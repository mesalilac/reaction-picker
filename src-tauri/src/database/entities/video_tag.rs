use super::prelude::*;
use super::{TagEntity, VideoEntity};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(VideoEntity, foreign_key = video_id))]
#[diesel(belongs_to(TagEntity, foreign_key = tag_id))]
#[diesel(table_name = videos_tags)]
#[diesel(primary_key(video_id, tag_id))]
pub struct VideoTagEntity {
    pub video_id: String,
    pub tag_id: String,
}

impl VideoTagEntity {
    pub fn new(video_id: String, tag_id: String) -> Self {
        Self { video_id, tag_id }
    }
}
