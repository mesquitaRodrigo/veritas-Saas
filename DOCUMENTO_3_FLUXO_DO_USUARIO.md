# Documento 3: Fluxo do Usuário

## Visão Geral

Este documento mapeia a jornada completa do usuário no Véritas, desde o cadastro inicial até o compartilhamento de insights. O fluxo é orientado por Projetos, que são a unidade central do sistema.

---

## Jornada de Valor

O usuário não entra no Véritas para criar um Dataset ou Dashboard, mas para responder perguntas de negócio.

**Fluxo de Valor:**

Objetivo de negócio
↓
Preciso acessar meus dados
↓
Preciso organizá-los
↓
Preciso transformá-los
↓
Preciso visualizá-los
↓
Preciso compartilhar com minha equipe
↓
Obter insights

O Véritas facilita essa jornada ao prover um Data Workspace orientado por Projetos, preparado para evoluir para uma plataforma completa de Governança de Dados.

---

## Primeiros 5 Minutos

**Objetivo:** O usuário deve chegar ao seu primeiro insight em menos de cinco minutos.

**Fluxo de Onboarding Ideal:**

Landing Page
↓
Cadastro
↓
Organização
↓
Projeto
↓
Conexão
↓
Selecionar tabela
↓
Criar gráfico
↓
Primeiro Dashboard
↓
Aha Moment

Este fluxo será utilizado como referência para todas as decisões de UX. Cada etapa deve ser otimizada para reduzir o tempo até o Aha Moment.

---

## Aha Moment

**Definição:**

"O usuário visualiza seu primeiro gráfico funcionando utilizando dados reais provenientes de uma fonte conectada."

Todas as decisões de onboarding e UX devem ter como objetivo reduzir o tempo necessário para chegar até esse momento. O Aha Moment é o ponto de virada onde o usuário percebe o valor real do Véritas.

---

## Fluxo Principal (Happy Path)

```
Cadastro
  ↓
Organização
  ↓
Projeto
  ↓
Conexão
  ↓
Dataset
  ↓
Consulta SQL (opcional)
  ↓
Dashboard
  ↓
Compartilhamento
```

---

## Etapa 1: Cadastro

### Fluxo Detalhado

1. **Acesso à Aplicação**
   - Usuário acessa URL do Véritas
   - Usuário vê landing page com CTA "Começar Trial"

2. **Início do Cadastro**
   - Usuário clica em "Começar Trial"
   - Sistema redireciona para Clerk (autenticação)
   - Usuário escolhe método: Google, GitHub, Email/Password

3. **Autenticação**
   - Usuário completa autenticação via Clerk
   - Sistema recebe dados do usuário (email, nome, etc)
   - Sistema verifica se usuário já existe

4. **Criação da Organização**
   - Sistema cria automaticamente uma Organização para o usuário
   - Usuário define nome da Organização
   - Usuário é atribuído como Owner da Organização

5. **Configuração Inicial**
   - Sistema configura plano Trial automaticamente
   - Usuário pode alterar plano após primeiro uso

6. **Onboarding**
   - Sistema exibe CTA "Criar Primeiro Projeto"
   - Sistema exibe instruções rápidas (3 passos)

### Variações

**Variação A: Usuário Convidado**
- Usuário recebe email de convite
- Usuário clica no link do convite
- Sistema redireciona para Clerk
- Após autenticação, usuário é adicionado à Organização existente
- Usuário recebe role definida no convite (Admin, Editor, Viewer)

**Variação B: Usuário Já Existente**
- Usuário já tem conta no Véritas
- Sistema detecta usuário existente
- Sistema pergunta: "Criar nova Organização ou entrar em existente?"
- Se entrar em existente: usuário seleciona Organização
- Se criar nova: fluxo normal de criação

### Pontos de Decisão

- Usuário quer criar nova Organização ou entrar em existente?
- Usuário aceita termos de uso?
- Usuário quer pular onboarding?

### Edge Cases

- Usuário cancela cadastro no meio do processo
- Usuário já atingiu limite de Organizações (se aplicável)
- Falha na integração com Clerk

---

## Etapa 2: Organização

### Fluxo Detalhado

1. **Dashboard da Organização**
   - Usuário acessa dashboard da sua Organização
   - Sistema exibe lista de Projetos
   - Sistema exibe estatísticas (número de projetos, conexões, dashboards)
   - Sistema exibir membros da Organização

2. **Gestão de Membros**
   - Owner/Admin pode convidar novos membros
   - Usuário clica em "Convidar Membro"
   - Usuário insere email do convidado
   - Usuário seleciona role (Owner, Admin, Editor, Viewer)
   - Sistema envia email de convite
   - Sistema exibe lista de membros com roles

