use super::prelude::*;
use crate::utils::fs::{get_app_audio_dir, get_app_images_dir, get_app_videos_dir};
use diesel::dsl::{exists, select};
use image::{EncodableLayout, ImageReader};
use std::{io::Cursor, path::PathBuf};
use symphonia::core::{
    formats::FormatOptions,
    io::MediaSourceStream,
    meta::{MetadataOptions, StandardTagKey},
    probe::Hint,
};
use tauri_plugin_clipboard_next::ClipboardNextExt;
use walkdir::WalkDir;

#[tauri::command]
#[specta::specta]
pub async fn util_drop_files(state: AppState<'_>, paths: Vec<PathBuf>) -> CommandResult<i32> {
    let mut conn = state.pool.get()?;
    let mut total_processed_files = 0;

    for path in paths {
        for entry in WalkDir::new(path)
            .into_iter()
            .filter_map(|e| e.ok().filter(|x| x.path().is_file()))
        {
            let entry_path = entry.path();
            let file_bytes = std::fs::read(entry_path)?;
            let cursor = Cursor::new(file_bytes.clone());
            let Some(file_name) = entry_path
                .file_name()
                .map(|s| s.to_string_lossy().to_string())
            else {
                continue;
            };

            let Some(file_type) = infer::get(&file_bytes) else {
                continue;
            };

            let file_size = file_bytes.len() as i64;
            let checksum: String = blake3::hash(&file_bytes).to_string();

            if file_type.matcher_type() == infer::MatcherType::Image {
                let Ok(image_exists) =
                    select(exists(images::table.filter(images::checksum.eq(&checksum))))
                        .get_result::<bool>(&mut conn)
                else {
                    continue;
                };

                if image_exists {
                    continue;
                }

                let Ok(reader) = ImageReader::new(cursor).with_guessed_format() else {
                    continue;
                };
                let Ok(img) = reader.decode() else {
                    continue;
                };

                let Ok(blur_hash) =
                    blurhash::encode(4, 3, img.width(), img.height(), img.to_rgba8().as_bytes())
                else {
                    continue;
                };

                let dest_file_path = get_app_images_dir().join(PathBuf::from(&file_name));

                let mut image_entity = ImageEntity::from_metadata(ImageMetadata {
                    file_name: file_name.clone(),
                    mime_type: file_type.mime_type().to_string(),
                    file_size,
                    checksum,
                    width: img.width() as i32,
                    height: img.height() as i32,
                    blur_hash,
                });

                image_entity.title = Some(file_name);

                match diesel::insert_into(images::table)
                    .values(&image_entity)
                    .execute(&mut conn)
                {
                    Ok(_) => {
                        if std::fs::copy(entry_path, &dest_file_path).is_err() {
                            continue;
                        }
                    }

                    Err(_) => {
                        continue;
                    }
                }
            } else if file_type.matcher_type() == infer::MatcherType::Video {
                let Ok(video_exists) =
                    select(exists(videos::table.filter(videos::checksum.eq(&checksum))))
                        .get_result::<bool>(&mut conn)
                else {
                    continue;
                };

                if video_exists {
                    continue;
                }

                let mss = MediaSourceStream::new(Box::new(cursor), Default::default());
                let hint = Hint::new();
                let format_opts = FormatOptions::default();
                let metadata_opts = MetadataOptions::default();

                let Ok(probed) = symphonia::default::get_probe().format(
                    &hint,
                    mss,
                    &format_opts,
                    &metadata_opts,
                ) else {
                    continue;
                };

                let mut format = probed.format;

                let mut title: Option<String> = Some(file_name.clone());
                let mut has_audio: bool = false;
                let mut duration = 0;

                if let Some(metadata) = format.metadata().current() {
                    for tag in metadata.tags() {
                        if let Some(StandardTagKey::TrackTitle) = tag.std_key {
                            title = Some(tag.value.to_string());
                            break;
                        }
                    }
                };

                for track in format.tracks() {
                    let params = &track.codec_params;

                    if params.sample_rate.is_some() {
                        has_audio = true;
                    }

                    if let (Some(n_frames), Some(tb)) = (params.n_frames, params.time_base) {
                        let total_seconds = n_frames as f64 * (tb.numer as f64 / tb.denom as f64);

                        if total_seconds as i32 > duration {
                            duration = total_seconds as i32;
                        }
                    }
                }

                let dest_file_path = get_app_videos_dir().join(PathBuf::from(&file_name));

                let mut video_entity = VideoEntity::from_metadata(VideoMetadata {
                    file_name: file_name.clone(),
                    mime_type: file_type.mime_type().to_string(),
                    file_size,
                    checksum,
                    has_audio,
                    duration,
                });

                video_entity.title = title;

                match diesel::insert_into(videos::table)
                    .values(&video_entity)
                    .execute(&mut conn)
                {
                    Ok(_) => {
                        if std::fs::copy(entry_path, &dest_file_path).is_err() {
                            continue;
                        }
                    }

                    Err(_) => {
                        continue;
                    }
                }
            } else if file_type.matcher_type() == infer::MatcherType::Audio {
                let Ok(audio_exists) =
                    select(exists(audio::table.filter(audio::checksum.eq(&checksum))))
                        .get_result::<bool>(&mut conn)
                else {
                    continue;
                };

                if audio_exists {
                    continue;
                }

                let mss = MediaSourceStream::new(Box::new(cursor), Default::default());
                let hint = Hint::new();
                let format_opts = FormatOptions::default();
                let metadata_opts = MetadataOptions::default();

                let Ok(probed) = symphonia::default::get_probe().format(
                    &hint,
                    mss,
                    &format_opts,
                    &metadata_opts,
                ) else {
                    continue;
                };

                let mut format = probed.format;

                let mut title: Option<String> = Some(file_name.clone());
                let mut duration = 0;

                if let Some(metadata) = format.metadata().current() {
                    for tag in metadata.tags() {
                        if let Some(StandardTagKey::TrackTitle) = tag.std_key {
                            title = Some(tag.value.to_string());
                            break;
                        }
                    }
                };

                for track in format.tracks() {
                    let params = &track.codec_params;

                    if let (Some(n_frames), Some(tb)) = (params.n_frames, params.time_base) {
                        let total_seconds = n_frames as f64 * (tb.numer as f64 / tb.denom as f64);

                        if total_seconds as i32 > duration {
                            duration = total_seconds as i32;
                        }
                    }
                }

                let dest_file_path = get_app_audio_dir().join(PathBuf::from(&file_name));

                let mut audio_entity = AudioEntity::from_metadata(AudioMetadata {
                    file_name: file_name.clone(),
                    mime_type: file_type.mime_type().to_string(),
                    file_size,
                    checksum,
                    duration,
                });

                audio_entity.title = title;

                match diesel::insert_into(audio::table)
                    .values(&audio_entity)
                    .execute(&mut conn)
                {
                    Ok(_) => {
                        if std::fs::copy(entry_path, &dest_file_path).is_err() {
                            continue;
                        }
                    }

                    Err(_) => {
                        continue;
                    }
                }
            }

            total_processed_files += 1
        }
    }

    Ok(total_processed_files)
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_image(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: String,
) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    let image_entity = images::table
        .find(id)
        .get_result::<ImageEntity>(&mut conn)?;

    let image = Image::from_entity(image_entity, Vec::new());

    let clipboard = app_handle.clipboard_next();

    clipboard
        .write_image(image.file_path.to_string_lossy().to_string())
        .map_err(|e| CommandError::Clipboard(e.to_string()))?;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_video(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: String,
) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    let video_entity = videos::table
        .find(id)
        .get_result::<VideoEntity>(&mut conn)?;

    let video = Video::from_entity(video_entity, Vec::new());

    let clipboard = app_handle.clipboard_next();

    clipboard
        .write_files(vec![video.file_path.to_string_lossy().to_string()])
        .map_err(|e| CommandError::Clipboard(e.to_string()))?;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_audio(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: String,
) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    let audio_entity = audio::table.find(id).get_result::<AudioEntity>(&mut conn)?;

    let audio = Audio::from_entity(audio_entity, Vec::new());

    let clipboard = app_handle.clipboard_next();

    clipboard
        .write_files(vec![audio.file_path.to_string_lossy().to_string()])
        .map_err(|e| CommandError::Clipboard(e.to_string()))?;

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_snippet(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: String,
) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    let snippet_entity = snippets::table
        .find(id)
        .get_result::<SnippetEntity>(&mut conn)?;

    let snippet = Snippet::from_entity(snippet_entity, Vec::new());

    let clipboard = app_handle.clipboard_next();

    clipboard
        .write_text(snippet.content)
        .map_err(|e| CommandError::Clipboard(e.to_string()))?;

    Ok(())
}
