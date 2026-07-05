import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const projectRoleEnum = pgEnum('project_role', [
  'owner',
  'admin',
  'editor',
  'viewer',
]);

export const connectionTypeEnum = pgEnum('connection_type', [
  'postgresql',
  'mysql',
  'sqlserver',
  'bigquery',
  'csv',
]);

export const datasetOriginEnum = pgEnum('dataset_origin', [
  'table',
  'view',
  'sql_query',
  'csv',
  'excel',
  'parquet',
  'api',
]);

export const widgetTypeEnum = pgEnum('widget_type', [
  'bar',
  'line',
  'pie',
  'table',
  'number',
]);

// ─── Projetos ─────────────────────────────────────────────────────────────────
// Unidade central do sistema. Todo ativo pertence a um projeto.

export const projectSchema = pgTable('project', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: text('org_id').notNull(), // ID da organização no Clerk
  name: text('name').notNull(),
  description: text('description'),
  ownerId: text('owner_id').notNull(), // userId do Clerk
  tags: text('tags').array(),
  documentation: text('documentation'), // Markdown
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Membros do Projeto ────────────────────────────────────────────────────────
// Controla quem tem acesso a cada projeto e com qual role.

export const projectMemberSchema = pgTable('project_member', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(), // userId do Clerk
  role: projectRoleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ─── Conexões ─────────────────────────────────────────────────────────────────
// Configurações de acesso a fontes de dados externas.
// Credenciais são armazenadas criptografadas.

export const connectionSchema = pgTable('connection', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: connectionTypeEnum('type').notNull(),
  // Config armazena host, port, database, etc. como JSON criptografado
  config: text('config').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  tags: text('tags').array(),
  documentation: text('documentation'),
  ownerId: text('owner_id').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Consultas SQL ────────────────────────────────────────────────────────────
// Queries SQL salvas e reutilizáveis dentro de um projeto.

export const sqlQuerySchema = pgTable('sql_query', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => connectionSchema.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  description: text('description'),
  sql: text('sql').notNull(),
  tags: text('tags').array(),
  documentation: text('documentation'),
  ownerId: text('owner_id').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Datasets ─────────────────────────────────────────────────────────────────
// Abstração unificada de qualquer conjunto de dados consumível.
// A origem pode ser tabela, view, SQL, CSV, Excel, etc.

export const datasetSchema = pgTable('dataset', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  connectionId: uuid('connection_id')
    .references(() => connectionSchema.id, { onDelete: 'set null' }),
  sqlQueryId: uuid('sql_query_id')
    .references(() => sqlQuerySchema.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  origin: datasetOriginEnum('origin').notNull(),
  // Para tabelas/views: "schema.table_name"
  // Para CSV/Excel: caminho ou referência ao arquivo
  originRef: text('origin_ref'),
  tags: text('tags').array(),
  documentation: text('documentation'),
  ownerId: text('owner_id').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Dashboards ───────────────────────────────────────────────────────────────
// Painéis compostos por widgets, compartilháveis dentro da organização.

export const dashboardSchema = pgTable('dashboard', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectSchema.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags').array(),
  documentation: text('documentation'),
  ownerId: text('owner_id').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Widgets ──────────────────────────────────────────────────────────────────
// Elementos visuais de um dashboard. Não existem fora de um dashboard.

export const widgetSchema = pgTable('widget', {
  id: uuid('id').primaryKey().defaultRandom(),
  dashboardId: uuid('dashboard_id')
    .notNull()
    .references(() => dashboardSchema.id, { onDelete: 'cascade' }),
  datasetId: uuid('dataset_id')
    .notNull()
    .references(() => datasetSchema.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  type: widgetTypeEnum('type').notNull(),
  // Config armazena eixos, filtros, cores, etc. como JSON
  config: text('config').notNull().default('{}'),
  // Layout armazena posição e tamanho no grid (x, y, w, h)
  layout: text('layout').notNull().default('{}'),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
