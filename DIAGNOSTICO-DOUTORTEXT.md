# Diagnóstico DoutorText e proposta de design system
Data: 19/11/2026

## Escopo e confiança
Inspeção da página inicial, login e cadastro em https://doutortext.pages.dev/, cabeçalhos HTTP do login e revisão dos arquivos de aplicação, autenticação, templates e migrations do GitHub ribeiromelo/doutortext.
Snapshot consultado: main, commit 1e9ec1f629b2bb53c3eb1eabf8c8f96d4c1191f1 (12/03/2026).

O site publicado usa páginas monocromáticas, diferentes dos templates em âmbar do main. Não é possível atribuir automaticamente ao deploy atual todas as falhas do repositório. Os itens abaixo distinguem evidência em produção e evidência estática. Não criei conta, não manipulei notas reais e não executei ataques no serviço. Editor autenticado e colaboração foram avaliados pelo código, sem teste completo entre contas. A tentativa de simular viewport móvel não se refletiu no navegador (innerWidth permaneceu 1101); portanto não alego validação visual mobile. Não foi possível verificar Cloudflare WAF, backups, regras de retenção, logs, configuração real do banco ou correspondência entre commit e deploy.

## Parecer
O produto tem uma base útil: organização hierárquica, abas, busca e compartilhamento. Sua fragilidade visual deriva de identidade pouco definida, hierarquia fraca e pouco acabamento nos estados de uso. Antes de ampliar uso com dados identificáveis de pacientes, corrigiria os problemas de XSS, autorização e integridade do salvamento. Esta revisão não certifica segurança, conformidade legal ou adequação como prontuário.

## 1. Segurança

### Alta: XSS persistente por serialização e interpolação inseguras — confirmado no código
Em src/templates/shared.ts:193–194, título e conteúdo são inseridos diretamente em um script por JSON.stringify. Isso não protege contra o encerramento do elemento script pelo parser HTML. Uma nota maliciosa pode injetar script quando a página compartilhada é renderizada. O escaping aplicado ao textarea não protege essa segunda cópia dos mesmos dados.

Em src/templates/dashboard.ts:104 o username entra em HTML sem escape, e em :560 entra em uma string JavaScript delimitada por aspas simples. O cadastro aceita caracteres arbitrários, exigindo apenas comprimento mínimo. Há interpolação de username sem escape também no painel administrativo; seria necessário revisar todos os contextos, e não apenas esse ponto.

Impacto: execução de ações com a sessão da vítima, leitura de dados acessíveis à página e alteração de notas. HttpOnly impede leitura direta do cookie, mas não impede requisições autenticadas feitas pelo script. Exploração em produção não foi executada.

Correção: renderização com escaping automático, inserção por textContent/value, transporte de dados com serialização apropriada para HTML (inclusive escape de <), eliminação de código inline e uma CSP restritiva como defesa adicional.

### Alta: exclusão de histórico sem conferir proprietário — confirmado no código
Em src/index.tsx:657–665, DELETE /api/notes/:id restringe a exclusão da nota a user_id, mas executa DELETE FROM note_edit_history WHERE note_id = ? sem esse filtro e sem verificar antes a propriedade da nota. Uma conta autenticada pode atingir o histórico de uma nota alheia por ID. Não implica, por si só, leitura ou exclusão do conteúdo da nota.

Correção: conferir propriedade antes de qualquer efeito e aplicar escopo também à exclusão do histórico, dentro de uma operação consistente. Testar com duas contas isoladas.

### Alta: propriedade e integridade de pastas não verificadas ao mover — confirmado no código
PUT /api/notes/:id aceita folder_id sem conferir a quem pertence a pasta (:646). PUT /api/folders/:id aceita parent_id sem conferir propriedade, auto-parentesco ou ciclos (:554). A criação valida propriedade, mas a atualização não repete essa validação.

Impacto: referências entre contas, pastas inacessíveis, ciclos e comportamento incorreto nas operações recursivas. As consequências de cascatas dependem das constraints e do estado real do banco. Isso não demonstra leitura direta das notas de outro usuário.

