'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { connectionSchema, datasetSchema, projectMemberSchema } from '@/models/Schema';

async function validateMembership(projectId: string, userId: string, requireWriteAccess = true) {
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

const createDatasetSchema = z.object({
  projectId: z.string().uuid(),
  connectionId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  origin: z.enum(['table', 'view', 'sql_query', 'csv', 'excel', 'parquet', 'api']),
  originRef: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function createDataset(input: z.infer<typeof createDatasetSchema>) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Não autorizado');
  }

  const parsed = createDatasetSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  const { projectId, connectionId, name, description, origin, originRef, tags } = parsed.data;

  await validateMembership(projectId, userId, true);

  const [dataset] = await db
    .insert(datasetSchema)
    .values({
      projectId,
      connectionId: connectionId ?? null,
      name,
      description: description ?? null,
      origin,
      originRef: originRef ?? null,
      tags: tags ?? [],
      ownerId: userId,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  revalidatePath(`/dashboard/projects/${projectId}`);
  return dataset;
}

// Lista tabelas de uma conexão PostgreSQL
export async function listConnectionTables(
  connectionId: string,
  projectId: string,
): Promise<{ ok: boolean; tables?: { schema: string; name: string; type: string }[]; message?: string }> {
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
    return { ok: false, message: 'Conexão não encontrada' };
  }

  if (conn.type !== 'postgresql') {
    return { ok: false, message: 'Listagem de tabelas disponível apenas para PostgreSQL' };
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

    const result = await client.query(`
      SELECT
        table_schema as schema,
        table_name as name,
        table_type as type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    await client.end();

    return {
      ok: true,
      tables: result.rows.map(r => ({
        schema: r.schema,
        name: r.name,
        type: r.type === 'BASE TABLE' ? 'table' : 'view',
      })),
    };
  } catch (err: any) {
    try {
      await client.end();
    } catch (e: any) {
      console.error('Error closing PostgreSQL client:', e);
    }
    return { ok: false, message: err?.message ?? 'Erro ao listar tabelas' };
  }
}
