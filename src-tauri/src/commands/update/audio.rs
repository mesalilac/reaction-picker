use super::prelude::*;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = audio)]
#[diesel(treat_none_as_null = true)]
struct AudioChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub is_favorite: bool,
    pub use_counter: i32,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAudioRequest {
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
pub async fn update_audio(
    state: AppState<'_>,
    id: AudioId,
    payload: UpdateAudioRequest,
) -> CommandResult<Audio> {
    let mut conn = state.pool.get()?;

    let changeset = AudioChangeset {
        title: normalize_optional_string(payload.title),
        description: normalize_optional_string(payload.description),
        external_link: normalize_optional_string(payload.external_link),
        is_favorite: payload.is_favorite,
        use_counter: payload.use_counter,
    };

    update(audio::table.find(&id))
        .set(&changeset)
        .execute(&mut conn)?;

    if let Some(tags) = payload.tag_ids {
        delete(audio_tags::table.filter(audio_tags::audio_id.eq(&id))).execute(&mut conn)?;

        for tag_id in tags {
            let new_tag_junction = AudioTagEntity::new(id.clone(), tag_id);

            insert_into(audio_tags::table)
                .values(&new_tag_junction)
                .execute(&mut conn)?;
        }
    }

    let entity = audio::table
        .find(&id)
        .get_result::<AudioEntity>(&mut conn)?;

    let tags = AudioTagEntity::belonging_to(&entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let audio = Audio::from_entity(entity, tags);

    Ok(audio)
}

#[tauri::command]
#[specta::specta]
pub async fn update_restore_audio(state: AppState<'_>, id: AudioId) -> CommandResult<Audio> {
    let mut conn = state.pool.get()?;

    update(audio::table.find(&id))
        .set(audio::deleted_at.eq(None::<i64>))
        .execute(&mut conn)?;

    let entity = audio::table
        .find(&id)
        .get_result::<AudioEntity>(&mut conn)?;

    let tags = AudioTagEntity::belonging_to(&entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let audio = Audio::from_entity(entity, tags);

    Ok(audio)
}
