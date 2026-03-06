use crate::database::{entities::*, types::*};
use serde::{Deserialize, Serialize};

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Image {
    pub id: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
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
            is_favorite: entity.is_favorite,
            blur_hash: entity.blur_hash,
            tags,
            created_at: entity.created_at,
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
    pub file_size: i64,
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
            file_size: entity.file_size,
            duration: entity.duration,
            is_favorite: entity.is_favorite,
            tags,
            created_at: entity.created_at,
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Audio {
    pub id: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub file_path: String,
    pub file_size: i64,
    pub duration: i32,
    pub is_favorite: bool,
    pub tags: Vec<Tag>,
    pub created_at: Timestamp,
}

impl Audio {
    pub fn from_entity(entity: AudioEntity, tags: Vec<Tag>) -> Self {
        Self {
            id: entity.id,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            file_path: entity.file_path,
            file_size: entity.file_size,
            duration: entity.duration,
            is_favorite: entity.is_favorite,
            tags,
            created_at: entity.created_at,
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Snippet {
    pub id: String,
    pub content: String,
    pub description: Option<String>,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub is_favorite: bool,
    pub tags: Vec<Tag>,
    pub created_at: Timestamp,
}

impl Snippet {
    pub fn from_entity(entity: SnippetEntity, tags: Vec<Tag>) -> Self {
        Self {
            id: entity.id,
            content: entity.content,
            description: entity.description,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            is_favorite: entity.is_favorite,
            tags,
            created_at: entity.created_at,
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub created_at: Timestamp,
}

impl Tag {
    pub fn from_entity(entity: TagEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name,
            created_at: entity.created_at,
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Setting {
    pub id: i32,
    pub library_path: Option<String>,
    pub minimize_on_copy: bool,
}

impl Setting {
    pub fn from_entity(entity: SettingEntity) -> Self {
        Self {
            id: entity.id,
            library_path: entity.library_path,
            minimize_on_copy: entity.minimize_on_copy,
        }
    }
}
