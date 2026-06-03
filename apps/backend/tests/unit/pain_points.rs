use backend::application::insights::pain_points::{
    classify_recall_strength, classify_severity, classify_status,
};
use backend::http::responses::insights::{IssueSeverity, RecallStrength, StatusTrend};

#[test]
fn classify_recall_strength_weak_below_40() {
    assert_eq!(classify_recall_strength(0.0), RecallStrength::Weak);
    assert_eq!(classify_recall_strength(39.9), RecallStrength::Weak);
}

#[test]
fn classify_recall_strength_boundary_40() {
    assert_eq!(classify_recall_strength(40.0), RecallStrength::Medium);
}

#[test]
fn classify_recall_strength_medium_40_to_70() {
    assert_eq!(classify_recall_strength(40.0), RecallStrength::Medium);
    assert_eq!(classify_recall_strength(69.9), RecallStrength::Medium);
}

#[test]
fn classify_recall_strength_boundary_70() {
    assert_eq!(classify_recall_strength(70.0), RecallStrength::Strong);
}

#[test]
fn classify_recall_strength_strong_70_and_above() {
    assert_eq!(classify_recall_strength(70.0), RecallStrength::Strong);
    assert_eq!(classify_recall_strength(100.0), RecallStrength::Strong);
}

#[test]
fn classify_severity_critical() {
    assert_eq!(classify_severity(24.9, 5), IssueSeverity::Critical);
    assert_eq!(classify_severity(10.0, 10), IssueSeverity::Critical);
}

#[test]
fn classify_severity_critical_boundary() {
    assert_eq!(classify_severity(25.0, 5), IssueSeverity::High);
    assert_eq!(classify_severity(24.9, 4), IssueSeverity::High);
}

#[test]
fn classify_severity_high_medium_low() {
    assert_eq!(classify_severity(39.9, 1), IssueSeverity::High);
    assert_eq!(classify_severity(59.9, 1), IssueSeverity::Medium);
    assert_eq!(classify_severity(60.0, 1), IssueSeverity::Low);
}

#[test]
fn classify_status_all_variants() {
    assert_eq!(classify_status(29.9), StatusTrend::Degrading);
    assert_eq!(classify_status(30.0), StatusTrend::Stable);
    assert_eq!(classify_status(59.9), StatusTrend::Stable);
    assert_eq!(classify_status(60.0), StatusTrend::Improving);
}

#[test]
fn classify_edge_values() {
    assert_eq!(classify_recall_strength(0.0), RecallStrength::Weak);
    assert_eq!(classify_recall_strength(100.0), RecallStrength::Strong);
    assert_eq!(classify_severity(0.0, 100), IssueSeverity::Critical);
    assert_eq!(classify_severity(100.0, 0), IssueSeverity::Low);
    assert_eq!(classify_status(0.0), StatusTrend::Degrading);
    assert_eq!(classify_status(100.0), StatusTrend::Improving);
}