3. **Configurações da Organização**
   - Owner/Admin acessa configurações
   - Usuário pode editar nome da Organização
   - Usuário pode ver plano atual e limites
   - Usuário pode upgrade/downgrade de plano
   - Usuário pode cancelar assinatura

### Variações

**Variação A: Primeiro Acesso**
- Organização recém-criada não tem Projetos
- Sistema exibe CTA "Criar Primeiro Projeto"
- Sistema exibe template de boas-vindas

**Variação B: Organização com Múltiplos Projetos**
- Usuário vê lista de Projetos
- Usuário pode buscar Projetos
- Usuário pode filtrar Projetos por tags

### Pontos de Decisão

- Usuário quer criar novo Projeto ou acessar existente?
- Usuário quer convidar novos membros?
- Usuário quer alterar plano?

### Edge Cases

- Usuário não tem permissão para convidar membros (Viewer)
- Limite de membros atingido conforme plano
- Organização está em trial expirado

---

## Etapa 3: Projeto

### Fluxo Detalhado

1. **Criação do Projeto**
   - Usuário clica em "Novo Projeto"
   - Usuário preenche nome do Projeto
   - Usuário preenche descrição (opcional)
   - Usuário seleciona responsável (padrão: usuário atual)
   - Usuário adiciona tags (opcional)
   - Sistema cria Projeto
   - Sistema redireciona para dashboard do Projeto

2. **Dashboard do Projeto**
   - Sistema exibe visão geral do Projeto
   - Sistema exibe lista de Conexões
   - Sistema exibe lista de Datasets
   - Sistema exibe lista de Consultas SQL
   - Sistema exibe lista de Dashboards
   - Sistema exibe documentação do Projeto

3. **Gestão de Membros do Projeto**
   - Owner/Admin da Organização atribui membros ao Projeto
   - Sistema exibe membros do Projeto
   - Sistema exibe roles específicas do Projeto
   - Permissões são herdadas do Projeto para todos os ativos

4. **Documentação do Projeto**
   - Usuário clica em "Documentação"
   - Usuário edita em Markdown
   - Sistema salva automaticamente
   - Sistema exibe preview em tempo real

### Variações

**Variação A: Copiar Projeto (Template)**
- Usuário seleciona Projeto existente
- Usuário clica em "Copiar"
- Usuário define nome do novo Projeto
- Sistema copia todos os ativos (Conexões, Datasets, Consultas, Dashboards)
- Sistema cria cópias independentes (nada sincronizado)
- Usuário pode modificar cópia livremente

**Variação B: Projeto Vazio**
- Usuário cria Projeto sem ativos
- Sistema exibe onboarding específico do Projeto
- Sistema sugere: "Criar Conexão", "Importar CSV", etc

### Pontos de Decisão

- Usuário quer criar Projeto do zero ou copiar existente?
- Usuário quer adicionar membros ao Projeto?
- Usuário quer documentar o Projeto agora?

### Edge Cases

- Usuário não tem permissão para criar Projetos (Viewer)
- Limite de Projetos atingido conforme plano
- Erro ao copiar Projeto (dependências quebradas)

---

## Etapa 4: Conexão

### Fluxo Detalhado

1. **Criação da Conexão**
   - Usuário clica em "Nova Conexão" dentro do Projeto
   - Sistema exibe tipos de fonte disponíveis (PostgreSQL, MySQL, SQL Server, BigQuery, CSV)
   - Usuário seleciona tipo de fonte

2. **Configuração da Conexão**
   - **Para Banco de Dados (PostgreSQL, MySQL, SQL Server, BigQuery):**
     - Usuário preenche host
     - Usuário preenche porta
     - Usuário preenche nome do banco
     - Usuário preenche usuário
     - Usuário preenche senha
     - Usuário preenche configurações adicionais (SSL, etc - opcional)
   - **Para CSV:**
     - Usuário faz upload do arquivo CSV
     - Sistema detecta delimitador automaticamente
     - Usuário confirma configuração

3. **Teste de Conexão**
   - Usuário clica em "Testar Conexão"
   - Sistema tenta conectar à fonte
   - Sistema exibe resultado: Sucesso ou Erro
   - Se erro: sistema exibe mensagem detalhada

4. **Salvamento**
   - Usuário clica em "Salvar"
   - Sistema criptografa credenciais
   - Sistema salva Conexão no Projeto
   - Sistema exibe lista de tabelas/views disponíveis (para bancos)

