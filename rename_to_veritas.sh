#!/bin/bash

# =============================================================
# Script de renomeação do projeto para Véritas
# Execute na raiz do projeto: bash rename_to_veritas.sh
# =============================================================

set -e

PROJECT_DIR="$HOME/Projetos/my-project-name"
cd "$PROJECT_DIR"

echo "🔄 Renomeando projeto para Véritas..."

# -------------------------------------------------------------
# 1. AppConfig.ts — nome principal da aplicação
# -------------------------------------------------------------
sed -i "s/name: 'SaaS Template'/name: 'Véritas'/g" src/utils/AppConfig.ts
sed -i "s/name: \"SaaS Template\"/name: \"Véritas\"/g" src/utils/AppConfig.ts
sed -i "s/support: 'contact@nextjs-boilerplate.com'/support: 'contact@veritas.app'/g" src/utils/AppConfig.ts
echo "✅ AppConfig.ts atualizado"

# -------------------------------------------------------------
# 2. package.json — nome do pacote
# -------------------------------------------------------------
sed -i 's/"name": "my-project-name"/"name": "veritas"/g' package.json
echo "✅ package.json atualizado"

# -------------------------------------------------------------
# 3. Arquivos de tradução — textos da landing page
# -------------------------------------------------------------
for file in src/locales/*.json; do
  # meta_title
  sed -i 's/SaaS Template/Véritas/g' "$file"
  # meta_description
  sed -i 's/A free and open-source landing page template for your SaaS business/Plataforma inteligente de apoio à decisão para qualquer área de negócio/g' "$file"
  # hero title
  sed -i 's/The perfect <important>SaaS template<\/important> to build and scale your business with ease\./Tome as melhores decisões com <important>inteligência<\/important> e clareza./g' "$file"
  # hero description
  sed -i 's/A free and open-source landing page template for your SaaS business, built with React, TypeScript, Shadcn UI, and Tailwind CSS\./Véritas analisa contexto, dados e alternativas para guiar sua decisão — independente da área de negócio./g' "$file"
  echo "✅ $file atualizado"
done

# -------------------------------------------------------------
# 4. .env — URL e nome do projeto
# -------------------------------------------------------------
if [ -f .env ]; then
  sed -i 's/CHECKLY_PROJECT_NAME=SaaS Boilerplate/CHECKLY_PROJECT_NAME=Véritas/g' .env
  sed -i 's/CHECKLY_LOGICAL_ID=saas-boilerplate/CHECKLY_LOGICAL_ID=veritas/g' .env
  sed -i 's/CHECKLY_EMAIL_ADDRESS=contact@nextjs-boilerplate.com/CHECKLY_EMAIL_ADDRESS=contact@veritas.app/g' .env
  echo "✅ .env atualizado"
fi

if [ -f .env.production ]; then
  sed -i 's/CHECKLY_PROJECT_NAME=SaaS Boilerplate/CHECKLY_PROJECT_NAME=Véritas/g' .env.production
  sed -i 's/CHECKLY_LOGICAL_ID=saas-boilerplate/CHECKLY_LOGICAL_ID=veritas/g' .env.production
  sed -i 's/CHECKLY_EMAIL_ADDRESS=contact@nextjs-boilerplate.com/CHECKLY_EMAIL_ADDRESS=contact@veritas.app/g' .env.production
  echo "✅ .env.production atualizado"
fi

# -------------------------------------------------------------
# 5. Resultado
# -------------------------------------------------------------
echo ""
echo "✅ Projeto renomeado para Véritas com sucesso!"
echo ""
echo "Verifique os arquivos alterados:"
echo "  - src/utils/AppConfig.ts"
echo "  - package.json"
echo "  - src/locales/*.json"
echo "  - .env / .env.production"
echo ""
echo "Agora reinicie o servidor:"
echo "  npm run dev"