// Production has a legacy trash column that was absent from the original schema.
// Inspect once per binding; never alter the legacy notes schema as part of this feature.
const liveNotes = new WeakMap<object, Promise<string>>()
export function liveNoteClause(db: D1Database): Promise<string> {
  let result = liveNotes.get(db)
  if (!result) {
    result = db.prepare('PRAGMA table_info(notes)').all<{ name: string }>().then(r => r.results.some(c => c.name === 'deleted_at') ? ' AND n.deleted_at IS NULL' : '')
    liveNotes.set(db, result)
    result.catch(() => liveNotes.delete(db))
  }
  return result
}

