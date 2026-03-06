// @generated automatically by Diesel CLI.

diesel::table! {
    audio (id) {
        id -> Text,
        description -> Nullable<Text>,
        external_link -> Nullable<Text>,
        use_counter -> Integer,
        last_used_at -> Nullable<BigInt>,
        file_path -> Text,
        file_size -> BigInt,
        duration -> Integer,
        is_favorite -> Nullable<Bool>,
        created_at -> BigInt,
    }
}

diesel::table! {
    audio_tags (audio_id, tag_id) {
        audio_id -> Text,
        tag_id -> Text,
    }
}

diesel::table! {
    images (id) {
        id -> Text,
        description -> Nullable<Text>,
        external_link -> Nullable<Text>,
        use_counter -> Integer,
        last_used_at -> Nullable<BigInt>,
        file_path -> Text,
        is_favorite -> Nullable<Bool>,
        blur_hash -> Text,
        created_at -> BigInt,
    }
}

diesel::table! {
    images_tags (image_id, tag_id) {
        image_id -> Text,
        tag_id -> Text,
    }
}

diesel::table! {
    settings (id) {
        id -> Integer,
        library_path -> Nullable<Text>,
        minimize_on_copy -> Bool,
    }
}

diesel::table! {
    snippets (id) {
        id -> Text,
        content -> Text,
        description -> Nullable<Text>,
        external_link -> Nullable<Text>,
        use_counter -> Integer,
        last_used_at -> Nullable<BigInt>,
        is_favorite -> Nullable<Bool>,
        created_at -> BigInt,
    }
}

diesel::table! {
    snippets_tags (snippet_id, tag_id) {
        snippet_id -> Text,
        tag_id -> Text,
    }
}

diesel::table! {
    tags (id) {
        id -> Text,
        name -> Text,
        created_at -> BigInt,
    }
}

diesel::table! {
    videos (id) {
        id -> Text,
        description -> Nullable<Text>,
        external_link -> Nullable<Text>,
        use_counter -> Integer,
        last_used_at -> Nullable<BigInt>,
        file_path -> Text,
        file_size -> BigInt,
        duration -> Integer,
        is_favorite -> Nullable<Bool>,
        created_at -> BigInt,
    }
}

diesel::table! {
    videos_tags (video_id, tag_id) {
        video_id -> Text,
        tag_id -> Text,
    }
}

diesel::joinable!(audio_tags -> audio (audio_id));
diesel::joinable!(audio_tags -> tags (tag_id));
diesel::joinable!(images_tags -> images (image_id));
diesel::joinable!(images_tags -> tags (tag_id));
diesel::joinable!(snippets_tags -> snippets (snippet_id));
diesel::joinable!(snippets_tags -> tags (tag_id));
diesel::joinable!(videos_tags -> tags (tag_id));
diesel::joinable!(videos_tags -> videos (video_id));

diesel::allow_tables_to_appear_in_same_query!(
    audio,
    audio_tags,
    images,
    images_tags,
    settings,
    snippets,
    snippets_tags,
    tags,
    videos,
    videos_tags,
);
