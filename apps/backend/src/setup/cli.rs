use crate::setup::openapi::ApiDoc;
use utoipa::OpenApi;

pub async fn handle_args() -> Result<bool, anyhow::Error> {
    if !std::env::args().any(|arg| arg == "--generate-openapi") {
        return Ok(false);
    }

    tracing::info!("Generating OpenAPI spec...");
    let mut openapi = ApiDoc::openapi();
    openapi.servers = Some(vec![utoipa::openapi::Server::new("http://localhost:3000")]);
    let json = serde_json::to_string_pretty(&openapi)?;
    std::fs::create_dir_all("apps/backend/openapi")?;
    std::fs::write("apps/backend/openapi/openapi.json", &json)?;
    tracing::info!("OpenAPI spec written to apps/backend/openapi/openapi.json");
    Ok(true)
}
