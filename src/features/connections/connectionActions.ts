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
  ssl: z.boolean().default(false),
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
): Promise<{ ok: boolean; message: string }> {
  // Por enquanto valida só os campos — integração real com driver vem depois
  try {
    validateConfig(type, config);
    return { ok: true, message: 'Configuração válida. Conexão pronta para ser salva.' };
  } catch {
    return { ok: false, message: 'Configuração inválida. Verifique os campos.' };
  }
}
