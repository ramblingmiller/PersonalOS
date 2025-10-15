use crate::services::index_service::IndexService;
use std::collections::HashSet;
use std::fs;
use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, Emitter};

const MAX_CONCURRENT_INDEXING: usize = 2;

pub struct BackgroundIndexer {
    indexed_dirs: Arc<Mutex<HashSet<String>>>,
    active_threads: Arc<AtomicUsize>,
}

impl BackgroundIndexer {
    pub fn new() -> Self {
        Self {
            indexed_dirs: Arc::new(Mutex::new(HashSet::new())),
            active_threads: Arc::new(AtomicUsize::new(0)),
        }
    }

    pub fn start_indexing(&self, app_handle: AppHandle, directory: String, db_path: String) {
        let indexed_dirs = self.indexed_dirs.clone();
        let active_threads = self.active_threads.clone();

        // Check if already indexed
        {
            let dirs = indexed_dirs.lock().unwrap();
            if dirs.contains(&directory) {
                println!("Directory already indexed: {}", directory);
                return;
            }
        }

        // Check if we've hit the thread limit
        let current_threads = active_threads.load(Ordering::SeqCst);
        if current_threads >= MAX_CONCURRENT_INDEXING {
            println!(
                "Indexing deferred for {} (max {} concurrent operations reached)",
                directory, MAX_CONCURRENT_INDEXING
            );
            // In production, this could be queued instead of silently dropped
            return;
        }

        // Increment active thread counter
        active_threads.fetch_add(1, Ordering::SeqCst);

        // Spawn background thread with resource limiting
        thread::spawn(move || {
            println!("Background indexing started for: {} [{} active]", 
                directory, active_threads.load(Ordering::SeqCst));

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
            
            // Decrement active thread counter when done
            active_threads.fetch_sub(1, Ordering::SeqCst);
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

    // Use transaction for atomicity of file + FTS index update
    let tx = conn
        .unchecked_transaction()
        .map_err(|e| format!("Failed to start transaction: {}", e))?;

    // Insert or replace file
    tx.execute(
        "INSERT OR REPLACE INTO files (path, title, content, modified, created)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![path_str, title, content, modified, created],
    )
    .map_err(|e| format!("Failed to insert file: {}", e))?;

    // Update FTS index - log errors instead of silently discarding
    if let Err(e) = tx.execute(
        "DELETE FROM files_fts WHERE rowid IN (SELECT id FROM files WHERE path = ?1)",
        params![path_str],
    ) {
        eprintln!("FTS deletion warning for {}: {}", path_str, e);
        // Continue anyway - INSERT below will handle it
    }

    tx.execute(
        "INSERT INTO files_fts (rowid, path, title, content)
         SELECT id, path, title, content FROM files WHERE path = ?1",
        params![path_str],
    )
    .map_err(|e| format!("Failed to update FTS index: {}", e))?;

    // Commit transaction (ensures atomicity)
    tx.commit()
        .map_err(|e| format!("Failed to commit transaction: {}", e))?;

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

