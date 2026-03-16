use diesel_derive_newtype::DieselNewType;
use serde::{Deserialize, Serialize};

#[derive(
    DieselNewType,
    specta::Type,
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Copy,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
)]
#[serde(transparent)]
pub struct Timestamp(pub i64);

impl Timestamp {
    pub fn now() -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Failed to get current time");

        let ms = timestamp.as_millis() as i64;

        Self(ms)
    }
}
