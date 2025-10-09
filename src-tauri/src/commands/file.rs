use crate::models::file::FileEntry;
use crate::utils::path::validate_path;
use std::fs;
use std::path::Path;
use tauri::command;

const MAX_FILE_SIZE: u64 = 10 * 1024 * 1024; // 10MB

#[command]
pub fn get_home_directory() -> Result<String, String> {
    dirs::home_dir()
        .ok_or_else(|| "Could not determine home directory".to_string())
        .and_then(|path| {
            path.to_str()
                .ok_or_else(|| "Invalid home directory path".to_string())
                .map(|s| s.to_string())
        })
}

#[command]
pub fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let validated_path = validate_path(&path)?;
    
    if !validated_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    
    let entries = fs::read_dir(&validated_path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut file_entries = Vec::new();
    
    for entry in entries {
        match entry {
            Ok(dir_entry) => {
                let entry_path = dir_entry.path();
                let name = dir_entry
                    .file_name()
                    .to_string_lossy()
                    .to_string();
                
                let path_str = entry_path
                    .to_str()
                    .unwrap_or(&name)
                    .to_string();
                
                let is_directory = entry_path.is_dir();
                
                let metadata = dir_entry.metadata().ok();
                let size = if is_directory {
                    None
                } else {
                    metadata.as_ref().map(|m| m.len())
                };
                
                let modified = metadata
                    .and_then(|m| m.modified().ok())
                    .and_then(|time| {
                        time.duration_since(std::time::UNIX_EPOCH)
                            .ok()
                            .map(|d| {
                                chrono::DateTime::from_timestamp(d.as_secs() as i64, 0)
                                    .map(|dt| dt.to_rfc3339())
                                    .unwrap_or_default()
                            })
                    });
                
                file_entries.push(FileEntry::new(
                    name,
                    path_str,
                    is_directory,
                    size,
                    modified,
                ));
            }
            Err(_) => continue, // Skip entries we can't read
        }
    }
    
    // Sort: directories first, then by name
    file_entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(file_entries)
}

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    let validated_path = validate_path(&path)?;
    
    if !validated_path.is_file() {
        return Err("Path is not a file".to_string());
    }
    
    // Check file size
    let metadata = fs::metadata(&validated_path)
        .map_err(|e| format!("Failed to read file metadata: {}", e))?;
    
    if metadata.len() > MAX_FILE_SIZE {
        return Err(format!(
            "File too large ({}MB). Maximum size is 10MB",
            metadata.len() / (1024 * 1024)
        ));
    }
    
    // Read file contents
    fs::read_to_string(&validated_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

