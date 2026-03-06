use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = videos)]
pub struct VideoEntity {
    pub id: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub file_size: i64,
    pub duration: i32,
    pub is_favorite: bool,
    pub created_at: Timestamp,
}

impl VideoEntity {
    pub fn new(file_path: String, file_size: i64, duration: i32) -> Self {
        Self {
            id: nanoid!(),
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_path,
            file_size,
            duration,
            is_favorite: false,
            created_at: Timestamp::now(),
        }
    }
}
