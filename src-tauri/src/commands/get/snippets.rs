use super::prelude::*;

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