Correção: validar destino e proprietário, negar ciclos e auto-parentesco, limitar profundidade e manter integridade das relações.

### Alta se usado como restrição por destinatário: email do compartilhamento não é autorização
shared_with_email é armazenado, mas não é aplicado em GET /s/:token, no polling ou em PUT /api/shared/:token. Qualquer pessoa com o token pode ler; com permissão edit, qualquer conta logada que tenha o token pode editar. Na interface revisada, a criação normal oferece links e não convite por email: a vulnerabilidade é a ausência de restrição caso a API/campo seja usado com essa expectativa.

Não há expiração temporal no schema ou verificação de expires_at; há revogação is_active. Links são capacidades de acesso e precisam de tratamento como segredo.

Correção: distinguir explicitamente “qualquer pessoa com link” e “pessoas convidadas”; validar destinatário com identidade verificada em todas as rotas; oferecer validade e revogação. Aplicar no-store e política de referrer adequada a páginas e APIs sensíveis.

### Média: autenticação e endurecimento
Pontos positivos: consultas parametrizadas, senha com salt aleatório e PBKDF2, sessões com 32 bytes aleatórios, cookies Secure/HttpOnly/SameSite=Lax e checagens de proprietário na maioria das leituras e escritas.

Lacunas do código: mínimo de seis caracteres, PBKDF2-SHA256 com 100.000 iterações, ausência de rate limiting na aplicação, ausência de verificação/recuperação de email e de MFA. Não foi verificado se Cloudflare aplica proteção de tentativas na borda. A OWASP recomenda 600.000 iterações para PBKDF2-HMAC-SHA256; escolher parâmetros com benchmark do ambiente e migração versionada dos hashes. Não alterar apenas o número sem planejar verificação dos hashes existentes.

O primeiro usuário recebe admin automaticamente e a migration promove o menor ID. Isso exige bootstrap controlado, principalmente em novos ambientes; não prova tomada de controle da instância atual.

Há CORS amplo, sem necessidade aparente para um app de mesma origem. Isso não equivale automaticamente a leitura cross-origin com cookies, mas vale restringir a política e revisar particularmente endpoints públicos com token. Não há defesa explícita de CSRF/Origin no código; SameSite=Lax oferece proteção parcial. Logout por GET pode ser acionado por navegação externa.

Na resposta do login em produção, confirmei X-Frame-Options: DENY e nosniff; não observei CSP nem HSTS nessa resposta. Tailwind é carregado por script remoto. Compilar e servir CSS localmente reduz dependência em runtime e facilita CSP. A documentação Tailwind reserva Play CDN para desenvolvimento.

### Dados e operação: pendências de verificação
Conteúdo é recebido pelo servidor e gravado como texto pelo código revisado: não há criptografia ponta a ponta na aplicação. Isso não demonstra falta de criptografia de infraestrutura em repouso ou trânsito.
Validar restauração de backup, política de exclusão e retenção, expiração/revogação de sessões, isolamento entre usuários, logs sem conteúdo médico e acesso administrativo. O endpoint de atividade administrativa inclui títulos e nomes; isso merece minimização e controle de acesso. Não concluir conformidade LGPD apenas a partir deste repositório.

## 2. Funcionalidade e confiabilidade

### O que existe no código
Cadastro/login/logout, pastas e subpastas, notas em texto simples, múltiplas abas, busca, fixação no modelo de dados, auto-save com debounce de 800ms, compartilhamento view/edit, revogação e polling. Há painel administrativo.

