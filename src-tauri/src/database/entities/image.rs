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
    pub file_size: i64,
    pub width: i32,
    pub height: i32,
    pub is_favorite: bool,
    pub blur_hash: String,
    pub created_at: Timestamp,
}

impl ImageEntity {
    pub fn new(
        file_path: String,
        file_size: i64,
        width: i32,
        height: i32,
        blur_hash: String,
    ) -> Self {
        Self {
            id: nanoid!(),
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_path,
            file_size,
            width,
            height,
            is_favorite: false,
            blur_hash,
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Image {
    pub id: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub file_size: i64,
    pub width: i32,
    pub height: i32,
    pub is_favorite: bool,
    pub blur_hash: String,
    pub tags: Vec<Tag>,
    pub created_at: Timestamp,
}

impl Image {
    pub fn from_entity(entity: ImageEntity, tags: Vec<Tag>) -> Self {
        Self {
            id: entity.id,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            file_path: entity.file_path,
            file_size: entity.file_size,
            width: entity.width,
            height: entity.height,
            is_favorite: entity.is_favorite,
            blur_hash: entity.blur_hash,
            tags,
            created_at: entity.created_at,
        }
    }
}
