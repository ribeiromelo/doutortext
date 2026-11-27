import { escapeHtml } from '../lib/security'

export function dashboardHome(username: string) {
  const first = username.trim().split(/\s+/)[0] || username
  return `<section id="dashboardHome" class="dh-home" aria-label="Página inicial">
    <header class="dh-welcome"><div><h1>Olá, <strong>${escapeHtml(first)}</strong></h1><p>Bem-vindo(a) ao <strong>DoutorText</strong></p></div>
      <svg class="dh-waves" viewBox="0 0 320 90" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width=".8">${Array.from({length:8},(_,i)=>`<path d="M0 ${35+i*5} C80 ${-55+i*5},160 ${155+i*5},320 ${10+i*5}"/>`).join('')}</g></svg>
    </header>
    <div class="dh-composition">
      <section class="dh-carousel" aria-label="Benefícios e comunicados" aria-roledescription="carrossel" tabindex="0">
        <div class="dh-carousel-stage"></div>
        <button type="button" class="dh-slide-arrow dh-prev" aria-label="Comunicado anterior"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>
        <button type="button" class="dh-slide-arrow dh-next" aria-label="Próximo comunicado"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>
        <div class="dh-carousel-controls"><div class="dh-slide-dots" aria-label="Escolher comunicado"></div><button type="button" class="dh-slide-pause" aria-label="Pausar reprodução automática"><i class="fas fa-pause" aria-hidden="true"></i></button></div>
        <span class="dh-sr-status" role="status" aria-live="polite"></span>
      </section>
      <button type="button" class="dh-create"><span class="dh-create-icon"><i class="far fa-file-lines" aria-hidden="true"></i><span aria-hidden="true">+</span></span><span class="dh-create-copy"><strong>Crie uma nova nota</strong><span>Registre evoluções, prescrições, pareceres e documentos.</span></span><span class="dh-create-arrow" aria-hidden="true"><i class="fas fa-arrow-right"></i></span></button>
      <section class="dh-tool-pair" aria-label="Ferramentas médicas">
        <button type="button" class="dh-tool" disabled aria-disabled="true"><i class="far fa-clipboard" aria-hidden="true"></i><span><strong>Plantão Guiado</strong><span>Ferramenta ainda não disponível</span></span></button>
        <button type="button" class="dh-tool" disabled aria-disabled="true"><svg viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M9 35V9h10c12 0 12 15 0 15H9m10 0 17 17m-3-17L21 41" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span><strong>Prescricionário</strong><span>Ferramenta ainda não disponível</span></span></button>
      </section>
      <section class="dh-list dh-popular" aria-labelledby="dh-popular-title"><header><h2 id="dh-popular-title"><i class="far fa-star" aria-hidden="true"></i> Notas mais acessadas</h2></header><div class="dh-note-list" data-home-list="popular" aria-busy="true">${loadingRows()}</div></section>
      <section class="dh-list dh-recent" aria-labelledby="dh-recent-title"><header><h2 id="dh-recent-title"><i class="far fa-clock" aria-hidden="true"></i> Notas recentes</h2><button type="button" class="dh-all-notes">Ver todas <span aria-hidden="true">→</span></button></header><div class="dh-note-list" data-home-list="recent" aria-busy="true">${loadingRows()}</div></section>
    </div><div class="dh-home-feedback" role="status" aria-live="polite"></div>
  </section>`
}
function loadingRows() { return '<div class="dh-loading" role="status"><span class="dh-sr-status">Carregando anotações…</span>' + '<div class="dh-skeleton"></div>'.repeat(4) + '</div>' }