5. **Documentação da Conexão**
   - Usuário adiciona descrição (opcional)
   - Usuário adiciona tags (opcional)
   - Usuário define responsável (opcional)

### Variações

**Variação A: Conexão com CSV**
- Usuário seleciona CSV
- Usuário faz upload do arquivo
- Sistema exibe preview dos dados
- Usuário confirma delimitador e encoding
- Sistema cria Conexão e Dataset automaticamente

**Variação B: Conexão Reutilizada**
- Usuário vê que já existe Conexão similar em outro Projeto
- Usuário não pode reutilizar (Projetos são isolados)
- Usuário deve criar nova Conexão (pode copiar configurações manualmente)

### Pontos de Decisão

- Qual tipo de fonte o usuário quer conectar?
- Usuário quer testar conexão antes de salvar?
- Usuário quer documentar a Conexão?

### Edge Cases

- Falha na conexão (credenciais inválidas, host inacessível)
- Timeout na conexão
- CSV com formato inválido
- Conexão com firewall bloqueando acesso

---

## Etapa 5: Dataset

### Fluxo Detalhado

1. **Criação do Dataset**
   - Usuário clica em "Novo Dataset" dentro do Projeto
   - Sistema exibe opções de origem:
     - Tabela (de Conexão existente)
     - View (de Conexão existente)
     - Consulta SQL (de Consulta SQL existente)
     - CSV (upload direto)
     - Excel (upload direto - futuro)
     - Parquet (upload direto - futuro)
     - API (endpoint - futuro)

2. **Seleção da Origem**
   - **Opção A: Tabela/View de Conexão**
     - Usuário seleciona Conexão
     - Sistema exibe lista de tabelas/views disponíveis
     - Usuário seleciona tabela/view
     - Sistema exibe preview dos dados
   - **Opção B: Consulta SQL**
     - Usuário seleciona Consulta SQL existente
     - Sistema exibe preview dos resultados
   - **Opção C: CSV Direto**
     - Usuário faz upload de CSV
     - Sistema exibe preview dos dados

3. **Configuração do Dataset**
   - Usuário define nome do Dataset
   - Usuário define descrição (opcional)
   - Usuário adiciona tags (opcional)
   - Usuário define responsável (opcional)
   - Sistema salva Dataset

4. **Preview e Validação**
   - Sistema exibe preview dos dados (primeiras N linhas)
   - Sistema exibe schema (colunas e tipos)
   - Usuário pode aplicar filtros no preview

### Variações

**Variação A: Dataset via Consulta SQL**
- Usuário primeiro cria Consulta SQL
- Usuário executa query e vê preview
- Usuário clica em "Salvar como Dataset"
- Sistema cria Dataset a partir da Consulta

**Variação B: Dataset com Transformação**
- Usuário seleciona tabela base
- Usuário aplica filtros/transformações (futuro)
- Sistema cria Dataset transformado

### Pontos de Decisão

- Qual origem o usuário quer para o Dataset?
- Usuário quer aplicar transformações?
- Usuário quer documentar o Dataset?

### Edge Cases

- Tabela/view não existe mais na fonte
- CSV com formato inconsistente
- Dataset muito grande (timeout no preview)
- Permissões negadas na fonte de dados

---

## Etapa 6: Consulta SQL

### Fluxo Detalhado

1. **Criação da Consulta SQL**
   - Usuário clica em "Nova Consulta SQL" dentro do Projeto
   - Usuário seleciona Conexão (obrigatório)
   - Sistema abre editor SQL

2. **Escrita da Query**
   - Usuário escreve query SQL no editor
   - Editor oferece syntax highlighting
   - Editor oferece autocomplete (tabelas, colunas)
   - Usuário pode salvar rascunho

3. **Execução e Preview**
   - Usuário clica em "Executar"
   - Sistema executa query na Conexão
   - Sistema exibe resultados em tabela
   - Sistema exibe tempo de execução
   - Sistema exibe número de linhas

4. **Salvamento**
   - Usuário clica em "Salvar"
   - Usuário define nome da Consulta
   - Usuário adiciona descrição (opcional)
   - Usuário adiciona tags (opcional)
   - Sistema salva Consulta SQL

5. **Criação de Dataset (Opcional)**
   - Usuário clica em "Salvar como Dataset"
   - Sistema cria Dataset a partir da Consulta
   - Dataset fica disponível para Dashboards

### Variações

**Variação A: Query Complexa**
- Usuário escreve query com joins, subqueries, etc
- Sistema exibe plano de execução (futuro)
- Sistema sugere otimizações (futuro)

