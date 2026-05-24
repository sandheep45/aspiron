#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ProgressPercentage(i32);

impl ProgressPercentage {
    pub fn new(value: i32) -> Self {
        Self(value.clamp(0, 100))
    }

    pub fn value(&self) -> i32 {
        self.0
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecallSessionStatus {
    Pending,
    Completed,
}

use std::str::FromStr;

impl FromStr for RecallSessionStatus {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "completed" => Ok(Self::Completed),
            _ => Ok(Self::Pending),
        }
    }
}

impl RecallSessionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Completed => "completed",
        }
    }
}
