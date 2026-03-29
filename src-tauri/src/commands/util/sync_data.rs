use walkdir::WalkDir;

use crate::{
    utils::fs::{get_app_audio_dir, get_app_images_dir, get_app_videos_dir},
    PooledDbConn,
};

use super::prelude::*;

type Result = CommandResult<()>;

fn sync_images(conn: &mut PooledDbConn) -> Result {
    let dir = get_app_images_dir();

    // check for orphaned files
    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok().filter(|x| x.path().is_file()))
    {
        let entry_path = entry.path();
        let file_bytes = std::fs::read(entry_path)?;
        let checksum: String = blake3::hash(&file_bytes).to_string();

        let found_in_db = select(exists(images::table.filter(images::checksum.eq(checksum))))
            .get_result::<bool>(conn)?;

        if !found_in_db {
            log::debug!(
                "Orphaned asset on disk (not in DB): '{}'",
                entry_path.display()
            );

            std::fs::remove_file(entry_path)?;
        }
    }

    // Check for files missing on disk
    let entities = images::table.load::<ImageEntity>(conn)?;
    for entity in entities {
        if !entity.full_path().exists() {
            log::debug!(
                "Missing asset file for DB record: '{}'",
                entity.full_path().display()
            );

            delete(images::table.find(&entity.id)).execute(conn)?;
        }
    }

    Ok(())
}

fn sync_videos(conn: &mut PooledDbConn) -> Result {
    let dir = get_app_videos_dir();

    // check for orphaned files
    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok().filter(|x| x.path().is_file()))
    {
        let entry_path = entry.path();
        let file_bytes = std::fs::read(entry_path)?;
        let checksum: String = blake3::hash(&file_bytes).to_string();

        let found_in_db = select(exists(videos::table.filter(videos::checksum.eq(checksum))))
            .get_result::<bool>(conn)?;

        if !found_in_db {
            log::debug!(
                "Orphaned asset on disk (not in DB): '{}'",
                entry_path.display()
            );

            std::fs::remove_file(entry_path)?;
        }
    }

    // Check for files missing on disk
    let entities = videos::table.load::<VideoEntity>(conn)?;
    for entity in entities {
        if !entity.full_path().exists() {
            log::debug!(
                "Missing asset file for DB record: '{}'",
                entity.full_path().display()
            );

            delete(videos::table.find(&entity.id)).execute(conn)?;
        }
    }

    Ok(())
}

fn sync_audio(conn: &mut PooledDbConn) -> Result {
    let dir = get_app_audio_dir();

    // check for orphaned files
    for entry in WalkDir::new(dir)
        .into_iter()
        .filter_map(|e| e.ok().filter(|x| x.path().is_file()))
    {
        let entry_path = entry.path();
        let file_bytes = std::fs::read(entry_path)?;
        let checksum: String = blake3::hash(&file_bytes).to_string();

        let found_in_db = select(exists(audio::table.filter(audio::checksum.eq(checksum))))
            .get_result::<bool>(conn)?;

        if !found_in_db {
            log::debug!(
                "Orphaned asset on disk (not in DB): '{}'",
                entry_path.display()
            );

            std::fs::remove_file(entry_path)?;
        }
    }

    // Check for files missing on disk
    let entities = audio::table.load::<AudioEntity>(conn)?;
    for entity in entities {
        if !entity.full_path().exists() {
            log::debug!(
                "Missing asset file for DB record: '{}'",
                entity.full_path().display()
            );

            delete(audio::table.find(&entity.id)).execute(conn)?;
        }
    }

    Ok(())
}

#[tauri::command]
#[specta::specta]
pub async fn util_sync_data(state: AppState<'_>) -> Result {
    let mut conn = state.pool.get()?;

    sync_images(&mut conn)?;
    sync_videos(&mut conn)?;
    sync_audio(&mut conn)?;

    std::thread::sleep(std::time::Duration::from_secs(2));

    Ok(())
}
