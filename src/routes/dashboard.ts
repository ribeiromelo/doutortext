import { liveNoteClause } from '../lib/dashboard-data'
import type { Hono, MiddlewareHandler } from 'hono'
import type { AppEnv } from '../index'
import { validId } from '../lib/security'
import { imageDimensions, MAX_SLIDE_IMAGE_BYTES, publishedSlidesWhere, slideColumns, validateSlide } from '../lib/dashboard'

export function registerDashboardRoutes(app: Hono<AppEnv>, auth: MiddlewareHandler<AppEnv>, admin: MiddlewareHandler<AppEnv>) {
  app.get('/api/dashboard/home', auth, async c => {
    const user = c.get('user')!
    const live = await liveNoteClause(c.env.DB)
    const [recent, popular, slides] = await c.env.DB.batch([
      c.env.DB.prepare(`SELECT n.id,n.title,n.updated_at FROM notes n WHERE n.user_id = ?${live} ORDER BY n.updated_at DESC,n.id DESC LIMIT 5`).bind(user.id),
      c.env.DB.prepare(`SELECT n.id,n.title,n.updated_at FROM note_accesses a JOIN notes n ON n.id = a.note_id AND n.user_id = a.user_id WHERE a.user_id = ?${live} ORDER BY a.access_count DESC,a.last_accessed_at DESC,n.id DESC LIMIT 5`).bind(user.id),
      c.env.DB.prepare(`SELECT ${slideColumns} FROM dashboard_slides WHERE ${publishedSlidesWhere} ORDER BY display_order,id`),
    ])
    return c.json({ recent: recent.results, popular: popular.results, slides: slides.results, slides_state: slides.results.length ? 'ready' : 'empty' })
  })

  // Reading, restoring tabs and polling never increment a counter. Only explicit UI opens POST here.
  app.post('/api/notes/:id/access', auth, async c => {
    const user = c.get('user')!, id = Number(c.req.param('id'))
    if (!validId(id)) return c.json({ error: 'Nota inválida.' }, 400)
    const body = await c.req.json().catch(() => null)
    if (!body || typeof body.event_id !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.event_id)) return c.json({ error: 'Evento inválido.' }, 400)
    const live = await liveNoteClause(c.env.DB)
    const result = await c.env.DB.prepare(`INSERT OR IGNORE INTO note_access_events(user_id,event_id,note_id) SELECT ?,?,n.id FROM notes n WHERE n.id = ? AND n.user_id = ?${live}`).bind(user.id, body.event_id, id, user.id).run()
    if (!result.meta.changes) {
      const note = await c.env.DB.prepare(`SELECT n.id FROM notes n WHERE n.id = ? AND n.user_id = ?${live}`).bind(id, user.id).first()
      if (!note) return c.json({ error: 'Nota não encontrada.' }, 404)
    }
    return c.json({ success: true })
  })

  const allSlides = (db: D1Database) => db.prepare(`SELECT ${slideColumns} FROM dashboard_slides ORDER BY display_order,id`).all()
  app.get('/api/admin/dashboard/slides', admin, async c => c.json({ slides: (await allSlides(c.env.DB)).results }))

  app.post('/api/admin/dashboard/slides/reorder', admin, async c => {
    const body = await c.req.json().catch(() => null), items = body?.items
    if (!Array.isArray(items) || !items.length || items.length > 100 || items.some(i => !validId(i.id) || !validId(i.version)) || new Set(items.map(i => i.id)).size !== items.length) return c.json({ error: 'Ordem inválida.' }, 400)
    // JSON keeps the atomic reorder within D1's bound-parameter limit at 100 slides.
    const result = await c.env.DB.prepare(`WITH requested AS (
      SELECT CAST(json_extract(value,'$.id') AS INTEGER) AS id,
             CAST(json_extract(value,'$.version') AS INTEGER) AS version,
             CAST(key AS INTEGER) AS position FROM json_each(?)
    ) UPDATE dashboard_slides SET display_order = (SELECT position FROM requested WHERE requested.id = dashboard_slides.id),
      version = version + 1,updated_at = CURRENT_TIMESTAMP
      WHERE (SELECT COUNT(*) FROM dashboard_slides s JOIN requested r ON s.id = r.id AND s.version = r.version) = ?
        AND (SELECT COUNT(*) FROM dashboard_slides) = ? AND id IN (SELECT id FROM requested)`)
      .bind(JSON.stringify(items),items.length,items.length).run()
    if (result.meta.changes !== items.length) return c.json({ error: 'Os slides mudaram em outra sessão. Atualize antes de reordenar.' }, 409)
    return c.json({ slides: (await allSlides(c.env.DB)).results })
  })

  async function existingImage(db: D1Database, path: string) {
    if (path.startsWith('/static/')) return ['/static/dashboard/workspace.jpg','/static/dashboard/organization.jpg','/static/dashboard/clinical-desk.jpg'].includes(path)
    return Boolean(await db.prepare('SELECT id FROM dashboard_slide_images WHERE id = ?').bind(path.split('/').pop()).first())
  }
  app.post('/api/admin/dashboard/slides', admin, async c => {
    const input = validateSlide(await c.req.json().catch(() => null))
    if (!input.value) return c.json({ error: input.error }, 400)
    const v = input.value
    if (!(await existingImage(c.env.DB, v.image_path))) return c.json({ error: 'A imagem selecionada não existe.' }, 400)
    const count = await c.env.DB.prepare('SELECT COUNT(*) AS total FROM dashboard_slides').first<{ total: number }>()
    if (count!.total >= 100) return c.json({ error: 'O limite é de 100 slides. Remova um slide antes de adicionar outro.' }, 400)
    const result = await c.env.DB.prepare('INSERT INTO dashboard_slides(title,description,image_path,image_alt,link_url,link_label,display_order,is_active,starts_at,ends_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(v.title,v.description,v.image_path,v.image_alt,v.link_url,v.link_label,v.display_order,v.is_active,v.starts_at,v.ends_at,c.get('user')!.id).run()
    return c.json({ slide: await c.env.DB.prepare(`SELECT ${slideColumns} FROM dashboard_slides WHERE id = ?`).bind(result.meta.last_row_id).first() }, 201)
  })
  app.put('/api/admin/dashboard/slides/:id', admin, async c => {
    const id = Number(c.req.param('id')), body = await c.req.json().catch(() => null)
    const input = validateSlide(body)
    if (!validId(id) || !validId(body?.version) || !input.value) return c.json({ error: input.error || 'Slide inválido.' }, 400)
    const v = input.value
    if (!(await existingImage(c.env.DB, v.image_path))) return c.json({ error: 'A imagem selecionada não existe.' }, 400)
    const result = await c.env.DB.prepare('UPDATE dashboard_slides SET title=?,description=?,image_path=?,image_alt=?,link_url=?,link_label=?,display_order=?,is_active=?,starts_at=?,ends_at=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?').bind(v.title,v.description,v.image_path,v.image_alt,v.link_url,v.link_label,v.display_order,v.is_active,v.starts_at,v.ends_at,id,body.version).run()
    if (!result.meta.changes) return c.json({ error: 'O slide mudou ou foi excluído. Atualize os dados antes de salvar.' }, 409)
    return c.json({ slide: await c.env.DB.prepare(`SELECT ${slideColumns} FROM dashboard_slides WHERE id = ?`).bind(id).first() })
  })
  app.delete('/api/admin/dashboard/slides/:id', admin, async c => {
    const id = Number(c.req.param('id')), version = Number(c.req.query('version'))
    if (!validId(id) || !validId(version)) return c.json({ error: 'Slide inválido.' }, 400)
    const result = await c.env.DB.prepare('DELETE FROM dashboard_slides WHERE id=? AND version=?').bind(id,version).run()
    if (!result.meta.changes) return c.json({ error: 'O slide mudou ou foi excluído. Atualize a lista.' }, 409)
    return c.json({ success: true })
  })

  // Small, infrequent institutional images use the existing D1 infrastructure.
  // Nothing is sent to a second storage provider; no administrative credentials reach the browser.
  app.post('/api/admin/dashboard/images', admin, async c => {
    const body = await c.req.formData(), file = body.get('image')
    if (!(file instanceof File) || !['image/jpeg','image/png','image/webp'].includes(file.type)) return c.json({ error: 'Envie uma imagem JPEG, PNG ou WebP.' }, 415)
    if (!file.size || file.size > MAX_SLIDE_IMAGE_BYTES) return c.json({ error: 'A imagem deve ter no máximo 750 KB. Otimize-a antes de enviar.' }, 413)
    const bytes = new Uint8Array(await file.arrayBuffer()), dimensions = imageDimensions(bytes, file.type)
    if (!dimensions) return c.json({ error: 'Imagem inválida ou com dimensões excessivas.' }, 415)
    const id = crypto.randomUUID()
    await c.env.DB.prepare('INSERT INTO dashboard_slide_images(id,mime_type,data,created_by) VALUES (?,?,?,?)').bind(id,file.type,bytes.buffer,c.get('user')!.id).run()
    return c.json({ image_path: '/api/dashboard/images/' + id, ...dimensions }, 201)
  })
  app.get('/api/dashboard/images/:id', auth, async c => {
    const id = c.req.param('id')
    if (!/^[a-f0-9-]{36}$/.test(id)) return c.notFound()
    const allowed = c.get('user')!.is_admin ? '' : ` AND EXISTS (SELECT 1 FROM dashboard_slides WHERE image_path = ? AND ${publishedSlidesWhere})`
    const stmt = c.env.DB.prepare(`SELECT mime_type,data FROM dashboard_slide_images WHERE id = ?${allowed}`)
    const row = await (allowed ? stmt.bind(id,'/api/dashboard/images/' + id) : stmt.bind(id)).first<{ mime_type: string; data: number[] | ArrayBuffer }>()
    if (!row) return c.notFound()
    return new Response(new Uint8Array(row.data as ArrayBuffer), { headers: { 'Content-Type': row.mime_type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" } })
  })
}
