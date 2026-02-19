use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/notes",
    tag = "Learning",
    responses(
        (status = 200, description = "Get all notes")
    )
)]
pub fn get_all_notes() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/notes",
    tag = "Learning",
    responses(
        (status = 200, description = "Create a note")
    )
)]
pub fn create_note() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    patch,
    path = "/api/v1/notes/{note_id}",
    tag = "Learning",
    responses(
        (status = 200, description = "Update a note")
    ),
    params(
        ("note_id" = i64, Path, description = "Note ID")
    )
)]
pub fn update_note() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    delete,
    path = "/api/v1/notes/{note_id}",
    tag = "Learning",
    responses(
        (status = 200, description = "Delete a note")
    ),
    params(
        ("note_id" = i64, Path, description = "Note ID")
    )
)]
pub fn delete_note() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/notes/official",
    tag = "Learning",
    responses(
        (status = 200, description = "Get teacher's notes from topic ID")
    ),
    params(
        ("topic_id" = i64, Path, description = "Topic ID")
    )
)]
pub fn get_teachers_notes_from_topic_id() -> Json<bool> {
    Json(true)
}
