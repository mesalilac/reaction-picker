use super::prelude::*;
use super::{TagEntity, VideoEntity};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(VideoEntity, foreign_key = video_id))]
#[diesel(belongs_to(TagEntity, foreign_key = tag_id))]
#[diesel(table_name = videos_tags)]
#[diesel(primary_key(video_id, tag_id))]
pub struct VideoTagEntity {
    pub video_id: VideoId,
    pub tag_id: TagId,
}

impl VideoTagEntity {
    pub fn new(video_id: VideoId, tag_id: TagId) -> Self {
        Self { video_id, tag_id }
    }
}
