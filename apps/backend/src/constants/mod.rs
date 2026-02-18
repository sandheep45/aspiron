use std::str::FromStr;

use ts_rs::TS;

#[derive(Debug, Clone, TS)]
#[ts(export)]
pub enum AllowedClientType {
    #[ts(rename = "BROWSER")]
    BROWSER,
    #[ts(rename = "MOBILE")]
    MOBILE,
}

impl FromStr for AllowedClientType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "BROWSER" => Ok(AllowedClientType::BROWSER),
            "MOBILE" => Ok(AllowedClientType::MOBILE),
            _ => Err(()),
        }
    }
}
