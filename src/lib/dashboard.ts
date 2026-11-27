export type DashboardSlide = {
  id: number; title: string; description: string; image_path: string; image_alt: string;
  link_url: string; link_label: string; display_order: number; is_active: number;
  starts_at: string | null; ends_at: string | null; version: number;
}

export const institutionalSlides = [
  { title: 'Mais produtividade na sua rotina médica', description: 'Padronize evoluções, prescrições e condutas com o DoutorText.', image_path: '/static/dashboard/workspace.jpg', image_alt: 'Notebook e estetoscópio em uma mesa de trabalho.' },
  { title: 'Tudo o que você precisa, em um só lugar', description: 'Organize suas anotações, modelos clínicos e referências para facilitar o atendimento.', image_path: '/static/dashboard/organization.jpg', image_alt: 'Caderno aberto e materiais de organização sobre a mesa.' },
  { title: 'Menos tempo digitando. Mais tempo cuidando.', description: 'Acesse suas anotações e ferramentas médicas de maneira rápida e intuitiva.', image_path: '/static/dashboard/clinical-desk.jpg', image_alt: 'Profissional de saúde trabalhando em um notebook.' },
].map((slide, i) => ({ ...slide, id: -(i + 1), link_url: '', link_label: '', display_order: i, is_active: 1, starts_at: null, ends_at: null, version: 1 })) satisfies DashboardSlide[]

export const slideColumns = 'id,title,description,image_path,image_alt,link_url,link_label,display_order,is_active,starts_at,ends_at,version,created_at,updated_at'
export const publishedSlidesWhere = "is_active = 1 AND (starts_at IS NULL OR datetime(starts_at) <= datetime('now')) AND (ends_at IS NULL OR datetime(ends_at) > datetime('now'))"

export function safeSlideLink(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048 || /[\s\\\u0000-\u001f]/.test(value)) return false
  if (!value) return true
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password } catch { return false }
}

export function validateSlide(input: any): { value?: Omit<DashboardSlide, 'id' | 'version'>; error?: string } {
  if (!input || typeof input !== 'object') return { error: 'Slide inválido.' }
  const limits = { title: 120, description: 400, image_alt: 240, link_label: 80 }
  for (const [field, limit] of Object.entries(limits)) {
    if (typeof input[field] !== 'string' || input[field].length > limit || /[<>\u0000]/.test(input[field])) return { error: 'Use texto simples dentro dos limites indicados.' }
  }
  if (!input.title.trim()) return { error: 'Informe o título.' }
  if (!safeSlideLink(input.link_url) || Boolean(input.link_url) !== Boolean(input.link_label.trim())) return { error: 'Informe um destino seguro e um texto para o link, ou deixe ambos vazios.' }
  if (typeof input.image_path !== 'string' || !/^\/(?:static\/dashboard\/[a-z0-9-]+\.(?:jpg|png|webp)|api\/dashboard\/images\/[a-f0-9-]{36})$/.test(input.image_path)) return { error: 'Escolha uma imagem enviada ou institucional.' }
  if (![true, false, 0, 1].includes(input.is_active) || !Number.isSafeInteger(input.display_order) || Math.abs(input.display_order) > 100000) return { error: 'Status ou ordem inválidos.' }
  const dates: (string | null)[] = []
  for (const field of ['starts_at', 'ends_at']) {
    const value = input[field]
    if (value == null || value === '') { dates.push(null); continue }
    if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?Z$/.test(value) || !Number.isFinite(Date.parse(value))) return { error: 'As datas precisam conter um horário UTC válido.' }
    if(new Date(value).toISOString().slice(0,16)!==value.slice(0,16))return { error:'Data de calendário inválida.' }
    dates.push(new Date(value).toISOString())
  }
  if (dates[0] && dates[1] && dates[0] >= dates[1]) return { error: 'O término deve ocorrer depois do início.' }
  return { value: { title: input.title.trim(), description: input.description.trim(), image_alt: input.image_alt.trim(), image_path: input.image_path, link_url: input.link_url, link_label: input.link_label.trim(), display_order: input.display_order, is_active: input.is_active ? 1 : 0, starts_at: dates[0], ends_at: dates[1] } }
}

export const MAX_SLIDE_IMAGE_BYTES = 750 * 1024
export function imageDimensions(bytes: Uint8Array, mime: string): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let width = 0, height = 0
  if (mime === 'image/png' && bytes.length >= 67 && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) {
    if (String.fromCharCode(...bytes.slice(12,16)) !== 'IHDR') return null
    width = view.getUint32(16); height = view.getUint32(20)
  } else if (mime === 'image/jpeg' && bytes.length >= 128 && bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217) {
    for (let p = 2; p + 8 < bytes.length;) {
      if (bytes[p++] !== 255) return null
      while (bytes[p] === 255) p++
      const marker = bytes[p++]
      if (marker === 218 || marker === 217) break
      const length = view.getUint16(p)
      if (length < 2 || p + length > bytes.length) return null
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) { height = view.getUint16(p + 3); width = view.getUint16(p + 5); break }
      p += length
    }
  } else if (mime === 'image/webp' && bytes.length >= 30 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP' && view.getUint32(4,true) + 8 === bytes.length) {
    const type = String.fromCharCode(...bytes.slice(12,16))
    if (type === 'VP8X') { width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16); height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) }
    else if (type === 'VP8L' && bytes[20] === 47) { const bits = view.getUint32(21,true); width = (bits & 16383) + 1; height = ((bits >>> 14) & 16383) + 1 }
    else if (type === 'VP8 ' && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) { width = view.getUint16(26,true) & 16383; height = view.getUint16(28,true) & 16383 }
  }
  return width > 0 && height > 0 && width <= 6000 && height <= 6000 && width * height <= 18000000 ? { width, height } : null
}
