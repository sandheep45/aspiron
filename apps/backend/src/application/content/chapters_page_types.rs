use chrono::{DateTime, Utc};
use uuid::Uuid;

pub struct ChapterWithMetrics {
    pub id: Uuid,
    pub name: String,
    pub subject_id: Uuid,
    pub published_topics: i64,
    pub total_topics: i64,
    pub coverage: f64,
    pub avg_recall: Option<f64>,
    pub practice_accuracy: Option<f64>,
    pub last_activity_at: Option<DateTime<Utc>>,
}

pub struct ChapterSummaryData {
    pub subject_name: String,
    pub total_chapters: i64,
    pub published_topics: i64,
    pub draft_topics: i64,
    pub chapters_needing_attention: i64,
}

pub struct ChapterInsightData {
    pub id: String,
    pub signal_type: String,
    pub title: String,
    pub description: String,
}

pub fn categorize_chapter_insights(metrics: &[ChapterWithMetrics]) -> Vec<ChapterInsightData> {
    let mut insights = Vec::new();

    let mut weak_recall_chapters: Vec<&str> = Vec::new();
    let mut strong_recall_chapters: Vec<&str> = Vec::new();
    let mut low_coverage_chapters: Vec<&str> = Vec::new();
    let mut high_coverage_chapters: Vec<&str> = Vec::new();
    let mut low_accuracy_chapters: Vec<&str> = Vec::new();

    for chapter in metrics {
        if let Some(recall) = chapter.avg_recall {
            if recall < 0.5 {
                weak_recall_chapters.push(chapter.name.as_str());
            } else if recall >= 0.8 {
                strong_recall_chapters.push(chapter.name.as_str());
            }
        }
        if chapter.coverage < 50.0 {
            low_coverage_chapters.push(chapter.name.as_str());
        } else if chapter.coverage >= 90.0 {
            high_coverage_chapters.push(chapter.name.as_str());
        }
        if let Some(accuracy) = chapter.practice_accuracy
            && accuracy < 0.5
        {
            low_accuracy_chapters.push(chapter.name.as_str());
        }
    }

    if !weak_recall_chapters.is_empty() {
        insights.push(ChapterInsightData {
            id: "weak-recall".to_string(),
            signal_type: "warning".to_string(),
            title: "Chapters with low recall".to_string(),
            description: format!(
                "{} have significantly lower recall rates than other chapters.",
                weak_recall_chapters.join(", ")
            ),
        });
    }

    if !low_accuracy_chapters.is_empty() {
        insights.push(ChapterInsightData {
            id: "low-accuracy".to_string(),
            signal_type: "negative".to_string(),
            title: "Practice accuracy concerns".to_string(),
            description: format!(
                "{} show practice accuracy below 50%, indicating students struggle with application.",
                low_accuracy_chapters.join(", ")
            ),
        });
    }

    if !low_coverage_chapters.is_empty() {
        insights.push(ChapterInsightData {
            id: "low-coverage".to_string(),
            signal_type: "warning".to_string(),
            title: "Content gaps detected".to_string(),
            description: format!(
                "{} have less than 50% topic coverage. Consider adding more topics.",
                low_coverage_chapters.join(", ")
            ),
        });
    }

    if !strong_recall_chapters.is_empty() {
        insights.push(ChapterInsightData {
            id: "strong-recall".to_string(),
            signal_type: "positive".to_string(),
            title: "Strong recall chapters".to_string(),
            description: format!(
                "{} maintain strong recall rates above 80%.",
                strong_recall_chapters.join(", ")
            ),
        });
    }

    if !high_coverage_chapters.is_empty() {
        insights.push(ChapterInsightData {
            id: "high-coverage".to_string(),
            signal_type: "positive".to_string(),
            title: "Full coverage achieved".to_string(),
            description: format!(
                "{} have 90% or higher topic coverage.",
                high_coverage_chapters.join(", ")
            ),
        });
    }

    if !metrics.is_empty() && metrics.iter().all(|c| c.coverage >= 80.0) {
        insights.push(ChapterInsightData {
            id: "all-healthy".to_string(),
            signal_type: "positive".to_string(),
            title: "All chapters well-covered".to_string(),
            description:
                "Every chapter in this subject has at least 80% topic coverage. Great progress!"
                    .to_string(),
        });
    }

    if metrics.is_empty() {
        insights.push(ChapterInsightData {
            id: "no-data".to_string(),
            signal_type: "info".to_string(),
            title: "No chapter data available".to_string(),
            description: "No chapters have been created for this subject yet.".to_string(),
        });
    }

    // Deduplicate by title
    let mut seen = std::collections::HashSet::new();
    insights.retain(|i| seen.insert(i.title.clone()));

    // Limit to 6
    insights.truncate(6);

    insights
}
