use backend::setup::openapi::ApiDoc;
use utoipa::OpenApi;

#[test]
fn openapi_spec_matches_snapshot() {
    let openapi = ApiDoc::openapi();
    insta::assert_json_snapshot!("openapi-spec", openapi);
}
