import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@/libs/DB';
import { projectMemberSchema, projectSchema } from '@/models/Schema';
import { ProjectsClient } from '@/features/projects/ProjectsClient';

export default async function ProjectsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return null;
  }

  // Busca projetos da organização onde o usuário é membro
  const projects = await db
    .select({
      id: projectSchema.id,
      name: projectSchema.name,
      description: projectSchema.description,
      tags: projectSchema.tags,
      ownerId: projectSchema.ownerId,
      createdAt: projectSchema.createdAt,
      updatedAt: projectSchema.updatedAt,
    })
    .from(projectSchema)
    .innerJoin(
      projectMemberSchema,
      eq(projectMemberSchema.projectId, projectSchema.id),
    )
    .where(
      and(
        eq(projectSchema.orgId, orgId),
        eq(projectMemberSchema.userId, userId),
      ),
    );

  return (
    <ProjectsClient
      projects={projects}
      userId={userId}
      orgId={orgId}
    />
  );
}
