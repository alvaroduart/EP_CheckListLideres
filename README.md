# Checklist Diário de Liderança — Electro Plastic

App em React Native + Expo para o checklist diário de liderança (5'S, Segurança e NR12).
Os dados (setores, pessoas cadastradas, categorias, perguntas, histórico de checklists,
notificações e fotos) ficam no **Supabase** — um banco compartilhado na nuvem, então qualquer
pessoa que abrir o app em qualquer celular vê as mesmas informações.

## Estrutura

```
App.tsx                              ponto de entrada — verifica se já existe uma pessoa
                                      selecionada no aparelho e decide a tela inicial
index.ts                             registra o app + polyfill de URL (necessário p/ Supabase)
eas.json                             perfis de build (gera APK via EAS Build)
supabase/schema.sql                  script para criar/atualizar as tabelas e políticas no Supabase
src/
  components/                        componentes de UI reutilizáveis
    AdminCategoriasTab.tsx           aba de gerenciamento de categorias (admin)
    AdminSetoresTab.tsx              aba de gerenciamento de setores (admin)
    AdminPessoasTab.tsx              aba de gerenciamento de pessoas/líderes (admin)
    AdminTarefasTab.tsx              aba com todas as tarefas atribuídas (admin)
    AdminHistoricoTab.tsx            aba de histórico visual dos checklists (admin)
    PhotoCapture.tsx                 botão de anexar/tirar foto (perguntas respondidas "Não")
    SelectField.tsx                  campo de seleção em lista (modal)
  config/
    appConfig.ts                     senha de admin, turnos
    supabase.ts                      URL e chave do projeto Supabase + cliente
  db/
    categoriasRepo.ts                CRUD de categorias
    questoesRepo.ts                  CRUD de perguntas
    setoresRepo.ts                   CRUD de setores
    pessoasRepo.ts                   CRUD de pessoas (líderes) e push token
    tarefasRepo.ts                   ciclo de vida das tarefas (status, prazo, notificação)
    notificacoesRepo.ts              central de notificações dentro do app
    checklistsRepo.ts                salvar checklist, ler o histórico e notificar envolvidos
  navigation/RootNavigator.tsx      Stack Navigator
  screens/
    SelecionarUsuarioScreen.tsx      tela inicial — escolher quem é você (lista do admin)
    ChecklistScreen.tsx              tela do líder (preenchimento do checklist)
    NotificacoesScreen.tsx           central de notificações do usuário logado no aparelho
    TarefaDetalheScreen.tsx          detalhe da tarefa — status e prazo (quem recebeu a tarefa)
    AdminLoginScreen.tsx             senha de acesso à administração
    AdminScreen.tsx                  abas: Perguntas / Categorias / Setores / Pessoas / Tarefas / Histórico
    AdminQuestionFormScreen.tsx      formulário de criar/editar pergunta
    AdminCategoryFormScreen.tsx      formulário de criar/editar categoria
    AdminSetorFormScreen.tsx         formulário de criar/editar setor
    AdminPessoaFormScreen.tsx        formulário de criar/editar pessoa
  theme/theme.ts                     cores, espaçamentos, tipografia e paleta de categorias
  types.ts                           tipos compartilhados
  utils/
    photos.ts                        captura de foto (câmera) + upload para o Supabase Storage
    pessoaCache.ts                   identidade do líder salva no aparelho (AsyncStorage)
    pushNotifications.ts             registro de push token + envio via Expo Push Service
```

## 1. Criar/atualizar o projeto no Supabase

1. Crie uma conta/projeto grátis em [supabase.com](https://supabase.com) (se ainda não tiver um).
2. No painel do projeto, abra **SQL Editor → New query**, cole todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) deste repositório e clique em **Run**.
   > Se você já rodou uma versão anterior deste script, **rode de novo** — ele foi atualizado
   > com as tabelas de `setores`, `pessoas`, `tarefas` e `notificacoes`, além de novas colunas
   > em `respostas` e `notificacoes`. É seguro rodar de novo: tudo usa
   > `if not exists`/`drop policy if exists`, e os dados que já existem não são apagados nem
   > duplicados.
3. Vá em **Project Settings → API** e copie a **Project URL** e a **anon / public key** (ou a
   chave nova no formato `sb_publishable_...`, funciona do mesmo jeito) para
   [`src/config/supabase.ts`](src/config/supabase.ts).
4. Entre no app como administrador (⚙️ no cabeçalho → senha) e cadastre, nessa ordem:
   1. Pelo menos um **Setor** (aba Setores → + Novo Setor).
   2. As **Pessoas** que vão usar o app (aba Pessoas → + Nova Pessoa, escolhendo o setor de
      cada uma). Só o administrador cadastra pessoas — ninguém mais cria seu próprio usuário.

## 2. Rodar o app

```bash
npm install
npx expo start
```

- Pressione `a` para Android (emulador ou celular com **Expo Go**) ou `i` para iOS (macOS).
- Ou escaneie o QR code com o app **Expo Go** no celular. Se o celular e o computador não
  estiverem na mesma rede/Wi-Fi (ou o QR não carregar), use `npx expo start --tunnel`.

O app precisa de internet para funcionar (lê e grava direto no Supabase) — não tem modo offline.

## 3. Configurar turnos e senha

Edite [`src/config/appConfig.ts`](src/config/appConfig.ts):

```ts
export const ADMIN_PASSWORD = '474849';
export const TURNOS = ['1º Turno', '2º Turno', 'Administrativos'];
```

A senha de administrador é validada apenas localmente no app (é a "senha simples" pedida no
briefing).

## 4. Notificações push (opcional, mas recomendado)

A central de notificações dentro do app **já funciona sem nenhuma configuração extra**. Para
também receber notificação no estilo push (aparece no celular mesmo com o app fechado), falta
conectar um projeto Firebase — é gratuito e leva uns 10 minutos:

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
   (pode ser o mesmo projeto para tudo, não precisa adicionar um app Android nele).
2. Vá em **Configurações do projeto → Contas de serviço** e clique em
   **Gerar nova chave privada** — baixa um arquivo `.json`.
3. No terminal, na pasta do projeto, rode:
   ```bash
   npx eas-cli credentials
   ```
   Escolha **Android** → **Push Notifications: Manage your FCM Api Key** → envie o arquivo
   `.json` baixado no passo 2.
4. Gere um novo APK (veja a seção abaixo) — a credencial só entra em vigor num build novo.

Sem esse passo, a central de notificações dentro do app funciona normalmente; só não chega
aviso com o app fechado.

## 5. Gerar o APK

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Ao final, a EAS mostra um link `https://expo.dev/.../builds/...` com o APK pronto para baixar e
instalar direto no celular (não precisa de Play Store).

## 6. Logo e identidade visual

A logo oficial (`logos/LOGO ELECTRO PLASTIC-01 (1).png`) já está integrada ao app: cabeçalho
de todas as telas (`assets/logo-full.png`), ícone do app, favicon e splash screen
(`assets/icon.png`, `assets/splash-icon.png`, `assets/android-icon-*.png`).

## Fluxo de telas

- **Selecionar Usuário** (primeira vez que o app abre naquele aparelho): lista de pessoas já
  cadastradas pelo administrador — toca no seu nome e pronto, sem digitar nada. Depois disso, a
  escolha fica salva naquele aparelho — não pergunta de novo. Há um link **Trocar** na tela de
  Checklist para selecionar outra pessoa no mesmo aparelho, se necessário. Ninguém consegue
  criar um usuário novo por conta própria; só o administrador faz isso (aba Pessoas).
- **Checklist**: identificação (nome/setor preenchidos automaticamente), Data, Turno, os itens
  por categoria e observações gerais. Quando uma pergunta é marcada como **Não**, abre um
  bloco extra para: comentário específico daquela pergunta, anexar foto e **atribuir a tarefa**
  a outra pessoa já cadastrada. O botão **Salvar Checklist** valida que todas as perguntas foram
  respondidas antes de gravar. Ao salvar: quem foi atribuído numa tarefa recebe uma notificação
  de tarefa, e todas as outras pessoas cadastradas recebem uma notificação de que o checklist
  foi finalizado.
- **Notificações** (sino no cabeçalho, com contador de não lidas): tocar numa notificação de
  **tarefa** abre o detalhe da tarefa; as demais (tarefa atualizada, checklist finalizado) são só
  avisos.
- **Detalhe da Tarefa** (quem recebeu a tarefa): mostra a pergunta, o comentário e a foto de
  quem atribuiu. A pessoa define o **status** (Pendente / Em andamento / Concluída) e uma
  **previsão de conclusão**; ao salvar, quem atribuiu a tarefa recebe uma notificação da
  atualização.
- **Administração** (ícone de engrenagem no cabeçalho, protegido por senha) tem seis abas:
  - **Perguntas**: lista por categoria com **Editar**, **Ativar/Inativar** e **Excluir**, e
    **+ Nova Pergunta**.
  - **Categorias**: ícone e cor próprios; **+ Nova Categoria** cria categorias além das 3
    padrão. Só pode ser excluída se não tiver perguntas vinculadas.
  - **Setores**: **+ Novo Setor** — usados no cadastro das pessoas. Só pode ser excluído se não
    tiver pessoas vinculadas.
  - **Pessoas**: **+ Nova Pessoa** — nome + setor. É aqui que se cadastra quem vai usar o app
    (líderes selecionam a partir dessa lista, não criam a própria conta).
  - **Tarefas**: todas as tarefas atribuídas (abertas primeiro), com status, prazo, quem
    atribuiu/recebeu, comentário e foto — visão geral para o administrador acompanhar pendências.
  - **Histórico**: todos os checklists já enviados (mais recente primeiro), com resumo
    Sim/Não/fotos. Tocar expande o detalhe completo — categoria, pergunta, resposta, comentário,
    a quem foi atribuído e a foto anexada (se houver) — com opção de excluir o registro.

Como tudo fica no Supabase, qualquer alteração feita por uma pessoa aparece para as outras assim
que elas abrirem ou atualizarem a tela — não precisa estar no mesmo aparelho.
