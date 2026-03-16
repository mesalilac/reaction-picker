use serde::Serialize;

#[derive(specta::Type, Serialize, thiserror::Error, Debug)]
#[serde(tag = "kind", content = "message")]
pub enum CommandError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Filesystem error: {0}")]
    Io(String),

    #[error("Clipboard manager error: {0}")]
    Clipboard(String),

    #[error("An unexpected error occurred: {0}")]
    Unknown(String),
}

impl From<diesel::result::Error> for CommandError {
    fn from(error: diesel::result::Error) -> Self {
        CommandError::Database(error.to_string())
    }
}

impl From<diesel::r2d2::PoolError> for CommandError {
    fn from(error: diesel::r2d2::PoolError) -> Self {
        CommandError::Database(error.to_string())
    }
}

impl From<std::io::Error> for CommandError {
    fn from(error: std::io::Error) -> Self {
        CommandError::Io(error.to_string())
    }
}

impl From<anyhow::Error> for CommandError {
    fn from(error: anyhow::Error) -> Self {
        CommandError::Unknown(format!("{:#}", error))
    }
}

impl From<tauri_plugin_opener::Error> for CommandError {
    fn from(error: tauri_plugin_opener::Error) -> Self {
        CommandError::Io(error.to_string())
    }
}

pub type CommandResult<T> = Result<T, CommandError>;

pub mod prelude {
    pub use crate::bridge::dto::*;
    pub use crate::commands::{CommandError, CommandResult};
    pub use crate::database::{entities::*, types::*};
    pub use crate::schema::*;
    pub use crate::utils::db::normalize_optional_string;
    pub use diesel::prelude::*;
    pub use diesel::{
        dsl::{delete, exists},
        insert_into, select, update,
    };
    pub use nanoid::nanoid;
    pub use serde::{Deserialize, Serialize};

    pub type AppState<'a> = tauri::State<'a, crate::AppState>;
}

mod create;
mod get;
mod remove;
mod update;
mod util;

pub use create::*;
pub use get::*;
pub use remove::*;
pub use update::*;
pub use util::*;
