import { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { search, highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { useFileStore } from '../../stores/fileStore';
import { wikilinkPlugin, wikilinkTheme, getWikilinkAtPos } from './wikilinkExtension';
import { resolveWikilink } from '../../services/searchService';

// Custom light theme
const lightTheme = EditorView.theme({
  "&": {
    color: "#1f2937",
    backgroundColor: "#ffffff"
  },
  ".cm-content": {
    caretColor: "#0e7490"
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#0e7490" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { 
    backgroundColor: "#bfdbfe" 
  },
  ".cm-activeLine": { backgroundColor: "#f3f4f6" },
  ".cm-gutters": {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    border: "none"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "#f3f4f6"
  }
}, { dark: false });

interface MarkdownEditorProps {
  initialContent: string;
  filePath: string;
  onSave: () => void;
}

export function MarkdownEditor({ initialContent, filePath, onSave }: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  const updateFileContent = useFileStore((state) => state.updateFileContent);
  const selectFile = useFileStore((state) => state.selectFile);
  const files = useFileStore((state) => state.files);
  const currentDirectory = useFileStore((state) => state.currentDirectory);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Update editor theme when dark mode changes
  useEffect(() => {
    console.log('Editor theme update:', { isDarkMode, hasView: !!viewRef.current });
    if (viewRef.current) {
      const newTheme = isDarkMode ? oneDark : lightTheme;
      console.log('Reconfiguring editor theme to:', isDarkMode ? 'oneDark' : 'lightTheme');
      viewRef.current.dispatch({
        effects: themeCompartment.current.reconfigure(newTheme),
      });
    }
  }, [isDarkMode]);

  // Only recreate editor when file changes, not on every content update
  useEffect(() => {
    if (!editorRef.current) return;

    // Create save command
    const saveCommand = () => {
      onSave();
      return true;
    };

    // Handle wikilink clicks
    const handleWikilinkClick = async (event: MouseEvent, view: EditorView) => {
      // Only handle Ctrl+Click or Cmd+Click
      if (!event.ctrlKey && !event.metaKey) return;

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (!pos) return;

      const wikilink = getWikilinkAtPos(view, pos);
      if (!wikilink) return;

      event.preventDefault();
      console.log('Navigating to wikilink:', wikilink);

      try {
        // Try to resolve the wikilink
        const targetPath = await resolveWikilink(wikilink, currentDirectory || '');
        
        if (targetPath) {
          // Find the file in the current files list
          const targetFile = files.find((f) => f.path === targetPath);
          if (targetFile) {
            selectFile(targetFile);
          } else {
            console.warn('File found but not in current directory:', targetPath);
          }
        } else {
          console.warn('Wikilink target not found:', wikilink);
          // Could show a "create new file?" dialog here
        }
      } catch (error) {
        console.error('Failed to resolve wikilink:', error);
      }
    };

    // Setup editor state
    const startState = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumbers(),
        history(),
        search({
          top: true, // Show search panel at top
        }),
        highlightSelectionMatches(),
        wikilinkPlugin,
        wikilinkTheme,
        keymap.of([
          ...searchKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          { key: 'Mod-s', run: saveCommand },
        ]),
        markdown(),
        themeCompartment.current.of(isDarkMode ? oneDark : lightTheme),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            updateFileContent(newContent);
          }
        }),
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          click: (event, view) => {
            handleWikilinkClick(event, view);
            return false;
          },
        }),
      ],
    });

    // Create editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [filePath]); // Only recreate when file changes, not on content changes

  // Prevent default browser save dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={editorRef}
      className="h-full w-full overflow-auto focus:outline-none"
    />
  );
}

