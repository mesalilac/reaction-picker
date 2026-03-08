use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = audio)]
pub struct AudioEntity {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub duration: i32,
    pub is_favorite: bool,
    pub created_at: Timestamp,
}

impl AudioEntity {
    pub fn new(
        file_path: String,
        mime_type: String,
        file_size: i64,
        checksum: String,
        duration: i32,
    ) -> Self {
        Self {
            id: nanoid!(),
            title: None,
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_path,
            mime_type,
            file_size,
            checksum,
            duration,
            is_favorite: false,
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Audio {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub duration: i32,
    pub is_favorite: bool,
    pub tags: Vec<Tag>,
    pub created_at: Timestamp,
}

impl Audio {
    pub fn from_entity(entity: AudioEntity, tags: Vec<Tag>) -> Self {
        Self {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            file_path: entity.file_path,
            mime_type: entity.mime_type,
            file_size: entity.file_size,
            checksum: entity.checksum,
            duration: entity.duration,
            is_favorite: entity.is_favorite,
            tags,
            created_at: entity.created_at,
        }
    }
}
