# Documento 2: Domínios de Negócio

## Visão Geral

O Véritas é organizado em domínios de negócio claros e isolados, com o Projeto como unidade central. Cada domínio tem responsabilidades específicas, limites definidos e relacionamentos bem estabelecidos.

## Diagrama em Árvore

```
Véritas
├── Organização
│   ├── Usuários
│   └── Projetos
│       ├── Conexões
│       ├── Datasets
│       ├── Consultas SQL
│       ├── Dashboards
│       │   └── Widgets
│       ├── Documentação
│       └── Metadata
│           ├── Tags
│           └── Responsáveis
```

## Domínios Principais

### 1. Domínio: Organização

**Responsabilidade:**
- Gerenciar o contexto multi-tenant da aplicação
- Isolar dados e configurações entre diferentes clientes
- Gerenciar assinatura e plano de pagamento

**Limites:**
- Uma Organização pode ter múltiplos Projetos
- Uma Organização pode ter múltiplos Usuários
- Dados de uma Organização nunca são visíveis para outra

**Relacionamentos:**
- **Tem muitos** → Projetos
- **Tem muitos** → Usuários
- **Pertence a** → Plano de Assinatura

**Dependências:**
- Depende de: Sistema de Autenticação (Clerk)
- É dependido por: Todos os outros domínios (isolamento)

**Fluxo:**
1. Usuário se cadastra → Organização é criada
2. Organização é associada a um plano
3. Usuários são convidados para a Organização
4. Projetos são criados dentro da Organização

---

### 2. Domínio: Projeto

**Responsabilidade:**
- Unidade central do sistema
- Agrupar e isolar todos os ativos de dados
- Gerenciar contexto de negócio específico
- Controlar acesso e permissões granulares

**Limites:**
- Todo ativo pertence obrigatoriamente a um Projeto
- Ativos de um Projeto não são visíveis para outros Projetos
- Um Projeto pertence a uma única Organização

**Relacionamentos:**
- **Pertence a** → Organização
- **Tem muitos** → Conexões
- **Tem muitos** → Datasets
- **Tem muitos** → Consultas SQL
- **Tem muitos** → Dashboards
- **Tem muitos** → Documentos
- **Tem muitos** → Usuários (com roles específicas)

**Dependências:**
- Depende de: Organização
- É dependido por: Todos os domínios de ativos

**Fluxo:**
1. Usuário cria Projeto dentro da Organização
2. Usuário define contexto (nome, descrição, responsável)
3. Usuário convida membros para o Projeto
4. Ativos são criados dentro do Projeto

---

### 3. Domínio: Conexão

**Responsabilidade:**
- Gerenciar configurações de acesso a fontes de dados externas
- Armazenar credenciais de forma segura
- Testar viabilidade de conexão
- Prover interface unificada para diferentes tipos de fontes

**Limites:**
- Uma Conexão pertence a um único Projeto
- Uma Conexão é específica para um tipo de fonte (PostgreSQL, CSV, etc)
- Credenciais são criptografadas e nunca expostas diretamente

**Relacionamentos:**
- **Pertence a** → Projeto
- **Pode gerar** → Datasets (tabelas, views)
- **É usada por** → Consultas SQL

**Dependências:**
- Depende de: Projeto
- Depende de: Drivers/Conectores específicos
- É dependida por: Dataset, Consulta SQL

**Fluxo:**
1. Usuário seleciona tipo de fonte (PostgreSQL, CSV, etc)
2. Usuário preenche configuração (host, port, credentials, etc)
3. Sistema testa conexão
4. Conexão é salva no Projeto
5. Conexão fica disponível para criar Datasets e Consultas

---

### 4. Domínio: Dataset

**Responsabilidade:**
- Abstrair qualquer conjunto de dados consumível
- Prover interface unificada independentemente da origem
- Gerenciar metadata (nome, descrição, responsável, tags)
- Servir como fonte de dados para Dashboards

**Limites:**
- Um Dataset pertence a um único Projeto
- Um Dataset tem uma única origem (tabela, view, consulta SQL, CSV, etc)
- A origem do Dataset é abstraída - o restante do sistema não precisa saber

**Relacionamentos:**
- **Pertence a** → Projeto
- **Originado de** → Conexão (indiretamente)
- **Pode ser originado de** → Consulta SQL
- **Alimenta** → Dashboards (via Widgets)
- **Tem** → Metadata (tags, responsável)

