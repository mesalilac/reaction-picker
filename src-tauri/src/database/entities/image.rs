use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = images)]
pub struct ImageEntity {
    pub id: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub is_favorite: bool,
    pub blur_hash: String,
    pub created_at: Timestamp,
}

impl ImageEntity {
    pub fn new(file_path: String, blur_hash: String) -> Self {
        Self {
            id: nanoid!(),
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_path,
            is_favorite: false,
            blur_hash,
            created_at: Timestamp::now(),
        }
    }
}