**Variação B: Query com Parâmetros**
- Usuário define variáveis na query
- Sistema permite preencher parâmetros ao executar
- Dataset criado pode ser parametrizado (futuro)

### Pontos de Decisão

- Usuário quer salvar apenas a Consulta ou também criar Dataset?
- Usuário quer documentar a Consulta?
- Usuário quer reutilizar a Consulta?

### Edge Cases

- Query com erro de sintaxe
- Query muito demorada (timeout)
- Query retorna muitos dados (limite de linhas)
- Permissões negadas na Conexão

---

## Etapa 7: Dashboard

### Fluxo Detalhado

1. **Criação do Dashboard**
   - Usuário clica em "Novo Dashboard" dentro do Projeto
   - Usuário define nome do Dashboard
   - Usuário define descrição (opcional)
   - Usuário adiciona tags (opcional)
   - Sistema cria Dashboard vazio

2. **Adição de Widget**
   - Usuário clica em "Adicionar Widget"
   - Sistema exibe tipos de chart disponíveis (bar, line, pie, table, number)
   - Usuário seleciona tipo de chart

3. **Configuração do Widget**
   - Usuário seleciona Dataset (obrigatório)
   - Sistema exibe colunas do Dataset
   - Usuário seleciona coluna para eixo X
   - Usuário seleciona coluna para eixo Y
   - Usuário aplica filtros (opcional)
   - Usuário configura ordenação (opcional)
   - Usuário configura agrupamento (opcional)

4. **Layout do Dashboard**
   - Usuário arrasta e solta Widgets para organizar
   - Usuário redimensiona Widgets
   - Usuário define número de colunas do grid

5. **Filtros Globais**
   - Usuário adiciona filtros globais ao Dashboard
   - Usuário define quais Widgets são afetados por cada filtro
   - Filtros globais se aplicam a todos os Widgets selecionados

6. **Salvamento**
   - Sistema salva automaticamente (autosave)
   - Usuário pode salvar manualmente
   - Sistema exibe timestamp da última modificação

### Variações

**Variação A: Copiar Dashboard**
- Usuário seleciona Dashboard existente
- Usuário clica em "Copiar"
- Usuário seleciona Projeto de destino (pode ser o mesmo)
- Sistema copia Dashboard e todos os Widgets
- Usuário pode modificar cópia livremente

**Variação B: Dashboard com Múltiplos Datasets**
- Usuário adiciona Widgets de diferentes Datasets
- Cada Widget pode ter seu próprio Dataset
- Filtros globais podem cruzar Datasets (futuro)

### Pontos de Decisão

- Usuário quer criar Dashboard do zero ou copiar existente?
- Usuário quer adicionar filtros globais?
- Usuário quer compartilhar Dashboard?

### Edge Cases

- Dataset usado no Widget foi deletado
- Dataset com schema alterado (colunas removidas)
- Dashboard com muitos Widgets (performance)

---

## Etapa 8: Compartilhamento

### Fluxo Detalhado

1. **Compartilhamento Interno**
   - Usuário clica em "Compartilhar" no Dashboard
   - Sistema exibe lista de membros da Organização
   - Usuário seleciona membros para compartilhar
   - Sistema envia notificação aos membros
   - Membros recebem acesso ao Dashboard

2. **Permissões de Compartilhamento**
   - Usuário define nível de acesso para cada membro:
     - View apenas (ver Dashboard)
     - Edit (modificar Dashboard)
   - Permissões respeitam roles do Projeto

3. **Link de Compartilhamento (Futuro)**
   - Usuário gera link público
   - Usuário define expiração do link (opcional)
   - Usuário define senha do link (opcional)
   - Link permite acesso sem autenticação

4. **Exportação (Futuro)**
   - Usuário clica em "Exportar"
   - Usuário seleciona formato (PDF, PNG, CSV)
   - Sistema gera arquivo
   - Usuário faz download

### Variações

**Variação A: Compartilhar Projeto Inteiro**
- Usuário compartilha acesso ao Projeto
- Todos os ativos do Projeto ficam acessíveis
- Permissões são herdadas do Projeto

**Variação B: Compartilhar Apenas Leitura**

- Usuário compartilha Dashboard com permissão de view
- Membros podem ver mas não modificar
- Útil para stakeholders executivos

### Pontos de Decisão

- Usuário quer compartilhar com quem?
- Usuário quer dar permissão de edição ou apenas visualização?
- Usuário quer gerar link público?

### Edge Cases

