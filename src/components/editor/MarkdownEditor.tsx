import { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useFileStore } from '../../stores/fileStore';

interface MarkdownEditorProps {
  initialContent: string;
  filePath: string;
  onSave: () => void;
}

export function MarkdownEditor({ initialContent, filePath, onSave }: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const updateFileContent = useFileStore((state) => state.updateFileContent);

  // Only recreate editor when file changes, not on every content update
  useEffect(() => {
    if (!editorRef.current) return;

    // Create save command
    const saveCommand = () => {
      onSave();
      return true;
    };

    // Setup editor state
    const startState = EditorState.create({
      doc: initialContent,
      extensions: [
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          { key: 'Mod-s', run: saveCommand },
        ]),
        markdown(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            updateFileContent(newContent);
          }
        }),
        EditorView.lineWrapping,
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

