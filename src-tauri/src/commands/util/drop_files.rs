use super::prelude::*;
use crate::{
    events::FileProcessingProgress,
    utils::fs::{get_app_audio_dir, get_app_images_dir, get_app_videos_dir},
};
use image::{EncodableLayout, ImageReader};
use std::{io::Cursor, path::PathBuf};
use symphonia::core::{
    formats::FormatOptions,
    io::MediaSourceStream,
    meta::{MetadataOptions, StandardTagKey},
    probe::Hint,
};
use tauri_specta::Event;
use walkdir::WalkDir;

struct FileQueue {
    path: PathBuf,
    file_type: infer::Type,
    new_file_name: String,
    cursor: Cursor<Vec<u8>>,
    file_size: i64,
    checksum: String,
}

#[tauri::command]
#[specta::specta]
pub async fn util_drop_files(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    paths: Vec<PathBuf>,
) -> CommandResult<i32> {
    let mut conn = state.pool.get()?;
    let mut total_processed_files = 0;
    let mut files = Vec::<FileQueue>::new();

    for path in paths {
        for entry in WalkDir::new(path)
            .into_iter()
            .filter_map(|e| e.ok().filter(|x| x.path().is_file()))
        {
            let entry_path = entry.path();
            let file_bytes = std::fs::read(entry_path)?;
            let cursor = Cursor::new(file_bytes.clone());

            let Some(file_name) = entry_path
                .file_stem()
                .map(|s| s.to_string_lossy().to_string())
            else {
                continue;
            };

            let Some(file_ext) = entry_path
                .extension()
                .map(|s| s.to_string_lossy().to_string())
            else {
                continue;
            };

            let new_file_name = format!("{file_name}__{}.{file_ext}", nanoid!());

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

                files.push(FileQueue {
                    path: entry_path.to_path_buf(),
                    file_type,
                    new_file_name,
                    cursor,
                    file_size,
                    checksum,
                });
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

                files.push(FileQueue {
                    path: entry_path.to_path_buf(),
                    file_type,
                    new_file_name,
                    cursor,
                    file_size,
                    checksum,
                });
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

                files.push(FileQueue {
                    path: entry_path.to_path_buf(),
                    file_type,
                    new_file_name,
                    cursor,
                    file_size,
                    checksum,
                });
            }
        }
    }

    let files_count = files.len() as i32;

    for item in files {
        if item.file_type.matcher_type() == infer::MatcherType::Image {
            let Ok(image_exists) = select(exists(
                images::table.filter(images::checksum.eq(&item.checksum)),
            ))
            .get_result::<bool>(&mut conn) else {
                continue;
            };

            if image_exists {
                continue;
            }

            let Ok(reader) = ImageReader::new(item.cursor).with_guessed_format() else {
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

            let dest_file_path = get_app_images_dir().join(PathBuf::from(&item.new_file_name));

            let mut image_entity = ImageEntity::from_metadata(ImageMetadata {
                file_name: item.new_file_name.clone(),
                mime_type: item.file_type.mime_type().to_string(),
                file_size: item.file_size,
                checksum: item.checksum,
                width: img.width() as i32,
                height: img.height() as i32,
                blur_hash,
            });

            image_entity.title = Some(item.new_file_name);

            match diesel::insert_into(images::table)
                .values(&image_entity)
                .execute(&mut conn)
            {
                Ok(_) => {
                    if std::fs::copy(item.path, &dest_file_path).is_err() {
                        continue;
                    }
                }

                Err(_) => {
                    continue;
                }
            }
        } else if item.file_type.matcher_type() == infer::MatcherType::Video {
            let Ok(video_exists) = select(exists(
                videos::table.filter(videos::checksum.eq(&item.checksum)),
            ))
            .get_result::<bool>(&mut conn) else {
                continue;
            };

            if video_exists {
                continue;
            }

            let mss = MediaSourceStream::new(Box::new(item.cursor), Default::default());
            let hint = Hint::new();
            let format_opts = FormatOptions::default();
            let metadata_opts = MetadataOptions::default();

            let Ok(probed) =
                symphonia::default::get_probe().format(&hint, mss, &format_opts, &metadata_opts)
            else {
                continue;
            };

            let mut format = probed.format;

            let mut title: Option<String> = Some(item.new_file_name.clone());
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

            let dest_file_path = get_app_videos_dir().join(PathBuf::from(&item.new_file_name));

            let mut video_entity = VideoEntity::from_metadata(VideoMetadata {
                file_name: item.new_file_name.clone(),
                mime_type: item.file_type.mime_type().to_string(),
                file_size: item.file_size,
                checksum: item.checksum,
                has_audio,
                duration,
            });

            video_entity.title = title;

            match diesel::insert_into(videos::table)
                .values(&video_entity)
                .execute(&mut conn)
            {
                Ok(_) => {
                    if std::fs::copy(item.path, &dest_file_path).is_err() {
                        continue;
                    }
                }

                Err(_) => {
                    continue;
                }
            }
        } else if item.file_type.matcher_type() == infer::MatcherType::Audio {
            let Ok(audio_exists) = select(exists(
                audio::table.filter(audio::checksum.eq(&item.checksum)),
            ))
            .get_result::<bool>(&mut conn) else {
                continue;
            };

            if audio_exists {
                continue;
            }

            let mss = MediaSourceStream::new(Box::new(item.cursor), Default::default());
            let hint = Hint::new();
            let format_opts = FormatOptions::default();
            let metadata_opts = MetadataOptions::default();

            let Ok(probed) =
                symphonia::default::get_probe().format(&hint, mss, &format_opts, &metadata_opts)
            else {
                continue;
            };

            let mut format = probed.format;

            let mut title: Option<String> = Some(item.new_file_name.clone());
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

            let dest_file_path = get_app_audio_dir().join(PathBuf::from(&item.new_file_name));

            let mut audio_entity = AudioEntity::from_metadata(AudioMetadata {
                file_name: item.new_file_name.clone(),
                mime_type: item.file_type.mime_type().to_string(),
                file_size: item.file_size,
                checksum: item.checksum,
                duration,
            });

            audio_entity.title = title;

            match diesel::insert_into(audio::table)
                .values(&audio_entity)
                .execute(&mut conn)
            {
                Ok(_) => {
                    if std::fs::copy(item.path, &dest_file_path).is_err() {
                        continue;
                    }
                }

                Err(_) => {
                    continue;
                }
            }
        }

        total_processed_files += 1;

        let _ = FileProcessingProgress {
            current: total_processed_files,
            total: files_count,
        }
        .emit(&app_handle);
    }

    Ok(total_processed_files)
}
