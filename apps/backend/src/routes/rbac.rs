use crate::setup::app::AppState;
use axum::Router;

pub fn router() -> Router<AppState> {
    Router::new()
}
