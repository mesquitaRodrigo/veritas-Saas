'use server';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/libs/DB';
import { projectMemberSchema, projectSchema } from '@/models/Schema';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export async function createProject(input: CreateProjectInput) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Não autorizado');
  }

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Dados inválidos');
  }

  const { name, description, tags } = parsed.data;

  // Cria o projeto
  const [project] = await db
    .insert(projectSchema)
    .values({
      orgId,
      name,
      description: description ?? null,
      tags: tags ?? [],
      ownerId: userId,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  if (!project) {
    throw new Error('Erro ao criar projeto');
  }

  // Adiciona o criador como owner
  await db.insert(projectMemberSchema).values({
    projectId: project.id,
    userId,
    role: 'owner',
  });

  revalidatePath('/dashboard/projects');

  return project;
}

export async function deleteProject(projectId: string) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    throw new Error('Não autorizado');
  }

  // Verifica se o usuário é owner
  const [membership] = await db
    .select()
    .from(projectMemberSchema)
    .where(eq(projectMemberSchema.projectId, projectId))
    .limit(1);

  if (!membership || membership.userId !== userId || membership.role !== 'owner') {
    throw new Error('Apenas o owner pode excluir o projeto');
  }

  await db
    .delete(projectSchema)
    .where(eq(projectSchema.id, projectId));

  revalidatePath('/dashboard/projects');
}
