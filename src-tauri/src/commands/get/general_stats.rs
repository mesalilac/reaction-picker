use super::prelude::*;

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
