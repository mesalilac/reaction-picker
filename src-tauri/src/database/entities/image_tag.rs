use super::prelude::*;
use super::{ImageEntity, TagEntity};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(ImageEntity, foreign_key = image_id))]
#[diesel(belongs_to(TagEntity, foreign_key = tag_id))]
#[diesel(table_name = images_tags)]
#[diesel(primary_key(image_id, tag_id))]
pub struct ImageTagEntity {
    pub image_id: ImageId,
    pub tag_id: TagId,
}

impl ImageTagEntity {
    pub fn new(image_id: ImageId, tag_id: TagId) -> Self {
        Self { image_id, tag_id }
    }
}
