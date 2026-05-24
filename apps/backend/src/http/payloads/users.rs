use serde::Deserialize;

#[derive(Deserialize, utoipa::IntoParams)]
pub struct GetUserEmailParams {
    #[param(example = "barbara_turner.1@admin.aspiron")]
    pub email: String,
}
