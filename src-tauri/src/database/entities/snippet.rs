use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = snippets)]
pub struct SnippetEntity {
    pub id: String,
    pub content: String,
    pub description: Option<String>,
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
            content,
            description: None,
            external_link: None,
            use_counter: 0,
            last_used_at: None,
            is_favorite: false,
            created_at: Timestamp::now(),
        }
    }
}
