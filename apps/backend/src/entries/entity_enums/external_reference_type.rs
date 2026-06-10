use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, DeriveActiveEnum, EnumIter, DeriveIden)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "external_reference_type"
)]
pub enum ExternalReferenceTypeEnum {
    #[sea_orm(string_value = "PDF")]
    Pdf,
    #[sea_orm(string_value = "Document")]
    Document,
    #[sea_orm(string_value = "URL")]
    Url,
    #[sea_orm(string_value = "Video")]
    Video,
    #[sea_orm(string_value = "Research Paper")]
    ResearchPaper,
}

impl fmt::Display for ExternalReferenceTypeEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Pdf => write!(f, "PDF"),
            Self::Document => write!(f, "Document"),
            Self::Url => write!(f, "URL"),
            Self::Video => write!(f, "Video"),
            Self::ResearchPaper => write!(f, "Research Paper"),
        }
    }
}
