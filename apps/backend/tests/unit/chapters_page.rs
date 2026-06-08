use backend::application::content::chapters_page_types::{
    ChapterWithMetrics, categorize_chapter_insights,
};
use backend::http::handlers::chapters_page::{
    apply_chapters_sorting, derive_chapter_status, recall_sort_key, status_sort_key,
};
use backend::http::payloads::chapters_page::ChaptersQueryParams;
use backend::http::responses::chapters_page::ChapterItemResponse;
use chrono::Utc;
use uuid::Uuid;

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

// ---- recall_sort_key ----

#[test]
fn recall_sort_key_strong() {
    assert_eq!(recall_sort_key("strong"), 3);
}

#[test]
fn recall_sort_key_medium() {
    assert_eq!(recall_sort_key("medium"), 2);
}

#[test]
fn recall_sort_key_weak() {
    assert_eq!(recall_sort_key("weak"), 1);
}

#[test]
fn recall_sort_key_unknown() {
    assert_eq!(recall_sort_key("unknown"), 0);
}

#[test]
fn recall_sort_key_case_sensitive() {
    assert_eq!(recall_sort_key("Strong"), 0);
}

// ---- status_sort_key ----

#[test]
fn status_sort_key_healthy() {
    assert_eq!(status_sort_key("healthy"), 3);
}

#[test]
fn status_sort_key_needs_attention() {
    assert_eq!(status_sort_key("needs_attention"), 2);
}

#[test]
fn status_sort_key_critical() {
    assert_eq!(status_sort_key("critical"), 1);
}

#[test]
fn status_sort_key_unknown() {
    assert_eq!(status_sort_key("unknown"), 0);
}

#[test]
fn status_sort_key_case_sensitive() {
    assert_eq!(status_sort_key("Healthy"), 0);
}

// ---- apply_chapters_sorting ----

fn make_params(
    search: Option<&str>,
    sort_by: Option<&str>,
    sort_order: Option<&str>,
    page: Option<i64>,
    limit: Option<i64>,
) -> ChaptersQueryParams {
    ChaptersQueryParams {
        search: search.map(|s| s.to_string()),
        sort_by: sort_by.map(|s| s.to_string()),
        sort_order: sort_order.map(|s| s.to_string()),
        page,
        limit,
    }
}

fn make_item(
    id: &str,
    name: &str,
    coverage: f64,
    avg_recall: &str,
    accuracy: f64,
    status: &str,
) -> ChapterItemResponse {
    ChapterItemResponse {
        id: id.to_string(),
        name: name.to_string(),
        published_topics: 0,
        total_topics: 0,
        coverage,
        avg_recall: avg_recall.to_string(),
        practice_accuracy: accuracy,
        status: status.to_string(),
        last_updated: "Never".to_string(),
    }
}

fn a(name: &str, coverage: f64, recall: &str, accuracy: f64, status: &str) -> ChapterItemResponse {
    make_item(name, name, coverage, recall, accuracy, status)
}

#[test]
fn sort_noop_when_no_sort_by() {
    let items = vec![
        a("B", 50.0, "medium", 0.0, "healthy"),
        a("A", 100.0, "strong", 0.0, "healthy"),
    ];
    let params = make_params(None, None, None, None, None);
    let result = apply_chapters_sorting(items.clone(), &params);
    assert_eq!(result[0].id, "B");
    assert_eq!(result[1].id, "A");
}

#[test]
fn sort_coverage_desc_default() {
    let items = vec![
        a("low", 10.0, "medium", 0.0, "healthy"),
        a("high", 90.0, "strong", 0.0, "healthy"),
    ];
    let params = make_params(None, Some("coverage"), None, None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].id, "high");
    assert_eq!(result[1].id, "low");
}

