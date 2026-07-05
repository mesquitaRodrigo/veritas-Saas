# Documento 1: Visão do Produto

## Missão
Democratizar a governança de dados, permitindo que empresas conectem, transformem e visualizam seus dados com transparência, qualidade e linhagem completa, sem depender de múltiplas ferramentas fragmentadas.

## Visão
Ser a plataforma unificada de governança de dados que combina simplicidade de uso com profundidade técnica, tornando a linhagem e qualidade de dados acessíveis para equipes de todos os tamanhos.

## Objetivos

**Curto Prazo (6-12 meses):**
- Lançar MVP com conectores, transformação SQL e visualização
- Validar product-market fit com PMF
- Estabelecer base de usuários early adopters

**Médio Prazo (1-2 anos):**
- Implementar governança de linhagem e qualidade
- Adicionar orquestração de pipelines
- Expandir conectores para fontes populares

**Longo Prazo (2+ anos):**
- Incorporar agentes de AI para automação
- Tornar-se referência em governança de dados
- Escalar para enterprise

## Problemas que Resolve

**Problema 1: Fragmentação de Ferramentas**
- Empresas usam 5+ ferramentas diferentes (ETL, BI, catalog, quality)
- Integração complexa e propensa a erros
- Custo alto de licenciamento

**Problema 2: Falta de Linhagem**
- Difícil rastrear origem e transformação dos dados
- Problemas de qualidade são difíceis de debugar
- Auditoria e compliance são complexos

**Problema 3: Barreira Técnica**
- Ferramentas atuais exigem conhecimento especializado
- Business users dependem de times técnicos
- Time-to-value lento

**Problema 4: Falta de Organização**
- Ativos de dados espalhados sem contexto
- Difícil saber o que pertence a qual time/projeto
- Colaboração desorganizada

## Diferenciais

**Diferencial 1: Contexto de Dados**
- Preserva contexto de negócio, não apenas dados técnicos
- Documentação, responsáveis, tags e histórico em cada ativo
- Transforma o Véritas em ambiente de colaboração, não apenas visualização
- Exemplo: Projeto Comercial → Conexão ERP → Dataset Receita → Consulta SQL → Dashboard → Documentação → Responsável → Tags → Histórico

**Diferencial 2: Contexto e Governança Básica**
- Metadata nativa (responsáveis, tags, documentação)
- Rastreabilidade básica de ativos
- Fundação para governança completa (evolução futura)

**Diferencial 3: Simplicidade Técnica**
- Transformação via SQL (universal)
- Interface moderna e intuitiva
- Setup em minutos, não semanas

**Diferencial 4: Orientação por Projetos**
- Unidade central do sistema - todo ativo pertence obrigatoriamente a um Projeto
- Organização natural por time/caso de uso
- Isolamento entre equipes
- Escalabilidade estruturada

## Público-Alvo

**Primário (MVP):**
- Startups brasileiras Série A-B (20-150 funcionários)
- Setores: Fintech, E-commerce, SaaS B2B, Logística
- Times de dados estruturados (3-10 pessoas: 1-2 engenheiros, 1-3 analistas)
- Empresas com data warehouse implementado (BigQuery/Redshift/Snowflake)
- Data Leads buscando centralizar governança manual

**Secundário (V2+):**
- Departamentos de dados em empresas maiores
- Consultores de dados
- Agências de analytics
- Analytics Managers e Business Users (expansão via land-and-expand)

## Personas

**Persona Primária (MVP): Data Lead**

**Cargo e senioridade:**
- Data Lead / Head of Data / Senior Data Engineer
- 4-8 anos de experiência
- Reporta-se a CTO, VP of Engineering ou CPO

**Perfil da empresa:**
- Startups brasileiras Série A-B (20-150 funcionários)
- Setores: Fintech, E-commerce, SaaS B2B, Logística
- Time de dados: 3-10 pessoas (1-2 engenheiros, 1-3 analistas)
- Data warehouse implementado (BigQuery/Redshift/Snowflake)

**Stack técnico típico:**
- Banco de dados: PostgreSQL (produção), BigQuery (DW)
- ETL: Airflow scripts manuais, Fivetran (se orçamento permite)
- BI: Metabase ou Looker (implementado mas subutilizado)
- Documentação: Notion, Confluence, Google Docs

**Dor principal:**
"Perco horas semanais procurando queries antigas, explicando o que cada tabela significa para novos analistas e mantendo documentação desatualizada em múltiplas ferramentas."

**Trabalho a ser feito (JTBD):**
Centralizar governança de dados em um único lugar onde contexto de negócio (documentação, tags, responsáveis) vive junto com ativos técnicos (queries, dashboards, datasets).

