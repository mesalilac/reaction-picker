use super::prelude::*;

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
