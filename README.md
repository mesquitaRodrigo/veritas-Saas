# Véritas

Plataforma unificada de governança de dados orientada por Projetos.

> **Status:** Em desenvolvimento ativo — MVP em construção.

---

## O que é

O Véritas é uma plataforma que permite que equipes conectem, transformem e visualizem seus dados com transparência e organização, sem depender de múltiplas ferramentas fragmentadas.

Tudo é organizado em **Projetos** — a unidade central do sistema. Cada projeto agrupa conexões, datasets, consultas SQL e dashboards de forma isolada por equipe.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Clerk** — autenticação e multi-tenant
- **Drizzle ORM** + **Neon** PostgreSQL
- **Tailwind CSS** + **Shadcn UI**
- **PGlite** — banco local em desenvolvimento

## Funcionalidades do MVP

- [x] Autenticação com Clerk (login, cadastro, OAuth)
- [x] Multi-tenant — organizações isoladas
- [x] Projetos — criar, listar, excluir
- [x] Página interna do projeto com visão geral dos ativos
- [x] Modal de conexão — PostgreSQL, MySQL, SQL Server, BigQuery, CSV
- [ ] Testar conexão com banco externo
- [ ] Datasets — criar a partir de conexão ou arquivo
- [ ] Editor SQL com preview
- [ ] Dashboards e widgets
- [ ] Documentação por ativo (Markdown)

## Estrutura do projeto

```
src/
├── app/                        # Rotas Next.js (App Router)
│   └── [locale]/
│       ├── (auth)/dashboard/   # Área autenticada
│       └── (marketing)/        # Landing page
├── components/ui/              # Componentes Shadcn
├── features/
│   ├── connections/            # Conexões com fontes de dados
│   ├── projects/               # Projetos e ativos
│   ├── dashboard/              # Layout do painel
│   └── landing/                # Landing page
├── libs/                       # DB, i18n, logger, env
├── models/Schema.ts            # Schema do banco (Drizzle)
└── utils/                      # Configurações e helpers
```

## Rodando localmente

**Requisitos:** Node.js 20+, npm

```bash
# Clone o repositório
git clone https://github.com/mesquitaRodrigo/veritas-Saas.git
cd veritas-Saas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie .env.local com:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
# CLERK_SECRET_KEY=...
# DATABASE_URL=...

# Rode em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com:

```env
# Clerk — obtenha em clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Neon PostgreSQL — obtenha em neon.tech
DATABASE_URL=postgresql://...
```

## Banco de dados

O projeto usa **PGlite** em desenvolvimento — nenhuma instalação necessária. As migrações rodam automaticamente ao iniciar o servidor.

Para produção, configure o `DATABASE_URL` apontando para um banco Neon.

```bash
# Gerar nova migração após alterar o Schema.ts
npm run db:generate

# Aplicar migrações manualmente
npm run db:migrate

# Explorar o banco via UI
npm run db:studio
```

## Domínios de negócio

O sistema segue uma hierarquia clara:

```
Organização
  └── Projeto
        ├── Conexões
        ├── Datasets
        ├── Consultas SQL
        └── Dashboards
              └── Widgets
```

Todo ativo pertence obrigatoriamente a um Projeto. Dados de uma organização nunca são visíveis para outra.

---

© 2026 Véritas. Todos os direitos reservados.