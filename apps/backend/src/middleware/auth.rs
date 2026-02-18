use axum::{
    body::Body,
    http::{Request, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};

use crate::constants::AllowedClientType;

pub async fn authenticate(mut request: Request<Body>, next: Next) -> Response<Body> {
    let client_type_header = match request.headers().get("x-client-type") {
        Some(value) => value,
        None => {
            return (StatusCode::UNAUTHORIZED, "Missing x-client-type header").into_response();
        }
    };

    let client_type_str = match client_type_header.to_str() {
        Ok(v) => v,
        Err(_) => {
            return (StatusCode::BAD_REQUEST, "Invalid header format").into_response();
        }
    };

    let client_type = match client_type_str.parse::<AllowedClientType>() {
        Ok(client) => client,
        Err(_) => {
            return (StatusCode::FORBIDDEN, "Client type not allowed").into_response();
        }
    };

    request.extensions_mut().insert(client_type);
    next.run(request).await
}