- Usuário tenta compartilhar com não-membro da Organização
- Usuário sem permissão para compartilhar (Viewer)
- Membro compartilhado não tem role no Projeto

---

## Fluxos Alternativos

### Fluxo Rápido: CSV → Dashboard

1. Usuário cria Projeto
2. Usuário faz upload de CSV
3. Sistema cria Conexão e Dataset automaticamente
4. Usuário cria Dashboard
5. Usuário adiciona Widget com o Dataset
6. Dashboard pronto em minutos

### Fluxo Técnico: Consulta SQL Avançada

1. Usuário cria Projeto
2. Usuário cria Conexão com banco de dados
3. Usuário escreve Consulta SQL complexa
4. Usuário salva como Dataset
5. Usuário cria Dashboard com múltiplos Widgets
6. Usuário aplica filtros globais

### Fluxo Colaborativo: Equipe

1. Data Lead cria Projeto e Conexões
2. Data Lead convida Analytics Manager
3. Analytics Manager cria Consultas SQL e Datasets
4. Analytics Manager convida Business User
5. Business User cria Dashboards
6. Dashboard compartilhado com toda equipe

---

## Operações por Ativo

Esta seção lista as operações CRUD disponíveis para cada tipo de ativo, separadas dos fluxos de jornada.

### Projeto
- Criar
- Editar
- Arquivar
- Duplicar (copiar como template)
- Excluir

### Conexão
- Criar
- Testar
- Editar
- Arquivar
- Excluir

### Dataset
- Criar
- Atualizar (refresh)
- Arquivar
- Excluir

### Consulta SQL
- Criar
- Executar
- Salvar
- Salvar como Dataset
- Arquivar

### Dashboard
- Criar
- Editar
- Duplicar
- Compartilhar
- Arquivar
- Excluir

### Documentação
- Criar
- Editar
- Versionar (futuro)
- Arquivar

---

## Estados dos Ativos

Esta seção define os estados possíveis para cada ativo. Esses estados serão utilizados pela interface e pelo backend.

### Projeto
```
Criando
  ↓
Ativo
  ↓
Arquivado
  ↓
Excluído
```

### Conexão
```
Criando
  ↓
Conectando
  ↓
Conectado
  ↓
Erro
  ↓
Arquivada
```

### Dataset
```
Criando
  ↓
Processando
  ↓
Pronto
  ↓
Erro
  ↓
Arquivado
```

### Consulta SQL
```
Rascunho
  ↓
Executando
  ↓
Sucesso
  ↓
Erro
  ↓
Arquivada
```

### Dashboard
```
Criando
  ↓
Publicado
  ↓
Arquivado
  ↓
Excluído
```

---

## Princípios de UX

Estes princípios guiam todas as decisões de experiência do usuário no Véritas:

1. **Tempo para Valor**
   - O usuário deve chegar ao primeiro Dashboard em menos de cinco minutos.
   - Otimizar cada etapa para reduzir o tempo até o Aha Moment.

2. **Simplicidade de Ação**
   - Nenhuma ação importante deve exigir mais de três cliques.
   - Reduzir fricção em tarefas frequentes.

3. **Contexto Visível**
   - O contexto do Projeto deve estar sempre visível.
   - Usuário nunca deve se perder em que Projeto está trabalhando.

4. **Progressão de Complexidade**
   - Priorizar simplicidade para usuários iniciantes.
   - Recursos avançados devem estar disponíveis mas não intrusivos.

5. **Abstração Técnica**
   - Esconder complexidade técnica sempre que possível.
   - Expor apenas o necessário para o usuário accomplishr sua tarefa.

6. **Preview Antes de Commit**
   - Exibir previews antes de salvar alterações.
   - Usuário deve ver o resultado antes de confirmar.

7. **Autosave Inteligente**
   - Autosave sempre que fizer sentido.
   - Não perder trabalho do usuário por acidentes.

8. **Consistência de Navegação**
   - Navegação consistente em todos os módulos.
   - Padrões de interação previsíveis.

---

## Home do Usuário

### Objetivo da Home

A Home é o ponto de partida do usuário após o login. Ela deve guiar o usuário para criar seu primeiro Projeto.

### Fluxo do Usuário

1. **Login**
   - Usuário se autentica via Clerk
   - Sistema redireciona para Home

2. **Visão Geral**
   - Se Organização não tem Projetos: exibir CTA "Criar Primeiro Projeto"
   - Se Organização tem Projetos: exibir lista de Projetos recentes (últimos 5)

3. **Navegação**
   - Usuário clica em Projeto para acessar
   - Usuário clica em "Criar Projeto" para criar novo

### Variações

