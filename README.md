# ✨ EloMoment

> **Onde cada estrela guarda uma lembrança.**

Rede social privada para um aniversário de 15 anos com tema **Noite Estrelada**.
Acesso exclusivo por convite. Feed, stories, chat, álbum do evento, mural de recados em forma de estrelas, timeline da festa e painéis do anfitrião e da debutante.

**Stack:** React 18 · TypeScript · Vite · TailwindCSS · Framer Motion · React Router · Zustand · Supabase (Auth, Postgres, Realtime, Storage) · PWA

---

## 🚀 Guia de implementação por etapas

### Etapa 1 — Instalar dependências

```bash
npm install
```

### Etapa 2 — Criar o projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e crie um projeto (ex.: `elomoment`).
2. Em **Authentication → Providers → Anonymous Sign-Ins**, habilite o login anônimo (é o que permite entrada só por convite, sem pedir e-mail/senha dos convidados).
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
4. Copie `.env.example` para `.env.local` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com esses valores.

### Etapa 3 — Criar o schema e as regras de segurança

No **SQL Editor** do seu projeto Supabase, rode o conteúdo de `supabase/schema.sql` (cria as tabelas, as RLS policies, habilita Realtime nas tabelas e cria os buckets de Storage).

O `schema.sql` cobre:
- Só usuários autenticados leem qualquer coisa (RLS).
- Convites únicos consumidos por **update condicional** (`used = false → true`, impossível usar duas vezes em concorrência).
- Autor ou anfitrião podem excluir posts/comentários; só o anfitrião fixa posts.
- Upload limitado a imagem/vídeo/áudio de até 50 MB (bucket `media`) ou imagem de até 8 MB (bucket `avatars`), apenas na pasta do próprio usuário.

### Etapa 4 — Criar o primeiro convite (bootstrap do anfitrião)

O painel de convites fica dentro do app, mas o **primeiro** convite precisa ser criado à mão:

1. No **Table Editor** (ou SQL Editor) do Supabase, insira uma linha na tabela `invites`:
   ```sql
   insert into invites (code, role, single_use, used, created_at)
   values ('ANFITRIAO1', 'host', true, false, 0);
   ```
2. Acesse `http://localhost:5173/invite/ANFITRIAO1`, crie o perfil do anfitrião.
3. A partir daí, gere todos os outros convites (convidados e debutante) pelo **Painel 👑** dentro do app — cada um já sai com link pronto para copiar e enviar.

### Etapa 5 — Rodar localmente

```bash
npm run dev
```

### Etapa 6 — Deploy

Ainda não configurado (o app antes usava Firebase Hosting). Qualquer host de SPA estática serve
(Vercel, Netlify, Cloudflare Pages) — basta rodar `npm run build` e apontar para a pasta `dist/`
com rewrite de SPA (todas as rotas → `index.html`).

---

## 🗂️ Estrutura do projeto

```
src/
├── components/
│   ├── sky/        StarField (céu em canvas c/ parallax), Splash (abertura cinematográfica)
│   ├── ui/         Avatar
│   ├── feed/       PostComposer, PostCard (reações), Comments
│   ├── stories/    StoriesBar, StoryViewer, StoryCreator
│   └── mural/      StarWall (recados como estrelas)
├── pages/          Landing, Invite, Feed, Album, Timeline, Mural, Busca, Chat, Perfil, Painel, 404
├── layouts/        AppLayout (topo + navegação inferior mobile + avisos)
├── routes/         Rotas com proteção de autenticação
├── services/       Toda a comunicação com Supabase (auth, invites, posts, stories, mural, chat, storage, users)
├── stores/         Zustand (authStore, uiStore c/ tema)
├── hooks/          useUsers (mapa reativo uid → perfil)
├── lib/            Cliente Supabase
├── types/          Todos os modelos de dados
├── utils/          Formatação de tempo, hashtags
└── styles/         Tailwind + componentes glass/btn-star
```

## 🗄️ Modelo de dados (Postgres / Supabase)

Schema completo em `supabase/schema.sql`.

