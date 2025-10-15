use crate::services::index_service::IndexService;
use std::collections::HashSet;
use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

pub struct BackgroundIndexer {
    indexed_dirs: Arc<Mutex<HashSet<String>>>,
}

impl BackgroundIndexer {
    pub fn new() -> Self {
        Self {
            indexed_dirs: Arc::new(Mutex::new(HashSet::new())),
        }
    }

    pub fn start_indexing(&self, app_handle: AppHandle, directory: String, db_path: String) {
        let indexed_dirs = self.indexed_dirs.clone();

        // Check if already indexed
        {
            let dirs = indexed_dirs.lock().unwrap();
            if dirs.contains(&directory) {
                println!("Directory already indexed: {}", directory);
                return;
            }
        }

        // Spawn background thread (non-blocking!)
        thread::spawn(move || {
            println!("Background indexing started for: {}", directory);

            match index_directory_in_thread(&db_path, &directory) {
                Ok(count) => {
                    indexed_dirs.lock().unwrap().insert(directory.clone());
                    println!("✅ Background indexing complete: {} files", count);

                    // Emit event to frontend
                    if let Err(e) = app_handle.emit("indexing-complete", count) {
                        eprintln!("Failed to emit event: {}", e);
                    }
                }
                Err(e) => {
                    eprintln!("Background indexing failed: {}", e);
                    if let Err(e) = app_handle.emit("indexing-error", e.to_string()) {
                        eprintln!("Failed to emit error event: {}", e);
                    }
                }
            }
        });
    }
}

fn index_directory_in_thread(db_path: &str, directory: &str) -> Result<usize, String> {
    let service = IndexService::new(db_path.into());
    let conn = service
        .get_connection()
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let mut indexed_count = 0;
    index_recursive(&conn, Path::new(directory), &mut indexed_count)?;

    Ok(indexed_count)
}

fn index_recursive(
    conn: &rusqlite::Connection,
    dir: &Path,
    count: &mut usize,
) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                // Skip hidden directories
                if let Some(name) = path.file_name() {
                    if name.to_string_lossy().starts_with('.') {
                        continue;
                    }
                }
                index_recursive(conn, &path, count)?;
            } else if let Some(ext) = path.extension() {
                if ext == "md" {
                    if let Err(e) = index_file(conn, &path) {
                        eprintln!("Failed to index {:?}: {}", path, e);
                    } else {
                        *count += 1;
                    }
                }
            }
        }
    }

    Ok(())
}

fn index_file(conn: &rusqlite::Connection, path: &Path) -> Result<(), String> {
    use rusqlite::params;

    let content = fs::read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))?;

    let path_str = path
        .to_str()
        .ok_or_else(|| "Invalid file path".to_string())?;

    let title = extract_title(&content, path);

    let metadata = fs::metadata(path).map_err(|e| format!("Failed to get metadata: {}", e))?;

    let modified = metadata
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    let created = metadata
        .created()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    // Insert or replace file
    conn.execute(
        "INSERT OR REPLACE INTO files (path, title, content, modified, created)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![path_str, title, content, modified, created],
    )
    .map_err(|e| format!("Failed to insert file: {}", e))?;

    // Update FTS index
    conn.execute(
        "DELETE FROM files_fts WHERE rowid IN (SELECT id FROM files WHERE path = ?1)",
        params![path_str],
    )
    .ok();

    conn.execute(
        "INSERT INTO files_fts (rowid, path, title, content)
         SELECT id, path, title, content FROM files WHERE path = ?1",
        params![path_str],
    )
    .map_err(|e| format!("Failed to update FTS index: {}", e))?;

    Ok(())
}

fn extract_title(content: &str, path: &Path) -> Option<String> {
    if content.starts_with("---") {
        if let Some(end) = content[3..].find("---") {
            let frontmatter = &content[3..end + 3];
            for line in frontmatter.lines() {
                if line.trim_start().starts_with("title:") {
                    let title = line.split(':').nth(1)?.trim();
                    return Some(title.trim_matches('"').trim_matches('\'').to_string());
                }
            }
        }
    }

    path.file_stem()
        .and_then(|s| s.to_str())
        .map(|s| s.to_string())
}

