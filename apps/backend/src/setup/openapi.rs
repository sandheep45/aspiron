use axum::{Json, response::IntoResponse};
use utoipa::OpenApi;

use crate::routes;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Aspiron API",
        version = "0.1.0",
        description = "Backend API for the Aspiron project"
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server")
    ),
    paths(
        routes::health::health
    )
)]
pub struct ApiDoc;

pub async fn openapi_json() -> impl IntoResponse {
    Json(ApiDoc::openapi())
}
