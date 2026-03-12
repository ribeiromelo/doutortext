-- Migration: Admin system
-- Add is_admin flag to users table

ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

-- Create index for admin lookup
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);

-- Promote the first user (by lowest id) to admin automatically
UPDATE users SET is_admin = 1 WHERE id = (SELECT MIN(id) FROM users);
