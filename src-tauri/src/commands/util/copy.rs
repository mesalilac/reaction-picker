use super::prelude::*;
use tauri_plugin_clipboard_next::ClipboardNextExt;

#[tauri::command]
#[specta::specta]
pub async fn util_copy_image(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: ImageId,
) -> CommandResult<Image> {
    let mut conn = state.pool.get()?;

    {
        let image_entity = images::table
            .find(&id)
            .get_result::<ImageEntity>(&mut conn)?;

        let image = Image::from_entity(image_entity, Vec::new());

        let clipboard = app_handle.clipboard_next();

        clipboard
            .write_image(image.file_path.to_string_lossy().to_string())
            .map_err(|e| CommandError::Clipboard(e.to_string()))?;

        update(images::table.find(&id))
            .set(images::use_counter.eq(image.use_counter + 1))
            .execute(&mut conn)?;

        update(images::table.find(&id))
            .set(images::last_used_at.eq(Timestamp::now()))
            .execute(&mut conn)?;
    }

    let image_entity = images::table
        .find(&id)
        .get_result::<ImageEntity>(&mut conn)?;

    let tags = ImageTagEntity::belonging_to(&image_entity)
        .inner_join(tags::table)
        .select((ImageTagEntity::as_select(), TagEntity::as_select()))
        .load::<(ImageTagEntity, TagEntity)>(&mut conn)?;

    let image = Image::from_entity(image_entity, tags.into_iter().map(|x| x.1).collect());

    Ok(image)
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_video(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: VideoId,
) -> CommandResult<Video> {
    let mut conn = state.pool.get()?;

    {
        let video_entity = videos::table
            .find(&id)
            .get_result::<VideoEntity>(&mut conn)?;

        let video = Video::from_entity(video_entity, Vec::new());

        let clipboard = app_handle.clipboard_next();

        clipboard
            .write_files(vec![video.file_path.to_string_lossy().to_string()])
            .map_err(|e| CommandError::Clipboard(e.to_string()))?;

        update(videos::table.find(&id))
            .set(videos::use_counter.eq(video.use_counter + 1))
            .execute(&mut conn)?;

        update(videos::table.find(&id))
            .set(videos::last_used_at.eq(Timestamp::now()))
            .execute(&mut conn)?;
    }

    let video_entity = videos::table
        .find(&id)
        .get_result::<VideoEntity>(&mut conn)?;

    let tags = VideoTagEntity::belonging_to(&video_entity)
        .inner_join(tags::table)
        .select((VideoTagEntity::as_select(), TagEntity::as_select()))
        .load::<(VideoTagEntity, TagEntity)>(&mut conn)?;

    let video = Video::from_entity(video_entity, tags.into_iter().map(|x| x.1).collect());

    Ok(video)
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_audio(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: AudioId,
) -> CommandResult<Audio> {
    let mut conn = state.pool.get()?;

    {
        let audio_entity = audio::table
            .find(&id)
            .get_result::<AudioEntity>(&mut conn)?;

        let audio: Audio = Audio::from_entity(audio_entity, Vec::new());

        let clipboard = app_handle.clipboard_next();

        clipboard
            .write_files(vec![audio.file_path.to_string_lossy().to_string()])
            .map_err(|e| CommandError::Clipboard(e.to_string()))?;

        update(audio::table.find(&id))
            .set(audio::use_counter.eq(audio.use_counter + 1))
            .execute(&mut conn)?;

        update(audio::table.find(&id))
            .set(audio::last_used_at.eq(Timestamp::now()))
            .execute(&mut conn)?;
    }

    let audio_entity = audio::table
        .find(&id)
        .get_result::<AudioEntity>(&mut conn)?;

    let tags = AudioTagEntity::belonging_to(&audio_entity)
        .inner_join(tags::table)
        .select((AudioTagEntity::as_select(), TagEntity::as_select()))
        .load::<(AudioTagEntity, TagEntity)>(&mut conn)?;

    let audio: Audio = Audio::from_entity(audio_entity, tags.into_iter().map(|x| x.1).collect());

    Ok(audio)
}

#[tauri::command]
#[specta::specta]
pub async fn util_copy_snippet(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: SnippetId,
) -> CommandResult<Snippet> {
    let mut conn = state.pool.get()?;

    {
        let snippet_entity = snippets::table
            .find(&id)
            .get_result::<SnippetEntity>(&mut conn)?;

        let snippet = Snippet::from_entity(snippet_entity, Vec::new());

        let clipboard = app_handle.clipboard_next();

        clipboard
            .write_text(snippet.content)
            .map_err(|e| CommandError::Clipboard(e.to_string()))?;

        update(snippets::table.find(&id))
            .set(snippets::use_counter.eq(snippet.use_counter + 1))
            .execute(&mut conn)?;

        update(snippets::table.find(&id))
            .set(snippets::last_used_at.eq(Timestamp::now()))
            .execute(&mut conn)?;
    }

    let snippet_entity = snippets::table
        .find(&id)
        .get_result::<SnippetEntity>(&mut conn)?;

    let tags = SnippetTagEntity::belonging_to(&snippet_entity)
        .inner_join(tags::table)
        .select((SnippetTagEntity::as_select(), TagEntity::as_select()))
        .load::<(SnippetTagEntity, TagEntity)>(&mut conn)?;

    let snippet = Snippet::from_entity(snippet_entity, tags.into_iter().map(|x| x.1).collect());

    Ok(snippet)
}
