use super::prelude::*;
use crate::utils::fs::get_app_images_dir;
use diesel::dsl::{exists, select};
use image::{EncodableLayout, ImageReader};
use std::{io::Cursor, path::PathBuf};
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
            let cursor = Cursor::new(file_bytes.as_slice());
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
                    file_path: dest_file_path,
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
                        if std::fs::copy(entry_path, &image_entity.file_path).is_err() {
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
            }

            total_processed_files += 1
        }
    }

    Ok(total_processed_files)
}
