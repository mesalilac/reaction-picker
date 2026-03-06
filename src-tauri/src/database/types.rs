use diesel::backend::Backend;
use diesel::deserialize::{self, FromSql, FromSqlRow};
use diesel::expression::AsExpression;
use diesel::serialize::{self, Output, ToSql};
use diesel::sql_types::BigInt;
use serde::{Deserialize, Serialize};

#[derive(
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
    AsExpression,
    FromSqlRow,
)]
#[serde(transparent)]
#[diesel(sql_type = BigInt)]
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

impl<DB> ToSql<BigInt, DB> for Timestamp
where
    DB: Backend,
    i64: ToSql<BigInt, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, DB>) -> serialize::Result {
        ToSql::<BigInt, DB>::to_sql(&self.0, out)
    }
}

impl<DB> FromSql<BigInt, DB> for Timestamp
where
    DB: Backend,
    i64: FromSql<BigInt, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> deserialize::Result<Self> {
        let val = i64::from_sql(bytes)?;
        Ok(Timestamp(val))
    }
}
