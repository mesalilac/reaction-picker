use super::prelude::*;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = videos)]
struct VideoChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub is_favorite: Option<bool>,
}

impl VideoChangeset {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.description.is_none()
            && self.external_link.is_none()
            && self.is_favorite.is_none()
    }
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateVideoRequest {
    #[specta(optional)]
    #[serde(default)]
    pub title: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub description: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub external_link: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub is_favorite: Option<bool>,
    #[specta(optional)]
    #[serde(default)]
    pub tag_ids: Option<Vec<String>>,
}

#[tauri::command]
#[specta::specta]
pub async fn update_video(
    state: AppState<'_>,
    id: String,
    payload: UpdateVideoRequest,
) -> CommandResult<Video> {
    let mut conn = state.pool.get()?;

    let changeset = VideoChangeset {
        title: normalize_optional_string(payload.title),
        description: normalize_optional_string(payload.description),
        external_link: normalize_optional_string(payload.external_link),
        is_favorite: payload.is_favorite,
    };

    if !changeset.is_empty() {
        update(videos::table.find(&id))
            .set(&changeset)
            .execute(&mut conn)?;
    }

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
