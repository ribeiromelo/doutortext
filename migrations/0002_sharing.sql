-- Migration: Note Sharing & Collaboration
-- Tables: note_shares, note_edit_history

-- Sharing: each share has a unique token for URL access
CREATE TABLE IF NOT EXISTS note_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view', -- 'view' or 'edit'
  shared_with_email TEXT DEFAULT NULL, -- NULL = anyone with link
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Edit history: track who changed what
CREATE TABLE IF NOT EXISTS note_edit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER NOT NULL,
  user_id INTEGER DEFAULT NULL, -- NULL = anonymous viewer (shouldn't edit)
  username TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'edit', -- 'edit', 'create', 'share'
  summary TEXT DEFAULT '', -- brief description of change
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add last_edited_by to notes for quick display
ALTER TABLE notes ADD COLUMN last_edited_by TEXT DEFAULT NULL;
ALTER TABLE notes ADD COLUMN version INTEGER DEFAULT 1;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shares_note ON note_shares(note_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON note_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_shares_owner ON note_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_note ON note_edit_history(note_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_user ON note_edit_history(user_id);
