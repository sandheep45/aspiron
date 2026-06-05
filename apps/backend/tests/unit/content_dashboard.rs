use backend::http::handlers::content_dashboard::classify_signals;

#[test]
fn classify_signals_empty_input_returns_empty_arrays() {
    let (highest, decay) = classify_signals(&[]);
    assert!(highest.is_empty());
    assert!(decay.is_empty());
}

#[test]
fn classify_signals_single_topic_returns_no_classification() {
    let (highest, decay) = classify_signals(&[("Topic A".to_string(), 50.0)]);
    assert!(highest.is_empty());
    assert!(decay.is_empty());
}

#[test]
fn classify_signals_two_equal_scores_return_no_classification() {
    let (highest, decay) =
        classify_signals(&[("Topic A".to_string(), 50.0), ("Topic B".to_string(), 50.0)]);
    assert!(highest.is_empty());
    assert!(decay.is_empty());
}

#[test]
fn classify_signals_three_varied_scores_classifies_correctly() {
    let scores = vec![
        ("Low".to_string(), 10.0),
        ("Mid".to_string(), 50.0),
        ("High".to_string(), 90.0),
    ];
    let (highest, decay) = classify_signals(&scores);

    assert_eq!(highest.len(), 1);
    assert_eq!(highest[0].topic, "High");
    assert_eq!(highest[0].score, Some(90.0));
    assert_eq!(highest[0].drop, None);

    assert_eq!(decay.len(), 1);
    assert_eq!(decay[0].topic, "Low");
    assert_eq!(decay[0].score, None);
    assert_eq!(decay[0].drop, Some(90.0));
}

#[test]
fn classify_signals_sorts_highest_recall_descending() {
    let scores = vec![
        ("A".to_string(), 20.0),
        ("B".to_string(), 95.0),
        ("C".to_string(), 15.0),
        ("D".to_string(), 85.0),
    ];
    let (highest, _) = classify_signals(&scores);

    assert_eq!(highest.len(), 2);
    assert_eq!(highest[0].topic, "B");
    assert_eq!(highest[1].topic, "D");
}

#[test]
fn classify_signals_sorts_fastest_decay_by_drop_descending() {
    let scores = vec![
        ("A".to_string(), 90.0),
        ("B".to_string(), 10.0),
        ("C".to_string(), 50.0),
        ("D".to_string(), 5.0),
    ];
    let (_, decay) = classify_signals(&scores);

    assert_eq!(decay.len(), 2);
    assert!(decay[0].drop.unwrap() >= decay[1].drop.unwrap());
}

#[test]
fn classify_signals_drop_is_100_minus_score() {
    let scores = vec![
        ("Strong".to_string(), 85.0),
        ("Weak".to_string(), 15.0),
        ("Average".to_string(), 50.0),
    ];
    let (_, decay) = classify_signals(&scores);

    assert_eq!(decay.len(), 1);
    assert_eq!(decay[0].drop, Some(85.0));
}
