use chrono::{DateTime, Duration, Utc};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SpacedRepetitionItem {
    pub ease_factor: f64,
    pub interval_days: i64,
    pub repetitions: u32,
    pub next_review: Option<DateTime<Utc>>,
}

impl Default for SpacedRepetitionItem {
    fn default() -> Self {
        Self {
            ease_factor: 2.5,
            interval_days: 0,
            repetitions: 0,
            next_review: None,
        }
    }
}

impl SpacedRepetitionItem {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn calculate_next(correct: bool, item: &SpacedRepetitionItem) -> Self {
        if correct {
            Self::calculate_correct(item)
        } else {
            Self::calculate_incorrect(item)
        }
    }

    fn calculate_correct(item: &SpacedRepetitionItem) -> Self {
        let new_interval = if item.repetitions == 0 {
            1
        } else if item.repetitions == 1 {
            6
        } else {
            (item.interval_days as f64 * item.ease_factor).round() as i64
        };

        let new_ease = (item.ease_factor + 0.15).clamp(1.3, 3.0);

        Self {
            ease_factor: new_ease,
            interval_days: new_interval,
            repetitions: item.repetitions + 1,
            next_review: Some(Utc::now() + Duration::days(new_interval)),
        }
    }

    fn calculate_incorrect(item: &SpacedRepetitionItem) -> Self {
        let new_ease = (item.ease_factor - 0.20).clamp(1.3, 3.0);

        Self {
            ease_factor: new_ease,
            interval_days: 1,
            repetitions: 0,
            next_review: Some(Utc::now() + Duration::days(1)),
        }
    }

    pub fn next_interval_days(correct: bool, item: &SpacedRepetitionItem) -> i64 {
        Self::calculate_next(correct, item).interval_days
    }

