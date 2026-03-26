use super::prelude::*;

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTagRequest {
    pub name: String,
}

#[tauri::command]
#[specta::specta]
pub async fn create_tag(state: AppState<'_>, payload: CreateTagRequest) -> CommandResult<Tag> {
    let mut conn = state.pool.get()?;

    let new_tag_entity = TagEntity::new(payload.name);

    insert_into(tags::table)
        .values(&new_tag_entity)
        .execute(&mut conn)?;

    let tag_entity = tags::table
        .find(&new_tag_entity.id)
        .get_result::<TagEntity>(&mut conn)?;

    let tag = Tag::from_entity(tag_entity);

    Ok(tag)
}
