import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { hashPassword, verifyPassword, generateSessionId } from './lib/auth'
import { landingPage, loginPage, registerPage } from './templates/layouts'
import { dashboardPage } from './templates/dashboard'
import { sharedNotePage } from './templates/shared'
import { adminPage } from './templates/admin'

type Bindings = {
  DB: D1Database
}

type Variables = {
  user: { id: number; username: string; email: string; is_admin: boolean } | null
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================================
// MIDDLEWARE
// ============================================================
app.use('/api/*', cors())

app.use('*', async (c, next) => {
  await next()
  c.res.headers.set('X-Content-Type-Options', 'nosniff')
  c.res.headers.set('X-Frame-Options', 'DENY')
})

// Auth middleware - resolve session
async function resolveUser(c: any): Promise<{ id: number; username: string; email: string; is_admin: boolean } | null> {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return null
  try {
    const session = await c.env.DB.prepare(
      'SELECT s.user_id, u.username, u.email, u.is_admin FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime(\'now\')'
    ).bind(sessionId).first()
    if (!session) return null
    return { id: session.user_id as number, username: session.username as string, email: session.email as string, is_admin: session.is_admin === 1 }
  } catch { return null }
}

function requireAuth(redirectTo = '/login') {
  return async (c: any, next: any) => {
    const user = await resolveUser(c)
    if (!user) return c.redirect(redirectTo)
    c.set('user', user)
    await next()
  }
}

function requireAuthAPI() {
  return async (c: any, next: any) => {
    const user = await resolveUser(c)
    if (!user) return c.json({ error: 'Não autenticado' }, 401)
    c.set('user', user)
    await next()
  }
}

function requireAdmin() {
  return async (c: any, next: any) => {
    const user = await resolveUser(c)
    if (!user) return c.redirect('/login')
    if (!user.is_admin) return c.redirect('/app')
    c.set('user', user)
    await next()
  }
}

function requireAdminAPI() {
  return async (c: any, next: any) => {
    const user = await resolveUser(c)
    if (!user) return c.json({ error: 'Não autenticado' }, 401)
    if (!user.is_admin) return c.json({ error: 'Acesso negado' }, 403)
    c.set('user', user)
    await next()
  }
}

// Helper: generate share token
function generateShareToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================================
// PUBLIC PAGES
// ============================================================
app.get('/', async (c) => {
  const user = await resolveUser(c)
  if (user) return c.redirect('/app')
  c.header('Cache-Control', 'public, max-age=300')
  return c.html(landingPage())
})

app.get('/login', async (c) => {
  const user = await resolveUser(c)
  if (user) return c.redirect('/app')
  return c.html(loginPage())
})

app.get('/register', async (c) => {
  const user = await resolveUser(c)
  if (user) return c.redirect('/app')
  return c.html(registerPage())
})

// ============================================================
// AUTH ACTIONS
// ============================================================
app.post('/register', async (c) => {
  try {
    const body = await c.req.parseBody()
    const username = (body.username as string || '').trim()
    const email = (body.email as string || '').trim().toLowerCase()
    const password = body.password as string || ''
    const passwordConfirm = body.password_confirm as string || ''

    if (!username || username.length < 3) return c.html(registerPage('Nome de usuário deve ter pelo menos 3 caracteres'))
    if (!email || !email.includes('@')) return c.html(registerPage('Email inválido'))
    if (password.length < 6) return c.html(registerPage('Senha deve ter pelo menos 6 caracteres'))
    if (password !== passwordConfirm) return c.html(registerPage('As senhas não conferem'))

    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).bind(username, email).first()
    if (existing) return c.html(registerPage('Usuário ou email já cadastrado'))

    const passwordHash = await hashPassword(password)

    // Check if this is the first user - auto-promote to admin
    const userCount = await c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first()
    const isFirstUser = (userCount as any)?.c === 0

    const result = await c.env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, ?)'
    ).bind(username, email, passwordHash, isFirstUser ? 1 : 0).run()

    const userId = result.meta.last_row_id
    const sessionId = generateSessionId()
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime(\'now\', \'+30 days\'))').bind(sessionId, userId),
      c.env.DB.prepare('INSERT INTO folders (user_id, name, icon) VALUES (?, ?, ?)').bind(userId, 'Minhas Notas', '📝')
    ])

    setCookie(c, 'session', sessionId, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 60 * 60 * 24 * 30 })
    return c.redirect('/app')
  } catch (e: any) {
    return c.html(registerPage('Erro ao criar conta: ' + e.message))
  }
})