#[test]
fn sort_coverage_asc() {
    let items = vec![
        a("high", 90.0, "strong", 0.0, "healthy"),
        a("low", 10.0, "medium", 0.0, "healthy"),
    ];
    let params = make_params(None, Some("coverage"), Some("asc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].id, "low");
    assert_eq!(result[1].id, "high");
}

#[test]
fn sort_recall_desc() {
    let items = vec![
        a("c", 50.0, "medium", 0.0, "healthy"),
        a("a", 50.0, "strong", 0.0, "healthy"),
        a("b", 50.0, "weak", 0.0, "healthy"),
    ];
    let params = make_params(None, Some("recall"), Some("desc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].avg_recall, "strong");
    assert_eq!(result[1].avg_recall, "medium");
    assert_eq!(result[2].avg_recall, "weak");
}

#[test]
fn sort_recall_asc() {
    let items = vec![
        a("c", 50.0, "medium", 0.0, "healthy"),
        a("a", 50.0, "strong", 0.0, "healthy"),
        a("b", 50.0, "weak", 0.0, "healthy"),
    ];
    let params = make_params(None, Some("recall"), Some("asc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].avg_recall, "weak");
    assert_eq!(result[1].avg_recall, "medium");
    assert_eq!(result[2].avg_recall, "strong");
}

#[test]
fn sort_accuracy_desc() {
    let items = vec![
        a("b", 50.0, "medium", 30.0, "healthy"),
        a("a", 50.0, "medium", 90.0, "healthy"),
    ];
    let params = make_params(None, Some("accuracy"), Some("desc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].id, "a");
    assert_eq!(result[1].id, "b");
}

#[test]
fn sort_accuracy_asc() {
    let items = vec![
        a("a", 50.0, "medium", 90.0, "healthy"),
        a("b", 50.0, "medium", 30.0, "healthy"),
    ];
    let params = make_params(None, Some("accuracy"), Some("asc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].id, "b");
    assert_eq!(result[1].id, "a");
}

#[test]
fn sort_status_desc() {
    let items = vec![
        a("c", 50.0, "medium", 0.0, "critical"),
        a("a", 50.0, "medium", 0.0, "healthy"),
        a("b", 50.0, "medium", 0.0, "needs_attention"),
    ];
    let params = make_params(None, Some("status"), Some("desc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].status, "healthy");
    assert_eq!(result[1].status, "needs_attention");
    assert_eq!(result[2].status, "critical");
}

#[test]
fn sort_status_asc() {
    let items = vec![
        a("a", 50.0, "medium", 0.0, "healthy"),
        a("c", 50.0, "medium", 0.0, "critical"),
        a("b", 50.0, "medium", 0.0, "needs_attention"),
    ];
    let params = make_params(None, Some("status"), Some("asc"), None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result[0].status, "critical");
    assert_eq!(result[1].status, "needs_attention");
    assert_eq!(result[2].status, "healthy");
}

#[test]
fn sort_unknown_field_is_noop() {
    let items = vec![
        a("B", 50.0, "medium", 0.0, "healthy"),
        a("A", 100.0, "strong", 0.0, "healthy"),
    ];
    let params = make_params(None, Some("nonexistent"), Some("desc"), None, None);
    let result = apply_chapters_sorting(items.clone(), &params);
    assert_eq!(result[0].id, "B");
    assert_eq!(result[1].id, "A");
}

#[test]
fn search_filters_by_name() {
    let items = vec![
        a("Algebra Basics", 50.0, "medium", 0.0, "healthy"),
        a("Calculus Intro", 50.0, "medium", 0.0, "healthy"),
        a("Algebra II", 50.0, "medium", 0.0, "healthy"),
    ];
    let params = make_params(Some("algebra"), None, None, None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].name, "Algebra Basics");
    assert_eq!(result[1].name, "Algebra II");
}

#[test]
fn search_case_insensitive() {
    let items = vec![
        a("ALGEBRA", 50.0, "medium", 0.0, "healthy"),
        a("algebra", 50.0, "medium", 0.0, "healthy"),
        a("Geometry", 50.0, "medium", 0.0, "healthy"),
    ];
    let params = make_params(Some("algebra"), None, None, None, None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result.len(), 2);
}

#[test]
fn search_no_match_returns_empty() {
    let items = vec![a("Algebra", 50.0, "medium", 0.0, "healthy")];
    let params = make_params(Some("zzzzz"), None, None, None, None);
    let result = apply_chapters_sorting(items, &params);
    assert!(result.is_empty());
}

#[test]
fn pagination_default_limit() {
    let items: Vec<ChapterItemResponse> = (0..20)
        .map(|i| a(&format!("Chapter {}", i), 50.0, "medium", 0.0, "healthy"))
        .collect();
    let params = make_params(None, None, None, Some(1), None);
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result.len(), 10);
    assert_eq!(result[0].id, "Chapter 0");
    assert_eq!(result[9].id, "Chapter 9");
}

#[test]
fn pagination_page_2() {
    let items: Vec<ChapterItemResponse> = (0..25)
        .map(|i| a(&format!("Chapter {}", i), 50.0, "medium", 0.0, "healthy"))
        .collect();
    let params = make_params(None, None, None, Some(2), Some(10));
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result.len(), 10);
    assert_eq!(result[0].id, "Chapter 10");
    assert_eq!(result[9].id, "Chapter 19");
}

#[test]
fn pagination_out_of_range_returns_empty() {
    let items: Vec<ChapterItemResponse> = (0..5)
        .map(|i| a(&format!("Chapter {}", i), 50.0, "medium", 0.0, "healthy"))
        .collect();
    let params = make_params(None, None, None, Some(10), Some(10));
    let result = apply_chapters_sorting(items, &params);
    assert!(result.is_empty());
}

#[test]
fn pagination_page_clamped_min_1() {
    let items: Vec<ChapterItemResponse> = (0..5)
        .map(|i| a(&format!("Chapter {}", i), 50.0, "medium", 0.0, "healthy"))
        .collect();
    let params = make_params(None, None, None, Some(0), Some(10));
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result.len(), 5);
}

#[test]
fn pagination_limit_clamped_min_1() {
    let items: Vec<ChapterItemResponse> = (0..3)
        .map(|i| a(&format!("Chapter {}", i), 50.0, "medium", 0.0, "healthy"))
        .collect();
    let params = make_params(None, None, None, None, Some(0));
    let result = apply_chapters_sorting(items, &params);
    assert_eq!(result.len(), 1);
}

#[test]
fn search_and_sort_and_pagination_combined() {
    let items = vec![
        a("Alpha", 90.0, "strong", 95.0, "healthy"),
        a("Alpha Prime", 30.0, "weak", 40.0, "critical"),
        a("Beta", 50.0, "medium", 50.0, "needs_attention"),
        a("Gamma", 80.0, "strong", 70.0, "healthy"),
    ];
    let params = make_params(
        Some("alpha"),
        Some("coverage"),
        Some("asc"),
        Some(1),
        Some(10),
    );
    let result = apply_chapters_sorting(items, &params);
    // filtered to "Alpha", "Alpha Prime", sorted by coverage asc
    assert_eq!(result.len(), 2);
    assert_eq!(result[0].name, "Alpha Prime");
    assert_eq!(result[0].coverage, 30.0);
    assert_eq!(result[1].name, "Alpha");
    assert_eq!(result[1].coverage, 90.0);
}

// ---- categorize_chapter_insights ----

fn make_chapter(
    name: &str,
    coverage: f64,
    recall: Option<f64>,
    accuracy: Option<f64>,
) -> ChapterWithMetrics {
    ChapterWithMetrics {
        id: Uuid::new_v4(),
        name: name.to_string(),
        subject_id: Uuid::new_v4(),
        published_topics: 0,
        total_topics: 0,
        coverage,
        avg_recall: recall,
        practice_accuracy: accuracy,
        last_activity_at: Some(Utc::now()),
    }
}

#[test]
fn insights_weak_recall() {
    let metrics = vec![
        make_chapter("Chapter A", 90.0, Some(0.3), Some(0.8)),
        make_chapter("Chapter B", 80.0, Some(0.9), Some(0.8)),
    ];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.title == "Chapters with low recall"));
    let item = result
        .iter()
        .find(|i| i.title == "Chapters with low recall")
        .unwrap();
    assert_eq!(item.signal_type, "warning");
    assert_eq!(item.id, "weak-recall");
}

#[test]
fn insights_weak_recall_no_false_positive() {
    let metrics = vec![
        make_chapter("A", 90.0, Some(0.6), Some(0.8)),
        make_chapter("B", 80.0, Some(0.9), Some(0.8)),
    ];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().all(|i| i.title != "Chapters with low recall"));
}

#[test]
fn insights_low_accuracy() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.8), Some(0.3))];
    let result = categorize_chapter_insights(&metrics);
    assert!(
        result
            .iter()
            .any(|i| i.title == "Practice accuracy concerns")
    );
    let item = result
        .iter()
        .find(|i| i.title == "Practice accuracy concerns")
        .unwrap();
    assert_eq!(item.signal_type, "negative");
    assert_eq!(item.id, "low-accuracy");
}

#[test]
fn insights_low_accuracy_no_false_positive() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.8), Some(0.6))];
    let result = categorize_chapter_insights(&metrics);
    assert!(
        result
            .iter()
            .all(|i| i.title != "Practice accuracy concerns")
    );
}

