-- Dashboard communications and per-user, idempotent note-opening events.
CREATE TABLE dashboard_slide_images (
  id TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
  data BLOB NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dashboard_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_key TEXT UNIQUE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 400),
  image_path TEXT NOT NULL,
  image_alt TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '',
  link_label TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0,1)),
  starts_at TEXT,
  ends_at TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)
);
CREATE INDEX idx_dashboard_slides_publication ON dashboard_slides(is_active, display_order, id);

CREATE TABLE note_accesses (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  access_count INTEGER NOT NULL DEFAULT 1 CHECK (access_count > 0),
  last_accessed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, note_id)
);
CREATE INDEX idx_note_accesses_ranking ON note_accesses(user_id, access_count DESC, last_accessed_at DESC, note_id DESC);

CREATE TABLE note_access_events (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_id, event_id)
);
CREATE TRIGGER note_access_event_owner BEFORE INSERT ON note_access_events
WHEN NOT EXISTS (SELECT 1 FROM notes WHERE id = NEW.note_id AND user_id = NEW.user_id)
BEGIN SELECT RAISE(ABORT, 'note access owner mismatch'); END;
CREATE TRIGGER note_access_event_increment AFTER INSERT ON note_access_events
BEGIN
  INSERT INTO note_accesses(user_id,note_id,access_count,last_accessed_at)
  VALUES (NEW.user_id,NEW.note_id,1,NEW.created_at)
  ON CONFLICT(user_id,note_id) DO UPDATE SET
    access_count = access_count + 1, last_accessed_at = excluded.last_accessed_at;
END;

-- Idempotent seed: rerunning these statements never overwrites an administrator's edits.
INSERT OR IGNORE INTO dashboard_slides(seed_key,title,description,image_path,image_alt,display_order,is_active)
VALUES ('institutional-productivity','Mais produtividade na sua rotina médica','Padronize evoluções, prescrições e condutas com o DoutorText.','/static/dashboard/workspace.jpg','Notebook e estetoscópio em uma mesa de trabalho.',0,1),
('institutional-organization','Tudo o que você precisa, em um só lugar','Organize suas anotações, modelos clínicos e referências para facilitar o atendimento.','/static/dashboard/organization.jpg','Caderno aberto e materiais de organização sobre a mesa.',1,1),
('institutional-care','Menos tempo digitando. Mais tempo cuidando.','Acesse suas anotações e ferramentas médicas de maneira rápida e intuitiva.','/static/dashboard/clinical-desk.jpg','Profissional de saúde trabalhando em um notebook.',2,1);
