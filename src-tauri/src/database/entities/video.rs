use super::prelude::*;
use crate::{
    commands::prelude::TagEntity,
    utils::fs::{get_app_thumbnails_dir, get_app_videos_dir},
};
use std::path::PathBuf;

pub struct VideoMetadata {
    pub file_path: PathBuf,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub has_audio: bool,
    pub width: i32,
    pub height: i32,
    pub duration: i32,
}

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = videos)]
pub struct VideoEntity {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub has_audio: bool,
    pub width: i32,
    pub height: i32,
    pub duration: i32,
    pub is_favorite: bool,
    pub deleted_at: Option<Timestamp>,
    pub created_at: Timestamp,
}

impl VideoEntity {
    pub fn new(metadata: VideoMetadata) -> Self {
        Self {
            id: nanoid!(),
            title: None,
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            file_path: metadata.file_path.to_string_lossy().to_string(),
            thumbnail_path: None,
            mime_type: metadata.mime_type,
            file_size: metadata.file_size,
            checksum: metadata.checksum,
            has_audio: metadata.has_audio,
            width: metadata.width,
            height: metadata.height,
            duration: metadata.duration,
            is_favorite: false,
            deleted_at: None,
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Video {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: PathBuf,
    pub thumbnail_path: Option<PathBuf>,
    pub mime_type: String,
    pub file_size: i64,
    pub checksum: String,
    pub has_audio: bool,
    pub width: i32,
    pub height: i32,
    pub duration: i32,
    pub is_favorite: bool,
    pub tags: Vec<Tag>,
    pub deleted_at: Option<Timestamp>,
    pub created_at: Timestamp,
}

impl Video {
    pub fn from_entity(entity: VideoEntity, tags: Vec<TagEntity>) -> Self {
        Self {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            file_path: get_app_videos_dir().join(entity.file_path),
            thumbnail_path: entity
                .thumbnail_path
                .map(|p| get_app_thumbnails_dir().join(p)),
            mime_type: entity.mime_type,
            file_size: entity.file_size,
            checksum: entity.checksum,
            has_audio: entity.has_audio,
            width: entity.width,
            height: entity.height,
            duration: entity.duration,
            is_favorite: entity.is_favorite,
            tags: tags.into_iter().map(Tag::from_entity).collect(),
            deleted_at: entity.deleted_at,
            created_at: entity.created_at,
        }
    }
}