app.post('/login', async (c) => {
  try {
    const body = await c.req.parseBody()
    const login = (body.login as string || '').trim()
    const password = body.password as string || ''

    if (!login || !password) return c.html(loginPage('Preencha todos os campos'))

    const user = await c.env.DB.prepare(
      'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?'
    ).bind(login.toLowerCase(), login).first()
    if (!user) return c.html(loginPage('Usuário ou senha inválidos'))

    const valid = await verifyPassword(password, user.password_hash as string)
    if (!valid) return c.html(loginPage('Usuário ou senha inválidos'))

    const sessionId = generateSessionId()
    await c.env.DB.batch([
      c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime(\'now\', \'+30 days\'))').bind(sessionId, user.id),
      c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND expires_at < datetime(\'now\')').bind(user.id)
    ])

    setCookie(c, 'session', sessionId, { path: '/', httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 60 * 60 * 24 * 30 })
    return c.redirect('/app')
  } catch (e: any) {
    return c.html(loginPage('Erro ao entrar: ' + e.message))
  }
})

app.get('/logout', async (c) => {
  const sessionId = getCookie(c, 'session')
  if (sessionId) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
  }
  deleteCookie(c, 'session', { path: '/' })
  return c.redirect('/')
})

// ============================================================
// APP PAGE (protected)
// ============================================================
app.get('/app', requireAuth(), async (c) => {
  const user = c.get('user')!
  c.header('Cache-Control', 'private, no-cache')
  return c.html(dashboardPage(user.username, user.is_admin))
})

// ============================================================
// ADMIN PAGE (admin only)
// ============================================================
app.get('/admin', requireAdmin(), async (c) => {
  const user = c.get('user')!
  c.header('Cache-Control', 'private, no-cache')
  return c.html(adminPage(user.username))
})

// ============================================================
// API: ADMIN ROUTES
// ============================================================

// Stats overview
app.get('/api/admin/stats', requireAdminAPI(), async (c) => {
  const [users, notes, folders, shares, edits, sessions, contentLen, admins, activeShares, recentUsers, topUsers] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT COUNT(*) as c FROM users'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM notes'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM folders'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM note_shares'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM note_edit_history'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM sessions WHERE expires_at > datetime(\'now\')'),
    c.env.DB.prepare('SELECT COALESCE(SUM(LENGTH(content)), 0) as c FROM notes'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM users WHERE is_admin = 1'),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM note_shares WHERE is_active = 1'),
    c.env.DB.prepare('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 10'),
    c.env.DB.prepare('SELECT u.id, u.username, u.is_admin, COUNT(n.id) as note_count FROM users u LEFT JOIN notes n ON u.id = n.user_id GROUP BY u.id ORDER BY note_count DESC LIMIT 10'),
  ])

  return c.json({
    total_users: (users.results[0] as any)?.c || 0,
    total_notes: (notes.results[0] as any)?.c || 0,
    total_folders: (folders.results[0] as any)?.c || 0,
    total_shares: (shares.results[0] as any)?.c || 0,
    total_edits: (edits.results[0] as any)?.c || 0,
    active_sessions: (sessions.results[0] as any)?.c || 0,
    total_content_length: (contentLen.results[0] as any)?.c || 0,
    admin_count: (admins.results[0] as any)?.c || 0,
    active_shares: (activeShares.results[0] as any)?.c || 0,
    recent_users: recentUsers.results,
    top_users: topUsers.results,
  })
})