**Métrica de sucesso:**
Redução de 50% no tempo de onboarding de novos analistas (de 2 semanas para 1 semana) e eliminação de perguntas repetitivas sobre localização de queries.

**Objecções de compra:**
- "Já tenho Metabase/Looker — por que preciso de outra ferramenta?"
- "Posso construir isso com Notion + GitHub — não quero mais uma assinatura"
- "Meu time é pequeno (3 pessoas) — governança é problema para quando formos maiores"
- "O produto é muito novo — e se vocês quebrarem em 6 meses?"
- "Não tenho tempo para migrar documentação existente"

**Willingness-to-pay:** R$800-2.000/mês

**Persona Secundária (V2+): Analytics Manager**

**Cargo e senioridade:**
- Analytics Manager / Head of Analytics
- 3-7 anos de experiência
- Responsável por insights e KPIs

**Dor principal:**
Demora para obter dados confiáveis e isolamento entre projetos

**Valor esperado:**
Velocidade + qualidade + isolamento entre projetos

**Willingness-to-pay:** R$500-1.500/mês

**Persona Terciária (V2+): Business User**

**Cargo e senioridade:**
- Analista de negócios/Marketing
- Perfil não-técnico

**Dor principal:**
Dependência de time técnico para acessar dados

**Valor esperado:**
Self-service com governança

**Willingness-to-pay:** R$100-300/mês

**Nota:** Analytics Managers e Business Users serão alcançados via land-and-expand após Data Leads implementarem o Véritas como porta de entrada.

## Casos de Uso

**UC1: Criar Projeto**
- Usuário cria novo projeto
- Define time e permissões
- Estabelece contexto de negócio

**UC2: Conectar e Explorar**
- Usuário conecta fonte de dados ao projeto (PostgreSQL, BigQuery, etc.)
- Explora esquema e dados
- Valida qualidade inicial

**UC3: Transformar Dados**
- Usuário escreve queries SQL dentro do projeto
- Cria datasets transformados
- Visualiza preview de resultados

**UC4: Criar Dashboard**
- Usuário cria visualizações com datasets do projeto
- Compõe dashboard
- Compartilha com time do projeto

**UC5: Ver Metadata de Ativos**
- Usuário vê responsável e documentação de cada ativo
- Entende contexto de negócio
- Rastreia origem básica (qual conexão/dataset alimenta o dashboard)

**UC6: Gerenciar Múltiplos Projetos**
- Usuário navega entre projetos diferentes
- Mantém isolamento de dados e permissões
- Escala organização conforme cresce

## O que o Véritas É

- Plataforma unificada de governança de dados orientada por Projetos
- Ferramenta de transformação SQL
- Ferramenta de visualização interativa
- Sistema de linhagem de dados
- Ferramenta de qualidade de dados
- Hub central para operações de dados
- Estrutura organizacional que garante isolamento entre equipes

## Estrutura por Projetos

O Véritas é orientado por Projetos. **Projetos é a unidade central do sistema.**

**Regra fundamental:** Todo ativo pertence obrigatoriamente a um Projeto. Nenhum ativo existe fora de um Projeto.

**Dentro de um Projeto existem (MVP):**
- Conexões (fontes de dados)
- Datasets (dados transformados)
- Consultas SQL (queries)
- Dashboards (visualizações)
- Widgets (componentes de dashboard)
- Documentação (contexto de negócio em Markdown)
- Metadata básica (responsáveis, tags)

**Ativos Futuros (V2+):**
- Métricas (KPIs e indicadores calculados)
- Qualidade (validações avançadas e regras)
- Governança avançada (linhagem completa)
- Versionamento (histórico de mudanças)
- Pipeline (orquestração)

**Ciclo de Vida dos Ativos:**
- Cada ativo possui seu próprio ciclo de vida
- Criação → Edição → Versão → Arquivamento/Deleção
- Histórico completo de mudanças
- Responsáveis definidos por ativo

**Benefícios da Orientação por Projetos:**
- Organização clara por time/caso de uso
- Isolamento entre equipes (segurança e autonomia)
- Escalabilidade (projetos crescem independentemente)
- Gestão de permissões granular
- Facilita onboarding de novos membros
- Contexto de negócio preservado em cada ativo

## O que o Véritas NÃO É

- NÃO é um data warehouse (conecta a warehouses existentes)
- NÃO é uma ferramenta de ETL/ELT tradicional (foco em transformação, não ingestão)
- NÃO é um BI puramente visual (tem profundidade técnica)
- NÃO é um data catalog standalone (catalog é parte da governança)
- NÃO é uma plataforma de orquestração (isso é futuro)
- NÃO é uma ferramenta de AI (AI é futuro)

