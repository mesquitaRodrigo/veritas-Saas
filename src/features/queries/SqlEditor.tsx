'use client';

import { autocompletion } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { sql } from '@codemirror/lang-sql';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { basicSetup, EditorView } from 'codemirror';
import { useEffect, useRef, useState } from 'react';

type SqlEditorProps = {
  value: string;
  onChange: (value: string) => void;
  tables?: string[];
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
};

export function SqlEditor({
  value,
  onChange,
  tables = [],
  placeholder = 'SELECT * FROM table_name...',
  readOnly = false,
  minHeight = '200px',
  maxHeight = '400px',
}: SqlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Create autocomplete completion source for table names
  const tableCompletion = () => {
    const tableOptions = tables.map(table => ({
      label: table,
      type: 'text',
      boost: 1,
    }));

    return autocompletion({
      override: [
        (context) => {
          const word = context.matchBefore(/\w*/);
          if (!word || (word.from === word.to && !context.explicit)) {
            return null;
          }

          return {
            from: word.from,
            options: tableOptions.filter(option =>
              option.label.toLowerCase().startsWith(word.text.toLowerCase()),
            ),
          };
        },
      ],
      activateOnTyping: true,
      maxRenderedOptions: 10,
    });
  };

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    // Create the editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        sql(),
        oneDark,
        keymap.of([...defaultKeymap, indentWithTab]),
        tableCompletion(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            minHeight,
            maxHeight,
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
          '.cm-content': {
            padding: '12px',
          },
          '.cm-placeholder': {
            color: '#6b7280',
          },
          '.cm-focused': {
            outline: 'none',
          },
        }),
        EditorView.lineWrapping,
        readOnly ? EditorState.readOnly.of(true) : [],
        EditorView.domEventHandlers({
          focus: () => setIsFocused(true),
          blur: () => setIsFocused(false),
        }),
      ],
    });

    // Create the editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only run on mount

  // Update editor value when prop changes (external updates)
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      className={`
        relative rounded-lg border transition-all
        ${isFocused ? 'border-primary ring-1 ring-primary' : 'border-border'}
      `}
    >
      <div ref={editorRef} className="overflow-hidden rounded-lg" />
      {!value && !isFocused && (
        <div className="
          pointer-events-none absolute inset-0 flex items-center justify-center
          text-sm text-muted-foreground
        "
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