// List all users with counts
app.get('/api/admin/users', requireAdminAPI(), async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT u.id, u.username, u.email, u.is_admin, u.created_at,
      (SELECT COUNT(*) FROM notes WHERE user_id = u.id) as note_count,
      (SELECT COUNT(*) FROM folders WHERE user_id = u.id) as folder_count,
      (SELECT COUNT(*) FROM note_shares WHERE owner_id = u.id) as share_count
    FROM users u ORDER BY u.created_at DESC
  `).all()
  return c.json({ users: results })
})

// Toggle admin status
app.put('/api/admin/users/:id/admin', requireAdminAPI(), async (c) => {
  const user = c.get('user')!
  const targetId = parseInt(c.req.param('id'))
  const { is_admin } = await c.req.json()

  // Prevent self-demotion
  if (targetId === user.id && !is_admin) {
    return c.json({ error: 'Você não pode remover seu próprio admin' }, 400)
  }

  const target = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(targetId).first()
  if (!target) return c.json({ error: 'Usuário não encontrado' }, 404)

  await c.env.DB.prepare('UPDATE users SET is_admin = ? WHERE id = ?').bind(is_admin ? 1 : 0, targetId).run()
  return c.json({ success: true })
})

// Delete user (and all their data)
app.delete('/api/admin/users/:id', requireAdminAPI(), async (c) => {
  const user = c.get('user')!
  const targetId = parseInt(c.req.param('id'))

  // Prevent self-deletion
  if (targetId === user.id) {
    return c.json({ error: 'Você não pode excluir a si mesmo' }, 400)
  }

  const target = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(targetId).first()
  if (!target) return c.json({ error: 'Usuário não encontrado' }, 404)

  // Cascade delete: shares, edit history, notes, folders, sessions, user
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM note_shares WHERE owner_id = ?').bind(targetId),
    c.env.DB.prepare('DELETE FROM note_edit_history WHERE user_id = ?').bind(targetId),
    c.env.DB.prepare('DELETE FROM notes WHERE user_id = ?').bind(targetId),
    c.env.DB.prepare('DELETE FROM folders WHERE user_id = ?').bind(targetId),
    c.env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(targetId),
    c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(targetId),
  ])

  return c.json({ success: true })
})

// Recent activity (all users)
app.get('/api/admin/activity', requireAdminAPI(), async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT h.*, n.title as note_title
    FROM note_edit_history h
    LEFT JOIN notes n ON h.note_id = n.id
    ORDER BY h.created_at DESC LIMIT 100
  `).all()
  return c.json({ activity: results })
})

// ============================================================
// SHARED NOTE PAGE (public)
// ============================================================
app.get('/s/:token', async (c) => {
  const token = c.req.param('token')
  const currentUser = await resolveUser(c)

  const share = await c.env.DB.prepare(
    'SELECT * FROM note_shares WHERE share_token = ? AND is_active = 1'
  ).bind(token).first()

  if (!share) {
    return c.html(`<!DOCTYPE html><html><head><title>Não encontrado - DoutorText</title>
      <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
      </head><body style="font-family:Poppins" class="bg-gray-50 flex items-center justify-center min-h-screen">
      <div class="text-center p-8"><div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
      <i class="fas fa-link-slash text-red-400 text-2xl"></i></div>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Link inválido ou expirado</h1>
      <p class="text-gray-500 mb-6">Este compartilhamento não existe mais.</p>
      <a href="/" class="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition">Ir para DoutorText</a>
      </div></body></html>`, 404)
  }

  // Get note with owner name
  const note = await c.env.DB.prepare(
    'SELECT n.*, u.username as owner_name FROM notes n JOIN users u ON n.user_id = u.id WHERE n.id = ?'
  ).bind(share.note_id).first()

  if (!note) {
    return c.html('<h1>Nota não encontrada</h1>', 404)
  }

  // Get edit history (last 20)
  const { results: editHistory } = await c.env.DB.prepare(
    'SELECT * FROM note_edit_history WHERE note_id = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(share.note_id).all()

  return c.html(sharedNotePage(note, share, currentUser, editHistory))
})

// ============================================================
// API: SHARED NOTE OPERATIONS (public with token)
// ============================================================

// Save shared note (edit permission required + logged in)
app.put('/api/shared/:token', async (c) => {
  const token = c.req.param('token')
  const currentUser = await resolveUser(c)

  if (!currentUser) return c.json({ error: 'Faça login para editar' }, 401)

  const share = await c.env.DB.prepare(
    'SELECT * FROM note_shares WHERE share_token = ? AND is_active = 1 AND permission = \'edit\''
  ).bind(token).first()

  if (!share) return c.json({ error: 'Sem permissão de edição' }, 403)

  const { title, content } = await c.req.json()

  // Update note and increment version
  await c.env.DB.batch([
    c.env.DB.prepare(
      'UPDATE notes SET title = ?, content = ?, last_edited_by = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(title, content, currentUser.username, share.note_id),
    c.env.DB.prepare(
      'INSERT INTO note_edit_history (note_id, user_id, username, action, summary) VALUES (?, ?, ?, \'edit\', ?)'
    ).bind(share.note_id, currentUser.id, currentUser.username, `Editou título/conteúdo`)
  ])

  // Get new version
  const updated = await c.env.DB.prepare('SELECT version FROM notes WHERE id = ?').bind(share.note_id).first()

  return c.json({ success: true, version: updated?.version || 1 })
})

// Poll for changes (public)
app.get('/api/shared/:token/poll', async (c) => {
  const token = c.req.param('token')
  const clientVersion = parseInt(c.req.query('version') || '0')

  const share = await c.env.DB.prepare(
    'SELECT note_id FROM note_shares WHERE share_token = ? AND is_active = 1'
  ).bind(token).first()

  if (!share) return c.json({ error: 'Share inválido' }, 404)

  const note = await c.env.DB.prepare(
    'SELECT title, content, version, last_edited_by, updated_at FROM notes WHERE id = ?'
  ).bind(share.note_id).first()

  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)

  const serverVersion = (note.version as number) || 1
  if (serverVersion > clientVersion) {
    return c.json({
      changed: true,
      title: note.title,
      content: note.content,
      version: serverVersion,
      last_edited_by: note.last_edited_by,
      updated_at: note.updated_at
    })
  }

  return c.json({ changed: false, version: serverVersion })
})

// ============================================================
// API: SHARING MANAGEMENT (protected)
// ============================================================

// List shares for a note
app.get('/api/notes/:id/shares', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const noteId = parseInt(c.req.param('id'))

  // Verify ownership
  const note = await c.env.DB.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').bind(noteId, user.id).first()
  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)

  const { results } = await c.env.DB.prepare(
    'SELECT id, share_token, permission, shared_with_email, is_active, created_at FROM note_shares WHERE note_id = ? AND owner_id = ? ORDER BY created_at DESC'
  ).bind(noteId, user.id).all()

  return c.json({ shares: results })
})