## Princípios do Produto

**P1: Simplicidade Primeiro**
- Interface intuitiva
- Setup rápido
- Curva de aprendizado baixa

**P2: Transparência Básica**
- Metadata visível (responsáveis, tags, documentação)
- Auditoria básica (quem criou/modificou)
- Fundação para linhagem completa (evolução futura)

**P3: Qualidade Básica**
- Validações simples (tipos, nulls)
- Preview de dados antes de salvar
- Confiança nos dados

**P4: Modularidade**
- Funcionalidades independentes
- Uso progressivo
- Sem lock-in

**P5: Performance**
- Queries rápidas
- Dashboards responsivos
- Escalabilidade horizontal

**P6: Orientação por Projetos**
- Isolamento natural
- Escalabilidade estruturada
- Colaboração organizada

## Valores

- **Confiança**: Dados confiáveis geram decisões confiáveis
- **Transparência**: Cada dado tem origem e destino conhecidos
- **Simplicidade**: Complexidade técnica escondida, usabilidade exposta
- **Autonomia**: Usuários não dependentes de times técnicos
- **Eficiência**: Menos ferramentas, mais valor
- **Organização**: Estrutura clara por projetos facilita colaboração
- **Contexto**: Dados com significado de negócio, não apenas técnicos

## Escopo do MVP

**Estrutura do MVP:**

Organização
↓
Projeto
↓
Conexões
↓
Datasets
↓
Consultas SQL (opcional)
↓
Dashboards
↓
Compartilhamento

**Metadata Básica (MVP):**
- Documentação em Markdown
- Responsáveis por ativo
- Tags para categorização
- Auditoria básica (created_by, updated_by)

**Evolução Futura (V2+):**
- Governança avançada (linhagem completa)
- Qualidade avançada (validações, anomalias)
- Versionamento de ativos
- Pipelines de orquestração
- IA e automação

## O que é um Dataset

**Definição:**
Um Dataset é qualquer conjunto de dados utilizável pela plataforma, independentemente da origem. É a unidade fundamental de dados consumível no Véritas.

**Origens Possíveis:**
- Tabela (PostgreSQL, MySQL, SQL Server, BigQuery, etc)
- View (view de banco de dados)
- Consulta SQL (query salva)
- CSV (arquivo CSV)
- Excel (arquivo Excel)
- Parquet (arquivo Parquet)
- API (endpoint de API)

**Abstração:**
Dataset
↓
Origem
↓
Tabela PostgreSQL OU View OU Consulta SQL OU CSV OU Excel OU Parquet OU API

**Benefícios da Abstração:**
- Flexibilidade para adicionar novas origens no futuro
- Todo o restante da aplicação trabalha apenas com o conceito de Dataset
- Simplificação do código (não precisa saber a origem)
- Experiência unificada para o usuário

**Características:**
- Pode ser reutilizado em múltiplas visualizações
- Pertence obrigatoriamente a um Projeto
- Possui metadata (nome, descrição, responsável, tags)
- Interface unificada independentemente da origem

**Ciclo de Vida:**
1. Usuário seleciona origem (tabela, view, query, arquivo, etc)
2. Dataset é criado a partir da origem
3. Dataset pode ser usado em Dashboards
4. Dataset pode ser atualizado (refresh dependendo da origem)

## Metas do MVP

**Meta 1: Conectividade**
- Conectores: PostgreSQL, MySQL, SQL Server, BigQuery e CSV
- Autenticação segura
- Teste de conexão

**Meta 2: Datasets**
- Suporte a múltiplas origens (tabela, view, consulta SQL, CSV)
- Abstração unificada de Dataset
- Preview de dados
- Metadata básica (nome, descrição, responsável, tags)

**Meta 3: Transformação**
- Editor SQL com syntax highlighting
- Preview de resultados
- Salvamento de queries como Consultas SQL
- Criação de Datasets a partir de Consultas SQL

**Meta 4: Visualização**
- 3 tipos de charts essenciais (bar, line, table)
- Dashboards com múltiplos widgets
- Filtros interativos básicos
- Datasets como fonte de dados para visualizações

**Meta 5: Organização por Projetos**
- Criação de projetos
- Isolamento de ativos por projeto
- Navegação entre projetos
- Contexto básico (nome, descrição, responsável)

**Meta 6: Documentação**
- Campo de documentação em Markdown por ativo (Projeto, Conexão, Dataset, Consulta, Dashboard)
- Tags para categorização
- Responsável por ativo

**Meta 7: Compartilhamento e Permissões**
- Compartilhamento entre membros da organização/projeto
- Roles: Owner, Admin, Editor e Viewer
- Multi-tenancy desde o início (organizações isoladas)

