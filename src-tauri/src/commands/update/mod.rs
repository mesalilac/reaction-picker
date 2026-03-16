pub mod prelude {
    pub use crate::commands::prelude::*;
}

mod audio;
mod image;
mod settings;
mod snippet;
mod tag;
mod video;

pub use audio::*;
pub use image::*;
pub use settings::*;
pub use snippet::*;
pub use tag::*;
pub use video::*;
