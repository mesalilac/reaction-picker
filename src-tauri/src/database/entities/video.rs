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
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub has_audio: bool,
    pub width: i32,
    pub height: i32,
    pub duration: i32,
    pub is_favorite: bool,
    pub created_at: Timestamp,
}

impl VideoEntity {
    pub fn new(
        file_path: String,
        mime_type: String,
        file_size: i64,
        checksum: String,
        has_audio: bool,
        width: i32,
        height: i32,
        duration: i32,
    ) -> Self {
        Self {
            id: nanoid!(),
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_path,
            mime_type,
            file_size,
            checksum,
            has_audio,
            width,
            height,
            duration,
            is_favorite: false,
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Video {
    pub id: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub has_audio: bool,
    pub width: i32,
    pub height: i32,
    pub duration: i32,
    pub is_favorite: bool,
    pub tags: Vec<Tag>,
    pub created_at: Timestamp,
}

impl Video {
    pub fn from_entity(entity: VideoEntity, tags: Vec<Tag>) -> Self {
        Self {
            id: entity.id,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            file_path: entity.file_path,
            mime_type: entity.mime_type,
            file_size: entity.file_size,
            checksum: entity.checksum,
            has_audio: entity.has_audio,
            width: entity.width,
            height: entity.height,
            duration: entity.duration,
            is_favorite: entity.is_favorite,
            tags,
            created_at: entity.created_at,
        }
    }
}
