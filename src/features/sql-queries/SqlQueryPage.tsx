'use client';

import { useState } from 'react';
import { SqlEditor } from '@/features/sql-queries/SqlEditor';

type Connection = { id: string; name: string; type: string };
type Query = { id: string; name: string; description: string | null; createdAt: Date };

type SqlQueryPageProps = {
  projectId: string;
  connections: Connection[];
  initialQueries: Query[];
  onCreated?: (query: any) => void;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function SqlQueryPage({ projectId, connections, initialQueries, onCreated }: SqlQueryPageProps) {
  const [queries, setQueries] = useState<Query[]>(initialQueries);
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{queries.length} consulta(s)</p>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nova consulta
        </button>
      </div>

      {/* Editor inline */}
      {showEditor && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Editor SQL</p>
            <button
              onClick={() => setShowEditor(false)}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <SqlEditor
            projectId={projectId}
            connections={connections}
            onCreated={(query) => {
              setQueries(prev => [query, ...prev]);
              onCreated?.(query);
              setShowEditor(false);
            }}
          />
        </div>
      )}

      {/* Lista de consultas salvas */}
      {queries.length === 0 && !showEditor
        ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">Nenhuma consulta ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">Escreva uma query SQL para transformar seus dados.</p>
              <button
                onClick={() => setShowEditor(true)}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Abrir editor SQL
              </button>
            </div>
          )
        : (
            <div className="flex flex-col gap-2">
              {queries.map(q => (
                <div
                  key={q.id}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => {
                              setShowEditor(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{q.name}</p>
                      {q.description && (
                        <p className="text-xs text-muted-foreground">{q.description}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
