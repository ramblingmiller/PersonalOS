use crate::models::search::{ContentMatch, FileMatch};
use crate::services::index_service::IndexService;
use crate::services::background_indexer::BackgroundIndexer;
use rusqlite::{params, Connection};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::OnceLock;
use tauri::{command, AppHandle, Manager};

static BACKGROUND_INDEXER: OnceLock<BackgroundIndexer> = OnceLock::new();

// Get database path in app data directory
fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
        .map(|mut path| {
            path.push("index.db");
            path
        })
}

#[command]
pub fn init_index(app: AppHandle) -> Result<String, String> {
    let db_path = get_db_path(&app)?;
    
    // Create app data directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    let service = IndexService::new(db_path.clone());
    service
        .initialize()
        .map_err(|e| format!("Failed to initialize database: {}", e))?;

    // Initialize background indexer
    BACKGROUND_INDEXER.get_or_init(|| BackgroundIndexer::new());

    db_path
        .to_str()
        .ok_or_else(|| "Invalid database path".to_string())
        .map(|s| s.to_string())
}

#[command]
pub fn notify_directory_opened(app: AppHandle, directory: String) -> Result<(), String> {
    let db_path = get_db_path(&app)?;
    let db_path_str = db_path
        .to_str()
        .ok_or_else(|| "Invalid database path".to_string())?
        .to_string();

    // Get or initialize the background indexer
    let indexer = BACKGROUND_INDEXER.get_or_init(|| BackgroundIndexer::new());

    // Trigger background indexing (returns immediately!)
    indexer.start_indexing(app, directory, db_path_str);

    Ok(())
}

#[command]
pub fn index_directory(app: AppHandle, directory: String) -> Result<usize, String> {
    let db_path = get_db_path(&app)?;
    let service = IndexService::new(db_path);
    let conn = service
        .get_connection()
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let mut indexed_count = 0;
    index_directory_recursive(&conn, Path::new(&directory), &mut indexed_count)?;

    Ok(indexed_count)
}

fn index_directory_recursive(
    conn: &Connection,
    dir: &Path,
    count: &mut usize,
) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        if let Ok(entry) = entry {
            let path = entry.path();

            if path.is_dir() {
                // Recursively index subdirectories
                index_directory_recursive(conn, &path, count)?;
            } else if let Some(ext) = path.extension() {
                // Only index .md files
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

fn index_file(conn: &Connection, path: &Path) -> Result<(), String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let path_str = path
        .to_str()
        .ok_or_else(|| "Invalid file path".to_string())?;

    // Extract title from frontmatter or filename
    let title = extract_title(&content, path);

    let metadata = fs::metadata(path)
        .map_err(|e| format!("Failed to get metadata: {}", e))?;

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

    // Insert or replace file in database
    conn.execute(
        "INSERT OR REPLACE INTO files (path, title, content, modified, created)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![path_str, title, content, modified, created],
    )
    .map_err(|e| format!("Failed to insert file: {}", e))?;

    // Update FTS index
    conn.execute(
        "INSERT INTO files_fts (rowid, path, title, content)
         SELECT id, path, title, content FROM files WHERE path = ?1",
        params![path_str],
    )
    .map_err(|e| format!("Failed to update FTS index: {}", e))?;

    Ok(())
}

fn extract_title(content: &str, path: &Path) -> Option<String> {
    // Try to extract title from YAML frontmatter
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

    // Fallback to filename
    path.file_stem()
        .and_then(|s| s.to_str())
        .map(|s| s.to_string())
}

#[command]
pub fn search_files(app: AppHandle, query: String) -> Result<Vec<FileMatch>, String> {
    let db_path = get_db_path(&app)?;
    let service = IndexService::new(db_path);
    let conn = service
        .get_connection()
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let query_lower = query.to_lowercase();
    
    let mut stmt = conn
        .prepare(
            "SELECT path, title FROM files
             WHERE LOWER(path) LIKE ?1 OR LOWER(title) LIKE ?1
             LIMIT 50",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let pattern = format!("%{}%", query_lower);
    
    let matches = stmt
        .query_map(params![pattern], |row| {
            let path: String = row.get(0)?;
            let title: Option<String> = row.get(1)?;
            
            // Simple scoring: higher if match is earlier in string
            let score = if path.to_lowercase().contains(&query_lower) {
                100.0
            } else {
                50.0
            };

            Ok(FileMatch {
                path,
                title,
                score,
            })
        })
        .map_err(|e| format!("Failed to execute query: {}", e))?;

    let mut results: Vec<FileMatch> = matches
        .filter_map(|m| m.ok())
        .collect();

    // Sort by score (descending)
    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());

    Ok(results)
}

#[command]
pub fn search_content(app: AppHandle, query: String) -> Result<Vec<ContentMatch>, String> {
    let db_path = get_db_path(&app)?;
    let service = IndexService::new(db_path);
    let conn = service
        .get_connection()
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT f.path, f.title, snippet(files_fts, 2, '<mark>', '</mark>', '...', 32) as snippet
             FROM files_fts
             JOIN files f ON files_fts.rowid = f.id
             WHERE files_fts MATCH ?1
             LIMIT 50",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let matches = stmt
        .query_map(params![query], |row| {
            let path: String = row.get(0)?;
            let title: Option<String> = row.get(1)?;
            let snippet: String = row.get(2)?;

            Ok(ContentMatch {
                path,
                title,
                snippet,
                matches: 1,
            })
        })
        .map_err(|e| format!("Failed to execute query: {}", e))?;

    let results: Vec<ContentMatch> = matches.filter_map(|m| m.ok()).collect();

    Ok(results)
}

#[command]
pub fn resolve_wikilink(app: AppHandle, link: String, _current_dir: String) -> Result<Option<String>, String> {
    let db_path = get_db_path(&app)?;
    let service = IndexService::new(db_path);
    let conn = service
        .get_connection()
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // Extract target from link (handle [[Target]] or [[Target|Alias]])
    let target = link.split('|').next().unwrap_or(&link).trim();

    // Try exact title match first
    let mut stmt = conn
        .prepare("SELECT path FROM files WHERE title = ?1 LIMIT 1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let result: Result<Option<String>, _> = stmt.query_row(params![target], |row| row.get(0));

    if let Ok(Some(path)) = result {
        return Ok(Some(path));
    }

    // Try fuzzy match on path
    let mut stmt = conn
        .prepare("SELECT path FROM files WHERE path LIKE ?1 LIMIT 1")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let pattern = format!("%{}%", target);
    let result: Result<Option<String>, _> = stmt.query_row(params![pattern], |row| row.get(0));

    match result {
        Ok(Some(path)) => Ok(Some(path)),
        _ => Ok(None),
    }
}

