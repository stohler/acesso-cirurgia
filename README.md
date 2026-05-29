# AgendeSuaCirurgia.com.br

Aplicação **Full Stack** em **Next.js (App Router)** + **Tailwind CSS** + **MongoDB Atlas**, preparada para deploy no **Google Cloud Run**.

O projeto já nasce com foco em **Cirurgia Geral**, porém com schema e arquitetura flexíveis para adicionar novas especialidades no futuro (ex.: Oftalmo, Vascular) sem quebrar rotas nem estrutura de dados.

---

## Funcionalidades implementadas

- **Rotas SEO dinâmicas locais**: `/<especialidade>/<procedimento>/<cidade>`
  - Exemplo: `/cirurgia-geral/vesicula/itapetininga`
- **Home com motor de busca** por especialidade, procedimento e cidade.
- **Páginas de destino** com faixa de preço estimada do pacote padrão por localidade.
- **Disclaimers automáticos de preço** em todas as visualizações de valores.
- **Triagem avançada** com descrição de sintomas + upload de exames.
- **Upload em Google Cloud Storage** via URL assinada.
- **Criptografia ponta a ponta (E2E)** para dados sensíveis e anexos:
  - Criptografia local no navegador (AES-256-GCM)
  - Chave simétrica protegida com RSA-OAEP-256
- **Modal de consentimento LGPD obrigatório** antes da coleta de dados.
- **Dashboard médico autenticado** para visualizar triagens por especialidade/região e descriptografar localmente.
- **Conexão Mongoose com suporte a transações** (`withMongoTransaction`).
- **Dockerfile otimizado para Cloud Run** (build multi-stage + standalone).
- **Workflow GitHub Actions** para CI + deploy Cloud Run.

---

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- MongoDB Atlas + Mongoose
- Google Cloud Storage
- JWT (jose) + bcrypt

---

## Estrutura principal

```txt
src/
  app/
    page.tsx                                 # Home com busca
    triagem/page.tsx                         # Triagem avançada
    dashboard/page.tsx                       # Área logada médica
    dashboard/login/page.tsx                 # Login médico
    [especialidade]/[procedimento]/[cidade]/page.tsx
    api/
      catalogo/route.ts
      triagens/route.ts
      triagens/upload-url/route.ts
      triagens/[id]/download-url/route.ts
      auth/login/route.ts
      auth/logout/route.ts
      auth/me/route.ts
  components/
    consent/consent-provider.tsx             # Modal + estado LGPD
    forms/home-search-form.tsx
    forms/triage-form.tsx
    dashboard/triage-manager.tsx
    dashboard/login-form.tsx
    seo/price-disclaimer.tsx
  lib/
    mongodb.ts                               # conexão + transações
    gcs.ts                                   # signed URLs GCS
    auth.ts                                  # sessão JWT
    client-crypto.ts                         # E2E browser crypto
    catalog-service.ts
  models/
    Specialty.ts
    Procedure.ts
    City.ts
    PriceEstimate.ts
    Triage.ts
    Doctor.ts
```

---

## Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Crie `.env.local` com base no `.env.example`.

3. Rode:

```bash
npm run dev
```

4. Acesse `http://localhost:3000`.

---

## Criptografia ponta a ponta (E2E)

- O navegador do paciente gera uma chave AES-256-GCM.
- Dados sensíveis e anexo são criptografados localmente.
- A chave AES é criptografada com a chave pública RSA carregada em **runtime** pela API (`/api/public-config`).
- O backend recebe e persiste apenas conteúdo criptografado.
- No dashboard, o médico descriptografa localmente usando a chave privada RSA (não enviada ao servidor).

### Gerar par de chaves RSA (exemplo)

```bash
openssl genpkey -algorithm RSA -out triage_private_key.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in triage_private_key.pem -out triage_public_key.pem
```

Use uma das opções abaixo:

- **Recomendado (Cloud Run/GitHub Actions):** `TRIAGE_RSA_PUBLIC_KEY_PEM_BASE64` (conteúdo PEM em base64, sem quebras de linha).
- **Alternativa:** `TRIAGE_RSA_PUBLIC_KEY_PEM` (PEM com `\n` escapado).

> Observação importante: em Next.js, valores `NEXT_PUBLIC_*` em componentes cliente podem ser resolvidos no build.
> Para evitar inconsistência entre build e deploy, a aplicação lê a chave em runtime no servidor e expõe via endpoint público.

