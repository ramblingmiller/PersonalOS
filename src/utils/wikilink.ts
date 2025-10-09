export interface Wikilink {
  target: string;
  alias: string | null;
  fullText: string;
  start: number;
  end: number;
}

const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

export function parseWikilinks(content: string): Wikilink[] {
  const links: Wikilink[] = [];
  let match;

  // Reset regex state
  WIKILINK_REGEX.lastIndex = 0;

  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    const fullText = match[0];
    const inner = match[1];
    const parts = inner.split('|');
    const target = parts[0].trim();
    const alias = parts[1]?.trim() || null;

    links.push({
      target,
      alias,
      fullText,
      start: match.index,
      end: match.index + fullText.length,
    });
  }

  return links;
}

export function isWikilinkAt(content: string, position: number): Wikilink | null {
  const links = parseWikilinks(content);
  return links.find((link) => position >= link.start && position <= link.end) || null;
}

