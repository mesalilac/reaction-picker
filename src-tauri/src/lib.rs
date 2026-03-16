mod bridge;
mod cli;
mod commands;
mod database;
mod events;
mod schema;
mod services;
mod utils;

use clap::Parser;
use cli::Cli;
use commands::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use events::*;
use specta_typescript::{BigIntExportBehavior, Typescript};
use tauri::Manager;
use tauri_specta::{collect_commands, collect_events, Builder};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");
const APP_NAME: &str = "com.mesalilac.reaction-manager";
const APP_SETTINGS_ID: i32 = 1;

pub type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::SqliteConnection>>;

pub struct AppState {
    pub pool: DbPool,
}

pub fn biome(file: &std::path::Path) -> std::io::Result<()> {
    let biome_bin = if cfg!(windows) {
        "../node_modules/.bin/biome.cmd"
    } else {
        "../node_modules/.bin/biome"
    };

    let process = std::process::Command::new(biome_bin)
        .arg("check")
        .arg("--write")
        .arg(file)
        .output();

    let output = match process {
        Ok(out) => out,
        Err(e) => {
            println!("Error: Failed to run biome: {e}");

            return Err(e);
        }
    };

    if !output.status.success() {
        let error_message = String::from_utf8_lossy(&output.stderr);
        let out_message = String::from_utf8_lossy(&output.stdout);
        println!("--- Biomejs Error ---");
        println!("Status: {}", output.status);
        println!("Stdout: {}", out_message);
        println!("Stderr: {}", error_message);

        return Err(std::io::Error::other(format!(
            "Biomejs failed: {error_message}"
        )));
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cli = Cli::parse();

    let mut env_builder = env_logger::Builder::new();

    env_builder.filter_level(log::LevelFilter::Info);

    if cli.verbose || cfg!(dev) {
        env_builder.filter_level(log::LevelFilter::Trace);
    }

    env_builder.init();

    let pool = database::connection::get_connection_pool();

    if let Ok(mut conn) = pool.get() {
        match conn.run_pending_migrations(MIGRATIONS) {
            Ok(_) => {}
            Err(e) => panic!("Failed to run migrations: {e}"),
        };
    }

    let specta_builder = Builder::<tauri::Wry>::new()
        .commands(collect_commands![
            get_images,
            get_videos,
            get_audio,
            get_snippets,
            get_tags,
            get_settings,
            get_general_stats,
            remove_tag,
            remove_delete_image,
            remove_delete_video,
            remove_delete_audio,
            remove_delete_snippet,
            update_image,
            update_video,
            update_audio,
            update_snippet,
            update_tag,
            update_settings,
            util_drop_files,
            util_copy_image,
            util_copy_video,
            util_copy_audio,
            util_copy_snippet
        ])
        .events(collect_events![FileProcessingProgress]);

    #[cfg(debug_assertions)]
    specta_builder
        .export(
            Typescript::default()
                .bigint(BigIntExportBehavior::Number)
                .header("/** biome-ignore-all lint: Auto generate */\n/** biome-ignore-all assist/source/organizeImports: Auto generate */")
                .formatter(biome),
            "../src/bindings.ts",
        )
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .manage(AppState { pool })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_next::init())
        .invoke_handler(specta_builder.invoke_handler())
        .setup(move |app| {
            specta_builder.mount_events(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
