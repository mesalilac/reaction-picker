use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = tags)]
pub struct TagEntity {
    pub id: TagId,
    pub name: String,
    pub created_at: Timestamp,
}

impl TagEntity {
    pub fn new(name: String) -> Self {
        Self {
            id: TagId(nanoid!()),
            name: name.trim().to_lowercase(),
            created_at: Timestamp::now(),
        }
    }
}

#[derive(specta::Type, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: TagId,
    pub name: String,
    pub created_at: Timestamp,
}

impl Tag {
    pub fn from_entity(entity: TagEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name,
            created_at: entity.created_at,
        }
    }
}
