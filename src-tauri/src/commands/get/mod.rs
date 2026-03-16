pub mod prelude {
    pub use crate::commands::prelude::*;
}

mod audio;
mod general_stats;
mod images;
mod settings;
mod snippets;
mod tags;
mod videos;

pub use audio::*;
pub use general_stats::*;
pub use images::*;
pub use settings::*;
pub use snippets::*;
pub use tags::*;
pub use videos::*;
