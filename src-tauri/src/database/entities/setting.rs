use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = settings)]
pub struct SettingEntity {
    pub id: i32,
    pub minimize_on_copy: bool,
    pub default_volume: Option<f32>,
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Setting {
    pub id: i32,
    pub minimize_on_copy: bool,
    pub default_volume: Option<f32>,
}

impl Setting {
    pub fn from_entity(entity: SettingEntity) -> Self {
        Self {
            id: entity.id,
            minimize_on_copy: entity.minimize_on_copy,
            default_volume: entity.default_volume,
        }
    }
}
