use super::prelude::*;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = images)]
#[diesel(treat_none_as_null = true)]
struct ImageChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub is_favorite: bool,
    pub use_counter: i32,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateImageRequest {
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
pub async fn update_image(
    state: AppState<'_>,
    id: ImageId,
    payload: UpdateImageRequest,
) -> CommandResult<Image> {
    let mut conn = state.pool.get()?;

    let changeset = ImageChangeset {
        title: normalize_optional_string(payload.title),
        description: normalize_optional_string(payload.description),
        external_link: normalize_optional_string(payload.external_link),
        is_favorite: payload.is_favorite,
        use_counter: payload.use_counter,
    };

    update(images::table.find(&id))
        .set(&changeset)
        .execute(&mut conn)?;

    delete(images_tags::table.filter(images_tags::image_id.eq(&id))).execute(&mut conn)?;

    if let Some(tags) = payload.tag_ids {
        delete(images_tags::table.filter(images_tags::image_id.eq(&id))).execute(&mut conn)?;

        for tag_id in tags {
            let new_tag_junction = ImageTagEntity::new(id.clone(), tag_id);

            insert_into(images_tags::table)
                .values(&new_tag_junction)
                .execute(&mut conn)?;
        }
    }

    let image_entity = images::table
        .find(&id)
        .get_result::<ImageEntity>(&mut conn)?;

    let tags = ImageTagEntity::belonging_to(&image_entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let image = Image::from_entity(image_entity, tags);

    Ok(image)
}

#[tauri::command]
#[specta::specta]
pub async fn update_restore_image(state: AppState<'_>, id: ImageId) -> CommandResult<Image> {
    let mut conn = state.pool.get()?;

    update(images::table.find(&id))
        .set(images::deleted_at.eq(None::<i64>))
        .execute(&mut conn)?;

    let entity = images::table
        .find(&id)
        .get_result::<ImageEntity>(&mut conn)?;

    let tags = ImageTagEntity::belonging_to(&entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let image = Image::from_entity(entity, tags);

    Ok(image)
}
