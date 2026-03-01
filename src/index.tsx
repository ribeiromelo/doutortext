import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { hashPassword, verifyPassword, generateSessionId } from './lib/auth'
import { baseLayout, landingPage, loginPage, registerPage } from './templates/layouts'
import { dashboardPage } from './templates/dashboard'

type Bindings = {
  DB: D1Database
}

type Variables = {
  user: { id: number; username: string; email: string } | null
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ============================================================
// MIDDLEWARE
// ============================================================
app.use('/api/*', cors())

// Auth middleware - resolve session
async function resolveUser(c: any): Promise<{ id: number; username: string; email: string } | null> {
  const sessionId = getCookie(c, 'session')
  if (!sessionId) return null

  try {
    const session = await c.env.DB.prepare(
      'SELECT s.user_id, u.username, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime(\'now\')'
    ).bind(sessionId).first()

    if (!session) return null
    return { id: session.user_id as number, username: session.username as string, email: session.email as string }
  } catch {
    return null
  }
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

// ============================================================
// PUBLIC PAGES
// ============================================================

// Landing Page
app.get('/', async (c) => {
  const user = await resolveUser(c)
  if (user) return c.redirect('/app')
  return c.html(landingPage())
})

// Login Page
app.get('/login', async (c) => {
  const user = await resolveUser(c)
  if (user) return c.redirect('/app')
  return c.html(loginPage())
})

// Register Page
app.get('/register', async (c) => {
  const user = await resolveUser(c)
  if (user) return c.redirect('/app')
  return c.html(registerPage())
})

// ============================================================
// AUTH ACTIONS
// ============================================================

// Register POST
app.post('/register', async (c) => {
  try {
    const body = await c.req.parseBody()
    const username = (body.username as string || '').trim()
    const email = (body.email as string || '').trim().toLowerCase()
    const password = body.password as string || ''
    const passwordConfirm = body.password_confirm as string || ''

    if (!username || username.length < 3) {
      return c.html(registerPage('Nome de usuário deve ter pelo menos 3 caracteres'))
    }
    if (!email || !email.includes('@')) {
      return c.html(registerPage('Email inválido'))
    }
    if (password.length < 6) {
      return c.html(registerPage('Senha deve ter pelo menos 6 caracteres'))
    }
    if (password !== passwordConfirm) {
      return c.html(registerPage('As senhas não conferem'))
    }

    // Check existing
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).bind(username, email).first()

    if (existing) {
      return c.html(registerPage('Usuário ou email já cadastrado'))
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const result = await c.env.DB.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).bind(username, email, passwordHash).run()

    const userId = result.meta.last_row_id

    // Create session
    const sessionId = generateSessionId()
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime(\'now\', \'+30 days\'))'
    ).bind(sessionId, userId).run()

    // Create default folder
    await c.env.DB.prepare(
      'INSERT INTO folders (user_id, name, icon) VALUES (?, ?, ?)'
    ).bind(userId, 'Minhas Notas', '📝').run()

    setCookie(c, 'session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 30
    })

    return c.redirect('/app')
  } catch (e: any) {
    return c.html(registerPage('Erro ao criar conta: ' + e.message))
  }
})

// Login POST
app.post('/login', async (c) => {
  try {
    const body = await c.req.parseBody()
    const login = (body.login as string || '').trim()
    const password = body.password as string || ''

    if (!login || !password) {
      return c.html(loginPage('Preencha todos os campos'))
    }

    // Find user by email or username
    const user = await c.env.DB.prepare(
      'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?'
    ).bind(login.toLowerCase(), login).first()

    if (!user) {
      return c.html(loginPage('Usuário ou senha inválidos'))
    }

    const valid = await verifyPassword(password, user.password_hash as string)
    if (!valid) {
      return c.html(loginPage('Usuário ou senha inválidos'))
    }

    // Create session
    const sessionId = generateSessionId()
    await c.env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime(\'now\', \'+30 days\'))'
    ).bind(sessionId, user.id).run()

    // Clean old sessions
    await c.env.DB.prepare(
      'DELETE FROM sessions WHERE user_id = ? AND expires_at < datetime(\'now\')'
    ).bind(user.id).run()

    setCookie(c, 'session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 30
    })

    return c.redirect('/app')
  } catch (e: any) {
    return c.html(loginPage('Erro ao entrar: ' + e.message))
  }
})

