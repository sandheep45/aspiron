use axum::Json;

pub fn get_all_subjects() -> Json<bool> {
    Json(true)
}
