use cookie::time::Duration;
use cookie::{Cookie, SameSite};

pub fn build_token_cookie(
    name: String,
    value: String,
    max_age: Duration,
    is_development: bool,
) -> Cookie<'static> {
    let mut builder = Cookie::build((name, value))
        .http_only(true)
        .path("/")
        .max_age(max_age);

    if is_development {
        builder = builder.secure(true).same_site(SameSite::None);
    } else {
        builder = builder.secure(true).same_site(SameSite::Strict);
    }

    builder.build()
}
