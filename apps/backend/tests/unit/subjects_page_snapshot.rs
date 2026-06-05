use backend::http::responses::subjects_page::{
    SubjectPageItem, SubjectSignal, SubjectSignalType, SubjectSummary,
};

#[test]
fn subjects_page_items() {
    let response = vec![
        SubjectPageItem {
            id: "subj-1".to_string(),
            name: "Physics".to_string(),
            chapters_count: 12,
            topics_published: 59,
            coverage: 87.0,
            average_recall: Some(0.62),
            practice_accuracy: Some(0.74),
            status: "Needs Attention".to_string(),
        },
        SubjectPageItem {
            id: "subj-2".to_string(),
            name: "Chemistry".to_string(),
            chapters_count: 10,
            topics_published: 39,
            coverage: 72.0,
            average_recall: Some(0.81),
            practice_accuracy: Some(0.85),
            status: "Healthy".to_string(),
        },
    ];
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("subjects-page-items", value);
}

#[test]
fn subjects_page_summary() {
    let response = SubjectSummary {
        total_subjects: 4,
        total_topics: 250,
        published_topics: 193,
        topics_needing_attention: 18,
        descriptions: vec![
            "Physics, Chemistry, Mathematics, Biology".to_string(),
            "250 topics across 4 subjects".to_string(),
            "193 topics published and available".to_string(),
            "18 topics with low recall or accuracy".to_string(),
        ],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("subjects-page-summary", value);
}

#[test]
fn subjects_page_signals() {
    let response = vec![
        SubjectSignal {
            subject_name: "Physics".to_string(),
            message: "Physics has fastest recall decay".to_string(),
            signal_type: SubjectSignalType::Negative,
        },
        SubjectSignal {
            subject_name: "Chemistry".to_string(),
            message: "Chemistry has highest practice accuracy".to_string(),
            signal_type: SubjectSignalType::Positive,
        },
    ];
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("subjects-page-signals", value);
}
