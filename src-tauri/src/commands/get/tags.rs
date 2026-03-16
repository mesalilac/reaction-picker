use super::prelude::*;

#[tauri::command]
#[specta::specta]
pub async fn get_tags(state: AppState<'_>) -> CommandResult<Vec<Tag>> {
    let mut conn = state.pool.get()?;

    let tag_entities = tags::table.load::<TagEntity>(&mut conn)?;

    let data: Vec<Tag> = tag_entities.into_iter().map(Tag::from_entity).collect();

    Ok(data)
}
