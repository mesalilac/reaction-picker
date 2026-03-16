use super::prelude::*;
use crate::{commands::prelude::TagEntity, utils::fs::get_app_audio_dir};
use std::path::PathBuf;

pub struct AudioMetadata {
    pub file_name: String,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub duration: i32,
}

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = audio)]
pub struct AudioEntity {
    pub id: AudioId,
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_name: String,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub duration: i32,
    pub is_favorite: bool,
    pub deleted_at: Option<Timestamp>,
    pub created_at: Timestamp,
}

impl AudioEntity {
    pub fn from_metadata(metadata: AudioMetadata) -> Self {
        Self {
            id: AudioId(nanoid!()),
            title: None,
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_name: metadata.file_name,
            mime_type: metadata.mime_type,
            file_size: metadata.file_size,
            checksum: metadata.checksum,
            duration: metadata.duration,
            is_favorite: false,
            deleted_at: None,
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Audio {
    pub id: AudioId,
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: PathBuf,
    pub file_name: String,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub duration: i32,
    pub is_favorite: bool,
    pub tags: Vec<Tag>,
    pub deleted_at: Option<Timestamp>,
    pub created_at: Timestamp,
}

impl Audio {
    pub fn from_entity(entity: AudioEntity, tags: Vec<TagEntity>) -> Self {
        Self {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            file_path: get_app_audio_dir().join(entity.file_name.clone()),
            file_name: entity.file_name,
            mime_type: entity.mime_type,
            file_size: entity.file_size,
            checksum: entity.checksum,
            duration: entity.duration,
            is_favorite: entity.is_favorite,
            tags: tags.into_iter().map(Tag::from_entity).collect(),
            deleted_at: entity.deleted_at,
            created_at: entity.created_at,
        }
    }
}
