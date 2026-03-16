use super::prelude::*;

#[tauri::command]
#[specta::specta]
pub async fn remove_tag(state: AppState<'_>, id: String) -> CommandResult<Tag> {
    let mut conn = state.pool.get()?;

    let entity = tags::table.find(&id).get_result::<TagEntity>(&mut conn)?;

    let tag = Tag::from_entity(entity);

    delete(snippets::table.find(&id)).execute(&mut conn)?;

    Ok(tag)
}
