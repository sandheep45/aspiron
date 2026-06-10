use aws_sdk_s3::Client as S3Client;
use aws_sdk_s3::config::{BehaviorVersion, Credentials, Region};
use aws_sdk_s3::primitives::ByteStream;

use crate::setup::config::S3Config;
use crate::setup::error::AppError;

pub fn build_s3_client(config: &S3Config) -> S3Client {
    let mut s3_config_builder = aws_sdk_s3::Config::builder()
        .behavior_version(BehaviorVersion::latest())
        .region(Region::new(config.region.clone()));

    if let Some(ref endpoint) = config.endpoint {
        s3_config_builder = s3_config_builder
            .force_path_style(true)
            .endpoint_url(endpoint);
    }

    if let (Some(key_id), Some(secret_key)) = (&config.access_key_id, &config.secret_access_key) {
        let creds = Credentials::new(key_id, secret_key, None, None, "custom");
        s3_config_builder = s3_config_builder.credentials_provider(creds);
    }

    S3Client::from_conf(s3_config_builder.build())
}

pub async fn ensure_bucket_exists(client: &S3Client, bucket: &str) -> Result<(), AppError> {
    let exists = client.head_bucket().bucket(bucket).send().await.is_ok();

    if !exists {
        client
            .create_bucket()
            .bucket(bucket)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create S3 bucket: {e}")))?;
        tracing::info!("Created S3 bucket: {}", bucket);
    }

    Ok(())
}

pub async fn upload_file(
    client: &S3Client,
    bucket: &str,
    key: &str,
    content_type: &str,
    body: Vec<u8>,
    public_base_url: &str,
) -> Result<String, AppError> {
    let byte_stream = ByteStream::from(body);

    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .content_type(content_type)
        .body(byte_stream)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to upload file to S3: {e}")))?;

    let public_url = format!(
        "{}/{}/{}",
        public_base_url.trim_end_matches('/'),
        bucket,
        key
    );

    Ok(public_url)
}
