mod commands;
mod models;
mod utils;

use commands::file::{get_home_directory, read_directory, read_file, write_file};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_home_directory,
            read_directory,
            read_file,
            write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
