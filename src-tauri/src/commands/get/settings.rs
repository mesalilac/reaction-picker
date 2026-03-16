use super::prelude::*;
use crate::APP_SETTINGS_ID;

#[tauri::command]
#[specta::specta]
pub async fn get_settings(state: AppState<'_>) -> CommandResult<Setting> {
    let mut conn = state.pool.get()?;

    let setting_entity = settings::table
        .find(APP_SETTINGS_ID)
        .get_result::<SettingEntity>(&mut conn)?;

    let settings = Setting::from_entity(setting_entity);

    Ok(settings)
}
