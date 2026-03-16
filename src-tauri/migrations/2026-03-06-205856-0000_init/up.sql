CREATE TABLE
    images (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT,
        description TEXT,
        external_link TEXT,
        use_counter INT NOT NULL DEFAULT 0 CHECK (use_counter >= 0),
        last_used_at BIGINT,
        file_name TEXT NOT NULL UNIQUE,
        mime_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        checksum TEXT NOT NULL UNIQUE,
        width INT NOT NULL CHECK (width >= 0),
        height INT NOT NULL CHECK (height >= 0),
        is_favorite BOOLEAN NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        blur_hash TEXT NOT NULL,
        deleted_at BIGINT,
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    videos (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT,
        description TEXT,
        external_link TEXT,
        use_counter INT NOT NULL DEFAULT 0 CHECK (use_counter >= 0),
        last_used_at BIGINT,
        file_name TEXT NOT NULL UNIQUE,
        mime_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        checksum TEXT NOT NULL UNIQUE,
        has_audio BOOLEAN NOT NULL DEFAULT 0 CHECK (has_audio IN (0, 1)),
        duration INT NOT NULL CHECK (duration >= 0),
        is_favorite BOOLEAN NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        deleted_at BIGINT,
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    audio (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT,
        description TEXT,
        external_link TEXT,
        use_counter INT NOT NULL DEFAULT 0 CHECK (use_counter >= 0),
        last_used_at BIGINT,
        file_name TEXT NOT NULL UNIQUE,
        mime_type TEXT NOT NULL,
        file_size BIGINT NOT NULL,
        checksum TEXT NOT NULL UNIQUE,
        duration INT NOT NULL CHECK (duration >= 0),
        is_favorite BOOLEAN NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        deleted_at BIGINT,
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    snippets (
        id TEXT NOT NULL PRIMARY KEY,
        title TEXT,
        description TEXT,
        content TEXT NOT NULL,
        external_link TEXT,
        use_counter INT NOT NULL DEFAULT 0 CHECK (use_counter >= 0),
        last_used_at BIGINT,
        is_favorite BOOLEAN NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        deleted_at BIGINT,
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    tags (
        id TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE COLLATE NOCASE,
        created_at BIGINT NOT NULL
    );

CREATE TABLE
    images_tags (
        image_id TEXT NOT NULL REFERENCES images (id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
        PRIMARY KEY (image_id, tag_id)
    );

CREATE TABLE
    videos_tags (
        video_id TEXT NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
        PRIMARY KEY (video_id, tag_id)
    );

CREATE TABLE
    audio_tags (
        audio_id TEXT NOT NULL REFERENCES audio (id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
        PRIMARY KEY (audio_id, tag_id)
    );

CREATE TABLE
    snippets_tags (
        snippet_id TEXT NOT NULL REFERENCES snippets (id) ON DELETE CASCADE,
        tag_id TEXT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
        PRIMARY KEY (snippet_id, tag_id)
    );

CREATE TABLE
    settings (
        id INT NOT NULL PRIMARY KEY CHECK (id = 1),
        minimize_on_copy BOOLEAN NOT NULL DEFAULT 0 CHECK (minimize_on_copy IN (0, 1)),
        default_volume FLOAT CHECK (
            default_volume >= 0.0
            AND default_volume <= 1.0
        )
    );

INSERT INTO
    settings (id)
VALUES
    (1);