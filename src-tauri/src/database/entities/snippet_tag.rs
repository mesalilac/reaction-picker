use super::prelude::*;
use super::{SnippetEntity, TagEntity};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(SnippetEntity, foreign_key = snippet_id))]
#[diesel(belongs_to(TagEntity, foreign_key = tag_id))]
#[diesel(table_name = snippets_tags)]
#[diesel(primary_key(snippet_id, tag_id))]
pub struct SnippetTagEntity {
    pub snippet_id: SnippetId,
    pub tag_id: TagId,
}

impl SnippetTagEntity {
    pub fn new(snippet_id: SnippetId, tag_id: TagId) -> Self {
        Self { snippet_id, tag_id }
    }
}