// Logout
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
  return c.html(dashboardPage(user.username))
})

// ============================================================
// API ROUTES (protected)
// ============================================================

// --- FOLDERS ---
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
  
  if (!name || !name.trim()) {
    return c.json({ error: 'Nome é obrigatório' }, 400)
  }

  // Verify parent belongs to user
  if (parent_id) {
    const parent = await c.env.DB.prepare(
      'SELECT id FROM folders WHERE id = ? AND user_id = ?'
    ).bind(parent_id, user.id).first()
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

  const folder = await c.env.DB.prepare(
    'SELECT id FROM folders WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first()
  if (!folder) return c.json({ error: 'Pasta não encontrada' }, 404)

  const updates: string[] = []
  const values: any[] = []

  if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()) }
  if (parent_id !== undefined) { updates.push('parent_id = ?'); values.push(parent_id) }
  if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }
  updates.push('updated_at = CURRENT_TIMESTAMP')

  values.push(id, user.id)
  await c.env.DB.prepare(
    `UPDATE folders SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...values).run()

  return c.json({ success: true })
})

app.delete('/api/folders/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))

  // Delete folder, subfolders, and notes (cascading)
  // First get all descendant folder ids
  const allFolderIds = [id]
  async function getDescendants(parentId: number) {
    const { results } = await c.env.DB.prepare(
      'SELECT id FROM folders WHERE parent_id = ? AND user_id = ?'
    ).bind(parentId, user.id).all()
    for (const f of results) {
      allFolderIds.push(f.id as number)
      await getDescendants(f.id as number)
    }
  }
  await getDescendants(id)

  // Delete notes in all these folders
  for (const fid of allFolderIds) {
    await c.env.DB.prepare('DELETE FROM notes WHERE folder_id = ? AND user_id = ?').bind(fid, user.id).run()
  }

  // Delete folders (children first)
  for (const fid of allFolderIds.reverse()) {
    await c.env.DB.prepare('DELETE FROM folders WHERE id = ? AND user_id = ?').bind(fid, user.id).run()
  }

  return c.json({ success: true })
})

// --- NOTES ---
app.get('/api/notes', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const folderId = c.req.query('folder_id')

  let query = 'SELECT id, title, content, folder_id, is_pinned, created_at, updated_at FROM notes WHERE user_id = ?'
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

  const note = await c.env.DB.prepare(
    'SELECT * FROM notes WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first()

  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)
  return c.json({ note })
})

app.post('/api/notes', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const { title, content, folder_id } = await c.req.json()

  // Verify folder belongs to user
  if (folder_id) {
    const folder = await c.env.DB.prepare(
      'SELECT id FROM folders WHERE id = ? AND user_id = ?'
    ).bind(folder_id, user.id).first()
    if (!folder) return c.json({ error: 'Pasta não encontrada' }, 404)
  }

  const result = await c.env.DB.prepare(
    'INSERT INTO notes (user_id, folder_id, title, content) VALUES (?, ?, ?, ?)'
  ).bind(user.id, folder_id || null, title || 'Nova nota', content || '').run()

  const note = await c.env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(result.meta.last_row_id).first()
  return c.json({ note }, 201)
})

app.put('/api/notes/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const note = await c.env.DB.prepare(
    'SELECT id FROM notes WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).first()
  if (!note) return c.json({ error: 'Nota não encontrada' }, 404)

  const updates: string[] = []
  const values: any[] = []

  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title) }
  if (body.content !== undefined) { updates.push('content = ?'); values.push(body.content) }
  if (body.folder_id !== undefined) { updates.push('folder_id = ?'); values.push(body.folder_id) }
  if (body.is_pinned !== undefined) { updates.push('is_pinned = ?'); values.push(body.is_pinned ? 1 : 0) }
  updates.push('updated_at = CURRENT_TIMESTAMP')

  values.push(id, user.id)
  await c.env.DB.prepare(
    `UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  ).bind(...values).run()

  return c.json({ success: true })
})

app.delete('/api/notes/:id', requireAuthAPI(), async (c) => {
  const user = c.get('user')!
  const id = parseInt(c.req.param('id'))

  await c.env.DB.prepare(
    'DELETE FROM notes WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).run()

  return c.json({ success: true })
})

export default app
