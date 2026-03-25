import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { mkdirSync, existsSync } from 'fs'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle> | null = null

export function useDb() {
  if (_db) return _db

  const config = useRuntimeConfig()
  const dbPath = config.dbPath as string

  // Ensure the directory exists
  const dbDir = dirname(dbPath)
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  const sqlite = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  _db = drizzle(sqlite, { schema })

  // Auto-create tables on first run
  initializeDatabase(sqlite)

  return _db
}

function initializeDatabase(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      birth_date TEXT,
      expected_lifespan INTEGER DEFAULT 80,
      avatar_url TEXT,
      is_setup_complete INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      end_date TEXT,
      category TEXT NOT NULL DEFAULT 'other',
      importance INTEGER DEFAULT 3,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT,
      record_date TEXT NOT NULL,
      mood TEXT,
      weather TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      start_date TEXT,
      status TEXT NOT NULL DEFAULT 'not_started',
      priority TEXT NOT NULL DEFAULT 'medium',
      linked_milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT,
      linked_plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
      linked_milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      color TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS record_tags (
      record_id INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (record_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS milestone_tags (
      milestone_id INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (milestone_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS idea_tags (
      idea_id INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (idea_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS plan_tags (
      plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (plan_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_milestones_user_date ON milestones(user_id, event_date);
    CREATE INDEX IF NOT EXISTS idx_records_user_date ON records(user_id, record_date);
    CREATE INDEX IF NOT EXISTS idx_plans_user_status ON plans(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_ideas_user_created ON ideas(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);
  `)
}
