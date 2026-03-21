use super::prelude::*;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = videos)]
#[diesel(treat_none_as_null = true)]
struct VideoChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub is_favorite: bool,
    pub use_counter: i32,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateVideoRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub is_favorite: bool,
    pub use_counter: i32,
    #[specta(optional)]
    #[serde(default)]
    pub tag_ids: Option<Vec<TagId>>,
}

#[tauri::command]
#[specta::specta]
pub async fn update_video(
    state: AppState<'_>,
    id: VideoId,
    payload: UpdateVideoRequest,
) -> CommandResult<Video> {
    let mut conn = state.pool.get()?;

    let changeset = VideoChangeset {
        title: normalize_optional_string(payload.title),
        description: normalize_optional_string(payload.description),
        external_link: normalize_optional_string(payload.external_link),
        is_favorite: payload.is_favorite,
        use_counter: payload.use_counter,
    };

    update(videos::table.find(&id))
        .set(&changeset)
        .execute(&mut conn)?;

    if let Some(tags) = payload.tag_ids {
        delete(videos_tags::table.filter(videos_tags::video_id.eq(&id))).execute(&mut conn)?;

        for tag_id in tags {
            let new_tag_junction = VideoTagEntity::new(id.clone(), tag_id);

            insert_into(videos_tags::table)
                .values(&new_tag_junction)
                .execute(&mut conn)?;
        }
    }

    let video_entity = videos::table
        .find(&id)
        .get_result::<VideoEntity>(&mut conn)?;

    let tags = VideoTagEntity::belonging_to(&video_entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let video = Video::from_entity(video_entity, tags);

    Ok(video)
}

#[tauri::command]
#[specta::specta]
pub async fn update_restore_video(state: AppState<'_>, id: VideoId) -> CommandResult<Video> {
    let mut conn = state.pool.get()?;

    update(videos::table.find(&id))
        .set(videos::deleted_at.eq(None::<i64>))
        .execute(&mut conn)?;

    let entity = videos::table
        .find(&id)
        .get_result::<VideoEntity>(&mut conn)?;

    let tags = VideoTagEntity::belonging_to(&entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let video = Video::from_entity(entity, tags);

    Ok(video)
}
