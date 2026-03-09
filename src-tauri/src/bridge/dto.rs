use serde::{Deserialize, Serialize};

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GeneralStats {
    pub image_count: i64,
    pub video_count: i64,
    pub audio_count: i64,
    pub snippet_count: i64,
    pub tag_count: i64,
}
