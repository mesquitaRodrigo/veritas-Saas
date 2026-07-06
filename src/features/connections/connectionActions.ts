'use server';

import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { connectionSchema, projectMemberSchema } from '@/models/Schema';

// Config por tipo de conexão
const postgresConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(5432),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string(),
  ssl: z.union([z.boolean(), z.string()]).transform(v => v === true || v === 'true').default(false),
});

const mysqlConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(3306),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string(),
});

const sqlserverConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(1433),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string(),
});

const bigqueryConfigSchema = z.object({
  projectId: z.string().min(1),
  dataset: z.string().min(1),
  keyfileJson: z.string().min(1),
});

const csvConfigSchema = z.object({
  delimiter: z.string().default(','),
  encoding: z.string().default('utf-8'),
});

const createConnectionSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(['postgresql', 'mysql', 'sqlserver', 'bigquery', 'csv']),
  config: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()).optional(),
});

async function validateMembership(projectId: string, userId: string) {
  const [membership] = await db
    .select({ role: projectMemberSchema.role })
    .from(projectMemberSchema)
    .where(
      and(
        eq(projectMemberSchema.projectId, projectId),
        eq(projectMemberSchema.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) throw new Error('Acesso negado');
  if (membership.role === 'viewer') throw new Error('Viewers não podem criar conexões');
  return membership;
}

function validateConfig(type: string, config: Record<string, unknown>) {
  switch (type) {
    case 'postgresql': return postgresConfigSchema.parse(config);
    case 'mysql': return mysqlConfigSchema.parse(config);
    case 'sqlserver': return sqlserverConfigSchema.parse(config);
    case 'bigquery': return bigqueryConfigSchema.parse(config);
    case 'csv': return csvConfigSchema.parse(config);
    default: throw new Error('Tipo de conexão inválido');
  }
}

export async function createConnection(input: z.infer<typeof createConnectionSchema>) {
  const { userId } = await auth();
  if (!userId) throw new Error('Não autorizado');

  const parsed = createConnectionSchema.safeParse(input);
  if (!parsed.success) throw new Error('Dados inválidos');

  const { projectId, name, type, config, tags } = parsed.data;

  await validateMembership(projectId, userId);
  const validatedConfig = validateConfig(type, config);

  // Serializa config como JSON
  // Em produção: criptografar antes de salvar
  const [connection] = await db
    .insert(connectionSchema)
    .values({
      projectId,
      name,
      type,
      config: JSON.stringify(validatedConfig),
      tags: tags ?? [],
      ownerId: userId,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  revalidatePath(`/dashboard/projects/${projectId}`);
  return connection;
}


export async function testConnection(
  type: string,
  config: Record<string, unknown>,
): Promise<{ ok: boolean; message: string; details?: string }> {
  // Valida os campos primeiro
  try {
    validateConfig(type, config);
  } catch {
    return { ok: false, message: 'Configuração inválida. Verifique os campos obrigatórios.' };
  }

  // Teste real por tipo
  if (type === 'postgresql') {
    const cfg = postgresConfigSchema.parse(config);
    const { Client } = await import('pg');
    const client = new Client({
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.username,
      password: cfg.password,
      ssl: cfg.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 8000,
    } as any);

    try {
      await client.connect();
      const result = await client.query('SELECT version()');
      const version = result.rows[0]?.version ?? '';
      await client.end();
      return {
        ok: true,
        message: 'Conexão estabelecida com sucesso!',
        details: version.split(' ').slice(0, 2).join(' '),
      };
    } catch (err: any) {
      try { await client.end(); } catch {}
      const msg = err?.message ?? 'Erro desconhecido';

      if (msg.includes('ECONNREFUSED')) {
        return { ok: false, message: 'Conexão recusada. Verifique host e porta.' };
      }
      if (msg.includes('password authentication')) {
        return { ok: false, message: 'Usuário ou senha incorretos.' };
      }
      if (msg.includes('does not exist')) {
        return { ok: false, message: `Banco de dados "${cfg.database}" não encontrado.` };
      }
      if (msg.includes('timeout')) {
        return { ok: false, message: 'Tempo esgotado. Verifique se o host está acessível.' };
      }
      return { ok: false, message: `Erro: ${msg}` };
    }
  }

  if (type === 'csv') {
    return { ok: true, message: 'Configuração de CSV válida. O arquivo será enviado ao criar um Dataset.' };
  }

  // MySQL, SQL Server, BigQuery — validação de campos por enquanto
  return { ok: true, message: 'Configuração válida. Salve para continuar.' };
}
