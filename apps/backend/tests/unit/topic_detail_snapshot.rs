use backend::http::responses::topic_detail::{
    TopicActionResponse, TopicComponentResponse, TopicIssueResponse, TopicOverviewResponse,
    TopicTrendsResponse, TrendDataPointResponse,
};

#[test]
fn topic_overview_weak() {
    let response = TopicOverviewResponse {
        recall_strength: "weak".to_string(),
        practice_accuracy: 35.5,
        dropoff_indicator: "high".to_string(),
        engagement_trend: "declining".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-overview-weak", value);
}

#[test]
fn topic_overview_strong() {
    let response = TopicOverviewResponse {
        recall_strength: "strong".to_string(),
        practice_accuracy: 92.0,
        dropoff_indicator: "low".to_string(),
        engagement_trend: "growing".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-overview-strong", value);
}

#[test]
fn topic_issue_critical() {
    let response = TopicIssueResponse {
        id: "accuracy-low".to_string(),
        title: "Practice accuracy critically low".to_string(),
        severity: "critical".to_string(),
        description: "Average practice accuracy is 42% — students are struggling with application"
            .to_string(),
        recommendation: "Review question difficulty and provide step-by-step solution walkthroughs"
            .to_string(),
        action_label: "View Practice Data".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-issue-critical", value);
}

#[test]
fn topic_issue_high() {
    let response = TopicIssueResponse {
        id: "recall-weak".to_string(),
        title: "Recall drops significantly after 5 days".to_string(),
        severity: "high".to_string(),
        description: "Students show 37% decline in recall accuracy within the first week"
            .to_string(),
        recommendation: "Schedule revision sessions at increasing intervals to reinforce retention"
            .to_string(),
        action_label: "Schedule Revision".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-issue-high", value);
}

#[test]
fn topic_issue_medium() {
    let response = TopicIssueResponse {
        id: "missing-video".to_string(),
        title: "No video content available".to_string(),
        severity: "medium".to_string(),
        description:
            "This topic has no video lecture — video content significantly improves engagement"
                .to_string(),
        recommendation: "Upload a video lecture to support visual learners".to_string(),
        action_label: "Open Content Review".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-issue-medium", value);
}

#[test]
fn topic_issue_low() {
    let response = TopicIssueResponse {
        id: "no-issues".to_string(),
        title: "No significant issues detected".to_string(),
        severity: "low".to_string(),
        description: "This topic appears to be performing well across all metrics".to_string(),
        recommendation: "Continue monitoring and consider adding enrichment content".to_string(),
        action_label: "Schedule Revision".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-issue-low", value);
}

#[test]
fn topic_component_published() {
    let response = TopicComponentResponse {
        id: "video".to_string(),
        name: "Video Lecture".to_string(),
        status: "published".to_string(),
        performance: "62% completion rate".to_string(),
        action: "Manage Video".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-component-published", value);
}

#[test]
fn topic_component_draft() {
    let response = TopicComponentResponse {
        id: "assignments".to_string(),
        name: "Assignments".to_string(),
        status: "draft".to_string(),
        performance: "Not assigned".to_string(),
        action: "Create Assignment".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-component-draft", value);
}

#[test]
fn topic_action_full() {
    let response = TopicActionResponse {
        id: "preview-as-student".to_string(),
        label: "Preview As Student".to_string(),
        description: Some("View the topic from a student's perspective".to_string()),
        icon: Some("eye".to_string()),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-action-full", value);
}

#[test]
fn topic_action_minimal() {
    let response = TopicActionResponse {
        id: "simple-action".to_string(),
        label: "Simple Action".to_string(),
        description: None,
        icon: None,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-action-minimal", value);
}

#[test]
fn topic_trends_with_data() {
    let response = TopicTrendsResponse {
        recall_trend: vec![
            TrendDataPointResponse {
                date: "2026-01-01".to_string(),
                value: 72.0,
            },
            TrendDataPointResponse {
                date: "2026-01-08".to_string(),
                value: 58.0,
            },
            TrendDataPointResponse {
                date: "2026-01-15".to_string(),
                value: 45.0,
            },
        ],
        practice_accuracy_trend: vec![
            TrendDataPointResponse {
                date: "2026-01-05".to_string(),
                value: 55.0,
            },
            TrendDataPointResponse {
                date: "2026-01-12".to_string(),
                value: 48.0,
            },
        ],
        engagement_trend: vec![
            TrendDataPointResponse {
                date: "2026-01-01".to_string(),
                value: 24.0,
            },
            TrendDataPointResponse {
                date: "2026-01-08".to_string(),
                value: 18.0,
            },
        ],
        completion_trend: vec![TrendDataPointResponse {
            date: "2026-01-05".to_string(),
            value: 100.0,
        }],
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("topic-trends-with-data", value);
}

#[test]
fn trend_data_point() {
    let response = TrendDataPointResponse {
        date: "2026-01-15".to_string(),
        value: 65.0,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("trend-data-point", value);
}
