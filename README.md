# DoutorText

## Visão Geral
- **Nome**: DoutorText
- **Objetivo**: Organizador de textos/notas com autenticação, pastas hierárquicas, abas, auto-save, compartilhamento colaborativo em tempo real e painel administrativo.
- **Stack**: Hono + TypeScript + Cloudflare Pages + D1 (SQLite) + TailwindCSS

## URLs
- **Produção**: https://doutortext.pages.dev
- **GitHub**: https://github.com/ribeiromelo/doutortext
- **Exemplo de nota compartilhada**: https://doutortext.pages.dev/s/{share_token}
- **Painel Admin**: https://doutortext.pages.dev/admin (requer admin)

## Funcionalidades

### Implementadas
- **Autenticação completa**: registro, login, logout com cookies HttpOnly + PBKDF2
- **Pastas e subpastas**: hierarquia ilimitada, criar/renomear/excluir, toggle colapsar/expandir
- **Notas**: criar, editar, mover entre pastas, excluir, busca por texto
- **Editor**: JetBrains Mono, contagem de caracteres/palavras/linhas
- **Abas múltiplas**: abrir várias notas simultaneamente
- **Auto-save**: salva automaticamente no D1 após 800ms de inatividade
- **Compartilhamento de notas**:
  - Links de visualização (qualquer pessoa com o link)
  - Links de edição (requer login para rastrear quem editou)
  - Polling em tempo real (3s para editores, 5s para visualizadores)
  - Histórico de edições com username e timestamp
  - Versionamento de notas para detecção de conflitos
  - Gerenciamento de links: criar, revogar, trocar permissão
- **Painel Administrativo**:
  - Visão geral com estatísticas (usuários, notas, pastas, compartilhamentos, edições, sessões ativas)
  - Lista de usuários cadastrados com contadores (notas, pastas, shares por usuário)
  - Promover/rebaixar admin com proteção contra auto-rebaixamento
  - Excluir usuário (cascade: notas, pastas, shares, sessões)
  - Log de atividade recente (edições de todas as notas)
  - Busca de usuários por nome/email
  - Top usuários por quantidade de notas
  - Registros recentes
  - Informações do sistema (plataforma, total de caracteres, admins, shares ativos)
  - Primeiro usuário registrado é automaticamente promovido a admin
- **Design responsivo**: mobile, tablet e desktop com sidebar overlay
- **Landing page**: gradientes, animações, glass-morphism
- **Atalhos de teclado**: Ctrl+S (salvar), Ctrl+W (fechar aba), Escape

### Rotas de páginas
| Rota | Descrição | Autenticação |
|------|-----------|--------------|
| `/` | Landing page | Pública |
| `/login` | Página de login | Pública |
| `/register` | Página de registro | Pública |
| `/app` | Dashboard principal | Requer login |
| `/admin` | Painel administrativo | Requer admin |
| `/s/:token` | Nota compartilhada | Pública (edição requer login) |
| `/logout` | Encerrar sessão | N/A |

### API Endpoints
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/folders` | Listar pastas do usuário |
| POST | `/api/folders` | Criar pasta |
| PUT | `/api/folders/:id` | Renomear/mover pasta |
| DELETE | `/api/folders/:id` | Excluir pasta (cascata) |
| GET | `/api/notes` | Listar notas (filtro por folder_id) |
| GET | `/api/notes/:id` | Obter nota completa |
| POST | `/api/notes` | Criar nota |
| PUT | `/api/notes/:id` | Atualizar nota |
| DELETE | `/api/notes/:id` | Excluir nota |
| GET | `/api/notes/:id/shares` | Listar compartilhamentos |
| POST | `/api/notes/:id/shares` | Criar link de compartilhamento |
| PUT | `/api/shares/:shareId` | Alterar permissão |
| DELETE | `/api/shares/:shareId` | Revogar compartilhamento |
| GET | `/api/notes/:id/history` | Histórico de edições |
| PUT | `/api/shared/:token` | Salvar nota via share (requer login) |
| GET | `/api/shared/:token/poll` | Polling de mudanças (tempo real) |
| GET | `/api/admin/stats` | Estatísticas gerais (admin) |
| GET | `/api/admin/users` | Lista de usuários com contadores (admin) |
| PUT | `/api/admin/users/:id/admin` | Promover/rebaixar admin (admin) |
| DELETE | `/api/admin/users/:id` | Excluir usuário e dados (admin) |
| GET | `/api/admin/activity` | Log de atividade recente (admin) |

## Arquitetura de Dados

### Tabelas (Cloudflare D1)
- **users**: id, username, email, password_hash, is_admin, timestamps
- **folders**: id, user_id, parent_id, name, icon, sort_order, timestamps
- **notes**: id, user_id, folder_id, title, content, is_pinned, last_edited_by, version, timestamps
- **sessions**: id, user_id, expires_at, created_at
- **note_shares**: id, note_id, owner_id, share_token, permission (view/edit), shared_with_email, is_active
- **note_edit_history**: id, note_id, user_id, username, action, summary, created_at

### Fluxo de Compartilhamento
1. Dono da nota cria um link (view ou edit) → gera `share_token` único
2. Link público: `https://doutortext.pages.dev/s/{token}`
3. **Visualização**: qualquer pessoa acessa, conteúdo read-only, botão copiar
4. **Edição**: apenas usuários logados, textarea editável, auto-save via API
5. **Polling**: cliente verifica versão periodicamente, atualiza se mudou
6. **Histórico**: cada edição registrada com username e timestamp

### Sistema Admin
- O primeiro usuário registrado na plataforma é automaticamente promovido a admin
- Admins podem promover/rebaixar outros usuários pelo painel
- Admin não pode se auto-rebaixar nem se auto-excluir
- Exclusão de usuário é em cascata (notas, pastas, shares, sessões, histórico)

## Guia de Uso
1. Acesse https://doutortext.pages.dev e crie uma conta
2. No dashboard, crie pastas para organizar suas notas
3. Clique em "Nova Nota" para criar uma nota
4. Edite o conteúdo — ele salva automaticamente
5. Para compartilhar: clique no ícone de share (🔗) no editor
6. Escolha "Visualização" ou "Edição" e copie o link gerado
7. Envie o link — qualquer pessoa pode visualizar; para editar, precisa de conta
8. **Admin**: se você for admin, verá o ícone de escudo (🛡️) no header do dashboard → clique para acessar o painel

## Deployment
- **Plataforma**: Cloudflare Pages
- **Banco de dados**: Cloudflare D1 (SQLite distribuído)
- **Status**: ✅ Ativo
- **Última atualização**: 2026-03-12
