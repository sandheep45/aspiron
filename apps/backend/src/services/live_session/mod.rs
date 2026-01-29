use axum::Json;

pub fn fetch_upcomming_live_classes() -> Json<bool> {
    Json(true)
}

pub fn join_live_class_by_id() -> Json<bool> {
    Json(true)
}

pub fn fetch_recoreded_live_sessions() -> Json<bool> {
    Json(true)
}