**Dependências:**
- Depende de: Projeto
- Depende de: Conexão (para tabelas/views) ou Consulta SQL (para queries)
- É dependido por: Dashboard

**Fluxo:**
1. Usuário seleciona origem (tabela, view, consulta SQL, CSV, etc)
2. Sistema cria Dataset a partir da origem
3. Usuário adiciona metadata (nome, descrição, tags, responsável)
4. Dataset fica disponível para uso em Dashboards
5. Dataset pode ser atualizado (refresh dependendo da origem)

---

### 5. Domínio: Consulta SQL

**Responsabilidade:**
- Armazenar queries SQL reutilizáveis
- Prover editor SQL com syntax highlighting
- Permitir preview de resultados
- Gerar Datasets a partir de queries

**Limites:**
- Uma Consulta SQL pertence a um único Projeto
- Uma Consulta SQL é executada em uma única Conexão
- Consultas podem ser salvas e reutilizadas

**Relacionamentos:**
- **Pertence a** → Projeto
- **Executa em** → Conexão
- **Gera** → Dataset
- **Tem** → Metadata (tags, responsável)

**Dependências:**
- Depende de: Projeto
- Depende de: Conexão
- É dependido por: Dataset

**Fluxo:**
1. Usuário seleciona Conexão
2. Usuário escreve query SQL no editor
3. Usuário executa preview
4. Usuário salva Consulta SQL
5. Usuário pode gerar Dataset a partir da Consulta

---

### 6. Domínio: Dashboard

**Responsabilidade:**
- Compor visualizações de dados em painéis interativos
- Organizar Widgets de forma lógica
- Prover filtros globais
- Facilitar compartilhamento de insights

**Limites:**
- Um Dashboard pertence a um único Projeto
- Um Dashboard contém múltiplos Widgets
- Dashboards são compartilháveis dentro da Organização

**Relacionamentos:**
- **Pertence a** → Projeto
- **Contém** → Widgets
- **Consome** → Datasets (via Widgets)
- **Tem** → Metadata (tags, responsável)

**Dependências:**
- Depende de: Projeto
- Depende de: Dataset (indiretamente via Widgets)
- É dependido por: Widget

**Fluxo:**
1. Usuário cria Dashboard no Projeto
2. Usuário adiciona Widgets
3. Usuário configura filtros globais
4. Dashboard é salvo e compartilhado

---

### 7. Domínio: Widget

**Responsabilidade:**
- Renderizar visualizações individuais (charts, tabelas, números)
- Configurar tipo de visualização (bar, line, pie, table, number)
- Consumir dados de um Dataset
- Aplicar filtros específicos

**Limites:**
- Um Widget pertence a um único Dashboard
- Um Widget consome um único Dataset
- Widget não existe fora de um Dashboard

**Relacionamentos:**
- **Pertence a** → Dashboard
- **Consome** → Dataset
- **Tem configuração de** → Tipo de chart, filtros, layout

**Dependências:**
- Depende de: Dashboard
- Depende de: Dataset
- Não é dependido por outros domínios

**Fluxo:**
1. Usuário adiciona Widget ao Dashboard
2. Usuário seleciona Dataset
3. Usuário configura tipo de visualização
4. Usuário aplica filtros
5. Widget é renderizado

---

### 8. Domínio: Documentação

**Responsabilidade:**
- Armazenar contexto de negócio de ativos
- Prover editor Markdown
- Facilitar colaboração e conhecimento
- Registrar última modificação (auditoria básica)

**Limites:**
- Documentação está associada a um ativo específico (Projeto, Conexão, Dataset, Consulta, Dashboard)
- Documentação é em formato Markdown
- Documentação pertence ao contexto do Projeto

**Relacionamentos:**
- **Pertence a** → Projeto (indiretamente via ativo)
- **Descreve** → Ativo (Projeto, Conexão, Dataset, Consulta, Dashboard)

**Dependências:**
- Depende de: Ativo associado
- Não é dependido por outros domínios

**Fluxo:**
1. Usuário edita documentação de um ativo
2. Usuário escreve em Markdown
3. Documentação é salva
4. Documentação é exibida no contexto do ativo

---

### 9. Domínio: Metadata

