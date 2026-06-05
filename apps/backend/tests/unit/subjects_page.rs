use backend::http::handlers::subjects_page::derive_status;

#[test]
fn derive_status_healthy() {
    assert_eq!(derive_status(Some(0.8), Some(0.75)), "Healthy");
}

#[test]
fn derive_status_needs_attention() {
    assert_eq!(derive_status(Some(0.6), Some(0.65)), "Needs Attention");
}

#[test]
fn derive_status_critical() {
    assert_eq!(derive_status(Some(0.4), Some(0.9)), "Critical");
}

#[test]
fn derive_status_boundary_needs_attention() {
    assert_eq!(derive_status(Some(0.5), Some(0.5)), "Needs Attention");
}

#[test]
fn derive_status_boundary_healthy() {
    assert_eq!(derive_status(Some(0.7), Some(0.7)), "Healthy");
}

#[test]
fn derive_status_uses_recall_when_accuracy_none() {
    assert_eq!(derive_status(Some(0.55), None), "Needs Attention");
}

#[test]
fn derive_status_uses_accuracy_when_recall_none() {
    assert_eq!(derive_status(None, Some(0.3)), "Critical");
}

#[test]
fn derive_status_healthy_when_both_none() {
    assert_eq!(derive_status(None, None), "Healthy");
}
