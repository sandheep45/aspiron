use axum::Json;

pub fn get_all_notes() -> Json<bool> {
    Json(true)
}

pub fn create_note() -> Json<bool> {
    Json(true)
}

pub fn update_note() -> Json<bool> {
    Json(true)
}

pub fn delete_note() -> Json<bool> {
    Json(true)
}

pub fn get_teachers_notes_from_topic_id() -> Json<bool> {
    Json(true)
}