**Responsabilidade:**
- Gerenciar tags de categorização
- Gerenciar responsáveis por ativos
- Prover contexto adicional
- Facilitar busca e organização

**Limites:**
- Metadata está associada a ativos específicos
- Tags são globais dentro da Organização
- Responsável é um Usuário do sistema

**Relacionamentos:**
- **Pertence a** → Ativo (Projeto, Conexão, Dataset, Consulta, Dashboard)
- **Referencia** → Usuário (responsável)
- **Usa** → Tags

**Dependências:**
- Depende de: Ativo associado
- Depende de: Usuário
- Não é dependido por outros domínios

**Fluxo:**
1. Usuário adiciona tags a um ativo
2. Usuário define responsável
3. Metadata é salva
4. Metadata é usada para busca e filtros

---

### 10. Domínio: Usuário e Permissões

**Responsabilidade:**
- Gerenciar identidade de usuários
- Controlar acesso a Organizações e Projetos
- Gerenciar roles (Owner, Admin, Editor, Viewer)
- Auditoria básica (quem criou/modificou cada ativo)

**Limites:**
- Um Usuário pode pertencer a múltiplas Organizações
- Um Usuário pode ter roles diferentes em diferentes Projetos
- Autenticação é gerenciada por Clerk

**Relacionamentos:**
- **Pertence a** → Organização
- **Participa de** → Projetos (com roles)
- **É responsável por** → Ativos (via Metadata)

**Dependências:**
- Depende de: Sistema de Autenticação (Clerk)
- Depende de: Organização
- É dependido por: Metadata, Projeto

**Fluxo:**
1. Usuário se autentica via Clerk
2. Sistema verifica Organizações do Usuário
3. Usuário seleciona Organização
4. Sistema verifica Projetos e Roles do Usuário
5. Usuário acessa Projetos conforme permissões

---

## Relacionamentos Entre Domínios

### Fluxo Principal de Criação

```
Organização
  ↓
Projeto
  ↓
Conexão
  ↓
Consulta SQL (opcional)
  ↓
Dataset
  ↓
Dashboard
  ↓
Widget
```

### Fluxo de Dados

```
Fonte de Dados (Externa)
  ↓ via Conexão
Dataset
  ↓ via Widget
Dashboard
  ↓ para Usuário
Visualização
```

### Fluxo de Permissões

```
Usuário
  ↓ tem role em
Organização
  ↓ tem role em
Projeto
  ↓ controla acesso a
Todos os Ativos
```

---

## Dependências Cruzadas

### Dependências Fortes (Obrigatórias)
- **Dataset** depende de **Projeto** (não existe fora)
- **Widget** depende de **Dashboard** (não existe fora)
- **Consulta SQL** depende de **Conexão** (não executa sem)

### Dependências Fracas (Opcionais)
- **Dataset** pode vir de **Consulta SQL** ou diretamente de **Conexão**
- **Documentação** é opcional para todos os ativos
- **Metadata** (tags) é opcional

### Independência
- **Organização** é independente (topo da hierarquia)
- **Usuário** é independente (gerenciado por Clerk)

---

## Pontos Pendentes de Decisão

## Decisões Tomadas

**1. Hierarquia de Projetos**
- Não ter subprojetos
- Todos os Projetos estão no mesmo nível
- Cada Projeto é completamente isolado

**2. Herança de Permissões**
- Permissões são herdadas do Projeto
- Ativos herdam permissões do Projeto ao qual pertencem
- Não há permissões granulares por ativo no MVP

**3. Compartilhamento entre Projetos**
- Cada Projeto é completamente isolado
- Datasets não são reutilizáveis entre Projetos
- Para reutilizar, deve-se copiar o ativo

**4. Templates**
- Templates permitirão copiar ativos entre Projetos
- Exemplo: Dashboard Executivo do Projeto Comercial pode ser copiado para Projeto Financeiro
- Após cópia, os ativos são independentes (nada fica sincronizado)

**5. Versionamento de Ativos**
- Sem versionamento no MVP
- Versionamento será implementado em versão futura

**6. Auditoria**
- Auditoria básica desde o MVP
- Registrar quem criou/modificou cada ativo (created_by, updated_by, created_at, updated_at)

**7. Busca Global**
- Busca global na Organização
- Filtros disponíveis: por Projeto e por tipo de ativo
