'use client';

import { useState, useTransition } from 'react';
import { createConnection, testConnection } from '@/features/connections/connectionActions';

type ConnectionType = 'postgresql' | 'mysql' | 'sqlserver' | 'bigquery' | 'csv';

type ConnectionModalProps = {
  projectId: string;
  onClose: () => void;
  onCreated: (connection: any) => void;
};

const CONNECTION_TYPES: { id: ConnectionType; label: string; description: string }[] = [
  { id: 'postgresql', label: 'PostgreSQL', description: 'Banco de dados relacional open-source' },
  { id: 'mysql', label: 'MySQL', description: 'Banco de dados relacional popular' },
  { id: 'sqlserver', label: 'SQL Server', description: 'Banco de dados Microsoft' },
  { id: 'bigquery', label: 'BigQuery', description: 'Data warehouse do Google Cloud' },
  { id: 'csv', label: 'CSV', description: 'Arquivo de valores separados por vírgula' },
];

const DB_ICONS: Record<ConnectionType, React.ReactNode> = {
  postgresql: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  mysql: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  sqlserver: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  ),
  bigquery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  csv: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

function Input({ label, id, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function ConfigFields({ type, config, onChange }: {
  type: ConnectionType;
  config: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  if (type === 'postgresql' || type === 'mysql' || type === 'sqlserver') {
    const defaults = { postgresql: '5432', mysql: '3306', sqlserver: '1433' };
    return (
      <div className="grid gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Host" id="host" required placeholder="localhost" value={config.host ?? ''} onChange={e => onChange('host', e.target.value)} />
          </div>
          <Input label="Porta" id="port" placeholder={defaults[type]} value={config.port ?? ''} onChange={e => onChange('port', e.target.value)} />
        </div>
        <Input label="Banco de dados" id="database" required placeholder="meu_banco" value={config.database ?? ''} onChange={e => onChange('database', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Usuário" id="username" required placeholder="postgres" value={config.username ?? ''} onChange={e => onChange('username', e.target.value)} />
          <Input label="Senha" id="password" type="password" placeholder="••••••••" value={config.password ?? ''} onChange={e => onChange('password', e.target.value)} />
        </div>
        {type === 'postgresql' && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={config.ssl === 'true'}
              onChange={e => onChange('ssl', String(e.target.checked))}
              className="rounded border-input"
            />
            Usar SSL
          </label>
        )}
      </div>
    );
  }

  if (type === 'bigquery') {
    return (
      <div className="grid gap-3">
        <Input label="Project ID" id="projectId" required placeholder="meu-projeto-gcp" value={config.projectId ?? ''} onChange={e => onChange('projectId', e.target.value)} />
        <Input label="Dataset" id="dataset" required placeholder="meu_dataset" value={config.dataset ?? ''} onChange={e => onChange('dataset', e.target.value)} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Service Account JSON <span className="text-destructive">*</span>
          </label>
          <textarea
            rows={4}
            placeholder='{"type": "service_account", ...}'
            value={config.keyfileJson ?? ''}
            onChange={e => onChange('keyfileJson', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      </div>
    );
  }

  if (type === 'csv') {
    return (
      <div className="grid gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Delimitador</label>
          <select
            value={config.delimiter ?? ','}
            onChange={e => onChange('delimiter', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value=",">, (vírgula)</option>
            <option value=";">; (ponto e vírgula)</option>
            <option value="\t">⇥ (tab)</option>
            <option value="|">| (pipe)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Encoding</label>
          <select
            value={config.encoding ?? 'utf-8'}
            onChange={e => onChange('encoding', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="utf-8">UTF-8</option>
            <option value="iso-8859-1">ISO-8859-1 (Latin-1)</option>
            <option value="windows-1252">Windows-1252</option>
          </select>
        </div>
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
          O arquivo CSV será enviado ao criar um Dataset dentro desta conexão.
        </div>
      </div>
    );
  }

  return null;
}

export function ConnectionModal({ projectId, onClose, onCreated }: ConnectionModalProps) {
  const [step, setStep] = useState<'type' | 'config'>('type');
  const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
  const [name, setName] = useState('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; details?: string } | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isTesting, setIsTesting] = useState(false);

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!selectedType) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(selectedType, config);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreate = () => {
    if (!selectedType) return;
    if (!name.trim()) { setError('O nome da conexão é obrigatório.'); return; }
    setError('');

    startTransition(async () => {
      try {
        const connection = await createConnection({
          projectId,
          name: name.trim(),
          type: selectedType,
          config,
        });
        onCreated(connection);
        onClose();
      } catch (e: any) {
        setError(e.message ?? 'Erro ao criar conexão.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Nova conexão</h2>
            <p className="text-xs text-muted-foreground">
              {step === 'type' ? 'Escolha o tipo de fonte de dados' : `Configurar ${CONNECTION_TYPES.find(t => t.id === selectedType)?.label}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step 1: Tipo */}
        {step === 'type' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-2">
              {CONNECTION_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id); setConfig({}); setStep('config'); }}
                  className="flex items-center gap-4 rounded-lg border border-border bg-background p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {DB_ICONS[type.id]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Config */}
        {step === 'config' && selectedType && (
          <>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="grid gap-4">
                <Input
                  label="Nome da conexão"
                  id="conn-name"
                  required
                  placeholder={`Ex: ${CONNECTION_TYPES.find(t => t.id === selectedType)?.label} Produção`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />

                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Configuração
                  </p>
                  <ConfigFields type={selectedType} config={config} onChange={handleConfigChange} />
                </div>

                {/* Resultado do teste */}
                {testResult && (
                  <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${
                    testResult.ok
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-destructive/10 border border-destructive/20 text-destructive'
                  }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0">
                      {testResult.ok
                        ? <><polyline points="20 6 9 17 4 12" /></>
                        : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                    </svg>
                    <div>
                      <p>{testResult.message}</p>
                      {testResult.details && (
                        <p className="mt-0.5 text-xs opacity-75">{testResult.details}</p>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <button
                onClick={() => { setStep('type'); setTestResult(null); setError(''); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  disabled={isTesting}
                  className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary disabled:opacity-60 transition-colors"
                >
                  {isTesting ? 'Testando...' : 'Testar conexão'}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {isPending ? 'Salvando...' : 'Salvar conexão'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
