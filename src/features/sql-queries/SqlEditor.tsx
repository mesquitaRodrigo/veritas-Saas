'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createSqlQuery, executeQuery, getConnectionTables } from '@/features/sql-queries/sqlQueryActions';

type Connection = { id: string; name: string; type: string };

type SqlEditorProps = {
  projectId: string;
  connections: Connection[];
  onCreated?: (query: any) => void;
  onClose?: () => void;
};

type QueryResult = {
  ok: boolean;
  columns?: string[];
  rows?: any[];
  rowCount?: number;
  message?: string;
  duration?: number;
};

function fmt(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

export function SqlEditor({ projectId, connections, onCreated }: SqlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const cmRef = useRef<any>(null);

  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(
    connections.length === 1 ? connections[0]! : null
  );
  const [tables, setTables] = useState<string[]>([]);
  const [sql, setSql] = useState('SELECT *\nFROM public.clientes_telecom\nLIMIT 10;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [name, setName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isRunning, setIsRunning] = useState(false);

  // Carrega tabelas quando conexão muda
  useEffect(() => {
    if (!selectedConnection) return;
    getConnectionTables(selectedConnection.id, projectId).then(setTables);
  }, [selectedConnection, projectId]);

  // Inicializa CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;
    // Limpa instância anterior se existir
    if (cmRef.current) {
      cmRef.current.destroy();
      cmRef.current = null;
    }

    let view: any = null;
    let destroyed = false;

    (async () => {
      const { EditorView, keymap, lineNumbers, highlightActiveLine } = await import('@codemirror/view');
      const { EditorState } = await import('@codemirror/state');
      const { sql: sqlLang, PostgreSQL } = await import('@codemirror/lang-sql');
      const { oneDark } = await import('@codemirror/theme-one-dark');
      const { defaultKeymap, historyKeymap, history } = await import('@codemirror/commands');
      const { autocompletion } = await import('@codemirror/autocomplete');

      const theme = EditorView.theme({
        '&': { height: '280px', fontSize: '13px', borderRadius: '8px', overflow: 'hidden' },
        '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, monospace' },
        '.cm-content': { padding: '12px' },
        '.cm-gutters': { backgroundColor: '#0d1117', borderRight: '1px solid #1e3a5f' },
        '.cm-lineNumbers .cm-gutterElement': { color: '#4a5568', padding: '0 8px' },
      });

      const state = EditorState.create({
        doc: sql,
        extensions: [
          history(),
          lineNumbers(),
          highlightActiveLine(),
          sqlLang({ dialect: PostgreSQL, schema: Object.fromEntries(tables.map(t => [t, []])) }),
          autocompletion(),
          oneDark,
          theme,
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              setSql(update.state.doc.toString());
            }
          }),
        ],
      });

      if (!destroyed && editorRef.current) {
        // Limpa o container antes de montar
        editorRef.current.innerHTML = '';
        view = new EditorView({ state, parent: editorRef.current });
        cmRef.current = view;
      }
    })();

    return () => {
      destroyed = true;
      view?.destroy();
      cmRef.current = null;
    };
  }, [tables]);

  const handleRun = async () => {
    if (!selectedConnection || !sql.trim()) return;
    setIsRunning(true);
    setResult(null);
    const res = await executeQuery(selectedConnection.id, projectId, sql);
    setResult(res);
    setIsRunning(false);
  };

  const handleSave = () => {
    if (!selectedConnection || !name.trim() || !sql.trim()) return;
    startTransition(async () => {
      try {
        const query = await createSqlQuery({
          projectId,
          connectionId: selectedConnection.id,
          name: name.trim(),
          sql,
        });
        onCreated?.(query);
        setShowSave(false);
        setName('');
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Seletor de conexão */}
        <select
          value={selectedConnection?.id ?? ''}
          onChange={e => {
            const conn = connections.find(c => c.id === e.target.value) ?? null;
            setSelectedConnection(conn);
          }}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Selecionar conexão...</option>
          {connections.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Tabelas disponíveis */}
        {tables.length > 0 && (
          <select
            onChange={e => {
              if (!e.target.value) return;
              const current = cmRef.current;
              if (current) {
                const insert = `SELECT * FROM ${e.target.value} LIMIT 10;`;
                current.dispatch({
                  changes: { from: 0, to: current.state.doc.length, insert },
                });
              }
              e.target.value = '';
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Inserir tabela...</option>
            {tables.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowSave(s => !s)}
            disabled={!result?.ok}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-secondary disabled:opacity-40 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Salvar consulta
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || !selectedConnection}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {isRunning
              ? <div className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"/>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
            {isRunning ? 'Executando...' : 'Executar'}
          </button>
        </div>
      </div>

      {/* Save form */}
      {showSave && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome da consulta..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-60"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={() => setShowSave(false)} className="text-muted-foreground hover:text-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Editor CodeMirror */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div ref={editorRef} />
      </div>

      {/* Resultado */}
      {result && (
        <div className="flex flex-col gap-2">
          {/* Status bar */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
            result.ok
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {result.ok
                ? <polyline points="20 6 9 17 4 12"/>
                : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
            </svg>
            {result.ok
              ? `${result.rowCount} linha(s) retornada(s) em ${result.duration}ms`
              : result.message}
          </div>

          {/* Tabela de resultados */}
          {result.ok && result.columns && result.rows && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-secondary sticky top-0">
                    <tr>
                      {result.columns.map(col => (
                        <th key={col} className="px-3 py-2 text-left text-muted-foreground font-medium whitespace-nowrap border-b border-border">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-secondary/30'}`}>
                        {result.columns!.map(col => (
                          <td key={col} className="px-3 py-1.5 text-foreground whitespace-nowrap max-w-[200px] truncate">
                            {fmt(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
