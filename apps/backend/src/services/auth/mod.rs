use axum::Json;

pub fn authenticate_user() -> Json<bool> {
    Json(true)
}

pub fn get_me() -> Json<bool> {
    Json(true)
}

pub fn refresh_token() -> Json<bool> {
    Json(true)
}

pub fn register_user() -> Json<bool> {
    Json(true)
}

pub fn log_out() -> Json<bool> {
    Json(true)
}