### Problemas prioritários
1. Concorrência e perda de atualização: versão é incrementada no servidor, mas nenhum PUT exige a versão que o usuário editou. Duas pessoas podem sobrescrever o trabalho uma da outra. Polling não oferece merge nem detecção efetiva de conflito. Retornar 409 quando a versão mudou e permitir comparar/mesclar; colaboração simultânea exigiria estratégia adicional.
2. Corrida no auto-save: saveNote captura o estado, aguarda a rede e então limpa dirty incondicionalmente. Alterações feitas durante a requisição podem ser marcadas como salvas antes de persistirem. Timer posterior pode encontrar dirty=false. Serializar saves por nota, comparar revisão enviada com revisão atual e repetir enquanto houver alterações.
3. Fechar aba remove rascunho antes da confirmação: closeTab inicia saveNote sem aguardar e apaga noteContents. Se houver erro, perde-se a cópia em memória. Preservar rascunho até confirmação, oferecer nova tentativa e sinalizar qual nota está pendente.
4. Saída da página: beforeunload dispara fetch assíncrono, que não garante conclusão. Não há recuperação persistente de rascunho no código. Planejar recuperação offline com proteção e expiração adequadas para dispositivo compartilhado.
5. “Histórico” não é restauração de versões: tabela registra autor/ação/resumo, sem snapshot do texto; edições pelo proprietário no endpoint normal não geram o mesmo histórico de edição. Portanto não há histórico completo nem retorno a uma versão anterior.
6. Exclusão definitiva: notas e pastas são removidas fisicamente. Introduzir lixeira, desfazer e retenção clara.
7. Escala: GET /api/notes traz todos os conteúdos sem paginação. Preferir lista paginada com snippets e conteúdo sob demanda; busca server-side conforme o volume.
8. Promessas divergentes: landing publicada anuncia tags, templates e impressão com CRM/assinatura. Esses recursos não aparecem implementados nos templates, rotas e migrations revisados. Confirmar o código do deploy antes de afirmar disponibilidade.
9. Recuperação de conta: login publicado não oferece “Esqueci minha senha”; não há rota correspondente no main.

Critérios de aceite recomendados: duas contas sem efeitos cruzados; duas abas concorrentes sem sobrescrita silenciosa; rede lenta/offline sem falso “salvo”; fechar/reabrir preservando pendências; revogação válida em página, polling e edição; restauração real da lixeira e de uma revisão.

## 3. Design e experiência

### Evidência no site publicado
O hero é uma imagem raster com título, texto e screenshot embutidos. A árvore acessível oferece só uma descrição genérica da imagem; não há h1 real na página. O recurso tem largura natural 1024px e foi mostrado em aproximadamente 1043px na inspeção. O texto apresenta suavidade/baixa definição. Como parte da imagem, não se reorganiza semanticamente por largura, não pode ser selecionado e não recebe a mesma adaptação de tamanho de texto.

Login e cadastro são simples, com espaço em branco amplo e marca pequena. Falta caráter visual e ajuda para recuperação. Os labels visíveis no login não estão associados por for/id nem envolvendo os inputs, e os campos aparecem sem nomes úteis na árvore acessível.

### Evidência no código do app
Estrutura em três colunas é adequada para um repositório. Há excesso de textos de 9–11px, tons muito claros e ações compactas. Estado de salvamento fica hidden em telas pequenas. Hierarquia de notas, metadados e ações precisa melhorar, com ícones rotulados, foco visível, diálogos acessíveis, feedback persistente e navegação integral por teclado. Não realizei auditoria WCAG automatizada nem medição de todos os contrastes.

### Direção
Dar identidade ao entorno e tranquilidade à escrita. Usar a esmeralda do case Emerald24 e a separação de camadas do dashboard de Dribbble; aproveitar composição, alinhamento e profundidade, adaptando ao trabalho com texto. Evitar transformar o espaço pessoal em um dashboard de indicadores sem utilidade.

## 4. Design system proposto: DoutorText Emerald

### Tokens iniciais
| Papel | Claro | Escuro |
|---|---|---|
| Marca/ação | #087F68 | #5ED9B3 |
| Marca em hover | #066653 | #82E7C9 |
| Fundo | #EDF5F1 | #10251F |
| Superfície de escrita | #FFFFFF | #182F28 |
| Texto principal | #17382F | #EDF8F2 |
| Texto secundário | #586C64 | #B6CBC2 |
| Borda | #DCE8E1 | #365047 |
| Sucesso | #166534 | #86EFAC |
| Atenção | #92400E | #FCD34D |
| Erro | #B91C1C | #FCA5A5 |

Tokens são ponto de partida, a validar em cada combinação de fundo, transparência e estado. Botão verde claro do tema escuro pede texto escuro, não branco.

