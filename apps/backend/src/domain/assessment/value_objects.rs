#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct QuizScore(i32);

impl QuizScore {
    pub fn new(value: i32) -> Self {
        Self(value.max(0))
    }

    pub fn value(&self) -> i32 {
        self.0
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttemptStatus {
    InProgress,
    Submitted,
}

impl AttemptStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::InProgress => "in_progress",
            Self::Submitted => "submitted",
        }
    }
}
