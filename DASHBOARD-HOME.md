# Página inicial da dashboard

## Implementação

A entrada em `/app` apresenta saudação, carrossel institucional, criação de nota,
atalhos de ferramentas e listas pessoais de cinco notas. O botão Início mantém
as abas e os editores montados, incluindo o histórico de desfazer da sessão.
Abrir uma nota volta ao editor existente; não converte nem regrava o conteúdo.

O layout usa Inter hospedada localmente, verdes #003D32/#004D40, menta #BFF0DC,
fundo #F7F9F8, bordas discretas e regras por largura do conteúdo. Em telas largas,
o carrossel ocupa a coluna esquerda ao longo das três linhas; no celular, as
ações e as notas ganham prioridade e o carrossel fica abaixo. A sidebar mantém
os estilos existentes. Não foi criado um mecanismo paralelo de temas.

Não existem rotas de Plantão Guiado ou Prescricionário neste repositório. Os
cards ficam desativados e informam que as ferramentas ainda não estão disponíveis.
Não apontam para páginas fictícias. A imagem de referência citada no pedido não
veio na pasta de anexos; a composição segue a especificação textual fornecida.

## Arquivos e responsabilidades

| Arquivo | Responsabilidade |
| --- | --- |
| `src/templates/dashboard-home.ts` | Estrutura e saudação escapada no servidor |
| `src/browser/dashboard-home.ts` | Carrossel, listas, datas locais, cache e estados |
| `src/browser/admin-slides.ts` | CRUD, formulário, prévia, upload e ordenação |
| `src/browser/dashboard.ts` | Entrada do bundle do navegador |
| `src/routes/dashboard.ts` | APIs privadas, permissões, imagens e concorrência |
| `src/lib/dashboard.ts` | Tipos, validação, imagens e slides institucionais |
| `src/lib/dashboard-data.ts` | Compatibilidade com a coluna legada de lixeira |
| `src/templates/dashboard.ts` | Integração com criação, abertura, abas e painéis |
| `src/templates/admin.ts` | Menu Dashboard → Slides e comunicados |
| `public/static/dashboard-home.css` | Estilos isolados da nova página inicial |
| `public/static/admin-slides.css` | Estilos do gerenciador administrativo |
| `public/static/dashboard/` | Três fotografias institucionais locais |
| `migrations/0006_dashboard_home.sql` | Persistência, índices, triggers e seed |
| `tests/dashboard.integration.mjs` | Integração com dados sintéticos locais |
| `vite.dashboard.config.ts` | Bundle IIFE independente do editor |
| `scripts/assets.mjs` | Fontes Inter locais e assets existentes |
| `tsconfig.browser.json` | Tipagem DOM separada dos tipos de Workers |

O novo JavaScript é produzido em `public/static/dashboard-app/dashboard.js`
(aproximadamente 19 KB, 7 KB gzip). Fontes e bundles são gerados pelo build e
ignorados no Git. `package.json`, lockfile, `tsconfig.json`, `.gitignore` e
`src/index.tsx` integram essa geração e o registro das rotas.

Dependências de desenvolvimento adicionadas: `@fontsource/inter`, `typescript`
e `@cloudflare/workers-types`. Nenhuma biblioteca nova de animação ou componente.

## Dados reais e rastreamento

`GET /api/dashboard/home` consulta notas recentes, ranking pessoal e slides
publicados em um batch D1. As listas não carregam o corpo das notas. O cache do
cliente dura 30 segundos e é invalidado ao salvar, excluir ou registrar abertura.

Aberturas explícitas feitas pelo usuário enviam
`POST /api/notes/:id/access` com um UUID de evento. Um trigger verifica a
propriedade, insere o evento uma vez e incrementa `note_accesses` atomicamente.
Reenvios com o mesmo UUID não duplicam a contagem. Consultar, pesquisar,
restaurar abas, renderizar painéis e salvar não contam como abertura.
O ranking ordena por contagem, último acesso e ID. Notas removidas ou na lixeira
legada não aparecem. O histórico anterior à atualização não é inventado.

Os eventos de idempotência permanecem no D1 até a exclusão da nota/conta.
Uma política futura de retenção deve preservar o agregado e definir uma janela
explícita para reenvios; não há limpeza automática nesta versão.

## Administração e segurança

Em `/admin`, abrir **Dashboard → Slides e comunicados**. É possível criar,
editar, excluir, ativar/desativar, mover com botões ou arrastar, visualizar e
agendar. Os horários são editados no fuso do navegador e persistidos em UTC.
O início é inclusivo e o término exclusivo. São permitidos até 100 slides.
Atualizações, exclusões e reordenação usam comparação de versão; um conflito
retorna 409 sem gravar uma ordem parcial. Reordenação usa JSON no SQL para
respeitar o limite de parâmetros do D1 mesmo com 100 slides.

