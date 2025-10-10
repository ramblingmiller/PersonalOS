import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';

// Wikilink regex: [[target]] or [[target|alias]]
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

// Create decorations for wikilinks
function createWikilinkDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const text = view.state.doc.toString();
  
  WIKILINK_REGEX.lastIndex = 0;
  let match;

  while ((match = WIKILINK_REGEX.exec(text)) !== null) {
    const from = match.index;
    const to = match.index + match[0].length;
    
    // Extract target (before | if present)
    const inner = match[1];
    const target = inner.split('|')[0].trim();
    
    // Style the entire wikilink
    builder.add(
      from,
      to,
      Decoration.mark({
        class: 'cm-wikilink',
        attributes: {
          'data-wikilink': target,
        },
      })
    );
  }

  return builder.finish();
}

// Plugin to add wikilink decorations
export const wikilinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = createWikilinkDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = createWikilinkDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// Theme for wikilink styling
export const wikilinkTheme = EditorView.baseTheme({
  '.cm-wikilink': {
    color: '#3b82f6',
    textDecoration: 'none',
    borderBottom: '1px dashed #3b82f6',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
  },
  '.dark .cm-wikilink': {
    color: '#60a5fa',
    borderBottom: '1px dashed #60a5fa',
    '&:hover': {
      backgroundColor: 'rgba(96, 165, 250, 0.1)',
    },
  },
});

// Helper to extract wikilink at cursor position
export function getWikilinkAtPos(view: EditorView, pos: number): string | null {
  const text = view.state.doc.toString();
  WIKILINK_REGEX.lastIndex = 0;
  let match;

  while ((match = WIKILINK_REGEX.exec(text)) !== null) {
    const from = match.index;
    const to = match.index + match[0].length;

    if (pos >= from && pos <= to) {
      const inner = match[1];
      return inner.split('|')[0].trim();
    }
  }

  return null;
}

