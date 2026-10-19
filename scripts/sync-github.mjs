#!/usr/bin/env node
// Refreshes src/data/github.json: the field log on the home page.
//   GITHUB_TOKEN=<token with repo scope> npm run github:sync
// Private repositories contribute counts only. Their names and commit messages never leave this
// script, so the committed snapshot holds aggregates plus public commit headlines.
import fs from 'node:fs';
import path from 'node:path';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Set GITHUB_TOKEN (a token that can read your private repositories) and run again.');
  process.exit(1);
}
const OUT = path.resolve('src/data/github.json');
const DAY = 86400000;
// Dates are Ankara dates: a commit at 01:23 on 18 October is an 18 October commit, not a UTC 17th.
const local = (iso) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
const today = new Date(local(new Date().toISOString()));
const since = new Date(today.getTime() - 364 * DAY);
// Weeks start on Sunday, like GitHub's contribution calendar.
const firstWeek = new Date(since.getTime() - since.getUTCDay() * DAY);

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors).slice(0, 400));
  return json.data;
}

const { viewer } = await gql(`{ viewer { id login
  contributionsCollection { contributionCalendar { totalContributions } }
  repositories(first: 100, ownerAffiliations: OWNER) { nodes { name isPrivate isFork url } } } }`);
const repos = viewer.repositories.nodes;

const weeks = [];
for (let t = firstWeek.getTime(); t <= today.getTime(); t += 7 * DAY) weeks.push({ start: new Date(t).toISOString().slice(0, 10), public: 0, private: 0 });
const weekOf = (iso) => Math.floor((new Date(local(iso)).getTime() - firstWeek.getTime()) / (7 * DAY));

// The field log quotes each public repository's latest commit headline as written, minus the
// bookkeeping: no conventional-commit prefix, and no message that says nothing on its own
// (an initial commit, a merge, a version number, a single word).
const PREFIX = /^(feat|fix|docs|chore|refactor|perf|test|build|ci|style)(\([^)]*\))?!?:\s*/i;
const turkish = (m) => /[çğıİöşüÇĞÖŞÜ]/.test(m);
// The site sets no em or en dash, quoted commits included: a range takes a hyphen, an aside a colon.
const undash = (s) => {
  let asides = 0;
  return s.replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, '$1-$2').replace(/\s*[\u2013\u2014]\s*/g, () => (asides++ ? ', ' : ': '));
};
const headline = (m) => {
  const s = m.replace(PREFIX, '').trim();
  return undash(s === m.trim() ? s : s.charAt(0).toLocaleUpperCase(turkish(s) ? 'tr' : 'en') + s.slice(1));
};
const telling = (m) => {
  const s = headline(m);
  return s.split(/\s+/).length > 1 && !/^(initial|first) commit$/i.test(s) && !/^merge\b/i.test(s) && !/^v?\d+(\.\d+)+$/.test(s);
};

const totals = { public: 0, private: 0 };
const recent = [];
for (const repo of repos) {
  let after = null;
  let latest = null;
  for (let page = 0; page < 30; page++) {
    const data = await gql(`query($name: String!, $owner: String!, $after: String, $author: ID!, $since: GitTimestamp!) {
      repository(owner: $owner, name: $name) { defaultBranchRef { target { ... on Commit {
        history(first: 100, after: $after, since: $since, author: { id: $author }) {
          pageInfo { hasNextPage endCursor } nodes { committedDate messageHeadline url } } } } } } }`,
      { owner: viewer.login, name: repo.name, after, author: viewer.id, since: since.toISOString() });
    const history = data.repository?.defaultBranchRef?.target?.history;
    if (!history) break;
    for (const c of history.nodes) {
      const w = weekOf(c.committedDate);
      if (w < 0 || w >= weeks.length) continue;
      const kind = repo.isPrivate ? 'private' : 'public';
      weeks[w][kind]++;
      totals[kind]++;
      if (!repo.isPrivate && !repo.isFork && telling(c.messageHeadline) && (!latest || c.committedDate > latest.committedDate)) latest = c;
    }
    if (!history.pageInfo.hasNextPage) break;
    after = history.pageInfo.endCursor;
  }
  if (latest) recent.push({ repo: repo.name, date: local(latest.committedDate), message: headline(latest.messageHeadline), url: latest.url });
}
recent.sort((a, b) => b.date.localeCompare(a.date));

const snapshot = {
  generated: today.toISOString().slice(0, 10),
  login: viewer.login,
  repos: { total: repos.length, public: repos.filter((r) => !r.isPrivate).length, private: repos.filter((r) => r.isPrivate).length },
  contributions: viewer.contributionsCollection.contributionCalendar.totalContributions,
  commits: { total: totals.public + totals.private, ...totals },
  weeks,
  recent: recent.slice(0, 8),
};
fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`github.json: ${snapshot.commits.total} commits (${totals.public} public, ${totals.private} private) in ${weeks.length} weeks, ${snapshot.repos.total} repositories`);