#[test]
fn insights_low_coverage() {
    let metrics = vec![make_chapter("A", 30.0, Some(0.8), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.title == "Content gaps detected"));
    let item = result
        .iter()
        .find(|i| i.title == "Content gaps detected")
        .unwrap();
    assert_eq!(item.signal_type, "warning");
    assert_eq!(item.id, "low-coverage");
}

#[test]
fn insights_low_coverage_no_false_positive() {
    let metrics = vec![make_chapter("A", 60.0, Some(0.8), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().all(|i| i.title != "Content gaps detected"));
}

#[test]
fn insights_strong_recall() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.9), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.title == "Strong recall chapters"));
    let item = result
        .iter()
        .find(|i| i.title == "Strong recall chapters")
        .unwrap();
    assert_eq!(item.signal_type, "positive");
    assert_eq!(item.id, "strong-recall");
}

#[test]
fn insights_high_coverage() {
    let metrics = vec![make_chapter("A", 95.0, Some(0.5), Some(0.5))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.title == "Full coverage achieved"));
    let item = result
        .iter()
        .find(|i| i.title == "Full coverage achieved")
        .unwrap();
    assert_eq!(item.signal_type, "positive");
    assert_eq!(item.id, "high-coverage");
}

#[test]
fn insights_all_healthy_signal() {
    let metrics = vec![
        make_chapter("A", 85.0, Some(0.8), Some(0.8)),
        make_chapter("B", 90.0, Some(0.7), Some(0.7)),
    ];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.id == "all-healthy"));
    let item = result.iter().find(|i| i.id == "all-healthy").unwrap();
    assert_eq!(item.signal_type, "positive");
    assert_eq!(item.title, "All chapters well-covered");
}

