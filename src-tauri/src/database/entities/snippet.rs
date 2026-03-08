use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = snippets)]
pub struct SnippetEntity {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub content: String,
    pub external_link: Option<String>,
    pub use_counter: i32,
    pub last_used_at: Option<Timestamp>,
    pub is_favorite: bool,
    pub created_at: Timestamp,
}

impl SnippetEntity {
    pub fn new(content: String) -> Self {
        Self {
            id: nanoid!(),
            title: None,
            description: None,
            content,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            is_favorite: false,
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Snippet {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub content: String,
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
            title: entity.title,
            description: entity.description,
            content: entity.content,
            external_link: entity.external_link,
            use_counter: entity.use_counter,
            last_used_at: entity.last_used_at,
            is_favorite: entity.is_favorite,
            tags,
            created_at: entity.created_at,
        }
    }
}