    pub fn should_review(item: &SpacedRepetitionItem) -> bool {
        match item.next_review {
            Some(review_date) => Utc::now() >= review_date,
            None => true,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum RecallOutcome {
    Forgotten,
    Recalled,
}

pub fn classify_recall_outcome(is_correct: bool, score: Option<i32>) -> RecallOutcome {
    match score {
        Some(s) if s > 0 => RecallOutcome::Recalled,
        None if is_correct => RecallOutcome::Recalled,
        _ => RecallOutcome::Forgotten,
    }
}

pub fn batch_calculate_next(outcomes: &[(bool, Option<i32>)]) -> Vec<SpacedRepetitionItem> {
    let mut item = SpacedRepetitionItem::new();
    let mut results = Vec::with_capacity(outcomes.len());

    for &(is_correct, score) in outcomes {
        let outcome = classify_recall_outcome(is_correct, score);
        let correct = outcome == RecallOutcome::Recalled;
        item = SpacedRepetitionItem::calculate_next(correct, &item);
        results.push(item);
    }

    results
}

pub fn average_retention(outcomes: &[(bool, Option<i32>)]) -> f64 {
    if outcomes.is_empty() {
        return 0.0;
    }
    let correct_count = outcomes
        .iter()
        .filter(|&&(is_correct, score)| {
            classify_recall_outcome(is_correct, score) == RecallOutcome::Recalled
        })
        .count();
    (correct_count as f64 / outcomes.len() as f64) * 100.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_item() {
        let item = SpacedRepetitionItem::new();
        assert_eq!(item.ease_factor, 2.5);
        assert_eq!(item.interval_days, 0);
        assert_eq!(item.repetitions, 0);
        assert!(item.next_review.is_none());
    }

    #[test]
    fn test_first_correct_review() {
        let item = SpacedRepetitionItem::new();
        let result = SpacedRepetitionItem::calculate_next(true, &item);
        assert_eq!(result.interval_days, 1);
        assert_eq!(result.repetitions, 1);
        assert!((result.ease_factor - 2.65).abs() < 0.01);
    }

    #[test]
    fn test_second_correct_review() {
        let item = SpacedRepetitionItem {
            ease_factor: 2.5,
            interval_days: 1,
            repetitions: 1,
            next_review: None,
        };
        let result = SpacedRepetitionItem::calculate_next(true, &item);
        assert_eq!(result.interval_days, 6);
        assert_eq!(result.repetitions, 2);
    }

    #[test]
    fn test_third_correct_review_interval_scales() {
        let item = SpacedRepetitionItem {
            ease_factor: 2.5,
            interval_days: 6,
            repetitions: 2,
            next_review: None,
        };
        let result = SpacedRepetitionItem::calculate_next(true, &item);
        assert_eq!(result.interval_days, 15);
        assert_eq!(result.repetitions, 3);
    }

    #[test]
    fn test_incorrect_review_resets_interval() {
        let item = SpacedRepetitionItem {
            ease_factor: 2.5,
            interval_days: 15,
            repetitions: 3,
            next_review: None,
        };
        let result = SpacedRepetitionItem::calculate_next(false, &item);
        assert_eq!(result.interval_days, 1);
        assert_eq!(result.repetitions, 0);
        assert!((result.ease_factor - 2.3).abs() < 0.01);
    }

    #[test]
    fn test_ease_factor_clamped() {
        let item = SpacedRepetitionItem {
            ease_factor: 3.0,
            interval_days: 10,
            repetitions: 5,
            next_review: None,
        };
        let result = SpacedRepetitionItem::calculate_next(true, &item);
        assert!((result.ease_factor - 3.0).abs() < 0.01);
    }

    #[test]
    fn test_ease_factor_floor() {
        let mut item = SpacedRepetitionItem::new();
        for _ in 0..10 {
            item = SpacedRepetitionItem::calculate_next(false, &item);
        }
        assert!((item.ease_factor - 1.3).abs() < 0.01);
    }

    #[test]
    fn test_batch_calculate_empty() {
        let results = batch_calculate_next(&[]);
        assert!(results.is_empty());
    }

    #[test]
    fn test_batch_calculate_alternating() {
        let outcomes = [(true, Some(1)), (false, Some(0)), (true, Some(1))];
        let results = batch_calculate_next(&outcomes);
        assert_eq!(results.len(), 3);
        assert_eq!(results[0].interval_days, 1);
        assert_eq!(results[0].repetitions, 1);
        assert_eq!(results[1].interval_days, 1);
        assert_eq!(results[1].repetitions, 0);
        assert_eq!(results[2].interval_days, 1);
        assert_eq!(results[2].repetitions, 1);
    }

    #[test]
    fn test_classify_recall_outcome_forgotten() {
        assert_eq!(
            classify_recall_outcome(false, Some(0)),
            RecallOutcome::Forgotten
        );
        assert_eq!(
            classify_recall_outcome(false, None),
            RecallOutcome::Forgotten
        );
    }

    #[test]
    fn test_classify_recall_outcome_recalled() {
        assert_eq!(
            classify_recall_outcome(true, Some(1)),
            RecallOutcome::Recalled
        );
        assert_eq!(classify_recall_outcome(true, None), RecallOutcome::Recalled);
    }

    #[test]
    fn test_average_retention_all_correct() {
        let outcomes = [(true, Some(1)), (true, Some(1)), (true, Some(1))];
        assert!((average_retention(&outcomes) - 100.0).abs() < 0.01);
    }

    #[test]
    fn test_average_retention_all_incorrect() {
        let outcomes = [(false, Some(0)), (false, Some(0))];
        assert!((average_retention(&outcomes)).abs() < 0.01);
    }

    #[test]
    fn test_average_retention_mixed() {
        let outcomes = [(true, Some(1)), (false, Some(0))];
        assert!((average_retention(&outcomes) - 50.0).abs() < 0.01);
    }

    #[test]
    fn test_average_retention_empty() {
        assert!((average_retention(&[])).abs() < 0.01);
    }

    #[test]
    fn test_should_review_no_schedule() {
        let item = SpacedRepetitionItem::new();
        assert!(SpacedRepetitionItem::should_review(&item));
    }

    #[test]
    fn test_next_interval_days_first_correct() {
        let item = SpacedRepetitionItem::new();
        assert_eq!(SpacedRepetitionItem::next_interval_days(true, &item), 1);
    }

    #[test]
    fn test_next_interval_days_incorrect() {
        let item = SpacedRepetitionItem::new();
        assert_eq!(SpacedRepetitionItem::next_interval_days(false, &item), 1);
    }
}