#[test]
fn insights_all_healthy_not_emitted_when_below_80() {
    let metrics = vec![make_chapter("A", 70.0, Some(0.8), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().all(|i| i.id != "all-healthy"));
}

#[test]
fn insights_no_data_when_empty() {
    let result = categorize_chapter_insights(&[]);
    assert!(result.iter().any(|i| i.id == "no-data"));
    let item = result.iter().find(|i| i.id == "no-data").unwrap();
    assert_eq!(item.signal_type, "info");
    assert_eq!(item.title, "No chapter data available");
}

#[test]
fn insights_empty_metrics_still_produces_no_data() {
    let result = categorize_chapter_insights(&[]);
    assert_eq!(result.len(), 1);
    assert_eq!(result[0].id, "no-data");
}

#[test]
fn insights_multiple_types_produced() {
    let metrics = vec![
        make_chapter("Weak", 30.0, Some(0.3), Some(0.8)),
        make_chapter("Good", 95.0, Some(0.9), Some(0.8)),
    ];
    let result = categorize_chapter_insights(&metrics);
    let ids: Vec<&str> = result.iter().map(|i| i.id.as_str()).collect();
    assert!(ids.contains(&"weak-recall"));
    assert!(ids.contains(&"low-coverage"));
    assert!(ids.contains(&"strong-recall"));
    assert!(ids.contains(&"high-coverage"));
}

#[test]
fn insights_deduplicates_by_title() {
    let metrics = vec![
        make_chapter("A", 95.0, Some(0.9), Some(0.8)),
        make_chapter("B", 92.0, Some(0.85), Some(0.9)),
    ];
    let result = categorize_chapter_insights(&metrics);
    let strong_recall_count = result
        .iter()
        .filter(|i| i.title == "Strong recall chapters")
        .count();
    assert_eq!(strong_recall_count, 1);
}

#[test]
fn insights_max_six() {
    let metrics = vec![
        make_chapter("WeakRecall", 30.0, Some(0.3), Some(0.3)),
        make_chapter("BothLow", 20.0, Some(0.4), Some(0.4)),
        make_chapter("HighCoverage", 95.0, Some(0.9), Some(0.9)),
    ];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.len() <= 6);
}

#[test]
fn insights_accuracy_below_0_5_only_with_recall_above_threshold() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.8), Some(0.49))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.id == "low-accuracy"));
}

#[test]
fn insights_accuracy_0_5_does_not_trigger_low_accuracy() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.8), Some(0.5))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().all(|i| i.id != "low-accuracy"));
}

#[test]
fn insights_boundary_recall_0_5_not_weak() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.5), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().all(|i| i.id != "weak-recall"));
}

#[test]
fn insights_boundary_recall_0_8_is_strong() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.8), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.id == "strong-recall"));
}

#[test]
fn insights_boundary_coverage_50_not_low() {
    let metrics = vec![make_chapter("A", 50.0, Some(0.8), Some(0.8))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().all(|i| i.id != "low-coverage"));
}

#[test]
fn insights_boundary_coverage_90_is_high() {
    let metrics = vec![make_chapter("A", 90.0, Some(0.5), Some(0.5))];
    let result = categorize_chapter_insights(&metrics);
    assert!(result.iter().any(|i| i.id == "high-coverage"));
}
