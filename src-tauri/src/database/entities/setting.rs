use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = settings)]
pub struct SettingEntity {
    pub id: i32,
    pub library_path: Option<String>,
    pub minimize_on_copy: bool,
}
