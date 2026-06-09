use backend::domain::learning::spaced_repetition::{
    SpacedRepetitionItem, average_retention, batch_calculate_next, classify_recall_outcome,
};

#[test]
fn test_default_item() {
    let item = SpacedRepetitionItem::new();
    assert_eq!(item.ease_factor, 2.5);
    assert_eq!(item.interval_days, 0);
    assert_eq!(item.repetitions, 0);
    assert!(item.next_review.is_none());
}

#[test]
fn test_first_correct_interval_one_day() {
    let item = SpacedRepetitionItem::new();
    let next = SpacedRepetitionItem::calculate_next(true, &item);
    assert_eq!(next.interval_days, 1);
    assert_eq!(next.repetitions, 1);
}

#[test]
fn test_second_correct_interval_six_days() {
    let item = SpacedRepetitionItem {
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        next_review: None,
    };
    let next = SpacedRepetitionItem::calculate_next(true, &item);
    assert_eq!(next.interval_days, 6);
    assert_eq!(next.repetitions, 2);
}

#[test]
fn test_third_correct_interval_scales_with_ease() {
    let item = SpacedRepetitionItem {
        ease_factor: 2.5,
        interval_days: 6,
        repetitions: 2,
        next_review: None,
    };
    let next = SpacedRepetitionItem::calculate_next(true, &item);
    assert_eq!(next.interval_days, 15);
    assert_eq!(next.repetitions, 3);
}

#[test]
fn test_incorrect_resets_interval() {
    let item = SpacedRepetitionItem {
        ease_factor: 2.5,
        interval_days: 30,
        repetitions: 5,
        next_review: None,
    };
    let next = SpacedRepetitionItem::calculate_next(false, &item);
    assert_eq!(next.interval_days, 1);
    assert_eq!(next.repetitions, 0);
}

#[test]
fn test_incorrect_reduces_ease_factor() {
    let item = SpacedRepetitionItem {
        ease_factor: 2.5,
        interval_days: 10,
        repetitions: 3,
        next_review: None,
    };
    let next = SpacedRepetitionItem::calculate_next(false, &item);
    assert!((next.ease_factor - 2.3).abs() < 0.01);
}

#[test]
fn test_correct_increases_ease_factor() {
    let item = SpacedRepetitionItem {
        ease_factor: 2.5,
        interval_days: 10,
        repetitions: 3,
        next_review: None,
    };
    let next = SpacedRepetitionItem::calculate_next(true, &item);
    assert!((next.ease_factor - 2.65).abs() < 0.01);
}

#[test]
fn test_ease_factor_capped_at_maximum() {
    let item = SpacedRepetitionItem {
        ease_factor: 3.0,
        interval_days: 10,
        repetitions: 5,
        next_review: None,
    };
    let next = SpacedRepetitionItem::calculate_next(true, &item);
    assert!((next.ease_factor - 3.0).abs() < 0.01);
}

#[test]
fn test_ease_factor_floor_minimum() {
    let mut item = SpacedRepetitionItem::new();
    for _ in 0..10 {
        item = SpacedRepetitionItem::calculate_next(false, &item);
    }
    assert!((item.ease_factor - 1.3).abs() < 0.01);
}

#[test]
fn test_classify_recall_outcome() {
    assert!(matches!(classify_recall_outcome(true, Some(1)), _));
    assert!(matches!(classify_recall_outcome(false, Some(0)), _));
    assert!(matches!(classify_recall_outcome(true, None), _));
    assert!(matches!(classify_recall_outcome(false, None), _));
}

#[test]
fn test_batch_calculate_alternating_correctness() {
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
fn test_average_retention_empty_returns_zero() {
    assert!((average_retention(&[])).abs() < 0.01);
}

#[test]
fn test_batch_calculate_empty_returns_empty() {
    let results = batch_calculate_next(&[]);
    assert!(results.is_empty());
}

#[test]
fn test_should_review_no_schedule_returns_true() {
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

#[test]
fn test_spaced_repetition_interval_calculation() {
    let outcomes = [(true, Some(1)), (true, Some(1)), (false, Some(0))];
    let results = batch_calculate_next(&outcomes);
    assert_eq!(results.len(), 3);
    assert_eq!(results[2].repetitions, 0);
}
