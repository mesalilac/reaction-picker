use super::prelude::*;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = tags)]
struct TagChangeset {
    pub name: Option<String>,
}

impl TagChangeset {
    pub fn is_empty(&self) -> bool {
        self.name.is_none()
    }
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTagRequest {
    #[specta(optional)]
    #[serde(default)]
    pub name: Option<String>,
}

#[tauri::command]
#[specta::specta]
pub async fn update_tag(
    state: AppState<'_>,
    id: String,
    payload: UpdateTagRequest,
) -> CommandResult<Tag> {
    let mut conn = state.pool.get()?;

    let changeset = TagChangeset {
        name: normalize_optional_string(payload.name).map(|x| x.to_lowercase()),
    };

    if !changeset.is_empty() {
        update(tags::table.find(&id))
            .set(&changeset)
            .execute(&mut conn)?;
    }

    let entity = tags::table.find(&id).get_result::<TagEntity>(&mut conn)?;

    let tag = Tag::from_entity(entity);

    Ok(tag)
}
