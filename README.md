# Checklist Diário de Liderança — Electro Plastic

App em React Native + Expo para o checklist diário de liderança (5'S, Segurança e NR12).
Os dados (categorias, perguntas, histórico de checklists e fotos) ficam no **Supabase** —
um banco compartilhado na nuvem, então qualquer pessoa que abrir o app em qualquer celular vê
as mesmas categorias/perguntas e o mesmo histórico.

## Estrutura

```
App.tsx                              ponto de entrada, monta a navegação
index.ts                             registra o app + polyfill de URL (necessário p/ Supabase)
supabase/schema.sql                  script para criar as tabelas/políticas no Supabase
src/
  components/                        componentes de UI reutilizáveis
    AdminCategoriasTab.tsx           aba de gerenciamento de categorias (admin)
    AdminHistoricoTab.tsx            aba de histórico visual dos checklists (admin)
    PhotoCapture.tsx                 botão de anexar/tirar foto por pergunta
    SelectField.tsx                  campo de seleção em lista (modal)
  config/
    appConfig.ts                     senha de admin, turnos, líderes
    supabase.ts                      URL e chave do projeto Supabase + cliente
  db/
    categoriasRepo.ts                CRUD de categorias (Supabase)
    questoesRepo.ts                  CRUD de perguntas (Supabase)
    checklistsRepo.ts                salvar checklist e ler o histórico (Supabase)
  navigation/RootNavigator.tsx      Stack Navigator
  screens/
    ChecklistScreen.tsx             tela do líder (preenchimento do checklist)
    AdminLoginScreen.tsx            senha de acesso à administração
    AdminScreen.tsx                 abas: Perguntas / Categorias / Histórico
    AdminQuestionFormScreen.tsx     formulário de criar/editar pergunta
    AdminCategoryFormScreen.tsx     formulário de criar/editar categoria
  theme/theme.ts                    cores, espaçamentos, tipografia e paleta de categorias
  types.ts                          tipos compartilhados
  utils/photos.ts                   captura de foto (câmera) + upload para o Supabase Storage
```

## 1. Criar e configurar o projeto no Supabase

1. Crie uma conta/projeto grátis em [supabase.com](https://supabase.com) (se ainda não tiver um).
2. No painel do projeto, abra **SQL Editor → New query**, cole todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) deste repositório e clique em **Run**. Isso cria
   as tabelas (`categorias`, `perguntas`, `checklists`, `respostas`), a view de resumo usada no
   Histórico, as políticas de acesso e o bucket de fotos — e já popula as categorias/perguntas
   padrão do briefing (5'S, Segurança, NR12), só na primeira vez.
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon / public key**
4. Cole os dois valores em [`src/config/supabase.ts`](src/config/supabase.ts):

```ts
export const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
export const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
```

> A "anon key" é feita para ficar no código do app — o Supabase te protege pelas políticas
> (Row Level Security) definidas no `schema.sql`, não por esconder essa chave. Como é uma
> ferramenta interna já protegida por senha no app, as políticas liberam leitura/escrita geral;
> se um dia quiser restringir por usuário, dá pra evoluir para o Supabase Auth.

## 2. Rodar o app

```bash
npm install
npx expo start
```

- Pressione `a` para Android (emulador ou celular com **Expo Go**) ou `i` para iOS (macOS).
- Ou escaneie o QR code com o app **Expo Go** no celular. Se o celular e o computador não
  estiverem na mesma rede/Wi-Fi (ou o QR não carregar), use `npx expo start --tunnel`.

O app precisa de internet para funcionar (lê e grava direto no Supabase) — não tem modo offline.

## 3. Configurar líderes, turnos e senha

Edite [`src/config/appConfig.ts`](src/config/appConfig.ts):

```ts
export const ADMIN_PASSWORD = 'defina-uma-senha-aqui';
export const TURNOS = ['1º Turno', '2º Turno', 'Administrativos'];
export const LIDERES = ['Daisy Santos', 'Juliana Antônio'];
```

`LIDERES` alimenta a lista de seleção do campo Responsável na tela de Checklist (com opção
"Outro" para digitar um nome fora da lista). A senha de administrador é validada apenas
localmente no app (é a "senha simples" pedida no briefing).

## 4. Logo e identidade visual

A logo oficial (`logos/LOGO ELECTRO PLASTIC-01 (1).png`) já está integrada ao app: cabeçalho
de todas as telas (`assets/logo-full.png`), ícone do app, favicon e splash screen
(`assets/icon.png`, `assets/splash-icon.png`, `assets/android-icon-*.png`).

## Fluxo de telas

- **Checklist** (tela inicial): Responsável (lista com Daisy Santos / Juliana Antônio / Outro),
  Data, Turno, os itens por categoria (carregados do Supabase) e observações gerais. Cada
  pergunta tem um botão **Anexar foto** para tirar uma foto pela câmera quando for necessário
  registrar uma evidência — a foto é enviada para o Supabase Storage. O botão **Salvar
  Checklist** valida que todas as perguntas foram respondidas antes de gravar.
- **Administração** (ícone de engrenagem no cabeçalho, protegido por senha) tem três abas:
  - **Perguntas**: lista por categoria com **Editar**, **Ativar/Inativar** e **Excluir**, e
    **+ Nova Pergunta**.
  - **Categorias**: lista de categorias com ícone e cor próprios; **+ Nova Categoria** permite
    criar categorias além das 3 padrão, escolhendo nome e ícone (a cor é atribuída
    automaticamente). Uma categoria só pode ser excluída se não tiver perguntas vinculadas.
  - **Histórico**: lista de todos os checklists já enviados por qualquer pessoa/aparelho (mais
    recente primeiro), com resumo de respostas Sim/Não e fotos. Tocar num item expande o
    detalhe completo — categoria, pergunta, resposta e a foto anexada (se houver), com opção de
    excluir o registro.

Como tudo fica no Supabase, qualquer alteração feita por uma pessoa (nova pergunta, categoria,
checklist preenchido) aparece para as outras assim que elas abrirem ou atualizarem a tela —
não precisa estar no mesmo aparelho.
