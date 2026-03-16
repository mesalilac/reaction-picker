use super::prelude::*;

#[tauri::command]
#[specta::specta]
pub async fn get_audio(state: AppState<'_>) -> CommandResult<Vec<Audio>> {
    let mut conn = state.pool.get()?;

    let audio_entities = audio::table.load::<AudioEntity>(&mut conn)?;

    let tag_entities = AudioTagEntity::belonging_to(&audio_entities)
        .inner_join(tags::table)
        .select((AudioTagEntity::as_select(), TagEntity::as_select()))
        .load::<(AudioTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<Audio> = tag_entities
        .grouped_by(&audio_entities)
        .into_iter()
        .zip(audio_entities)
        .map(|(tags_list, audio)| {
            Audio::from_entity(audio, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}
