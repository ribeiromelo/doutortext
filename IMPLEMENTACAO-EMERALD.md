# DoutorText — revisão Emerald

Branch local: `codex/security-and-emerald`. Nenhuma publicação, push ou migration remota foi executada.

## Design

Landing, cadastro, login e editor receberam a nova direção inspirada no Emerald24: navegação em verde profundo, superfícies claras, Manrope, botões discretos, escala tipográfica consistente e composição com mais espaço. A landing usa texto HTML real e ilustração em elementos da página. O login tem uma composição gráfica abstrata em CSS. Fontes, ícones e CSS são servidos localmente.

Capturas reais em `review/`: login, landing, editor desktop e editor em 390px. Dados das capturas são fictícios e existem apenas no D1 local.

## Correções implementadas

- Escaping por contexto de HTML e JSON inserido em script; nomes não entram mais em código de handlers.
- CSP com nonce por resposta, sem `unsafe-inline` em scripts e sem `eval`; ações usam roteamento declarativo de uma lista permitida.
- Verificação do proprietário antes da exclusão do histórico e de todas as relações de pastas.
- Validação e triggers de banco contra relações entre usuários e ciclos de pastas; referências cruzadas legadas são desvinculadas, sem apagar notas.
- Proteção por Origin para alterações e logout por POST. Referrer-Policy `same-origin` mantém formulários compatíveis e impede envio do caminho para sites externos.
- Compartilhamentos novos expiram em sete dias; revogação é aplicada à página, ao polling e à escrita.
- Compartilhamentos com email são negados enquanto não existir verificação de identidade por email. Não se apresenta a restrição como funcionalidade disponível.
- Remoção da promoção automática do primeiro cadastro. Administradores existentes são preservados. Ambientes novos exigem provisionamento administrativo controlado.
- Validação de tamanho e tipos de conteúdo; limite de corpo; senha nova de 12 a 256 caracteres; erros públicos sem detalhes internos.
- Rate limit persistente por IP e rota de autenticação: 30 tentativas a cada 15 minutos.
- Remoção do CORS amplo, `no-store` nas páginas e APIs privadas, políticas de frame, referrer e permissões; HSTS em HTTPS.
- Atualização das dependências e retirada do adaptador de desenvolvimento vulnerável. `npm audit`: zero vulnerabilidades conhecidas no momento da verificação.
- Escrita com comparação de versão no banco: requisições obsoletas recebem 409. Snapshots são guardados em `note_revisions` antes de alterações aceitas.
- Saves por nota são serializados. Alterações durante uma requisição continuam pendentes; uma aba não fecha enquanto seu texto continua pendente. Falhas e conflitos preservam o texto na sessão, sem sobrescrever silenciosamente o servidor.

## Validação executada

`npm run build`, aplicação local das cinco migrations, `node tests/security.integration.mjs`, `npm audit` e verificação de diff.

Testes de integração cobrem: duas contas isoladas, exclusão indevida de histórico, referências entre contas, ciclos, Origin, versões antigas, duas escritas concorrentes, serialização XSS, CSP, links e revogação. No navegador: login, logout, abrir nota, auto-save confirmado após recarga, modal de compartilhamento e navegação móvel. Console sem erros na inspeção final.

## Limites e pendências

Esta versão não é uma certificação de segurança. O deploy atual não foi modificado nem verificado contra a branch local. Antes da publicação, fazer backup verificável do D1 e aplicar migrations em staging com dados representativos.

PBKDF2 permanece em 100.000 iterações para compatibilidade com o teto de Workers. A recomendação anterior de simplesmente subir para 600.000 não deve ser aplicada neste runtime sem validar suporte e estratégia de migração. A comparação foi endurecida e hashes legados continuam funcionando. MFA, recuperação/verificação de email e uma estratégia de hash mais forte exigem uma etapa de autenticação própria ou serviço de identidade.

Backups, restauração operacional, retenção, permissões Cloudflare, observabilidade sem conteúdo sensível e conformidade precisam de acesso/configuração do ambiente. Não foi implementada criptografia ponta a ponta. Compartilhamentos antigos sem data de expiração mantêm o comportamento anterior até revisão pelo proprietário.

Exclusões continuam definitivas; não há lixeira. Snapshots ainda não têm interface de restauração. Rascunhos pendentes ficam em memória da sessão; não há garantia de recuperação após fechamento forçado/offline. Conflitos são bloqueados e sinalizados, sem merge colaborativo automático. Não se deve prometer “sem perda” ou colaboração com merge em tempo real.

## Executar localmente

1. `npm ci`
2. `npm run db:migrate:local`
3. `npm run dev`

O servidor local usa `http://127.0.0.1:3000`. `npm run build` gera automaticamente os assets locais. A validação de Origin exige que chamadas diretas à API enviem a origem correta.

Referência do limite PBKDF2: https://github.com/cloudflare/workerd/issues/1346
