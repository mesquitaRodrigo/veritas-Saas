import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/libs/DB';
import {
  connectionSchema,
  dashboardSchema,
  datasetSchema,
  projectMemberSchema,
  projectSchema,
  sqlQuerySchema,
} from '@/models/Schema';
import { ProjectDetailClient } from '@/features/projects/ProjectDetailClient';

export default async function ProjectDetailPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;

  // Verifica se o usuário tem acesso ao projeto
  const [membership] = await db
    .select({ role: projectMemberSchema.role })
    .from(projectMemberSchema)
    .innerJoin(projectSchema, eq(projectSchema.id, projectMemberSchema.projectId))
    .where(
      and(
        eq(projectMemberSchema.projectId, id),
        eq(projectMemberSchema.userId, userId),
        eq(projectSchema.orgId, orgId),
      ),
    )
    .limit(1);

  if (!membership) notFound();

  // Busca o projeto
  const [project] = await db
    .select()
    .from(projectSchema)
    .where(eq(projectSchema.id, id))
    .limit(1);

  if (!project) notFound();

  // Busca os ativos do projeto em paralelo
  const [connections, datasets, queries, dashboards] = await Promise.all([
    db.select().from(connectionSchema).where(eq(connectionSchema.projectId, id)),
    db.select().from(datasetSchema).where(eq(datasetSchema.projectId, id)),
    db.select().from(sqlQuerySchema).where(eq(sqlQuerySchema.projectId, id)),
    db.select().from(dashboardSchema).where(eq(dashboardSchema.projectId, id)),
  ]);

  return (
    <ProjectDetailClient
      project={project}
      role={membership.role}
        connections={connections}
      datasets={datasets}
      queries={queries}
      dashboards={dashboards}
    />
  );
}