**Meta 8: Usabilidade**
- Onboarding guiado
- Documentação básica
- Suporte via chat/email

**Meta 9: Fundação Técnica**
- Arquitetura modular para expansão futura
- Estrutura preparada para governança (metadata básica)
- Captura de metadados para linhagem (visualização completa na v2)
- Apenas validações básicas de qualidade no MVP

## Ajustes do MVP Baseados na Persona Primária (Data Lead)

Com base na definição do Data Lead como persona primária, os seguintes ajustes são recomendados no escopo do MVP:

### Amplificado no MVP (Features Críticas para Data Lead)

**Editor SQL Robusto**
- Syntax highlighting completo
- Autocomplete de tabelas e colunas
- Query history (histórico de queries executadas)
- Salvamento de queries favoritas
- Preview de resultados (limit 100 linhas)
- Tempo de execução exibido

**Documentação por Ativo**
- Campo de documentação em Markdown rich text para cada ativo (Projeto, Conexão, Dataset, Consulta, Dashboard)
- Tags obrigatórias (pelo menos 1)
- Responsável (owner) obrigatório por ativo
- Preview em tempo real do Markdown

**Organização por Projetos**
- Criação de projetos com contexto completo (nome, descrição, responsável, tags)
- Isolamento total entre projetos
- Navegação fluida entre projetos
- Gestão de membros por projeto com roles granulares

**Controle de Acesso Granular**
- Roles: Owner, Admin, Editor, Viewer
- Permissões herdadas do projeto para todos os ativos
- Auditoria básica (created_by, updated_by, created_at, updated_at)

**Importação de CSV**
- Upload de CSV direto
- Detecção automática de delimitador
- Preview de dados antes de salvar
- Criação automática de Dataset a partir de CSV

### Reduzido no MVP (Features com Prioridade Menor)

**Dashboards**
- Reduzir de 5-10 tipos de chart para 3 essenciais: bar, line, table
- Pie charts e number cards adiados para V2
- Layout simplificado (grid básico)
- Filtros globais básicos

**Visualização**
- Remover drag-and-drop avançado de widgets
- Configuração via formulário (suficiente para Data Leads)
- Templates de dashboard removidos (Data Leads constroem customizados)

**Exportação**
- Exportação básica apenas: CSV e PNG
- Scheduled exports adiados para V2
- PDF export adiado para V2

### Adiado para V2 (Features Não Servem à Persona Primária)

**Interface No-Code para Business Users**
- Query builders visuais
- Natural language to SQL
- Data Lead prefere SQL nativo

**Alerts e Notificações**
- Alerts integrados em dashboards
- Notificações por email/Slack
- Data Leads preferem monitorar via ferramentas próprias

**Data Lineage Automático**
- Visualização completa de linhagem
- Impact analysis
- Feature complexa, não crítica para MVP

**Integrações com BI Externo**
- Conector Looker
- Conector Power BI
- Data Leads podem usar Véritas como BI primário no MVP

---

## Glossário

| Termo | Definição |
|-------|-----------|
| Organização | Empresa ou cliente que utiliza o Véritas. |
| Projeto | Unidade central do sistema que agrupa todos os ativos de dados. |
| Ativo | Qualquer recurso pertencente a um projeto. |
| Conexão | Configuração para acessar uma fonte de dados. |
| Fonte de Dados | Banco de dados, arquivo ou serviço externo. |
| Dataset | Qualquer conjunto de dados utilizável pela plataforma, independentemente da origem (tabela, view, consulta SQL, CSV, Excel, Parquet, API). |
| Consulta SQL | Query salva dentro de um projeto. |
| Dashboard | Painel composto por widgets. |
| Widget | Elemento visual de um dashboard. |
| Documento | Registro de contexto de negócio relacionado a um projeto ou ativo. |
| Métrica | Indicador calculado a partir de um ou mais datasets. |

## Decisões Tomadas

**Conectores do MVP**
- PostgreSQL, MySQL, SQL Server, BigQuery e CSV

**Modelo de Preço**
- Trial + assinatura mensal

**Deploy**
- Apenas Cloud no MVP

**Multi-tenancy**
- Sim, desde o início (organizações isoladas)

**Limitações do MVP**
- Limitar projetos, conexões e dashboards por plano

**Qualidade de Dados**
- Apenas validações básicas no MVP

**Linhagem**
- Capturar metadados desde o MVP, visualização completa na v2

**Compartilhamento**
- Apenas entre membros da organização/projeto

**Roles**
- Owner, Admin, Editor e Viewer

**Documentação**
- Markdown

**Dataset**
- Qualquer conjunto de dados utilizável pela plataforma, independentemente da origem
