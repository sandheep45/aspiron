use backend::http::handlers::recall_insights::{
    derive_memory_decay, derive_mismatch_alert, derive_overall_status, derive_recall_status,
};
use backend::http::responses::recall_insights::RecallStatus;

// ---------------------------------------------------------------------------
// derive_recall_status
// ---------------------------------------------------------------------------

#[test]
fn recall_status_returns_remembered_above_70_percent() {
    assert_eq!(derive_recall_status(0.7), RecallStatus::Remembered);
    assert_eq!(derive_recall_status(0.85), RecallStatus::Remembered);
    assert_eq!(derive_recall_status(1.0), RecallStatus::Remembered);
}

#[test]
fn recall_status_returns_partial_between_40_and_70_percent() {
    assert_eq!(derive_recall_status(0.4), RecallStatus::Partial);
    assert_eq!(derive_recall_status(0.55), RecallStatus::Partial);
    assert_eq!(derive_recall_status(0.69), RecallStatus::Partial);
}

#[test]
fn recall_status_returns_forgotten_below_40_percent() {
    assert_eq!(derive_recall_status(0.0), RecallStatus::Forgotten);
    assert_eq!(derive_recall_status(0.2), RecallStatus::Forgotten);
    assert_eq!(derive_recall_status(0.39), RecallStatus::Forgotten);
}

// ---------------------------------------------------------------------------
// derive_memory_decay
// ---------------------------------------------------------------------------

#[test]
fn memory_decay_returns_stable_above_70() {
    assert_eq!(derive_memory_decay(70.0), "stable");
    assert_eq!(derive_memory_decay(85.0), "stable");
    assert_eq!(derive_memory_decay(100.0), "stable");
}

#[test]
fn memory_decay_returns_degrading_between_45_and_70() {
    assert_eq!(derive_memory_decay(45.0), "degrading");
    assert_eq!(derive_memory_decay(55.0), "degrading");
    assert_eq!(derive_memory_decay(69.9), "degrading");
}

#[test]
fn memory_decay_returns_critical_below_45() {
    assert_eq!(derive_memory_decay(0.0), "critical");
    assert_eq!(derive_memory_decay(30.0), "critical");
    assert_eq!(derive_memory_decay(44.9), "critical");
}

// ---------------------------------------------------------------------------
// derive_mismatch_alert
// ---------------------------------------------------------------------------

#[test]
fn mismatch_alert_returns_alert_for_high_confidence_low_accuracy() {
    assert_eq!(
        derive_mismatch_alert(0.7, 0.39),
        Some("High Confidence, Low Accuracy".to_string())
    );
    assert_eq!(
        derive_mismatch_alert(0.9, 0.0),
        Some("High Confidence, Low Accuracy".to_string())
    );
}

#[test]
fn mismatch_alert_returns_alert_for_low_confidence_high_accuracy() {
    assert_eq!(
        derive_mismatch_alert(0.29, 0.7),
        Some("Low Confidence, High Accuracy".to_string())
    );
    assert_eq!(
        derive_mismatch_alert(0.0, 1.0),
        Some("Low Confidence, High Accuracy".to_string())
    );
}

#[test]
fn mismatch_alert_returns_none_for_normal_confidence_accuracy() {
    assert_eq!(derive_mismatch_alert(0.5, 0.5), None);
    assert_eq!(derive_mismatch_alert(0.7, 0.7), None);
    assert_eq!(derive_mismatch_alert(0.3, 0.4), None);
}

#[test]
fn mismatch_alert_returns_none_at_boundary_conditions() {
    assert_eq!(derive_mismatch_alert(0.7, 0.4), None);
    assert_eq!(derive_mismatch_alert(0.3, 0.7), None);
}

// ---------------------------------------------------------------------------
// derive_overall_status
// ---------------------------------------------------------------------------

#[test]
fn overall_status_returns_strong_above_70() {
    assert_eq!(derive_overall_status(70.0), "Strong Recall");
    assert_eq!(derive_overall_status(85.0), "Strong Recall");
    assert_eq!(derive_overall_status(100.0), "Strong Recall");
}

#[test]
fn overall_status_returns_medium_between_45_and_70() {
    assert_eq!(derive_overall_status(45.0), "Medium Recall");
    assert_eq!(derive_overall_status(60.0), "Medium Recall");
    assert_eq!(derive_overall_status(69.9), "Medium Recall");
}

#[test]
fn overall_status_returns_weak_below_45() {
    assert_eq!(derive_overall_status(0.0), "Weak Recall");
    assert_eq!(derive_overall_status(30.0), "Weak Recall");
    assert_eq!(derive_overall_status(44.9), "Weak Recall");
}
