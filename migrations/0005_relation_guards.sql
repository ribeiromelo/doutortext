-- Repair legacy cross-account references without removing notes or folders.
UPDATE notes SET folder_id = NULL WHERE folder_id IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM folders f WHERE f.id = notes.folder_id AND f.user_id = notes.user_id
);
UPDATE folders SET parent_id = NULL WHERE parent_id IS NOT NULL AND (
  parent_id = id OR NOT EXISTS (SELECT 1 FROM folders p WHERE p.id = folders.parent_id AND p.user_id = folders.user_id)
);

CREATE TRIGGER notes_folder_insert BEFORE INSERT ON notes WHEN NEW.folder_id IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM folders WHERE id = NEW.folder_id AND user_id = NEW.user_id)
    THEN RAISE(ABORT, 'Invalid folder ownership') END;
END;
CREATE TRIGGER notes_folder_update BEFORE UPDATE OF folder_id, user_id ON notes WHEN NEW.folder_id IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM folders WHERE id = NEW.folder_id AND user_id = NEW.user_id)
    THEN RAISE(ABORT, 'Invalid folder ownership') END;
END;
CREATE TRIGGER folders_parent_insert BEFORE INSERT ON folders WHEN NEW.parent_id IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM folders WHERE id = NEW.parent_id AND user_id = NEW.user_id)
    THEN RAISE(ABORT, 'Invalid parent ownership') END;
END;
CREATE TRIGGER folders_parent_update BEFORE UPDATE OF parent_id, user_id ON folders WHEN NEW.parent_id IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM folders WHERE id = NEW.parent_id AND user_id = NEW.user_id)
    THEN RAISE(ABORT, 'Invalid parent ownership') END;
  SELECT CASE WHEN EXISTS (
    WITH RECURSIVE ancestors(id, parent_id) AS (
      SELECT id, parent_id FROM folders WHERE id = NEW.parent_id
      UNION
      SELECT f.id, f.parent_id FROM folders f JOIN ancestors a ON f.id = a.parent_id
    ) SELECT 1 FROM ancestors WHERE id = NEW.id
  ) THEN RAISE(ABORT, 'Circular folder hierarchy') END;
END;
