use cookie::Cookie;
use cookie::time::Duration;

pub fn build_token_cookie(
    name: String,
    value: String,
    max_age: Duration,
    _is_development: bool,
) -> Cookie<'static> {
    let builder = Cookie::build((name, value))
        .http_only(true)
        .path("/")
        .max_age(max_age);

    // if is_development {
    //     builder = builder.secure(true).same_site(SameSite::None);
    // } else {
    //     builder = builder.secure(true).same_site(SameSite::Strict);
    // }

    builder.build()
}