**Variação A: Primeiro Acesso**
- Organização recém-criada não tem Projetos
- Exibir CTA destacado "Criar Primeiro Projeto"
- Exibir instruções rápidas (3 passos)

**Variação B: Usuário Ativo**
- Usuário com Projetos existentes
- Exibir lista de Projetos recentes
- Exibir botão "Novo Projeto"

---

## Navegação Global

### Sidebar Principal

A Sidebar principal está sempre visível e permite navegação entre módulos globais.

**Estrutura:**

1. **Home**
   - Ícone: House
   - Acesso à Home do usuário

2. **Projetos**
   - Ícone: Folder
   - Lista de Projetos da Organização
   - Criar novo Projeto

3. **Perfil**
   - Avatar do usuário
   - Logout

### Sidebar Interna do Projeto

Quando o usuário acessa um Projeto, a Sidebar muda para exibir módulos específicos do Projeto.

**Estrutura:**

1. **Breadcrumb**
   - Organização > Projeto
   - Clique para voltar

2. **Overview**
   - Visão geral do Projeto
   - Estatísticas do Projeto
   - Atividades recentes no Projeto

3. **Conexões**
   - Lista de Conexões do Projeto
   - Criar nova Conexão
   - Testar Conexões

4. **Datasets**
   - Lista de Datasets do Projeto
   - Criar novo Dataset
   - Atualizar Datasets

5. **SQL**
   - Lista de Consultas SQL do Projeto
   - Criar nova Consulta
   - Editor SQL

6. **Dashboards**
   - Lista de Dashboards do Projeto
   - Criar novo Dashboard
   - Acesso a Dashboards

7. **Documentação**
   - Documentação do Projeto
   - Editor Markdown

8. **Configurações do Projeto**
   - Nome, descrição, tags
   - Responsável
   - Membros e permissões
   - Duplicar, arquivar, excluir

### Navegação Entre Módulos

**Fluxo de Navegação:**

Home
↓
Selecionar Organização (se múltiplas)
↓
Selecionar Projeto
↓
Sidebar Interna do Projeto
↓
Selecionar módulo (Conexões, Datasets, etc)
↓
Navegar dentro do módulo

**Retorno:**
- Breadcrumb sempre visível
- Botão "Voltar" em sub-páginas
- Sidebar permite navegação direta

### Pontos de Decisão

- Usuário quer trocar de Organização?
- Usuário quer acessar módulo específico do Projeto?
- Usuário quer voltar para nível anterior?

### Edge Cases

- Usuário sem permissão para acessar módulo
- Projeto arquivado
- Organização inativa

---

## Empty States

Estados vazios são exibidos quando um módulo não possui itens. Devem ser informativos e guiar o usuário para ação.

### Projeto Vazio

**Mensagem:**
"Este Projeto ainda não possui ativos. Comece conectando seus dados."

**CTA Principal:**
"Criar Conexão"

### Conexões Vazias

**Mensagem:**
"Você ainda não possui Conexões. Conecte uma fonte de dados para começar."

**CTA Principal:**
"Nova Conexão"

### Dashboards Vazios

**Mensagem:**
"Você ainda não possui Dashboards. Crie seu primeiro Dashboard para visualizar seus dados."

**CTA Principal:**
"Novo Dashboard"

---

## Fluxos de Recuperação

Fluxos de recuperação definem como o usuário retorna ao fluxo normal após encontrar um erro ou problema.

### Conexão Inválida

**Problema:**
- Conexão não pode ser estabelecida
- Credenciais inválidas ou host inacessível

**Ação Sugerida:**
- Exibir mensagem de erro clara
- Sugerir verificar credenciais

**Recuperação:**
1. Usuário clica em "Editar Conexão"
2. Usuário atualiza credenciais
3. Usuário testa conexão novamente

### Timeout

**Problema:**
- Query SQL excedeu tempo limite (30 segundos)

**Ação Sugerida:**
- Exibir mensagem de timeout
- Sugerir otimização da query

**Recuperação:**
1. Usuário clica em "Editar Consulta"
2. Usuário otimiza query
3. Usuário executa novamente

---

## Estados de Carregamento

Estados de carregamento fornecem feedback visual ao usuário durante operações assíncronas.

### Feedback Visual Padrão

- Spinner ou skeleton screen
- Mensagem genérica: "Carregando..."
- Botão de ação desabilitado

### Operações com Feedback

- Criando Projeto
- Criando Dataset
- Executando SQL
- Atualizando Dashboard
- Salvando alterações

---

## Fluxo de Favoritos

