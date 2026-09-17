import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import xml2js from 'xml2js';
import { buildRepository } from './build-plugin-repository.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'plugin-feed-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'source'), output = path.join(root, 'output');
  await mkdir(source);
  async function feed(folder, id, version = '1.0') {
    await mkdir(path.join(source, folder), { recursive: true });
    await writeFile(path.join(source, folder, 'plugin.zip'), 'fixture');
    await writeFile(path.join(source, folder, 'updatePlugins.xml'), `<plugins><plugin id="${id}" version="${version}" url="https://birkankader.com/plugins/${folder}/plugin.zip"><idea-version since-build="243"/><name>Oyun &amp; Kaşif</name></plugin></plugins>`);
  }
  return { source, output, feed };
}
test('merges three plugins, preserves aliases, picks up later single-plugin releases', async t => {
  const { source, output, feed } = await fixture(t);
  await feed('kasif', 'kasif');
  await feed('arcade-machine', 'arcade');
  await feed('haftanin-seyirligi', 'dev.teamwatch.weekly', '0.2.1');
  await buildRepository(source, output);
  const xml = await readFile(path.join(output, 'updatePlugins.xml'), 'utf8');
  assert.equal(await readFile(path.join(output, 'kasif/updatePlugins.xml'), 'utf8'), xml);
  assert.equal(await readFile(path.join(output, 'arcade-machine/updatePlugins.xml'), 'utf8'), xml);
  assert.equal(await readFile(path.join(output, 'haftanin-seyirligi/updatePlugins.xml'), 'utf8'), xml);
  assert.equal((await xml2js.parseStringPromise(xml)).plugins.plugin[0].name[0], 'Oyun & Kaşif');
  await feed('kasif', 'kasif', '2.0');
  assert.deepEqual(await buildRepository(source, output), ['arcade@1.0', 'dev.teamwatch.weekly@0.2.1', 'kasif@2.0']);
});
test('rejects duplicate IDs before publishing', async t => {
  const { source, output, feed } = await fixture(t);
  await feed('one', 'same'); await feed('two', 'same');
  await assert.rejects(buildRepository(source, output), /Duplicate plugin ID/);
});
test('rejects missing download artifacts', async t => {
  const { source, output, feed } = await fixture(t);
  await feed('one', 'one'); await rm(path.join(source, 'one/plugin.zip'));
  await assert.rejects(buildRepository(source, output), /ENOENT/);
});
