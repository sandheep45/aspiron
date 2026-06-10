use axum::{Router, routing::put};

use crate::http::handlers::upload::handler_upload_file;
use crate::setup::app::AppState;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    Router::new().route("/upload/file", put(handler_upload_file))
}