**Nota:** Favoritos não fazem parte do MVP. Serão implementados em V2.

---

## Fluxo da Busca Global

**Nota:** Busca global não faz parte do MVP. Será implementada em V2.

---

## Auditoria Básica

Auditoria básica está presente no MVP e deve ser visível para o usuário.

### Informações Exibidas

**Criado Por**
- Nome do usuário que criou o ativo
- Data e hora de criação

**Última Alteração**
- Nome do usuário que modificou pela última vez
- Data e hora da modificação

### Onde Aparece na Interface

**Todos os Ativos**
- Painel de detalhes ou rodapé
- Criado por, última alteração

---

## Fluxo de Arquivamento

**Nota:** Arquivamento não faz parte do MVP. Será implementado em V2.

---

## Configurações do Projeto

Configurações do Projeto permitem gerenciar metadados e permissões do Projeto.

### Nome e Descrição

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Usuário edita nome do Projeto
3. Usuário edita descrição (opcional)
4. Sistema salva automaticamente
5. Alteração refletida em toda a interface

### Tags

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Usuário adiciona tags
3. Sistema sugere tags existentes (autocomplete)
4. Usuário pode criar novas tags
5. Sistema salva automaticamente
6. Tags aparecem na lista do Projeto

### Responsável

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Usuário clica em "Alterar Responsável"
3. Sistema exibe lista de membros do Projeto
4. Usuário seleciona novo responsável
5. Sistema salva
6. Novo responsável é notificado

### Membros

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Sistema exibe lista de membros
3. Para cada membro: nome, email, role
4. Usuário pode adicionar novo membro:
   - Clica em "Adicionar Membro"
   - Seleciona usuário da Organização
   - Define role (Owner, Admin, Editor, Viewer)
   - Sistema salva
5. Usuário pode remover membro:
   - Clica em "Remover"
   - Sistema confirma
   - Sistema remove acesso

### Permissões

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Sistema exibe roles disponíveis
3. Para cada role: descrição de permissões
4. Permissões são herdadas do Projeto para todos os ativos
5. Usuário não pode alterar permissões granulares por ativo no MVP

### Duplicar Projeto

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Usuário clica em "Duplicar Projeto"
3. Sistema exibe formulário:
   - Nome do novo Projeto
   - Descrição (opcional)
4. Usuário preenche e confirma
5. Sistema copia todos os ativos (Conexões, Datasets, Consultas, Dashboards)
6. Sistema cria cópias independentes (nada sincronizado)
7. Usuário é redirecionado para o novo Projeto

### Arquivar Projeto

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Usuário clica em "Arquivar Projeto"
3. Sistema exibe confirmação com impactos
4. Usuário confirma
5. Sistema arquia Projeto e todos os ativos
6. Projeto aparece em "Arquivados"

### Excluir Projeto

**Fluxo:**

1. Usuário acessa configurações do Projeto
2. Usuário clica em "Excluir Projeto"
3. Sistema exibe aviso: "Esta ação não pode ser desfeita."
4. Sistema lista impactos: "Todos os ativos serão excluídos permanentemente."
5. Usuário confirma (pode ser necessário digitar nome do Projeto)
6. Sistema exclui Projeto e todos os ativos permanentemente
7. Usuário é redirecionado para lista de Projetos

### Variações

**Variação A: Projeto com Muitos Membros**
- Sistema exibe lista paginada
- Busca de membros
- Filtros por role

**Variação B: Projeto Template**
- Usuário marca Projeto como "Template"
- Template aparece como opção ao criar novo Projeto
- Criar a partir de Template duplica todos os ativos

### Pontos de Decisão

- Usuário quer alterar responsável?
- Usuário quer adicionar/remover membros?
- Usuário quer duplicar Projeto?
- Usuário quer arquivar ou excluir?

### Edge Cases

- Usuário tenta remover o único Owner
- Usuário sem permissão para alterar configurações
- Erro ao duplicar (dependências quebradas)

---

## Melhorias Recomendadas

Esta seção contém melhorias identificadas que agregam valor ao produto e ao desenvolvimento, mas não foram solicitadas explicitamente.

### 1. Sistema de Comentários

**Justificativa:**
Facilita colaboração em tempo real entre membros da equipe, especialmente em Dashboards e Projetos.

**Fluxo Proposto:**
- Usuário pode adicionar comentários em Dashboards, Projetos, Datasets
- Comentários suportam menções (@usuário)
- Notificações quando mencionado
- Thread de comentários para discussões

**Prioridade:**
- Versão 2 (após MVP)

### 2. Agendamento de Refresh de Datasets

