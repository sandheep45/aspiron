use std::collections::HashSet;

use axum::{
    body::Body,
    http::{Request, Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use once_cell::sync::Lazy;

use crate::constants::AllowedClientType;

// Exact route whitelist
static WHITELIST_ROUTES: Lazy<HashSet<&'static str>> =
    Lazy::new(|| HashSet::from(["/api-docs/openapi.json", "/api-docs/openapi-swagger.json"]));

// Prefix-based whitelist (for route groups)
static WHITELIST_PREFIXES: &[&str] = &["/swagger"];

fn is_whitelisted(path: &str) -> bool {
    WHITELIST_ROUTES.contains(path)
        || WHITELIST_PREFIXES
            .iter()
            .any(|prefix| path.starts_with(prefix))
}

pub async fn authenticate(mut request: Request<Body>, next: Next) -> Response<Body> {
    let path = request.uri().path();

    if is_whitelisted(path) {
        return next.run(request).await;
    }

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
