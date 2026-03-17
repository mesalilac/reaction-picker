use super::prelude::*;
use crate::APP_SETTINGS_ID;

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = settings)]
struct SettingsChangeset {
    pub minimize_on_copy: Option<bool>,
    pub default_volume: Option<f64>,
}

impl SettingsChangeset {
    pub fn is_empty(&self) -> bool {
        self.minimize_on_copy.is_none() && self.default_volume.is_none()
    }
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsRequest {
    #[specta(optional)]
    #[serde(default)]
    pub minimize_on_copy: Option<bool>,
    #[specta(optional)]
    #[serde(default)]
    pub default_volume: Option<f64>,
}

#[tauri::command]
#[specta::specta]
pub async fn update_settings(
    state: AppState<'_>,
    payload: UpdateSettingsRequest,
) -> CommandResult<Setting> {
    let mut conn = state.pool.get()?;

    let changeset = SettingsChangeset {
        minimize_on_copy: payload.minimize_on_copy,
        default_volume: payload.default_volume,
    };

    if !changeset.is_empty() {
        update(settings::table.find(APP_SETTINGS_ID))
            .set(&changeset)
            .execute(&mut conn)?;
    }

    let entity = settings::table
        .find(&APP_SETTINGS_ID)
        .get_result::<SettingEntity>(&mut conn)?;

    let setting = Setting::from_entity(entity);

    Ok(setting)
}
