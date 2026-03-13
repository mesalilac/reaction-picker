use crate::APP_NAME;
use std::path::{absolute, PathBuf};

/// Returns the app data directory.
///
/// This is where the database and media are stored
pub fn get_app_data_dir() -> PathBuf {
    let app_data_dir = if cfg!(dev) {
        let dir = "../dev-data";

        absolute(PathBuf::from(dir)).unwrap_or(PathBuf::from(dir))
    } else {
        directories::BaseDirs::new()
            .expect("Failed to get base dir")
            .data_local_dir()
            .join(APP_NAME)
            .join("data")
    };

    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir).expect("Failed to create data dir");
    }

    app_data_dir
}

/// Returns the media directory.
pub fn get_app_media_dir() -> PathBuf {
    let app_media_dir = get_app_data_dir().join("media");

    if !app_media_dir.exists() {
        std::fs::create_dir_all(&app_media_dir).expect("Failed to create media dir");
    }

    app_media_dir
}

/// Returns the images directory.
///
/// Place to store images
pub fn get_app_images_dir() -> PathBuf {
    let app_images_dir = get_app_media_dir().join("images");

    if !app_images_dir.exists() {
        std::fs::create_dir_all(&app_images_dir).expect("Failed to create images dir");
    }

    app_images_dir
}

/// Returns the videos directory.
///
/// Place to store videos
pub fn get_app_videos_dir() -> PathBuf {
    let app_videos_dir = get_app_media_dir().join("videos");

    if !app_videos_dir.exists() {
        std::fs::create_dir_all(&app_videos_dir).expect("Failed to create videos dir");
    }

    app_videos_dir
}

/// Returns the audio directory.
///
/// Place to store audio
pub fn get_app_audio_dir() -> PathBuf {
    let app_audio_dir = get_app_media_dir().join("audio");

    if !app_audio_dir.exists() {
        std::fs::create_dir_all(&app_audio_dir).expect("Failed to create audio dir");
    }

    app_audio_dir
}