| Tabela | Conteúdo |
|---|---|
| `invites` | code (pk), role, single_use, used, used_by |
| `users` | uid (pk, fk auth.users), nome, foto, frase, emoji, cor, role (`guest` / `host` / `debutante`) |
| `posts` | texto, mídia, local, hashtags, `reactions` (jsonb uid → emoji), pinned |
| `comments` | post_id (fk), texto, curtidas (array), reply_to |
| `stories` | mídia/texto, `expires_at` = criação + 24 h (filtrado na query) |
| `mural_messages` | recado + posição x/y da estrela no céu |
| `guestbook_entries` | mensagem, emoji, assinatura desenhada, foto |
| `timeline_moments` | horário, título, ordem |
| `announcements` | avisos do anfitrião/debutante |
| `chats` + `messages` | conversas 1:1 e grupos, read_by (visto) |

Realtime é feito via Supabase Realtime (`postgres_changes`), substituindo o `onSnapshot` do Firestore.

## ✅ O que está implementado e funcionando

- Abertura cinematográfica (estrelas → lua → logo → slogan)
- Céu estrelado animado em canvas com parallax, respeitando `prefers-reduced-motion`
- Entrada **somente por convite** com link `/invite/CODIGO`, mensagem "Este convite não existe.", convites únicos com consumo transacional
- Cadastro: nome, foto, nascimento (opcional), frase, emoji e cor favoritos
- Feed em tempo real: texto, foto, vídeo, GIF, local, hashtags, 8 reações (❤️ 😂 😍 🥹 👏 ✨ 🌙 ⭐), comentários com respostas/curtidas/exclusão, posts fixados
- Stories de 24 h: câmera, galeria, texto com cor, figurinhas, barra de progresso, navegação por toque
- Chat 1:1 e em grupo: texto, foto, vídeo, "Visto", nome do grupo
- Álbum do evento: ordenado por horário, modos grade/mosaico, filtro por pessoa e por horário, lightbox
- Timeline da festa com "Ver publicações desse momento" (filtra a busca por hora)
- Mural de recados: cada mensagem é uma estrela clicável com animação suave
- Pesquisa: pessoa, legenda, #hashtag, emoji
- Painel do anfitrião: gerar/copiar/excluir convites, remover convidados, enviar avisos, fixar/excluir conteúdo
- Painel da debutante: avisos em destaque
- Modo escuro/claro/automático · Glassmorphism · Compressão de imagens no navegador antes do upload · Lazy loading · PWA instalável com cache offline das fotos já vistas
- Totalmente responsivo (navegação inferior no celular, topo no desktop)

## 🧭 Roadmap (próximas iterações)

Recursos do briefing que dependem de serviços externos ou de mais uma rodada de desenvolvimento — o código já está estruturado para recebê-los:

1. **Livro de assinaturas com desenho** — os tipos e a coleção `guestbook` já existem; falta a página com canvas de assinatura (sugestão: `signature_pad`).
2. **Desenho no story (caneta/marcador/neon)** — adicionar um `<canvas>` de camada no `StoryCreator` e exportar composto com a mídia.
3. **Música nos stories** — exige licenciamento; alternativa: upload de trecho de áudio próprio (o Storage já aceita `audio/*`).
4. **Filtros de câmera** — CSS filters sobre o preview são o caminho mais simples.
5. **Galeria inteligente (rostos)** — usar `face-api.js` no cliente ou Cloud Functions + Vision API; agrupar por descritor facial.
6. **Notificações push** — Web Push + uma Supabase Edge Function disparando em novos posts/mensagens (hoje tudo já atualiza em tempo real na tela).
7. **Compressão de vídeo** — hoje o vídeo sobe original (limite 50 MB); para comprimir, `ffmpeg.wasm` no cliente ou uma Edge Function com transcodificação.
8. **Compartilhamento interno de posts** — botão "enviar no chat" reaproveitando `sendMessage` com link do post.
9. **Expiração configurável de convites** — adicionar campo `expiresAt` no convite + checagem na regra.

## 🔐 Notas de segurança

- Nenhuma credencial no código: tudo via `.env.local` (fora do git — crie um `.gitignore` com `node_modules`, `dist`, `.env*`). A chave usada no front (`anon public`) é segura para expor; a `service_role` nunca deve ir para o cliente.
- As RLS (Row Level Security) policies do Postgres são a fronteira real de segurança — o front-end nunca é confiável sozinho.
- Auth anônima + convite com update condicional: quem não tem link válido não consegue criar perfil nem ler nada.
