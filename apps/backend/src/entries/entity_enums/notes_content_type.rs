use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Eq, DeriveActiveEnum, EnumIter, DeriveIden, Serialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "notes_content_type")]
pub enum NotesContentTypeEnum {
    #[sea_orm(string_value = "inline")]
    INLINE,
    #[sea_orm(string_value = "external")]
    EXTERNAL,
}
