'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { connectionSchema, datasetSchema, projectMemberSchema } from '@/models/Schema';

async function validateMembership(projectId: string, userId: string, requireWriteAccess = false) {
  const [membership] = await db
    .select({ role: projectMemberSchema.role })
    .from(projectMemberSchema)
    .where(and(
      eq(projectMemberSchema.projectId, projectId),
      eq(projectMemberSchema.userId, userId),
    ))
    .limit(1);
  if (!membership) {
    throw new Error('Acesso negado');
  }
  if (requireWriteAccess && membership.role === 'viewer') {
    throw new Error('Viewers não podem realizar esta ação');
  }
  return membership;
}

const executeQuerySchema = z.object({
  projectId: z.string().uuid(),
  connectionId: z.string().uuid().optional(),
  datasetId: z.string().uuid().optional(),
  query: z.string().min(1).max(10000),
});

export async function executeQuery(input: z.infer<typeof executeQuerySchema>) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Não autorizado');
  }

  const parsed = executeQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  const { projectId, connectionId, datasetId, query } = parsed.data;

  await validateMembership(projectId, userId, false);

  // Get connection from either direct connectionId or dataset's connectionId
  let connId = connectionId;
  if (datasetId && !connectionId) {
    const [dataset] = await db
      .select({ connectionId: datasetSchema.connectionId })
      .from(datasetSchema)
      .where(eq(datasetSchema.id, datasetId))
      .limit(1);
    if (!dataset) {
      throw new Error('Dataset não encontrado');
    }
    connId = dataset.connectionId ?? undefined;
  }

  if (!connId) {
    throw new Error('Conexão não especificada');
  }

  const [conn] = await db
    .select()
    .from(connectionSchema)
    .where(eq(connectionSchema.id, connId))
    .limit(1);

  if (!conn) {
    throw new Error('Conexão não encontrada');
  }

  if (conn.type !== 'postgresql') {
    throw new Error('Execução de queries disponível apenas para PostgreSQL');
  }

  const config = JSON.parse(conn.config) as {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };

  const { Client } = await import('pg');
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    family: 4,
  } as any);

  try {
    await client.connect();

    // Security: Prevent dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE'];
    const upperQuery = query.toUpperCase();
    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        await client.end();
        throw new Error(`Operação ${keyword} não permitida em queries de consulta`);
      }
    }

    const result = await client.query(query);

    await client.end();

    return {
      ok: true,
      columns: result.fields.map(f => f.name),
      rows: result.rows,
      rowCount: result.rowCount,
    };
  } catch (err: any) {
    try {
      await client.end();
    } catch (e: any) {
      console.error('Error closing PostgreSQL client:', e);
    }
    return {
      ok: false,
      error: err?.message ?? 'Erro ao executar query',
    };
  }
}

export async function getQuerySuggestions(connectionId: string, projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Não autorizado');
  }

  await validateMembership(projectId, userId, false);

  const [conn] = await db
    .select()
    .from(connectionSchema)
    .where(eq(connectionSchema.id, connectionId))
    .limit(1);

  if (!conn) {
    throw new Error('Conexão não encontrada');
  }

  if (conn.type !== 'postgresql') {
    return { ok: true, tables: [], columns: {} };
  }

  const config = JSON.parse(conn.config) as {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };

  const { Client } = await import('pg');
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 8000,
    family: 4,
  } as any);

  try {
    await client.connect();

    // Get tables
    const tablesResult = await client.query(`
      SELECT
        table_schema as schema,
        table_name as name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    // Get columns for each table
    const columns: Record<string, string[]> = {};
    for (const table of tablesResult.rows) {
      const tableRef = `${table.schema}.${table.name}`;
      const columnsResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `, [table.schema, table.name]);
      columns[tableRef] = columnsResult.rows.map(r => r.column_name);
    }

    await client.end();

    return {
      ok: true,
      tables: tablesResult.rows.map(t => `${t.schema}.${t.name}`),
      columns,
    };
  } catch (err: any) {
    try {
      await client.end();
    } catch (e: any) {
      console.error('Error closing PostgreSQL client:', e);
    }
    return {
      ok: false,
      error: err?.message ?? 'Erro ao obter sugestões',
    };
  }
}
