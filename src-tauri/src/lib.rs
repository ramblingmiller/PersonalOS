mod commands;
mod models;
mod services;
mod utils;

use commands::file::{get_home_directory, read_directory, read_file, write_file, create_file, create_directory};
use commands::search::{init_index, notify_directory_opened, search_files, search_content, resolve_wikilink};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_home_directory,
            read_directory,
            read_file,
            write_file,
            create_file,
            create_directory,
            init_index,
            notify_directory_opened,
            search_files,
            search_content,
            resolve_wikilink
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
