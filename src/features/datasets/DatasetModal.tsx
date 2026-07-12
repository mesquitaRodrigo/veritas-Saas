'use client';

import Papa from 'papaparse';
import { useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import { createDataset, listConnectionTables } from '@/features/datasets/datasetActions';
import { getQuerySuggestions } from '@/features/queries/queryActions';
import { SqlEditor } from '@/features/queries/SqlEditor';

type Connection = { id: string; name: string; type: string };
type Table = { schema: string; name: string; type: string };

type DatasetModalProps = {
  projectId: string;
  connections: Connection[];
  onClose: () => void;
  onCreated: (dataset: any) => void;
};

type Origin = 'database' | 'file' | 'query' | null;

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-6 py-3">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`
            flex size-6 items-center justify-center rounded-full text-xs
            font-medium
            ${
        i <= current
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-muted-foreground'
        }
          `}
          >
            {i < current
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              : i + 1}
          </div>
          <span className={`
            text-xs
            ${i === current
          ? 'font-medium text-foreground'
          : 'text-muted-foreground'}
          `}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export function DatasetModal({ projectId, connections, onClose, onCreated }: DatasetModalProps) {
  const [origin, setOrigin] = useState<Origin>(null);
  const [step, setStep] = useState(0);

  // Database flow
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tablesError, setTablesError] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableSearch, setTableSearch] = useState('');

  // File flow
  const [fileData, setFileData] = useState<{ headers: string[]; rows: any[]; fileName: string } | null>(null);
  const [fileError, setFileError] = useState('');

  // Query flow
  const [queryConnection, setQueryConnection] = useState<Connection | null>(null);
  const [query, setQuery] = useState('');
  const [queryTables, setQueryTables] = useState<string[]>([]);
  const [loadingQueryTables, setLoadingQueryTables] = useState(false);

  // Common
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSelectOrigin = (o: Origin) => {
    setOrigin(o);
    setStep(1);
  };

  const handleSelectConnection = async (conn: Connection) => {
    setSelectedConnection(conn);
    setLoadingTables(true);
    setTablesError('');
    setTables([]);
    const result = await listConnectionTables(conn.id, projectId);
    setLoadingTables(false);
    if (result.ok && result.tables) {
      setTables(result.tables);
      setStep(2);
    } else {
      setTablesError(result.message ?? 'Erro ao listar tabelas');
    }
  };

  const handleSelectQueryConnection = async (conn: Connection) => {
    setQueryConnection(conn);
    setLoadingQueryTables(true);
    const result = await getQuerySuggestions(conn.id, projectId);
    setLoadingQueryTables(false);
    if (result.ok && result.tables) {
      setQueryTables(result.tables);
      setStep(2);
    }
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setName(`${table.schema}.${table.name}`);
    setStep(3);
  };

  const handleFile = (file: File) => {
    setFileError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (r) => {
          setFileData({ headers: r.meta.fields ?? [], rows: r.data, fileName: file.name });
          setName(file.name.replace(/\.[^/.]+$/, ''));
          setStep(2);
        },
        error: () => setFileError('Não foi possível ler o CSV.'),
      });
    } else if (['xlsx', 'xls'].includes(ext ?? '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]!]!;
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          setFileData({ headers, rows: json, fileName: file.name });
          setName(file.name.replace(/\.[^/.]+$/, ''));
          setStep(2);
        } catch {
          setFileError('Não foi possível ler o Excel.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setFileError('Formato não suportado. Use .xlsx, .xls ou .csv.');
    }
  };

  const handleCreate = () => {
    if (!name.trim()) {
      setError('O nome do dataset é obrigatório.');
      return;
    }
    setError('');

    startTransition(async () => {
      try {
        let originType: 'table' | 'view' | 'csv' | 'excel' | 'sql_query' = 'table';
        let originRef: string | undefined;
        let connectionId: string | undefined;

        if (origin === 'database' && selectedTable && selectedConnection) {
          originType = selectedTable.type === 'view' ? 'view' : 'table';
          originRef = `${selectedTable.schema}.${selectedTable.name}`;
          connectionId = selectedConnection.id;
        } else if (origin === 'file' && fileData) {
          originType = fileData.fileName.endsWith('.csv') ? 'csv' : 'excel';
          originRef = fileData.fileName;
        } else if (origin === 'query' && queryConnection) {
          originType = 'sql_query';
          originRef = query;
          connectionId = queryConnection.id;
        }

        const dataset = await createDataset({
          projectId,
          connectionId,
          name: name.trim(),
          description: description.trim() || undefined,
          origin: originType,
          originRef,
        });

        onCreated(dataset);
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erro ao criar dataset.');
      }
    });
  };

  const filteredTables = tables.filter(t =>
    `${t.schema}.${t.name}`.toLowerCase().includes(tableSearch.toLowerCase()),
  );

  const dbSteps = ['Origem', 'Conexão', 'Tabela', 'Detalhes'];
  const fileSteps = ['Origem', 'Arquivo', 'Detalhes'];
  const querySteps = ['Origem', 'Conexão', 'Query', 'Detalhes'];
  const steps = origin === 'database' ? dbSteps : origin === 'file' ? fileSteps : origin === 'query' ? querySteps : ['Origem'];

  return (
    <div className="
      fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4
      backdrop-blur-sm
    "
    >
      <div className="
        flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border
        border-border bg-card shadow-xl
      "
      >

        {/* Header */}
        <div className="
          flex items-center justify-between border-b border-border px-6 py-4
        "
        >
          <div>
            <h2 className="text-base font-semibold text-foreground">Novo dataset</h2>
            <p className="text-xs text-muted-foreground">
              {step === 0
                ? 'Escolha a origem dos dados'
                : origin === 'database' && step === 1
                  ? 'Selecione a conexão'
                  : origin === 'database' && step === 2
                    ? `${tables.length} tabelas encontradas`
                    : origin === 'file' && step === 1
                      ? 'Envie seu arquivo'
                      : 'Configure o dataset'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="
              rounded-sm p-1.5 text-muted-foreground transition-colors
              hover:bg-secondary hover:text-foreground
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Steps indicator */}
        {origin && <StepIndicator steps={steps} current={step} />}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 0: Escolha de origem */}
          {step === 0 && (
            <div className="grid gap-3">
              <button
                onClick={() => handleSelectOrigin('database')}
                className="
                  group flex items-center gap-4 rounded-lg border border-border
                  bg-background p-4 text-left transition-all
                  hover:border-primary/50 hover:bg-primary/5
                "
              >
                <div className="
                  flex size-10 shrink-0 items-center justify-center rounded-lg
                  bg-primary/10 text-primary transition-colors
                  group-hover:bg-primary/20
                "
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Banco de dados</p>
                  <p className="text-xs text-muted-foreground">Escolha uma tabela ou view de uma conexão existente</p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="
                    text-muted-foreground transition-colors
                    group-hover:text-primary
                  "
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={() => handleSelectOrigin('file')}
                className="
                  group flex items-center gap-4 rounded-lg border border-border
                  bg-background p-4 text-left transition-all
                  hover:border-primary/50 hover:bg-primary/5
                "
              >
                <div className="
                  flex size-10 shrink-0 items-center justify-center rounded-lg
                  bg-primary/10 text-primary transition-colors
                  group-hover:bg-primary/20
                "
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Arquivo</p>
                  <p className="text-xs text-muted-foreground">Suba um arquivo CSV ou Excel (.xlsx)</p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="
                    text-muted-foreground transition-colors
                    group-hover:text-primary
                  "
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                onClick={() => handleSelectOrigin('query')}
                className="
                  group flex items-center gap-4 rounded-lg border border-border
                  bg-background p-4 text-left transition-all
                  hover:border-primary/50 hover:bg-primary/5
                "
              >
                <div className="
                  flex size-10 shrink-0 items-center justify-center rounded-lg
                  bg-primary/10 text-primary transition-colors
                  group-hover:bg-primary/20
                "
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Query SQL</p>
                  <p className="text-xs text-muted-foreground">Escreva uma query SQL personalizada</p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="
                    text-muted-foreground transition-colors
                    group-hover:text-primary
                  "
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}

          {/* STEP 1 DATABASE: Selecionar conexão */}
          {origin === 'database' && step === 1 && (
            <div className="grid gap-2">
              {connections.length === 0
                ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma conexão disponível. Crie uma conexão primeiro.</p>
                : connections.map(conn => (
                    <button
                      key={conn.id}
                      onClick={() => handleSelectConnection(conn)}
                      disabled={loadingTables}
                      className="
                        flex items-center gap-3 rounded-lg border border-border
                        bg-background p-3 text-left transition-all
                        hover:border-primary/50
                        disabled:opacity-60
                      "
                    >
                      <div className="
                        flex size-8 items-center justify-center rounded-sm
                        bg-primary/10 text-primary
                      "
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{conn.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{conn.type}</p>
                      </div>
                      {loadingTables && selectedConnection?.id === conn.id && (
                        <div className="
                          ml-auto size-4 animate-spin rounded-full border-2
                          border-primary border-t-transparent
                        "
                        />
                      )}
                    </button>
                  ))}
              {tablesError && (
                <div className="
                  mt-2 rounded-lg border border-destructive/20 bg-destructive/10
                  px-3 py-2 text-sm text-destructive
                "
                >
                  {tablesError}
                </div>
              )}
            </div>
          )}

          {/* STEP 2 DATABASE: Selecionar tabela */}
          {origin === 'database' && step === 2 && (
            <div className="flex flex-col gap-3">
              <input
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Buscar tabela..."
                className="
                  w-full rounded-md border border-input bg-background px-3 py-2
                  text-sm text-foreground
                  placeholder:text-muted-foreground
                  focus:border-primary focus:ring-1 focus:ring-primary
                  focus:outline-none
                "
              />
              <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                {filteredTables.length === 0
                  ? (
                      <p className="
                        py-6 text-center text-sm text-muted-foreground
                      "
                      >
                        Nenhuma tabela encontrada.
                      </p>
                    )
                  : filteredTables.map(t => (
                      <button
                        key={`${t.schema}.${t.name}`}
                        onClick={() => handleSelectTable(t)}
                        className="
                          flex items-center gap-3 rounded-lg border
                          border-border bg-background px-3 py-2.5 text-left
                          transition-all
                          hover:border-primary/50 hover:bg-primary/5
                        "
                      >
                        <span className={`
                          rounded-sm px-1.5 py-0.5 text-xs font-medium
                          ${t.type === 'view'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-blue-500/10 text-blue-400'}
                        `}
                        >
                          {t.type === 'view' ? 'VIEW' : 'TABLE'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.schema}
                          .
                        </span>
                        <span className="text-sm font-medium text-foreground">{t.name}</span>
                      </button>
                    ))}
              </div>
            </div>
          )}

          {/* STEP 1 FILE: Upload */}
          {origin === 'file' && step === 1 && (
            <div>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) {
                    handleFile(f);
                  }
                }}
                onClick={() => document.getElementById('dataset-file')?.click()}
                className="
                  flex cursor-pointer flex-col items-center justify-center
                  rounded-xl border-2 border-dashed border-border bg-background
                  p-10 transition-all
                  hover:border-primary/50 hover:bg-primary/5
                "
              >
                <div className="
                  mb-3 flex size-12 items-center justify-center rounded-lg
                  bg-primary/10 text-primary
                "
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Arraste seu arquivo aqui</p>
                <p className="mt-1 text-xs text-muted-foreground">ou clique para selecionar</p>
                <span className="
                  mt-3 rounded-full bg-secondary/50 px-3 py-1 text-xs
                  text-secondary
                "
                >
                  .csv · .xlsx · .xls
                </span>
                <input
                  id="dataset-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              {fileError && (
                <div className="
                  mt-3 rounded-lg border border-destructive/20 bg-destructive/10
                  px-3 py-2 text-sm text-destructive
                "
                >
                  {fileError}
                </div>
              )}
            </div>
          )}

          {/* STEP FILE preview */}
          {origin === 'file' && step === 2 && fileData && (
            <div className="space-y-3">
              <div className="
                flex items-center gap-3 rounded-lg border border-border
                bg-background p-3
              "
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-primary"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-foreground">{fileData.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {fileData.rows.length}
                    {' '}
                    linhas ·
                    {' '}
                    {fileData.headers.length}
                    {' '}
                    colunas
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary">
                      <tr>
                        {fileData.headers.slice(0, 5).map(h => (
                          <th
                            key={h}
                            className="
                              px-3 py-2 text-left font-medium
                              text-muted-foreground
                            "
                          >
                            {h}
                          </th>
                        ))}
                        {fileData.headers.length > 5 && (
                          <th className="px-3 py-2 text-muted-foreground">
                            +
                            {fileData.headers.length - 5}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.rows.slice(0, 3).map((row, i) => (
                        <tr key={i} className="border-t border-border">
                          {fileData.headers.slice(0, 5).map(h => (
                            <td
                              key={h}
                              className="
                                max-w-[120px] truncate px-3 py-2 text-foreground
                              "
                            >
                              {String(row[h] ?? '')}
                            </td>
                          ))}
                          {fileData.headers.length > 5 && (
                            <td className="px-3 py-2 text-muted-foreground">
                              ...
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 QUERY: Selecionar conexão */}
          {origin === 'query' && step === 1 && (
            <div className="grid gap-2">
              {connections.length === 0
                ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma conexão disponível. Crie uma conexão primeiro.</p>
                : connections.map(conn => (
                    <button
                      key={conn.id}
                      onClick={() => handleSelectQueryConnection(conn)}
                      disabled={loadingQueryTables}
                      className="
                        flex items-center gap-3 rounded-lg border border-border
                        bg-background p-3 text-left transition-all
                        hover:border-primary/50
                        disabled:opacity-60
                      "
                    >
                      <div className="
                        flex size-8 items-center justify-center rounded-sm
                        bg-primary/10 text-primary
                      "
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{conn.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{conn.type}</p>
                      </div>
                      {loadingQueryTables && queryConnection?.id === conn.id && (
                        <div className="
                          ml-auto size-4 animate-spin rounded-full border-2
                          border-primary border-t-transparent
                        "
                        />
                      )}
                    </button>
                  ))}
            </div>
          )}

          {/* STEP 2 QUERY: SQL Editor */}
          {origin === 'query' && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="
                  mb-2 block text-sm font-medium text-foreground
                "
                >
                  Query SQL
                  <span className="text-destructive">
                    *
                  </span>
                </label>
                <SqlEditor
                  value={query}
                  onChange={setQuery}
                  tables={queryTables}
                  placeholder="SELECT * FROM schema.table_name WHERE..."
                  minHeight="250px"
                  maxHeight="400px"
                />
              </div>
              <button
                onClick={() => {
                  if (query.trim()) {
                    setName(`Query SQL ${new Date().toLocaleDateString()}`);
                    setStep(3);
                  }
                }}
                disabled={!query.trim()}
                className="
                  w-full rounded-md bg-primary px-4 py-2 text-sm font-medium
                  text-primary-foreground transition-colors
                  hover:bg-primary/90
                  disabled:opacity-60
                "
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP FINAL: Detalhes */}
          {((origin === 'database' && step === 3) || (origin === 'file' && step === 2 && fileData) || (origin === 'query' && step === 3)) && (
            <div className="mt-4 space-y-4">
              <div className="border-t border-border pt-4">
                <p className="
                  mb-3 text-xs font-medium tracking-wider text-muted-foreground
                  uppercase
                "
                >
                  Detalhes do dataset
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="
                      mb-1.5 block text-sm font-medium text-foreground
                    "
                    >
                      Nome
                      <span className="text-destructive">
                        *
                      </span>
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Vendas 2024"
                      className="
                        w-full rounded-md border border-input bg-background px-3
                        py-2 text-sm text-foreground
                        placeholder:text-muted-foreground
                        focus:border-primary focus:ring-1 focus:ring-primary
                        focus:outline-none
                      "
                    />
                  </div>
                  <div>
                    <label className="
                      mb-1.5 block text-sm font-medium text-foreground
                    "
                    >
                      Descrição
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Contexto sobre este dataset..."
                      rows={2}
                      className="
                        w-full resize-none rounded-md border border-input
                        bg-background px-3 py-2 text-sm text-foreground
                        placeholder:text-muted-foreground
                        focus:border-primary focus:ring-1 focus:ring-primary
                        focus:outline-none
                      "
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="
                  rounded-lg border border-destructive/20 bg-destructive/10 px-3
                  py-2 text-sm text-destructive
                "
                >
                  {error}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        {(step > 0) && (
          <div className="
            flex items-center justify-between border-t border-border px-6 py-4
          "
          >
            <button
              onClick={() => {
                setStep(s => s - 1);
                if (step === 1) {
                  setOrigin(null);
                }
              }}
              className="
                text-sm text-muted-foreground transition-colors
                hover:text-foreground
              "
            >
              ← Voltar
            </button>
            {((origin === 'database' && step === 3) || (origin === 'file' && step === 2 && fileData) || (origin === 'query' && step === 3)) && (
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="
                  rounded-md bg-primary px-4 py-2 text-sm font-medium
                  text-primary-foreground transition-colors
                  hover:bg-primary/90
                  disabled:opacity-60
                "
              >
                {isPending ? 'Salvando...' : 'Criar dataset'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