**Justificativa:**
Datasets baseados em queries ou fontes externas precisam ser atualizados periodicamente para manter dados frescos.

**Fluxo Proposto:**
- Usuário configura agendamento (ex: diário, semanal, horário específico)
- Sistema executa refresh automaticamente
- Sistema notifica em caso de falha
- Histórico de execuções agendadas

**Prioridade:**
- Versão 2 (após MVP)

### 3. Versionamento de Consultas SQL

**Justificativa:**
Consultas SQL evoluem ao longo do tempo. Versionamento permite rastrear mudanças e reverter se necessário.

**Fluxo Proposto:**
- Sistema salva versão automaticamente a cada alteração
- Usuário pode ver histórico de versões
- Usuário pode reverter para versão anterior
- Comparação entre versões (diff)

**Prioridade:**
- Versão 2 (após MVP)

### 4. Notificações In-App

**Justificativa:**
Além de notificações por email, notificações in-App proporcionam feedback mais imediato.

**Fluxo Proposto:**
- Ícone de sino na interface
- Lista de notificações
- Tipos: compartilhamento, menção, falha de refresh, convite aceito
- Marcar como lido

**Prioridade:**
- Versão 2 (após MVP)

### 5. Integrações com Slack/Teams

**Justificativa:**
Equipes modernas utilizam ferramentas de comunicação como Slack e Teams. Integrações permitem compartilhar insights onde a equipe já está.

**Fluxo Proposto:**
- Usuário conecta workspace do Slack/Teams
- Usuário configura canal para notificações
- Sistema envia snapshots de Dashboards
- Sistema envia alertas de falha

**Prioridade:**
- Versão 3 (longo prazo)

### 6. Exportação e Relatórios Agendados

**Justificativa:**
Stakeholders executivos frequentemente precisam de relatórios por email ou PDF em horários específicos.

**Fluxo Proposto:**
- Usuário configura exportação agendada
- Formatos: PDF, PNG, CSV
- Frequência: diária, semanal, mensal
- Destinatários: lista de emails
- Sistema envia automaticamente

**Prioridade:**
- Versão 2 (após MVP)

### 7. API Pública

**Justificativa:**
Permite automação e integrações com outros sistemas, expandindo o ecossistema do Véritas.

**Fluxo Proposto:**
- Documentação de API (Swagger/OpenAPI)
- Endpoints para CRUD de ativos
- Endpoints para execução de queries
- Autenticação via API Keys
- Rate limiting

**Prioridade:**
- Versão 3 (longo prazo)

### 8. Webhooks

**Justificativa:**
Permite que sistemas externos reajam a eventos no Véritas (ex: novo Dataset criado, Dashboard compartilhado).

**Fluxo Proposto:**
- Usuário configura webhook URL
- Usuário seleciona eventos de interesse
- Sistema envia POST quando evento ocorre
- Retry em caso de falha
- Logs de entregas

**Prioridade:**
- Versão 3 (longo prazo)

### 9. Modo de Apresentação

**Justificativa:**
Dashboards são frequentemente apresentados em reuniões. Modo de apresentação remove distrações.

**Fluxo Proposto:**
- Usuário clica em "Apresentar"
- Interface entra em fullscreen
- Sidebar e navegação ocultas
- Auto-play de filtros (opcional)
- Navegação entre Dashboards

**Prioridade:**
- Versão 2 (após MVP)


---

## Pontos Pendentes de Decisão

## Decisões Oficiais do MVP

**Onboarding**
- Exibir CTA "Criar Primeiro Projeto"
- Exibir instruções rápidas (3 passos)

**Autosave**
- Habilitar autosave para: Dashboards, Documentação, Editor SQL (rascunhos)
- Disponibilizar botão de salvar manualmente também

**Limite do Preview**
- Exibir até 100 registros por padrão
- Informar ao usuário que os dados foram limitados apenas para visualização
- Paginação poderá ser adicionada futuramente

**Timeout das Queries**
- 30 segundos
- Caso ultrapasse: interromper execução, informar timeout, sugerir otimização

**Exportação**
- Não faz parte do MVP
- Será adicionada futuramente

**Links Públicos**
- Não fazem parte do MVP
- Compartilhamento apenas entre membros da Organização e do Projeto

**Notificações**
- Implementar apenas notificações de convite por e-mail
- Notificações in-app ficam para versões futuras

**Favoritos**
- Implementar no MVP
- Usuário poderá favoritar: Projetos, Dashboards, Datasets, Consultas SQL
- Favoritos aparecerão na Home e na navegação lateral
