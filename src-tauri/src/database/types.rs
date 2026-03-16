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

#[derive(
    specta::Type, DieselNewType, Eq, PartialEq, Hash, Debug, Clone, Serialize, Deserialize,
)]
pub struct ImageId(pub String);

#[derive(
    specta::Type, DieselNewType, Eq, PartialEq, Hash, Debug, Clone, Serialize, Deserialize,
)]
pub struct VideoId(pub String);

#[derive(
    specta::Type, DieselNewType, Eq, PartialEq, Hash, Debug, Clone, Serialize, Deserialize,
)]
pub struct AudioId(pub String);

#[derive(
    specta::Type, DieselNewType, Eq, PartialEq, Hash, Debug, Clone, Serialize, Deserialize,
)]
pub struct SnippetId(pub String);

#[derive(
    specta::Type, DieselNewType, Eq, PartialEq, Hash, Debug, Clone, Serialize, Deserialize,
)]
pub struct TagId(pub String);
