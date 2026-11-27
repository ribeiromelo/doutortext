import { institutionalSlides, safeSlideLink, type DashboardSlide } from '../lib/dashboard'
type Note = { id: number; title: string; updated_at: string }
type Options = { root: HTMLElement; onCreate: () => Promise<void>; onOpen: (id: number) => Promise<void>; onAll: () => void }

export function createHome({ root, onCreate, onOpen, onAll }: Options) {
  const carousel = root.querySelector<HTMLElement>('.dh-carousel')!, stage = carousel.querySelector<HTMLElement>('.dh-carousel-stage')!
  const dots = carousel.querySelector<HTMLElement>('.dh-slide-dots')!
  const status = carousel.querySelector<HTMLElement>('[role="status"]')!, feedback = root.querySelector<HTMLElement>('.dh-home-feedback')!
  let slides: DashboardSlide[] = [], current = 0, visible = true
  let timer: ReturnType<typeof setTimeout> | undefined, pending: Promise<void> | undefined, dirty = true, loadedAt = 0
  let refreshTimer: ReturnType<typeof setTimeout> | undefined, touch: { x: number; y: number } | undefined
  let announcements = false
  const create = root.querySelector<HTMLButtonElement>('.dh-create')!
  create.addEventListener('click', async () => { create.disabled = true; try { await onCreate() } catch { feedback.textContent = 'Não foi possível criar a nota. Tente novamente.' } finally { create.disabled = false } })
  root.querySelector('.dh-all-notes')!.addEventListener('click', onAll)

  function schedule() {
    clearTimeout(timer)
    if (slides.length > 1 && visible && !document.hidden) timer = setTimeout(() => change(current + 1, false), 8000)
  }
  function change(index: number, announce = true) {
    if (!slides.length) return
    current = (index + slides.length) % slides.length
    stage.querySelectorAll<HTMLElement>('.dh-slide').forEach((slide,i) => { slide.classList.toggle('is-active', i === current); slide.inert = i !== current; slide.setAttribute('aria-hidden', String(i !== current)) })
    dots.querySelectorAll<HTMLButtonElement>('button').forEach((b,i) => { b.setAttribute('aria-pressed',String(i === current)); b.tabIndex = 0 })
    if (announce && announcements) status.textContent = `Comunicado ${current + 1} de ${slides.length}: ${slides[current].title}`
    schedule()
  }
  function renderSlides(next: DashboardSlide[]) {
    const selectedId = slides[current]?.id
    slides = next.length ? next : institutionalSlides
    current = Math.max(0, slides.findIndex(s => s.id === selectedId))
    stage.replaceChildren(); dots.replaceChildren()
    slides.forEach((s,i) => {
      const card = document.createElement('article'); card.className = 'dh-slide'; card.setAttribute('aria-roledescription','slide'); card.setAttribute('aria-label',`${i + 1} de ${slides.length}`)
      const image = new Image(); image.alt = s.image_alt; image.src = s.image_path; image.width = 900; image.height = 1350; image.loading = i === current ? 'eager' : 'lazy'; image.decoding = 'async'
      image.addEventListener('error', () => { image.hidden = true; card.classList.add('image-failed') })
      const text = document.createElement('div'); text.className = 'dh-slide-copy'
      const title = document.createElement('h2'); title.textContent = s.title
      const description = document.createElement('p'); description.textContent = s.description
      text.append(title, description)
      if (s.link_url && safeSlideLink(s.link_url)) { const a = document.createElement('a'); a.href = s.link_url; a.textContent = s.link_label; if (!s.link_url.startsWith('/')) { a.target = '_blank'; a.rel = 'noopener noreferrer' } text.append(a) }
      card.append(image, text); stage.append(card)
      const dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label',`Ir para comunicado ${i + 1}`); dot.addEventListener('click', () => change(i)); dots.append(dot)
    })
    carousel.querySelectorAll<HTMLElement>('.dh-slide-arrow,.dh-carousel-controls').forEach(el => el.hidden = slides.length <= 1)
    change(current, false); announcements = true
  }
  carousel.querySelector('.dh-prev')!.addEventListener('click', () => change(current - 1))
  carousel.querySelector('.dh-next')!.addEventListener('click', () => change(current + 1))
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); change(current + (e.key === 'ArrowLeft' ? -1 : 1)) }
  })
  carousel.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' && !(e.target as Element).closest('a,button')) touch = { x:e.clientX,y:e.clientY } })
  carousel.addEventListener('pointerup', e => { if (!touch) return; const dx = e.clientX - touch.x, dy = e.clientY - touch.y; touch = undefined; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) change(current + (dx < 0 ? 1 : -1)) })
  carousel.addEventListener('pointercancel', () => touch = undefined)
  document.addEventListener('visibilitychange', schedule)

  function dateLabel(value: string) {
    const date = new Date(value.includes('T') ? value : value.replace(' ','T') + 'Z')
    if (Number.isNaN(date.getTime())) return ''
    const now = new Date(), yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
    const day = date.toLocaleDateString('pt-BR'), time = date.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})
    return `${day === now.toLocaleDateString('pt-BR') ? 'Hoje' : day === yesterday.toLocaleDateString('pt-BR') ? 'Ontem' : date.toLocaleDateString('pt-BR',{day:'numeric',month:'short'})}, ${time}`
  }
  function renderNotes(kind: 'recent' | 'popular', notes: Note[]) {
    const host = root.querySelector<HTMLElement>(`[data-home-list="${kind}"]`)!
    host.replaceChildren(); host.setAttribute('aria-busy','false')
    if (!notes.length) { const p = document.createElement('p'); p.className = 'dh-empty'; p.textContent = kind === 'popular' ? 'Suas notas mais utilizadas aparecerão aqui conforme você acessá-las.' : 'Suas anotações recentes aparecerão aqui.'; host.append(p); return }
    for (const note of notes.slice(0,5)) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'dh-note-row'
      const icon = document.createElement('i'); icon.className = 'far fa-file-lines'; icon.setAttribute('aria-hidden','true')
      const title = document.createElement('span'); title.className = 'dh-note-name'; title.textContent = note.title || 'Sem título'; title.title = title.textContent
      button.append(icon,title)
      if (kind === 'recent') { const time = document.createElement('time'); time.dateTime = note.updated_at; time.textContent = dateLabel(note.updated_at); button.append(time) }
      else { const arrow = document.createElement('i'); arrow.className = 'fas fa-chevron-right'; arrow.setAttribute('aria-hidden','true'); button.append(arrow) }
      button.addEventListener('click', async () => { button.disabled = true; try { await onOpen(note.id) } catch { feedback.textContent = 'Não foi possível abrir a nota. Ela pode ter sido removida.'; invalidate() } finally { button.disabled = false } })
      host.append(button)
    }
  }
  async function refresh(force = false) {
    if (pending) return pending
    if (!force && !dirty && Date.now() - loadedAt < 30000) return
    pending = (async () => {
      try {
        const response = await fetch('/api/dashboard/home')
        if (!response.ok) throw Error()
        const data = await response.json(); carousel.dataset.state=data.slides_state; renderNotes('popular', data.popular); renderNotes('recent', data.recent); renderSlides(data.slides)
        feedback.replaceChildren(); dirty = false; loadedAt = Date.now()
      } catch {
        carousel.dataset.state='error';
        for (const host of root.querySelectorAll<HTMLElement>('[data-home-list]')) { host.replaceChildren(); host.setAttribute('aria-busy','false'); const p = document.createElement('p'); p.className = 'dh-empty'; p.textContent = 'Não foi possível carregar suas anotações.'; host.append(p) }
        if (!slides.length) renderSlides(institutionalSlides)
        feedback.textContent = 'Falha ao atualizar a página inicial. Os comunicados institucionais continuam disponíveis. '
        const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = 'Tentar novamente'; retry.addEventListener('click', () => { retry.disabled = true; void refresh(true) }); feedback.append(retry)
        dirty = true
      }
    })()
    try { await pending } finally { pending = undefined }
  }
  function invalidate() { dirty = true; clearTimeout(refreshTimer); if (visible) refreshTimer = setTimeout(() => void refresh(), 250) }
  carousel.dataset.state='loading';renderSlides(institutionalSlides); void refresh()
  return { invalidate, refresh, setVisible(value: boolean) { visible = value; schedule(); if (visible) void refresh() } }
}
