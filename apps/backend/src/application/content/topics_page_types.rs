use chrono::{DateTime, Utc};
use uuid::Uuid;

pub struct TopicWithMetrics {
    pub id: Uuid,
    pub name: String,
    pub chapter_id: Uuid,
    pub has_video: bool,
    pub has_quiz: bool,
    pub avg_recall: Option<f64>,
    pub practice_accuracy: Option<f64>,
    pub last_activity_at: Option<DateTime<Utc>>,
}

pub struct TopicSummaryData {
    pub chapter_name: String,
    pub total_topics: i64,
    pub published_topics: i64,
    pub draft_topics: i64,
    pub weak_topics: i64,
}

pub struct TopicInsightData {
    pub id: String,
    pub signal_type: String,
    pub title: String,
    pub description: String,
}

pub fn categorize_topic_insights(metrics: &[TopicWithMetrics]) -> Vec<TopicInsightData> {
    let mut insights = Vec::new();

    let mut weak_recall_topics: Vec<&str> = Vec::new();
    let mut low_accuracy_topics: Vec<&str> = Vec::new();
    let mut no_video_topics: Vec<&str> = Vec::new();
    let mut no_quiz_topics: Vec<&str> = Vec::new();

    for topic in metrics {
        if let Some(recall) = topic.avg_recall
            && recall < 0.5
        {
            weak_recall_topics.push(topic.name.as_str());
        }
        if let Some(accuracy) = topic.practice_accuracy
            && accuracy < 0.5
        {
            low_accuracy_topics.push(topic.name.as_str());
        }
        if !topic.has_video {
            no_video_topics.push(topic.name.as_str());
        }
        if !topic.has_quiz {
            no_quiz_topics.push(topic.name.as_str());
        }
    }

    if !weak_recall_topics.is_empty() {
        insights.push(TopicInsightData {
            id: "weak-recall".to_string(),
            signal_type: "warning".to_string(),
            title: "Topics with low recall".to_string(),
            description: format!(
                "{} have significantly lower recall rates.",
                weak_recall_topics.join(", ")
            ),
        });
    }

    if !low_accuracy_topics.is_empty() {
        insights.push(TopicInsightData {
            id: "low-accuracy".to_string(),
            signal_type: "negative".to_string(),
            title: "Practice accuracy concerns".to_string(),
            description: format!(
                "{} show practice accuracy below 50%.",
                low_accuracy_topics.join(", ")
            ),
        });
    }

    if !no_video_topics.is_empty() {
        insights.push(TopicInsightData {
            id: "no-video".to_string(),
            signal_type: "warning".to_string(),
            title: "Topics missing video content".to_string(),
            description: format!(
                "{} have no video content uploaded.",
                no_video_topics.join(", ")
            ),
        });
    }

    if !no_quiz_topics.is_empty() {
        insights.push(TopicInsightData {
            id: "no-quiz".to_string(),
            signal_type: "info".to_string(),
            title: "Topics without quizzes".to_string(),
            description: format!(
                "{} have no assessment quizzes configured.",
                no_quiz_topics.join(", ")
            ),
        });
    }

    if metrics.iter().all(|t| t.has_video && t.has_quiz) {
        insights.push(TopicInsightData {
            id: "all-ready".to_string(),
            signal_type: "positive".to_string(),
            title: "All topics fully equipped".to_string(),
            description:
                "Every topic in this chapter has both video content and assessment quizzes."
                    .to_string(),
        });
    }

    if metrics.is_empty() {
        insights.push(TopicInsightData {
            id: "no-data".to_string(),
            signal_type: "info".to_string(),
            title: "No topic data available".to_string(),
            description: "No topics have been created for this chapter yet.".to_string(),
        });
    }

    let mut seen = std::collections::HashSet::new();
    insights.retain(|i| seen.insert(i.title.clone()));

    insights.truncate(6);

    insights
}