Todas as rotas administrativas verificam a sessão e o papel no backend.
As regras existentes de Origin/CSRF, tamanho de corpo, CSP e `no-store` continuam
aplicadas. Títulos e descrições aceitam texto simples. Links aceitam HTTPS sem
credenciais ou caminhos internos seguros; HTML, JavaScript e URLs de imagem
externas não são aceitos. As imagens privadas exigem autenticação; um usuário
comum só pode ler imagens de slides publicados dentro do período vigente.

JPEG, PNG e WebP são verificados por assinatura e dimensões no servidor
(até 750 KB, 6000 px por dimensão e 18 MP). O navegador otimiza o arquivo em
WebP antes do envio, com limite de entrada de 8 MB. Usa-se BLOB no D1 já existente
para esse pequeno volume de mídia institucional; não é necessário provisionar
R2 nem inserir credenciais no cliente. Uploads não vinculados ficam armazenados
e não são expostos a usuários comuns. Limpeza de imagens órfãs e migração para
R2 são melhorias operacionais futuras se o volume crescer.

O carrossel usa intervalo de oito segundos, pausa por foco/hover/aba oculta,
controle manual, indicadores, setas de teclado e swipe. Movimento reduzido
desliga a reprodução inicial e as transições; o usuário pode retomá-la
explicitamente. Falhas de imagem usam fundo verde; falhas da API exibem erro
e tentativa novamente. Sem slides publicados, há fallback institucional.

## Migrations e publicação

Não executar `seed.sql` nem comandos de reset em produção.

1. `npm ci` e `npm run build`.
2. `npm run typecheck` e testes locais abaixo.
3. Conferir `npx wrangler d1 migrations list doutortext-production --remote`.
4. Registrar um bookmark do D1 Time Travel antes da aplicação.
5. Aplicar **antes de publicar o código novo**:
   `npx wrangler d1 migrations apply doutortext-production --remote`.
6. Confirmar que a lista de migrations ficou vazia e conferir apenas schema e
   quantidade dos três slides institucionais, sem consultar conteúdo clínico.
7. Publicar pela integração GitHub/Cloudflare Pages e conferir o resultado.

A migration 0006 é aditiva e não altera `notes` nem reescreve documentos.
Cria `dashboard_slides`, `dashboard_slide_images`, `note_accesses` e
`note_access_events`, com índices e triggers. O seed tem chaves únicas e
`INSERT OR IGNORE`: repetir o seed não substitui alterações do administrador.
O arquivo inteiro deve ser aplicado apenas pelo controle de migrations.

Rollback de código: voltar ao deploy anterior no Pages; as tabelas aditivas
podem permanecer. Restaurar o banco inteiro só com uma decisão operacional
explícita, pois isso pode desfazer notas criadas depois do bookmark.

## Verificações

Com `npm run preview` em `127.0.0.1:3000` e migrations locais aplicadas:

```sh
npm run typecheck
npm run build
npm run test:dashboard
node tests/security.integration.mjs
node tests/editor-readback.mjs
node tests/workspace-readback.mjs
git diff --check
```

As duas suítes de readback exigem as respectivas fixtures locais, conforme os
comentários dos scripts; não são testes que devem rodar sobre dados reais.
A suíte de dashboard cria contas sintéticas, usa exclusivamente localhost,
restaura os slides originais e remove suas contas ao terminar. Cobre isolamento,
CSRF, duplicação e concorrência de acessos, ordenação de recentes, lixeira,
CRUD/agendamento/CAS, ordem atômica com 100 slides, uploads, publicação privada,
fallback e seed idempotente. Também foi aplicada a sequência 0001–0006 em um
banco local novo. O projeto não possui lint configurado; não se declara uma
execução de lint inexistente.

## Fotografias e licença

Fotografias baixadas em 26/11/2026 e servidas localmente, com largura de 900 px.
Uso conforme a [licença Unsplash](https://unsplash.com/license).

| Arquivo | Autor e página original |
| --- | --- |
| `workspace.jpg` | [Abdulai Sayni](https://unsplash.com/photos/a-notebook-with-a-stethoscope-on-top-of-it-next-to-a-laptop-u2EjDa_hYJI) |
| `organization.jpg` | [Clay Banks](https://unsplash.com/photos/open-notebook-with-pen-and-pencils-on-desk-n9AaeihA9HI) |
| `clinical-desk.jpg` | [National Cancer Institute](https://unsplash.com/photos/person-sitting-while-using-laptop-computer-and-green-stethoscope-near-NFvdKIhxYlU) |

As imagens são institucionais; não representam dados ou pacientes do aplicativo.
