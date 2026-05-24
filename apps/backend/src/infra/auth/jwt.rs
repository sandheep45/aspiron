use async_trait::async_trait;
use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};

use crate::application::auth::ports::{Claims, TokenService};
use crate::setup::error::AppError;

pub(crate) struct JwtService {
    secret: String,
    access_expiry: u64,
    refresh_expiry: u64,
}

impl JwtService {
    pub(crate) fn new(secret: String, access_expiry: u64, refresh_expiry: u64) -> Self {
        Self {
            secret,
            access_expiry,
            refresh_expiry,
        }
    }
}

#[async_trait]
impl TokenService for JwtService {
    fn generate_access_token(&self, user_id: &str) -> Result<String, AppError> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::seconds(self.access_expiry as i64))
            .expect("valid timestamp")
            .timestamp() as usize;
        let claims = Claims {
            sub: user_id.to_string(),
            exp: expiration,
        };
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.secret.as_bytes()),
        )
        .map_err(|e| AppError::auth(format!("Failed to generate access token: {e}")))
    }

    fn generate_refresh_token(&self, user_id: &str) -> Result<String, AppError> {
        let expiration = Utc::now()
            .checked_add_signed(Duration::seconds(self.refresh_expiry as i64))
            .expect("valid timestamp")
            .timestamp() as usize;
        let claims = Claims {
            sub: user_id.to_string(),
            exp: expiration,
        };
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.secret.as_bytes()),
        )
        .map_err(|e| AppError::auth(format!("Failed to generate refresh token: {e}")))
    }

    fn decode_token(&self, token: &str) -> Result<Claims, AppError> {
        decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.secret.as_bytes()),
            &Validation::new(Algorithm::HS256),
        )
        .map(|data| data.claims)
        .map_err(|err| match err.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
                AppError::access_token_expired("Token has expired")
            }
            _ => AppError::auth(format!("Invalid token: {err}")),
        })
    }

    fn access_token_expiry(&self) -> u64 {
        self.access_expiry
    }

    fn refresh_token_expiry(&self) -> u64 {
        self.refresh_expiry
    }
}