---

## Deploy no Google Cloud Run (Docker)

### Build local da imagem

```bash
docker build -t agende-sua-cirurgia:local .
```

### Rodar container local

```bash
docker run --rm -p 8080:8080 --env-file .env.local agende-sua-cirurgia:local
```

---

## Roteiro de variáveis: GitHub e Google Cloud

A regra aplicada foi: **não sensível = GitHub Action Variable (`vars`)**, **sensível = GitHub Secret (`secrets`)**.

### 1) GitHub Action Variables (`vars`) – NÃO sensíveis

Cadastre no repositório (Settings > Secrets and variables > Actions > Variables):

| Nome | Uso |
|---|---|
| `GCP_PROJECT_ID` | ID do projeto GCP |
| `GCP_REGION` | Região do Cloud Run/Artifact Registry (ex.: `southamerica-east1`) |
| `CLOUD_RUN_SERVICE` | Nome do serviço Cloud Run |
| `AR_REPOSITORY` | Nome do repositório no Artifact Registry |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Provider de federated identity |
| `GCP_SERVICE_ACCOUNT_EMAIL` | Service Account usada no deploy |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |
| `TRIAGE_RSA_PUBLIC_KEY_PEM_BASE64` | Chave pública RSA para E2E (recomendado, em base64) |
| `TRIAGE_RSA_PUBLIC_KEY_PEM` | Chave pública RSA para E2E (opcional, PEM com `\\n`) |
| `NEXT_PUBLIC_TRIAGE_RSA_PUBLIC_KEY_PEM` | Legado/opcional, mantido por compatibilidade |
| `MONGODB_DB_NAME` | Nome do database no MongoDB Atlas |
| `GCS_BUCKET_NAME` | Bucket de anexos criptografados |
| `BOOTSTRAP_DOCTOR_NOME` | Nome inicial de médico bootstrap |
| `BOOTSTRAP_DOCTOR_EMAIL` | E-mail inicial de médico bootstrap |

### 2) GitHub Action Secrets (`secrets`) – SENSÍVEIS

Cadastre em Settings > Secrets and variables > Actions > Secrets:

| Nome | Uso |
|---|---|
| `MONGODB_URI` | String de conexão MongoDB Atlas |
| `JWT_SECRET` | Assinatura de sessão JWT |
| `BOOTSTRAP_DOCTOR_PASSWORD` | Senha inicial de acesso médico |
| `TRIAGE_RSA_PRIVATE_KEY_PEM` | Chave privada RSA da triagem (secret; nunca em `vars`) |

> Importante: para o bootstrap funcionar, **BOOTSTRAP_DOCTOR_EMAIL (Variable)** e
> **BOOTSTRAP_DOCTOR_PASSWORD (Secret)** devem estar ambos definidos e um novo deploy do Cloud Run precisa ser executado.

---

## Configurações necessárias no Google Cloud

### Recursos obrigatórios

1. **Projeto GCP**
2. **Cloud Run API habilitada**
3. **Artifact Registry API habilitada**
4. **Cloud Build API habilitada**
5. **IAM Credentials API habilitada**
6. **Bucket GCS** para anexos criptografados (`GCS_BUCKET_NAME`)
7. **Service Account** para deploy (usada pelo GitHub Actions)
8. **Workload Identity Federation** entre GitHub e GCP

### Permissões recomendadas para a Service Account de deploy

- `roles/run.admin`
- `roles/artifactregistry.writer`
- `roles/iam.serviceAccountUser`
- `roles/storage.admin` (ou ajuste fino por bucket)

### MongoDB Atlas

- Cluster em produção
- Usuário dedicado para app
- IP allowlist conforme estratégia de acesso
- `MONGODB_URI` com `retryWrites=true&w=majority`

---

## Observações operacionais

- `BOOTSTRAP_DOCTOR_*` cria automaticamente um médico inicial no primeiro login.
- Para produção, use rotação de credenciais e gestão de segredo apropriada.
- Em Cloud Run, preferencialmente use service account da plataforma para acesso GCP.

---

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

---

## Próximas evoluções sugeridas

- Painel administrativo para CRUD de especialidades/procedimentos/cidades/preços.
- Versionamento de tabela de preços por região e convênio.
- Auditoria LGPD e trilha de consentimento com versionamento de termos.
- Fila assíncrona para validação e classificação automatizada de triagens.
