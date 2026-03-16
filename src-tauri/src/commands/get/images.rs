use super::prelude::*;

#[tauri::command]
#[specta::specta]
pub async fn get_images(state: AppState<'_>) -> CommandResult<Vec<Image>> {
    let mut conn = state.pool.get()?;

    let image_entities = images::table.load::<ImageEntity>(&mut conn)?;

    let tag_entities = ImageTagEntity::belonging_to(&image_entities)
        .inner_join(tags::table)
        .select((ImageTagEntity::as_select(), TagEntity::as_select()))
        .load::<(ImageTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<Image> = tag_entities
        .grouped_by(&image_entities)
        .into_iter()
        .zip(image_entities)
        .map(|(tags_list, image)| {
            Image::from_entity(image, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}
