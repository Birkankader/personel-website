// Markdown to safe DOM. The desktop app renders with Markdig's advanced extensions and runs no
// script in the result; this does the same with marked (GFM, footnotes, alerts, GitHub heading ids)
// and DOMPurify.
import { Marked } from 'marked';
import markedFootnote from 'marked-footnote';
import markedAlert from 'marked-alert';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import DOMPurify from 'dompurify';

export const ID_PREFIX = 'user-content-';

// YAML front matter is read past and left out of the page, as Markdig's UseYamlFrontMatter does.
const FRONT_MATTER = /^---[ \t]*\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;

export function createRenderer(footnotes: { label: string; back: string }) {
  const marked = new Marked(
    { gfm: true },
    gfmHeadingId(),
    markedFootnote({ description: footnotes.label, backRefLabel: footnotes.back }),
    markedAlert(),
  );

  return (source: string): DocumentFragment => {
    const html = marked.parse(source.replace(FRONT_MATTER, ''), { async: false });
    // Ids and names get GitHub's prefix, so a heading called "title" or "location" can't shadow a
    // property of the page. In-page links are matched against the prefixed id (see app.ts).
    // The fragment belongs to an inert document: nothing in it loads until it is inserted.
    return DOMPurify.sanitize(html, {
      RETURN_DOM_FRAGMENT: true,
      SANITIZE_NAMED_PROPS: true,
      FORBID_TAGS: ['style', 'form', 'button', 'textarea', 'select'],
    });
  };
}

/** Text from a file's bytes: UTF-16 by its byte order mark, otherwise UTF-8 (BOM dropped). */
export function decode(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b);
  if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b);
  return new TextDecoder('utf-8').decode(b);
}

export function countWords(text: string): number {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu)?.length ?? 0;
}
