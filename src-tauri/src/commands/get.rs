use super::prelude::*;
use crate::APP_SETTINGS_ID;

#[tauri::command]
#[specta::specta]
pub async fn get_images(state: AppState<'_>) -> CommandResult<Vec<Image>> {
    let mut conn = state.pool.get()?;

    let image_entities = images::table
        .filter(images::deleted_at.is_null())
        .load::<ImageEntity>(&mut conn)?;

    let tag_entities = ImageTagEntity::belonging_to(&image_entities)
        .inner_join(tags::table)
        .select((ImageTagEntity::as_select(), TagEntity::as_select()))
        .load::<(ImageTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<Image> = tag_entities
        .grouped_by(&image_entities)
        .into_iter()
        .zip(image_entities)
        .map(|(tags_list, image)| {
            Image::from_entity(image, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}

#[tauri::command]
#[specta::specta]
pub async fn get_videos(state: AppState<'_>) -> CommandResult<Vec<Video>> {
    let mut conn = state.pool.get()?;

    let video_entities = videos::table
        .filter(videos::deleted_at.is_null())
        .load::<VideoEntity>(&mut conn)?;

    let tag_entities = VideoTagEntity::belonging_to(&video_entities)
        .inner_join(tags::table)
        .select((VideoTagEntity::as_select(), TagEntity::as_select()))
        .load::<(VideoTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<Video> = tag_entities
        .grouped_by(&video_entities)
        .into_iter()
        .zip(video_entities)
        .map(|(tags_list, video)| {
            Video::from_entity(video, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}

#[tauri::command]
#[specta::specta]
pub async fn get_audio(state: AppState<'_>) -> CommandResult<Vec<Audio>> {
    let mut conn = state.pool.get()?;

    let audio_entities = audio::table
        .filter(audio::deleted_at.is_null())
        .load::<AudioEntity>(&mut conn)?;

    let tag_entities = AudioTagEntity::belonging_to(&audio_entities)
        .inner_join(tags::table)
        .select((AudioTagEntity::as_select(), TagEntity::as_select()))
        .load::<(AudioTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<Audio> = tag_entities
        .grouped_by(&audio_entities)
        .into_iter()
        .zip(audio_entities)
        .map(|(tags_list, audio)| {
            Audio::from_entity(audio, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}

#[tauri::command]
#[specta::specta]
pub async fn get_snippets(state: AppState<'_>) -> CommandResult<Vec<Snippet>> {
    let mut conn = state.pool.get()?;

    let snippet_entities = snippets::table
        .filter(snippets::deleted_at.is_null())
        .load::<SnippetEntity>(&mut conn)?;

    let tag_entities = SnippetTagEntity::belonging_to(&snippet_entities)
        .inner_join(tags::table)
        .select((SnippetTagEntity::as_select(), TagEntity::as_select()))
        .load::<(SnippetTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<Snippet> = tag_entities
        .grouped_by(&snippet_entities)
        .into_iter()
        .zip(snippet_entities)
        .map(|(tags_list, snippet)| {
            Snippet::from_entity(snippet, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}

#[tauri::command]
#[specta::specta]
pub async fn get_settings(state: AppState<'_>) -> CommandResult<Setting> {
    let mut conn = state.pool.get()?;

    let setting_entity = settings::table
        .find(APP_SETTINGS_ID)
        .get_result::<SettingEntity>(&mut conn)?;

    let settings = Setting::from_entity(setting_entity);

    Ok(settings)
}

#[tauri::command]
#[specta::specta]
pub async fn get_general_stats(state: AppState<'_>) -> CommandResult<GeneralStats> {
    let mut conn = state.pool.get()?;

    let image_count = images::table
        .filter(images::deleted_at.is_null())
        .count()
        .get_result::<i64>(&mut conn)?;
    let video_count = videos::table
        .filter(videos::deleted_at.is_null())
        .count()
        .get_result::<i64>(&mut conn)?;
    let audio_count = audio::table
        .filter(audio::deleted_at.is_null())
        .count()
        .get_result::<i64>(&mut conn)?;
    let snippet_count = snippets::table
        .filter(snippets::deleted_at.is_null())
        .count()
        .get_result::<i64>(&mut conn)?;

    let tag_count = tags::table.count().get_result::<i64>(&mut conn)?;

    let data = GeneralStats {
        image_count,
        video_count,
        audio_count,
        snippet_count,
        tag_count,
    };

    Ok(data)
}
