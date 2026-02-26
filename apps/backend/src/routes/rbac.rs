use crate::setup::app::AppState;
use axum::Router;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    Router::new()
}
