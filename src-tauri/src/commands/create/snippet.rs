use super::prelude::*;

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSnippetRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub content: String,
    pub external_link: Option<String>,
    pub tag_ids: Vec<TagId>,
}

#[tauri::command]
#[specta::specta]
pub async fn create_snippet(
    state: AppState<'_>,
    payload: CreateSnippetRequest,
) -> CommandResult<Snippet> {
    let mut conn = state.pool.get()?;

    let mut snippet_entity = SnippetEntity::new(payload.content);

    snippet_entity.title = payload.title;
    snippet_entity.description = payload.description;
    snippet_entity.external_link = payload.external_link;

    insert_into(snippets::table)
        .values(&snippet_entity)
        .execute(&mut conn)?;

    for tag_id in payload.tag_ids {
        let new_tag_junction = SnippetTagEntity::new(snippet_entity.id.clone(), tag_id);

        insert_into(snippets_tags::table)
            .values(&new_tag_junction)
            .execute(&mut conn)?;
    }

    let tags = SnippetTagEntity::belonging_to(&snippet_entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let snippet = Snippet::from_entity(snippet_entity, tags);

    Ok(snippet)
}