// Create a share
app.post('/api/notes/:id/shares', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const noteId = parseInt(c.req.param('id'))
  const { permission, shared_with_email } = await c.req.json()

  // Verify ownership
  const note = await c.env.DB.prepare('SELECT id, title FROM notes WHERE id = ? AND user_id = ?').bind(noteId, user.id).first()
  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)

  const perm = permission === 'edit' ? 'edit' : 'view'
  const shareToken = generateShareToken()

  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO note_shares (note_id, owner_id, share_token, permission, shared_with_email) VALUES (?, ?, ?, ?, ?)'
    ).bind(noteId, user.id, shareToken, perm, shared_with_email || null),
    c.env.DB.prepare(
      'INSERT INTO note_edit_history (note_id, user_id, username, action, summary) VALUES (?, ?, ?, \'share\', ?)'
    ).bind(noteId, user.id, user.username, `Compartilhou com permissão de ${perm === 'edit' ? 'edição' : 'visualização'}`)
  ])

  return c.json({
    share: { share_token: shareToken, permission: perm, shared_with_email: shared_with_email || null }
  }, 201)
})

// Update a share (change permission or deactivate)
app.put('/api/shares/:shareId', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const shareId = parseInt(c.req.param('shareId'))
  const body = await c.req.json()

  const share = await c.env.DB.prepare(
    'SELECT id FROM note_shares WHERE id = ? AND owner_id = ?'
  ).bind(shareId, user.id).first()
  if (!share) return c.json({ error: 'Compartilhamento não encontrado' }, 404)

  const updates: string[] = []
  const values: any[] = []
  if (body.permission !== undefined) { updates.push('permission = ?'); values.push(body.permission === 'edit' ? 'edit' : 'view') }
  if (body.is_active !== undefined) { updates.push('is_active = ?'); values.push(body.is_active ? 1 : 0) }
  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(shareId, user.id)

  await c.env.DB.prepare(`UPDATE note_shares SET ${updates.join(', ')} WHERE id = ? AND owner_id = ?`).bind(...values).run()
  return c.json({ success: true })
})

// Delete a share
app.delete('/api/shares/:shareId', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const shareId = parseInt(c.req.param('shareId'))

  await c.env.DB.prepare('DELETE FROM note_shares WHERE id = ? AND owner_id = ?').bind(shareId, user.id).run()
  return c.json({ success: true })
})

// Get edit history for a note
app.get('/api/notes/:id/history', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const noteId = parseInt(c.req.param('id'))

  const note = await c.env.DB.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').bind(noteId, user.id).first()
  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM note_edit_history WHERE note_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(noteId).all()

  return c.json({ history: results })
})

