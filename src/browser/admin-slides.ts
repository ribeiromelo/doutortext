import { institutionalSlides, safeSlideLink, type DashboardSlide } from '../lib/dashboard'
type Slide = DashboardSlide & { created_at?: string; updated_at?: string }
const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
const localDate = (value: string | null) => { if (!value) return ''; const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16) }

export function mountSlidesAdmin(root: HTMLElement) {
  let slides: Slide[] = [], editing: Slide | null = null, dirty = false, uploading = false, busy = false
  root.innerHTML = `<section class="ds-manager"><header class="ds-manager-heading"><div><h2>Slides e comunicados</h2><p>Conteúdo exibido na página inicial de todos os usuários.</p></div><button type="button" class="ds-primary" data-slides-new><i class="fas fa-plus" aria-hidden="true"></i> Novo slide</button></header><p class="ds-feedback" role="status" aria-live="polite"></p><div class="ds-list" aria-label="Slides cadastrados"></div>
    <section class="ds-editor" hidden aria-label="Editor de slide"><div class="ds-editor-heading"><h2></h2><button type="button" class="ds-secondary" data-slides-cancel>Fechar editor</button></div><div class="ds-editor-grid"><form class="ds-form">
      <label>Título<input name="title" maxlength="120" required></label><label>Descrição<textarea name="description" maxlength="400" rows="3"></textarea></label>
      <label>Imagem institucional<select name="image_path">${institutionalSlides.map(s=>`<option value="${s.image_path}">${esc(s.image_alt)}</option>`).join('')}</select></label>
      <label class="ds-upload">Enviar ou substituir imagem<input name="image" type="file" accept="image/jpeg,image/png,image/webp"><span>JPEG, PNG ou WebP. Recomendado: vertical 2:3 ou 9:16. A imagem será otimizada; máximo enviado de 750 KB.</span></label>
      <label>Descrição alternativa da imagem<input name="image_alt" maxlength="240"></label>
      <div class="ds-form-pair"><label>Destino do link (opcional)<input name="link_url" maxlength="2048" placeholder="https://… ou /app"></label><label>Texto da ação<input name="link_label" maxlength="80" placeholder="Conhecer recurso"></label></div>
      <div class="ds-form-pair"><label>Início da exibição<input name="starts_at" type="datetime-local"></label><label>Término da exibição<input name="ends_at" type="datetime-local"></label></div><p class="ds-timezone"></p>
      <label class="ds-checkbox"><input name="is_active" type="checkbox"> Ativar publicação (respeita as datas acima)</label>
      <p class="ds-form-error" role="alert"></p><div class="ds-form-actions"><button type="button" class="ds-secondary" data-slides-preview>Visualizar slide</button><button type="submit" class="ds-primary">Salvar rascunho</button></div>
    </form><aside class="ds-preview-panel"><h3>Prévia antes de publicar</h3><figure class="ds-preview" tabindex="-1"><img alt=""><figcaption><h3></h3><p></p><a target="_blank" rel="noopener noreferrer" hidden></a></figcaption></figure><p>Recorte central automático. Em celulares o comunicado é apresentado na horizontal.</p></aside></div></section></section>`
  const list = root.querySelector<HTMLElement>('.ds-list')!, editor = root.querySelector<HTMLElement>('.ds-editor')!, form = root.querySelector<HTMLFormElement>('form')!
  const feedback = root.querySelector<HTMLElement>('.ds-feedback')!, error = root.querySelector<HTMLElement>('.ds-form-error')!, preview = root.querySelector<HTMLElement>('.ds-preview')!
  const control = (name: string) => form.elements.namedItem(name) as HTMLInputElement
  root.querySelector('.ds-timezone')!.textContent = 'Horários no seu fuso: ' + Intl.DateTimeFormat().resolvedOptions().timeZone
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!
  async function request(path: string, options: RequestInit = {}) {
    const res = await fetch('/api/admin/dashboard' + path, { ...options, headers: options.body instanceof FormData ? undefined : { 'Content-Type':'application/json' } })
    const data = await res.json()
    if (!res.ok) throw Error(data.error || 'Não foi possível concluir a operação.')
    return data
  }
  function stateLabel(s: Slide) {
    if (!s.is_active) return 'Inativo'
    if (s.ends_at && Date.parse(s.ends_at) <= Date.now()) return 'Encerrado'
    if (s.starts_at && Date.parse(s.starts_at) > Date.now()) return 'Agendado'
    return 'Publicado'
  }
  async function refresh(propagate = false) {
    list.setAttribute('aria-busy','true')
    try { slides = (await request('/slides')).slides; renderList() }
    catch (e) { list.textContent = (e as Error).message; const retry = document.createElement('button'); retry.className = 'ds-secondary'; retry.textContent = 'Tentar novamente'; retry.onclick = () => void refresh(); list.append(retry); if (propagate) throw e }
    finally { list.removeAttribute('aria-busy') }
  }
  function renderList() {
    list.innerHTML = slides.map((s,i) => `<article class="ds-row" draggable="true" data-slide-id="${s.id}"><div class="ds-row-thumb"><img src="${esc(s.image_path)}" alt="" loading="lazy"></div><div class="ds-row-copy"><span class="ds-state">${stateLabel(s)}</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p>${s.starts_at || s.ends_at ? `<span class="ds-schedule">${s.starts_at ? 'De ' + esc(new Date(s.starts_at).toLocaleString('pt-BR')) : 'Sem início definido'}${s.ends_at ? ' · Até ' + esc(new Date(s.ends_at).toLocaleString('pt-BR')) : ''}</span>` : ''}</div><div class="ds-row-actions"><button data-slide-action="edit" class="ds-secondary" type="button">Editar</button><button data-slide-action="toggle" class="ds-secondary" type="button">${s.is_active ? 'Desativar' : 'Ativar'}</button><button data-slide-action="up" class="ds-icon" type="button" aria-label="Mover ${esc(s.title)} para cima" ${i===0?'disabled':''}><i class="fas fa-chevron-up" aria-hidden="true"></i></button><button data-slide-action="down" class="ds-icon" type="button" aria-label="Mover ${esc(s.title)} para baixo" ${i===slides.length-1?'disabled':''}><i class="fas fa-chevron-down" aria-hidden="true"></i></button><button data-slide-action="delete" class="ds-icon ds-danger" type="button" aria-label="Excluir ${esc(s.title)}"><i class="far fa-trash-can" aria-hidden="true"></i></button></div></article>`).join('') || '<p class="ds-empty">Nenhum slide cadastrado. A dashboard usa os comunicados institucionais até você publicar um slide.</p>'
    for (const row of list.querySelectorAll<HTMLElement>('[data-slide-id]')) {
      const id = Number(row.dataset.slideId)
      row.querySelectorAll<HTMLButtonElement>('[data-slide-action]').forEach(button => button.addEventListener('click', () => void act(id, button.dataset.slideAction!)))
      row.addEventListener('dragstart',e=>{ if ((e.target as Element).closest('button')) { e.preventDefault(); return } e.dataTransfer!.setData('text/plain',String(id)); e.dataTransfer!.effectAllowed='move' })
      row.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer!.dropEffect='move'})
      row.addEventListener('drop',e=>{e.preventDefault();const moved=Number(e.dataTransfer!.getData('text/plain'));if(moved!==id)void reorder(moved,id)})
      row.querySelector('img')!.addEventListener('error', e => { (e.target as HTMLImageElement).hidden=true })
    }
    list.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{if(busy)button.disabled=true})
  }
  async function run(task: () => Promise<void>) {
    if (busy) return
    busy = true; renderList(); feedback.textContent = ''
    try { await task() } catch (e) { feedback.textContent = (e as Error).message }
    finally { busy = false; renderList() }
  }
  async function reorder(id: number, target: number) {
    const items=[...slides],from=items.findIndex(s=>s.id===id),to=items.findIndex(s=>s.id===target)
    if(from<0||to<0)return
    const [item]=items.splice(from,1);items.splice(to,0,item)
    await run(async()=>{slides=(await request('/slides/reorder',{method:'POST',body:JSON.stringify({items:items.map(s=>({id:s.id,version:s.version}))})})).slides;feedback.textContent='Ordem atualizada.'})
  }
  async function act(id: number, action: string) {
    const slide=slides.find(s=>s.id===id);if(!slide)return
    if(action==='edit'){openEditor(slide);return}
    if(action==='up'||action==='down'){const target=slides[slides.indexOf(slide)+(action==='up'?-1:1)];if(target)await reorder(id,target.id);return}
    if(action==='delete'&&!window.confirm(`Excluir definitivamente o slide “${slide.title}”? Essa ação remove o comunicado da dashboard.`))return
    await run(async()=>{
      if(action==='delete')await request('/slides/'+id+'?version='+slide.version,{method:'DELETE'})
      else if(action==='toggle')await request('/slides/'+id,{method:'PUT',body:JSON.stringify({...slide,is_active:!slide.is_active})})
      await refresh(true);feedback.textContent=action==='delete'?'Slide excluído.':'Publicação atualizada.'
    })
  }
  function updatePreview() {
    const image=preview.querySelector('img')!;image.hidden=false;image.src=control('image_path').value;image.alt=control('image_alt').value
    preview.querySelector('h3')!.textContent=control('title').value || 'Título do comunicado'
    preview.querySelector('figcaption p')!.textContent=control('description').value || 'A descrição do comunicado aparecerá aqui.'
    const link=preview.querySelector('a')!,url=control('link_url').value.trim();link.hidden=!url||!safeSlideLink(url);link.textContent=control('link_label').value;link.href=link.hidden?'#':url
    submit.textContent=control('is_active').checked?'Salvar e publicar':'Salvar rascunho'
    if(control('is_active').checked&&control('starts_at').value&&new Date(control('starts_at').value).getTime()>Date.now())submit.textContent='Salvar agendamento'
  }
  preview.querySelector('img')!.addEventListener('error',e=>{(e.target as HTMLImageElement).hidden=true})
  function openEditor(slide: Slide | null) {
    if(uploading || submit.disabled)return
    if(dirty&&!window.confirm('Descartar as alterações não salvas do slide atual?'))return
    editing=slide?{...slide}:null;error.textContent='';form.reset()
    for(const name of ['title','description','image_alt','link_url','link_label'])control(name).value=String(slide?.[name as keyof Slide] || '')
    const select=control('image_path') as unknown as HTMLSelectElement
    select.querySelectorAll('[data-uploaded]').forEach(option=>option.remove())
    if(slide?.image_path&&!institutionalSlides.some(s=>s.image_path===slide.image_path)){const option=new Option('Imagem enviada',slide.image_path);option.dataset.uploaded='true';select.add(option)}
    select.value=slide?.image_path || institutionalSlides[0].image_path
    control('starts_at').value=localDate(slide?.starts_at || null);control('ends_at').value=localDate(slide?.ends_at || null);control('is_active').checked=!!slide?.is_active
    root.querySelector('.ds-editor-heading h2')!.textContent=slide?'Editar comunicado':'Novo comunicado'
    editor.hidden=false;dirty=false;updatePreview();editor.scrollIntoView({block:'start',behavior:'instant'});control('title').focus()
  }
  root.querySelector('[data-slides-new]')!.addEventListener('click',()=>openEditor(null))
  root.querySelector('[data-slides-cancel]')!.addEventListener('click',()=>{if(uploading || submit.disabled)return;if(dirty&&!window.confirm('Descartar as alterações não salvas?'))return;editor.hidden=true;dirty=false;(root.querySelector('[data-slides-new]') as HTMLButtonElement).focus()})
  root.querySelector('[data-slides-preview]')!.addEventListener('click',()=>{updatePreview();preview.scrollIntoView({block:'center'});preview.focus()})
  form.addEventListener('input',()=>{dirty=true;updatePreview()})
  control('image_path').addEventListener('change',()=>{dirty=true;updatePreview()})
  control('image').addEventListener('change',async()=>{
    const file=control('image').files?.[0];if(!file)return
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024){error.textContent='Escolha JPEG, PNG ou WebP de até 8 MB para otimizar.';return}
    uploading=true;setEditorBusy(true);error.textContent='Otimizando e enviando imagem…'
    try {
      const bitmap=await createImageBitmap(file)
      if(bitmap.width*bitmap.height>40000000){bitmap.close();throw Error('A imagem tem dimensões excessivas.')}
      const scale=Math.min(1,1200/bitmap.width,1800/bitmap.height),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale)
      canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close()
      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.82))
      if(!blob||blob.size>750*1024)throw Error('A imagem continua maior que 750 KB. Reduza sua resolução e tente novamente.')
      const data=new FormData();data.append('image',blob,'slide.webp');const uploaded=await request('/images',{method:'POST',body:data})
      const option=new Option('Imagem enviada',uploaded.image_path);option.dataset.uploaded='true';(control('image_path') as unknown as HTMLSelectElement).add(option);control('image_path').value=uploaded.image_path;dirty=true;updatePreview();error.textContent=''
    } catch(e){error.textContent=(e as Error).message} finally {uploading=false;setEditorBusy(false)}
  })
  function setEditorBusy(value: boolean) {
    form.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>('input,button,select,textarea').forEach(el=>{el.disabled=value})
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(uploading||submit.disabled||!form.reportValidity())return
    const payload={title:control('title').value,description:control('description').value,image_alt:control('image_alt').value,image_path:control('image_path').value,link_url:control('link_url').value.trim(),link_label:control('link_label').value,is_active:control('is_active').checked,display_order:editing?.display_order ?? slides.length,starts_at:control('starts_at').value?new Date(control('starts_at').value).toISOString():null,ends_at:control('ends_at').value?new Date(control('ends_at').value).toISOString():null,version:editing?.version}
    if(!safeSlideLink(payload.link_url)){error.textContent='Use um endereço HTTPS ou um caminho interno seguro.';return}
    setEditorBusy(true);error.textContent=''
    try {const result=await request('/slides'+(editing?'/'+editing.id:''),{method:editing?'PUT':'POST',body:JSON.stringify(payload)});editing=result.slide;dirty=false;await refresh(true);feedback.textContent='Slide salvo. A dashboard receberá a atualização na próxima consulta.';updatePreview()}
    catch(e){error.textContent=(e as Error).message}finally{setEditorBusy(false)}
  })
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}})
  return { refresh }
}
