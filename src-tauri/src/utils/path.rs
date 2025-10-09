use std::path::{Path, PathBuf};
use std::io;

/// Validates and canonicalizes a path to prevent directory traversal attacks
pub fn validate_path(path: &str) -> Result<PathBuf, String> {
    let path_buf = PathBuf::from(path);
    
    // Canonicalize the path (resolve .. and symlinks)
    match path_buf.canonicalize() {
        Ok(canonical_path) => Ok(canonical_path),
        Err(e) => {
            if e.kind() == io::ErrorKind::NotFound {
                Err("Path does not exist".to_string())
            } else if e.kind() == io::ErrorKind::PermissionDenied {
                Err("Permission denied".to_string())
            } else {
                Err(format!("Invalid path: {}", e))
            }
        }
    }
}

/// Check if a path is a directory
pub fn is_directory(path: &Path) -> bool {
    path.is_dir()
}

/// Get the parent directory of a path
pub fn get_parent(path: &Path) -> Option<PathBuf> {
    path.parent().map(|p| p.to_path_buf())
}

