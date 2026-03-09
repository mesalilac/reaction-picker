use crate::APP_NAME;
use std::path::PathBuf;

pub fn get_app_data_dir() -> PathBuf {
    let app_data_dir = directories::BaseDirs::new()
        .expect("Failed to get base dir")
        .data_local_dir()
        .join(APP_NAME);

    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir).expect("Failed to create data dir");
    }

    app_data_dir
}
