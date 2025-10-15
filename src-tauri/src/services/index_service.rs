use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub struct IndexService {
    db_path: PathBuf,
}

impl IndexService {
    pub fn new(db_path: PathBuf) -> Self {
        Self { db_path }
    }

    pub fn initialize(&self) -> Result<()> {
        let conn = Connection::open(&self.db_path)?;

        // Enable WAL mode for better concurrency (use pragma for setting)
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;

        // Create files table
        conn.execute(
            "CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                path TEXT UNIQUE NOT NULL,
                title TEXT,
                content TEXT,
                modified INTEGER,
                created INTEGER
            )",
            [],
        )?;

        // Create FTS5 virtual table for full-text search
        conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
                path, title, content,
                content='files',
                content_rowid='id'
            )",
            [],
        )?;

        Ok(())
    }

    pub fn get_connection(&self) -> Result<Connection> {
        let conn = Connection::open(&self.db_path)?;
        // WAL mode is already set at database level, no need to set per connection
        Ok(conn)
    }
}