// ============================================================
// API: FOLDERS (protected)
// ============================================================
app.get('/api/folders', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM folders WHERE user_id = ? ORDER BY sort_order, name'
  ).bind(user.id).all()
  return c.json({ folders: results })
})

app.post('/api/folders', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const { name, parent_id } = await c.req.json()
  if (!name || !name.trim()) return c.json({ error: 'Nome é obrigatório' }, 400)

  if (parent_id) {
    const parent = await c.env.DB.prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?').bind(parent_id, user.id).first()
    if (!parent) return c.json({ error: 'Pasta pai não encontrada' }, 404)
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO folders (user_id, parent_id, name) VALUES (?, ?, ?)'
  ).bind(user.id, parent_id || null, name.trim()).run()

  return c.json({ folder: { id: result.meta.last_row_id, name: name.trim(), parent_id: parent_id || null } }, 201)
})

app.put('/api/folders/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))
  const { name, parent_id, sort_order } = await c.req.json()

  const folder = await c.env.DB.prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?').bind(id, user.id).first()
  if (!folder) return c.json({ error: 'Pasta não encontrada' }, 404)

  const updates: string[] = []
  const values: any[] = []
  if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()) }
  if (parent_id !== undefined) { updates.push('parent_id = ?'); values.push(parent_id) }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }
  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id, user.id)

  await c.env.DB.prepare(`UPDATE folders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).bind(...values).run()
  return c.json({ success: true })
})

app.delete('/api/folders/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))

  const allFolderIds = [id]
  async function getDescendants(parentId: number) {
    const { results } = await c.env.DB.prepare('SELECT id FROM folders WHERE parent_id = ? AND user_id = ?').bind(parentId, user.id).all()
    for (const f of results) {
      allFolderIds.push(f.id as number)
      await getDescendants(f.id as number)
    }
  }
  await getDescendants(id)

  const stmts = []
  for (const fid of allFolderIds) {
    stmts.push(c.env.DB.prepare('DELETE FROM notes WHERE folder_id = ? AND user_id = ?').bind(fid, user.id))
  }
  for (const fid of allFolderIds.reverse()) {
    stmts.push(c.env.DB.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').bind(fid, user.id))
  }
  await c.env.DB.batch(stmts)

  return c.json({ success: true })
})

// ============================================================
// API: NOTES (protected)
// ============================================================
app.get('/api/notes', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const folderId = c.req.query('folder_id')

  let query = 'SELECT id, title, content, folder_id, is_pinned, last_edited_by, version, created_at, updated_at FROM notes WHERE user_id = ?'
  const params: any[] = [user.id]

  if (folderId) {
    query += ' AND folder_id = ?'
    params.push(parseInt(folderId))
  }

  query += ' ORDER BY is_pinned DESC, updated_at DESC'
  const { results } = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ notes: results })
})

app.get('/api/notes/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))
  const note = await c.env.DB.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').bind(id, user.id).first()
  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)
  return c.json({ note })
})

app.post('/api/notes', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const { title, content, folder_id } = await c.req.json()

  if (folder_id) {
    const folder = await c.env.DB.prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?').bind(folder_id, user.id).first()
    if (!folder) return c.json({ error: 'Pasta não encontrada' }, 404)
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO notes (user_id, folder_id, title, content, last_edited_by) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, folder_id || null, title || 'Nova nota', content || '', user.username).run()

  const note = await c.env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(result.meta.last_row_id).first()
  return c.json({ note }, 201)
})

app.put('/api/notes/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const note = await c.env.DB.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').bind(id, user.id).first()
  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)

  const updates: string[] = []
  const values: any[] = []
  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title) }
  if (body.content !== undefined) { updates.push('content = ?'); values.push(body.content) }
  if (body.folder_id !== undefined) { updates.push('folder_id = ?'); values.push(body.folder_id) }
  if (body.is_pinned !== undefined) { updates.push('is_pinned = ?'); values.push(body.is_pinned ? 1 : 0) }
  updates.push('last_edited_by = ?'); values.push(user.username)
  updates.push('version = version + 1')
  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id, user.id)

  await c.env.DB.prepare(`UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).bind(...values).run()
  return c.json({ success: true })
})

app.delete('/api/notes/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))
  // Also delete shares for this note
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM note_shares WHERE note_id = ? AND owner_id = ?').bind(id, user.id),
    c.env.DB.prepare('DELETE FROM note_edit_history WHERE note_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').bind(id, user.id)
  ])
  return c.json({ success: true })
})

export default app
