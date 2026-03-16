use super::prelude::*;
use super::{AudioEntity, TagEntity};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(AudioEntity, foreign_key = audio_id))]
#[diesel(belongs_to(TagEntity, foreign_key = tag_id))]
#[diesel(table_name = audio_tags)]
#[diesel(primary_key(audio_id, tag_id))]
pub struct AudioTagEntity {
    pub audio_id: AudioId,
    pub tag_id: TagId,
}

impl AudioTagEntity {
    pub fn new(audio_id: AudioId, tag_id: TagId) -> Self {
        Self { audio_id, tag_id }
    }
}
