'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConnectionModal } from '@/features/connections/ConnectionModal';
import { DatasetModal } from '@/features/datasets/DatasetModal';
import { SqlQueryPage } from '@/features/sql-queries/SqlQueryPage';

type Project = {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Connection = { id: string; name: string; type: string; isActive: boolean; createdAt: Date };
type Dataset = { id: string; name: string; description: string | null; origin: string; createdAt: Date };
type Query = { id: string; name: string; description: string | null; createdAt: Date };
type Dashboard = { id: string; name: string; description: string | null; createdAt: Date };

type Tab = 'overview' | 'connections' | 'datasets' | 'queries' | 'dashboards';

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  sqlserver: 'SQL Server',
  bigquery: 'BigQuery',
  csv: 'CSV',
};
const ORIGIN_LABELS: Record<string, string> = {
  table: 'Tabela',
  view: 'View',
  sql_query: 'Consulta SQL',
  csv: 'CSV',
  excel: 'Excel',
  parquet: 'Parquet',
  api: 'API',
};
const CONNECTION_COLORS: Record<string, string> = {
  postgresql: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  mysql: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  sqlserver: 'bg-red-500/10 text-red-400 border-red-500/20',
  bigquery: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  csv: 'bg-green-500/10 text-green-400 border-green-500/20',
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="
      flex flex-col items-center justify-center rounded-xl border border-dashed
      border-border bg-card py-12 text-center
    "
    >
      <div className="
        mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10
        text-primary
      "
      >
        {icon}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="
          flex size-8 items-center justify-center rounded-lg bg-primary/10
          text-primary
        "
        >
          {icon}
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function ProjectDetailClient({
  project,
  role,
  connections: initialConnections,
  datasets: initialDatasets,
  queries,
  dashboards,
}: {
  project: Project;
  role: string;
  connections: Connection[];
  datasets?: Dataset[];
  queries: Query[];
  dashboards: Dashboard[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [sqlQueries, setSqlQueries] = useState<Query[]>(queries ?? []);
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets ?? []);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'connections', label: 'Conexões', count: connections.length },
    { id: 'datasets', label: 'Datasets', count: datasets.length },
    { id: 'queries', label: 'Consultas SQL', count: queries.length },
    { id: 'dashboards', label: 'Dashboards', count: dashboards.length },
  ];

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="
            transition-colors
            hover:text-foreground
          "
        >
          Projetos
        </button>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        <span className="font-medium text-foreground">{project.name}</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="
              flex size-12 shrink-0 items-center justify-center rounded-xl
              bg-primary/10
            "
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary"
              >
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
                <span className="
                  rounded-full border border-primary/30 bg-primary/10 px-2
                  py-0.5 text-xs font-medium text-primary
                "
                >
                  {role}
                </span>
              </div>
              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Atualizado em
                {formatDate(project.updatedAt)}
              </p>
            </div>
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="
                    rounded-full bg-secondary px-2.5 py-0.5 text-xs
                    text-secondary-foreground
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm
                font-medium whitespace-nowrap transition-colors
                ${
            activeTab === tab.id
              ? 'border-primary text-primary'
              : `
                border-transparent text-muted-foreground
                hover:text-foreground
              `
            }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  rounded-full px-1.5 py-0.5 text-xs
                  ${activeTab === tab.id
                  ? `bg-primary/10 text-primary`
                  : `bg-secondary text-muted-foreground`}
                `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="
            grid gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
          >
            <KpiCard
              label="Conexões"
              value={connections.length}
              icon={(
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 12V22H4V12" />
                  <path d="M22 7H2v5h20V7z" />
                  <path d="M12 22V7" />
                </svg>
              )}
            />
            <KpiCard
              label="Datasets"
              value={datasets.length}
              icon={(
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              )}
            />
            <KpiCard
              label="Consultas SQL"
              value={queries.length}
              icon={(
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              )}
            />
            <KpiCard
              label="Dashboards"
              value={dashboards.length}
              icon={(
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              )}
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-medium text-foreground">Fluxo de dados</h2>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: 'Conexões', count: connections.length },
                { label: 'Datasets', count: datasets.length },
                { label: 'Consultas SQL', count: queries.length },
                { label: 'Dashboards', count: dashboards.length },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`
                    min-w-[90px] rounded-lg border px-3 py-2 text-center
                    ${item.count > 0
                  ? `border-primary/40 bg-primary/10`
                  : `border-border bg-secondary/50`}
                  `}
                  >
                    <p className={`
                      text-lg font-bold
                      ${item.count > 0
                  ? `text-primary`
                  : `text-muted-foreground`}
                    `}
                    >
                      {item.count}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0 text-muted-foreground"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONEXÕES */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {connections.length}
              {' '}
              conexão(ões)
            </p>
            <button
              onClick={() => setShowConnectionModal(true)}
              className="
                flex items-center gap-2 rounded-md bg-primary px-3 py-1.5
                text-xs font-medium text-primary-foreground transition-colors
                hover:bg-primary/90
              "
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nova conexão
            </button>
          </div>
          {connections.length === 0
            ? (
                <EmptyState
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 12V22H4V12" />
                      <path d="M22 7H2v5h20V7z" />
                    </svg>
                  )}
                  title="Nenhuma conexão ainda"
                  description="Conecte uma fonte de dados para começar."
                  action={(
                    <button
                      onClick={() => setShowConnectionModal(true)}
                      className="
                        rounded-md bg-primary px-4 py-2 text-sm font-medium
                        text-primary-foreground transition-colors
                        hover:bg-primary/90
                      "
                    >
                      Criar conexão
                    </button>
                  )}
                />
              )
            : (
                <div className="
                  grid gap-3
                  sm:grid-cols-2
                "
                >
                  {connections.map(conn => (
                    <div
                      key={conn.id}
                      className="
                        cursor-pointer rounded-xl border border-border bg-card
                        p-4 transition-colors
                        hover:border-primary/40
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{conn.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Criado em
                            {formatDate(conn.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`
                            rounded-full border px-2 py-0.5 text-xs font-medium
                            ${CONNECTION_COLORS[conn.type] ?? ''}
                          `}
                          >
                            {CONNECTION_TYPE_LABELS[conn.type] ?? conn.type}
                          </span>
                          <span className={`
                            size-2 rounded-full
                            ${conn.isActive
                      ? `bg-green-500`
                      : `bg-muted-foreground`}
                          `}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* DATASETS */}
      {activeTab === 'datasets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {datasets.length}
              {' '}
              dataset(s)
            </p>
            <button
              onClick={() => setShowDatasetModal(true)}
              className="
                flex items-center gap-2 rounded-md bg-primary px-3 py-1.5
                text-xs font-medium text-primary-foreground transition-colors
                hover:bg-primary/90
              "
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo dataset
            </button>
          </div>
          {datasets.length === 0
            ? (
                <EmptyState
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                  )}
                  title="Nenhum dataset ainda"
                  description="Crie um dataset a partir de uma conexão ou arquivo."
                />
              )
            : (
                <div className="
                  grid gap-3
                  sm:grid-cols-2
                "
                >
                  {datasets.map(ds => (
                    <div
                      key={ds.id}
                      className="
                        cursor-pointer rounded-xl border border-border bg-card
                        p-4 transition-colors
                        hover:border-primary/40
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">{ds.name}</p>
                          {ds.description && (
                            <p className="
                              mt-0.5 line-clamp-1 text-xs text-muted-foreground
                            "
                            >
                              {ds.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Criado em
                            {formatDate(ds.createdAt)}
                          </p>
                        </div>
                        <span className="
                          rounded-full bg-secondary px-2 py-0.5 text-xs
                          text-secondary-foreground
                        "
                        >
                          {ORIGIN_LABELS[ds.origin] ?? ds.origin}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* CONSULTAS SQL */}
      {activeTab === 'queries' && (
        <SqlQueryPage
          projectId={project.id}
          connections={connections}
          initialQueries={sqlQueries}
          onCreated={(q: any) => setSqlQueries((prev: any[]) => [q, ...prev])}
        />
      )}

            {/* DASHBOARDS */}
      {activeTab === 'dashboards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {dashboards.length}
              {' '}
              dashboard(s)
            </p>
            <button className="
              flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs
              font-medium text-primary-foreground transition-colors
              hover:bg-primary/90
            "
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo dashboard
            </button>
          </div>
          {dashboards.length === 0
            ? (
                <EmptyState
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  )}
                  title="Nenhum dashboard ainda"
                  description="Crie um dashboard para visualizar seus datasets."
                />
              )
            : (
                <div className="
                  grid gap-3
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
                >
                  {dashboards.map(dash => (
                    <div
                      key={dash.id}
                      className="
                        cursor-pointer rounded-xl border border-border bg-card
                        p-4 transition-colors
                        hover:border-primary/40
                      "
                    >
                      <p className="font-medium text-foreground">{dash.name}</p>
                      {dash.description && (
                        <p className="
                          mt-1 line-clamp-2 text-xs text-muted-foreground
                        "
                        >
                          {dash.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(dash.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* Modal de dataset */}
      {showDatasetModal && (
        <DatasetModal
          projectId={project.id}
          connections={connections}
          onClose={() => setShowDatasetModal(false)}
          onCreated={(ds: any) => {
            setDatasets(prev => [ds, ...prev]);
            setShowDatasetModal(false);
          }}
        />
      )}

      {/* Modal de conexão */}
      {showConnectionModal && (
        <ConnectionModal
          projectId={project.id}
          onClose={() => setShowConnectionModal(false)}
          onCreated={(conn: any) => {
            setConnections(prev => [conn, ...prev]);
            setShowConnectionModal(false);
          }}
        />
      )}

    </div>
  );
}
