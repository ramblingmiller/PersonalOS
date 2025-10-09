use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub modified: Option<String>,
}

impl FileEntry {
    pub fn new(
        name: String,
        path: String,
        is_directory: bool,
        size: Option<u64>,
        modified: Option<String>,
    ) -> Self {
        Self {
            name,
            path,
            is_directory,
            size,
            modified,
        }
    }
}

