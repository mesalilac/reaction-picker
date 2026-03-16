use super::prelude::*;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = snippets)]
struct SnippetChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub is_favorite: Option<bool>,
}

impl SnippetChangeset {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.description.is_none()
            && self.external_link.is_none()
            && self.is_favorite.is_none()
    }
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSnippetRequest {
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
pub async fn update_snippet(
    state: AppState<'_>,
    id: String,
    payload: UpdateSnippetRequest,
) -> CommandResult<Snippet> {
    let mut conn = state.pool.get()?;

    let changeset = SnippetChangeset {
        title: normalize_optional_string(payload.title),
        description: normalize_optional_string(payload.description),
        external_link: normalize_optional_string(payload.external_link),
        is_favorite: payload.is_favorite,
    };

    if !changeset.is_empty() {
        update(snippets::table.find(&id))
            .set(&changeset)
            .execute(&mut conn)?;
    }

    if let Some(tags) = payload.tag_ids {
        delete(snippets_tags::table.filter(snippets_tags::snippet_id.eq(&id)))
            .execute(&mut conn)?;

        for tag_id in tags {
            let new_tag_junction = SnippetTagEntity::new(id.clone(), tag_id);

            insert_into(snippets_tags::table)
                .values(&new_tag_junction)
                .execute(&mut conn)?;
        }
    }

    let entity = snippets::table
        .find(&id)
        .get_result::<SnippetEntity>(&mut conn)?;

    let tags = SnippetTagEntity::belonging_to(&entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let snippet = Snippet::from_entity(entity, tags);

    Ok(snippet)
}

#[tauri::command]
#[specta::specta]
pub async fn update_restore_snippet(state: AppState<'_>, id: String) -> CommandResult<Snippet> {
    let mut conn = state.pool.get()?;

    update(snippets::table.find(&id))
        .set(snippets::deleted_at.eq(None::<i64>))
        .execute(&mut conn)?;

    let entity = snippets::table
        .find(&id)
        .get_result::<SnippetEntity>(&mut conn)?;

    let tags = SnippetTagEntity::belonging_to(&entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let snippet = Snippet::from_entity(entity, tags);

    Ok(snippet)
}
