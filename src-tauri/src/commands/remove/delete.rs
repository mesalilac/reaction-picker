use super::prelude::*;

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteRequest {
    #[specta(optional)]
    #[serde(default)]
    pub permanent: Option<bool>,
}

#[tauri::command]
#[specta::specta]
pub async fn remove_delete_image(
    state: AppState<'_>,
    id: ImageId,
    payload: DeleteRequest,
) -> CommandResult<Image> {
    let mut conn = state.pool.get()?;

    update(images::table.find(&id))
        .set(images::deleted_at.eq(Timestamp::now()))
        .execute(&mut conn)?;

    let entity = images::table
        .find(&id)
        .get_result::<ImageEntity>(&mut conn)?;

    let image = Image::from_entity(entity, Vec::new());

    if let Some(permanent) = payload.permanent {
        if permanent {
            delete(images::table.find(&id)).execute(&mut conn)?;

            std::fs::remove_file(&image.file_path)?;
        }
    }

    Ok(image)
}

#[tauri::command]
#[specta::specta]
pub async fn remove_delete_video(
    state: AppState<'_>,
    id: VideoId,
    payload: DeleteRequest,
) -> CommandResult<Video> {
    let mut conn = state.pool.get()?;

    update(videos::table.find(&id))
        .set(videos::deleted_at.eq(Timestamp::now()))
        .execute(&mut conn)?;

    let entity = videos::table
        .find(&id)
        .get_result::<VideoEntity>(&mut conn)?;

    let video = Video::from_entity(entity, Vec::new());

    if let Some(permanent) = payload.permanent {
        if permanent {
            delete(videos::table.find(&id)).execute(&mut conn)?;

            std::fs::remove_file(&video.file_path)?;
        }
    }

    Ok(video)
}

#[tauri::command]
#[specta::specta]
pub async fn remove_delete_audio(
    state: AppState<'_>,
    id: AudioId,
    payload: DeleteRequest,
) -> CommandResult<Audio> {
    let mut conn = state.pool.get()?;

    update(audio::table.find(&id))
        .set(audio::deleted_at.eq(Timestamp::now()))
        .execute(&mut conn)?;

    let entity = audio::table
        .find(&id)
        .get_result::<AudioEntity>(&mut conn)?;

    let audio = Audio::from_entity(entity, Vec::new());

    if let Some(permanent) = payload.permanent {
        if permanent {
            delete(audio::table.find(&id)).execute(&mut conn)?;

            std::fs::remove_file(&audio.file_path)?;
        }
    }

    Ok(audio)
}

#[tauri::command]
#[specta::specta]
pub async fn remove_delete_snippet(
    state: AppState<'_>,
    id: SnippetId,
    payload: DeleteRequest,
) -> CommandResult<Snippet> {
    let mut conn = state.pool.get()?;

    update(snippets::table.find(&id))
        .set(snippets::deleted_at.eq(Timestamp::now()))
        .execute(&mut conn)?;

    let entity = snippets::table
        .find(&id)
        .get_result::<SnippetEntity>(&mut conn)?;

    let snippet = Snippet::from_entity(entity, Vec::new());

    if let Some(permanent) = payload.permanent {
        if permanent {
            delete(snippets::table.find(&id)).execute(&mut conn)?;
        }
    }

    Ok(snippet)
}