- Tipografia: Inter para interface e leitura; 14px na navegação desktop, 16px no editor e formulários móveis, 24–28px nos títulos de notas. Entrelinha de 1,65–1,8 para escrita. Mono opcional, não obrigatório.
- Espaçamento: escala 4/8/12/16/24/32; padding de editor 24–32px.
- Geometria: controles 8–10px, painéis 16–20px; bordas finas, sombras leves. Painéis e divisões com padrão consistente.
- Glassmorphism: transparência discreta na navegação e cabeçalho; superfície sólida atrás de conteúdo e texto longo, fallback opaco e contraste preservado. Gradiente esmeralda suave, sem animação contínua.
- Ícones: uma única família de traço, como Lucide. Usar texto junto das ações principais e nomes acessíveis nas secundárias.
- Movimento: transições curtas de 120–180ms e respeito a prefers-reduced-motion.
- Acessibilidade: alvo de contraste WCAG AA, foco visível, status anunciado, erro por texto e ícone além de cor; alvos confortáveis de cerca de 44px no toque.

### Estrutura e comportamento
Desktop: navegação de cerca de 220px, lista de 280–320px e editor flexível; largura de leitura confortável de cerca de 70–85 caracteres, com painéis redimensionáveis e modo foco. Manter “Nova nota” como ação primária contextual. Abas organizam notas já abertas sem substituir a lista.

Mobile: uma etapa por vez — lista, editor, navegação em drawer. Voltar sem perder posição nem rascunho. Status de sincronização sempre visível. O mockup ilustrativo reordena componentes para caber na conversa; o fluxo mobile final precisa de protótipo próprio.

Editor: caminho da pasta, título, texto e ações contextuais. Mostrar “Alterações pendentes”, “Salvando”, “Salvo às…”, “Sem conexão” ou “Falha — tentar novamente”; cada estado deve refletir o servidor. Compartilhamento: “Privado”, “Link de leitura” ou “Link de edição”, acompanhado de quem pode acessar, expiração e revogação.

Componentes essenciais: botão primário/secundário/destrutivo, busca, árvore de pastas, item de nota, abas, editor, indicador de sync, tags com significado, menu, diálogo de compartilhar, diálogo de conflito e lixeira. Especificar estados vazio, carregamento, selecionado, foco, erro e offline em cada fluxo.

Landing: título e descrição em HTML real, um CTA “Criar minha conta”, demonstração fiel do editor, descrição honesta de funcionalidades e limites de privacidade. Usar screenshots apenas como ilustração de produto.

## Sequência recomendada
1. Identificar commit efetivamente publicado e trazer o código certo para o repositório.
2. Corrigir XSS, propriedade, compartilhamento e integridade de salvamento; validar com duas contas e rede simulada.
3. Fechar decisões de armazenamento, recuperação, backup, retenção e acesso.
4. Aplicar tokens e componentes no editor, lista e navegação; depois autenticação e landing.
5. Validar responsividade real, teclado, leitores de tela e estados de rede antes da publicação.

A prévia apresentada na conversa usa dados fictícios e interações locais; não é uma versão implantada do produto.

## Fontes
- Repositório consultado: https://github.com/ribeiromelo/doutortext/tree/1e9ec1f629b2bb53c3eb1eabf8c8f96d4c1191f1
- Código principal: https://github.com/ribeiromelo/doutortext/blob/1e9ec1f629b2bb53c3eb1eabf8c8f96d4c1191f1/src/index.tsx
- Templates: https://github.com/ribeiromelo/doutortext/tree/1e9ec1f629b2bb53c3eb1eabf8c8f96d4c1191f1/src/templates
- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP XSS Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Tailwind Play CDN: https://tailwindcss.com/docs/installation/play-cdn
- WCAG: https://www.w3.org/WAI/WCAG22/quickref/
- Referência Behance: https://www.behance.net/gallery/256834293/Neobank-web-mobile-app-UXUI-design-Emerald24
- Referência Dribbble: https://dribbble.com/shots/27523418-Glassmorphism-Funnel-Analytics-Dashboard
