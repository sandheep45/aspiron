use backend::http::handlers::chapters_page::derive_chapter_status;

#[test]
fn derive_status_healthy() {
    assert_eq!(derive_chapter_status(Some(0.8), Some(0.75)), "healthy");
}

#[test]
fn derive_status_needs_attention() {
    assert_eq!(
        derive_chapter_status(Some(0.6), Some(0.65)),
        "needs_attention"
    );
}

#[test]
fn derive_status_critical() {
    assert_eq!(derive_chapter_status(Some(0.4), Some(0.9)), "critical");
}

#[test]
fn derive_status_boundary_needs_attention() {
    assert_eq!(
        derive_chapter_status(Some(0.5), Some(0.5)),
        "needs_attention"
    );
}

#[test]
fn derive_status_boundary_healthy() {
    assert_eq!(derive_chapter_status(Some(0.7), Some(0.7)), "healthy");
}

#[test]
fn derive_status_uses_recall_when_accuracy_none() {
    assert_eq!(derive_chapter_status(Some(0.55), None), "needs_attention");
}

#[test]
fn derive_status_uses_accuracy_when_recall_none() {
    assert_eq!(derive_chapter_status(None, Some(0.3)), "critical");
}

#[test]
fn derive_status_healthy_when_both_none() {
    assert_eq!(derive_chapter_status(None, None), "healthy");
}

#[test]
fn derive_status_uses_lower_of_recall_and_accuracy() {
    // recall high (0.9) but accuracy low (0.4) → min is 0.4 → critical
    assert_eq!(derive_chapter_status(Some(0.9), Some(0.4)), "critical");
    // accuracy high (0.95) but recall low (0.45) → min is 0.45 → critical
    assert_eq!(derive_chapter_status(Some(0.45), Some(0.95)), "critical");
}
