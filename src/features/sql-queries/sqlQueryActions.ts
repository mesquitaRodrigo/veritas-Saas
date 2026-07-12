'use server';

import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { connectionSchema, projectMemberSchema, sqlQuerySchema } from '@/models/Schema';

async function validateMembership(projectId: string, userId: string) {
  const [membership] = await db
    .select({ role: projectMemberSchema.role })
    .from(projectMemberSchema)
    .where(and(
      eq(projectMemberSchema.projectId, projectId),
      eq(projectMemberSchema.userId, userId),
    ))
    .limit(1);
  if (!membership) throw new Error('Acesso negado');
  if (membership.role === 'viewer') throw new Error('Viewers não podem criar consultas');
  return membership;
}

const createQuerySchema = z.object({
  projectId: z.string().uuid(),
  connectionId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sql: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export async function createSqlQuery(input: z.infer<typeof createQuerySchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autorizado');

  const parsed = createQuerySchema.safeParse(input);
  if (!parsed.success) throw new Error('Dados inválidos');

  const { projectId, connectionId, name, description, sql, tags } = parsed.data;

  await validateMembership(projectId, userId);

  const [query] = await db
    .insert(sqlQuerySchema)
    .values({
      projectId,
      connectionId,
      name,
      description: description ?? null,
      sql,
      tags: tags ?? [],
      ownerId: userId,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  revalidatePath(`/dashboard/projects/${projectId}`);
  return query;
}

export async function executeQuery(
  connectionId: string,
  projectId: string,
  sql: string,
  limit = 100,
): Promise<{ ok: boolean; columns?: string[]; rows?: any[]; rowCount?: number; message?: string; duration?: number }> {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autorizado');

  await validateMembership(projectId, userId);

  // Busca a conexão
  const [conn] = await db
    .select()
    .from(connectionSchema)
    .where(eq(connectionSchema.id, connectionId))
    .limit(1);

  if (!conn) return { ok: false, message: 'Conexão não encontrada' };
  if (conn.type !== 'postgresql') return { ok: false, message: 'Execução de SQL disponível apenas para PostgreSQL no momento' };

  const config = JSON.parse(conn.config) as {
    host: string; port: number; database: string;
    username: string; password: string; ssl: boolean;
  };

  const { Client } = await import('pg');
  const client = new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
    statement_timeout: 30000,
    family: 4,
  } as any);

  const start = Date.now();

  try {
    await client.connect();

    // Envolve em LIMIT para segurança
    const safeSql = sql.trim().replace(/;+$/, '');
    const limitedSql = safeSql.toLowerCase().includes('limit')
      ? safeSql
      : `${safeSql} LIMIT ${limit}`;

    const result = await client.query(limitedSql);
    await client.end();

    const duration = Date.now() - start;
    const columns = result.fields.map(f => f.name);

    return {
      ok: true,
      columns,
      rows: result.rows,
      rowCount: result.rowCount ?? result.rows.length,
      duration,
    };
  } catch (err: any) {
    try { await client.end(); } catch {}
    const msg = err?.message ?? 'Erro desconhecido';
    return { ok: false, message: msg, duration: Date.now() - start };
  }
}

export async function getConnectionTables(
  connectionId: string,
  projectId: string,
): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    await validateMembership(projectId, userId);
  } catch {
    return [];
  }

  const [conn] = await db
    .select()
    .from(connectionSchema)
    .where(eq(connectionSchema.id, connectionId))
    .limit(1);

  if (!conn || conn.type !== 'postgresql') return [];

  const config = JSON.parse(conn.config) as any;
  const { Client } = await import('pg');
  const client = new Client({
    host: config.host, port: config.port,
    database: config.database, user: config.username,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 8000,
    family: 4,
  } as any);

  try {
    await client.connect();
    const result = await client.query(`
      SELECT table_schema || '.' || table_name as full_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);
    await client.end();
    return result.rows.map((r: any) => r.full_name);
  } catch {
    try { await client.end(); } catch {}
    return [];
  }
}
