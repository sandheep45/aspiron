use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub score: u32,
    pub percentile: f64,
    pub time_taken_minutes: u32,
    pub attempts_count: u32,
    pub mastery_level: String, // "beginner", "developing", "proficient", "advanced"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningProgressData {
    pub completion_percentage: u8,
    pub time_spent_minutes: u32,
    pub last_access_days_ago: u32,
    engagement_frequency: String, // "daily", "weekly", "monthly", "sporadic"
    streak_days: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreDistribution {
    pub mean: f64,
    pub std_dev: f64,
    pub min_score: u32,
    pub max_score: u32,
    pub grade_boundaries: std::collections::HashMap<char, u32>, // A, B, C, D, F
}

pub struct RealisticDataGenerator {
    rng: rand::rngs::StdRng,
}

impl RealisticDataGenerator {
    pub fn new(seed: u64) -> Self {
        Self {
            rng: rand::rngs::StdRng::seed_from_u64(seed),
        }
    }

    // Generate realistic assessment scores with bell curve distribution
    pub fn generate_score_distribution(&mut self, num_students: usize) -> Vec<u32> {
        let mean = 75.0; // Class average
        let std_dev = 15.0; // Standard deviation

        // Generate scores using Box-Muller transform for normal distribution
        (0..num_students)
            .map(|_| {
                let u1: f64 = self.rng.gen_range(0.001..0.999); // Avoid log(0)
                let u2: f64 = self.rng.gen_range(0.0..1.0);

                // Box-Muller transform
                let z0 = (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos();
                let raw_score: f64 = mean + z0 * std_dev;

                // Clamp to 0-100 and ensure integer
                raw_score.clamp(0.0, 100.0) as u32
            })
            .collect()
    }

    // Generate learning progress with realistic patterns
    pub fn generate_learning_progress(&mut self, student_type: &str) -> LearningProgressData {
        match student_type {
            "high_achiever" => LearningProgressData {
                completion_percentage: self.rng.gen_range(85..100),
                time_spent_minutes: self.rng.gen_range(180..300),
                last_access_days_ago: self.rng.gen_range(0..2),
                engagement_frequency: "daily".to_string(),
                streak_days: self.rng.gen_range(7..30),
            },
            "average_student" => LearningProgressData {
                completion_percentage: self.rng.gen_range(50..80),
                time_spent_minutes: self.rng.gen_range(60..180),
                last_access_days_ago: self.rng.gen_range(1..7),
                engagement_frequency: ["weekly", "daily"][self.rng.gen_range(0..2)].to_string(),
                streak_days: self.rng.gen_range(1..14),
            },
            "struggling_student" => LearningProgressData {
                completion_percentage: self.rng.gen_range(20..60),
                time_spent_minutes: self.rng.gen_range(20..90),
                last_access_days_ago: self.rng.gen_range(7..21),
                engagement_frequency: ["monthly", "sporadic"][self.rng.gen_range(0..2)].to_string(),
                streak_days: self.rng.gen_range(0..5),
            },
            "inactive_student" => LearningProgressData {
                completion_percentage: self.rng.gen_range(0..30), // 0-29%
                time_spent_minutes: self.rng.gen_range(0..30),
                last_access_days_ago: self.rng.gen_range(30..90),
                engagement_frequency: "sporadic".to_string(),
                streak_days: 0,
            },
            _ => self.generate_learning_progress("average_student"),
        }
    }

    // Generate performance metrics with realistic patterns
    pub fn generate_performance_metrics(
        &mut self,
        score: u32,
        difficulty: &str,
    ) -> PerformanceMetrics {
        let percentile = self.calculate_percentile(score);
        let mastery_level = self.determine_mastery_level(score);

        // Time taken inversely correlates with score (better students are faster)
        let base_time = match difficulty {
            "Easy" => 15,
            "Medium" => 25,
            "Hard" => 40,
            _ => 25,
        };

        let time_multiplier = match score {
            s if s >= 90 => 0.7, // Fast completion
            s if s >= 70 => 1.0, // Normal time
            s if s >= 50 => 1.3, // Slower completion
            _ => 1.6,            // Very slow
        };

        let time_taken = (base_time as f64 * time_multiplier) as u32;

        // Lower scores might have more attempts (retrying)
        let attempts_count = match score {
            s if s >= 80 => 1,
            s if s >= 60 => self.rng.gen_range(1..3),
            s if s >= 40 => self.rng.gen_range(2..4),
            _ => self.rng.gen_range(3..5),
        };

        PerformanceMetrics {
            score,
            percentile,
            time_taken_minutes: time_taken,
            attempts_count,
            mastery_level,
        }
    }

    // Generate realistic video watching patterns
    pub fn generate_video_watch_pattern(
        &mut self,
        video_duration_minutes: u32,
    ) -> VideoWatchPattern {
        // Different student engagement levels
        let engagement_level = match self.rng.gen_range(0..100) {
            0..=15 => "skipped",          // Watched less than 20%
            16..=35 => "partial",         // Watched 20-70%
            36..=80 => "mostly_complete", // Watched 70-95%
            _ => "complete",              // Watched 95-100%
        };

        let (percentage_watched, watch_duration, completion_timestamp) = match engagement_level {
            "skipped" => (
                self.rng.gen_range(5..20),
                (video_duration_minutes * self.rng.gen_range(5..20) / 100),
                self.rng.gen_range(1..video_duration_minutes / 4),
            ),
            "partial" => (
                self.rng.gen_range(20..70),
                (video_duration_minutes * self.rng.gen_range(20..70) / 100),
                self.rng
                    .gen_range(video_duration_minutes / 4..video_duration_minutes / 2),
            ),
            "mostly_complete" => (
                self.rng.gen_range(70..95),
                (video_duration_minutes * self.rng.gen_range(70..95) / 100),
                self.rng
                    .gen_range(video_duration_minutes / 2..video_duration_minutes - 1),
            ),
            "complete" => (
                self.rng.gen_range(95..100),
                video_duration_minutes,
                video_duration_minutes,
            ),
            _ => unreachable!(),
        };

        // Some users re-watch parts
        let rewatch_count = if percentage_watched >= 80 {
            self.rng.gen_range(0..3)
        } else {
            0
        };

        VideoWatchPattern {
            engagement_level: engagement_level.to_string(),
            percentage_watched,
            watch_duration_minutes: watch_duration,
            completion_timestamp_minutes: completion_timestamp,
            rewatch_count,
            took_notes: self.rng.gen_bool(0.3), // 30% take notes
            bookmarked: self.rng.gen_bool(0.1), // 10% bookmark
        }
    }

    // Generate realistic enrollment patterns
    pub fn generate_enrollment_pattern(&mut self) -> EnrollmentPattern {
        // Students enroll in courses based on different motivations
        let enrollment_type = match self.rng.gen_range(0..100) {
            0..=20 => "early_adopter", // First week
            21..=50 => "regular",      // First month
            51..=75 => "late_joiner",  // 1-3 months
            _ => "very_late",          // 3+ months
        };

        let days_after_start = match enrollment_type {
            "early_adopter" => self.rng.gen_range(0..7),
            "regular" => self.rng.gen_range(7..30),
            "late_joiner" => self.rng.gen_range(30..90),
            "very_late" => self.rng.gen_range(90..180),
            _ => self.rng.gen_range(90..180),
        };

        let motivation = match enrollment_type {
            "early_adopter" => "highly_motivated",
            "regular" => "standard_interest",
            "late_joiner" => "peer_influence",
            _ => "last_minute",
        };

        EnrollmentPattern {
            enrollment_type: enrollment_type.to_string(),
            days_after_course_start: days_after_start,
            motivation: motivation.to_string(),
            will_complete: match enrollment_type {
                "early_adopter" => self.rng.gen_bool(0.8),
                "regular" => self.rng.gen_bool(0.6),
                _ => self.rng.gen_bool(0.3),
            },
        }
    }

    // Helper methods
    fn calculate_percentile(&self, score: u32) -> f64 {
        // Simplified percentile calculation (in real implementation, this would use actual distribution)
        match score {
            s if s >= 95 => 99.0,
            s if s >= 90 => 95.0,
            s if s >= 85 => 90.0,
            s if s >= 80 => 85.0,
            s if s >= 75 => 75.0,
            s if s >= 70 => 65.0,
            s if s >= 65 => 55.0,
            s if s >= 60 => 45.0,
            s if s >= 55 => 35.0,
            s if s >= 50 => 25.0,
            s if s >= 45 => 15.0,
            s if s >= 40 => 10.0,
            s if s >= 35 => 5.0,
            _ => 2.0,
        }
    }

    fn determine_mastery_level(&self, score: u32) -> String {
        match score {
            s if s >= 90 => "advanced".to_string(),
            s if s >= 75 => "proficient".to_string(),
            s if s >= 60 => "developing".to_string(),
            _ => "beginner".to_string(),
        }
    }

    // Generate student categorization for realistic patterns
    pub fn categorize_student(&mut self, overall_score: u32) -> String {
        match overall_score {
            s if s >= 85 => "high_achiever",
            s if s >= 65 => "average_student",
            s if s >= 40 => "struggling_student",
            _ => "inactive_student",
        }
        .to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoWatchPattern {
    pub engagement_level: String,
    pub percentage_watched: u32,
    pub watch_duration_minutes: u32,
    pub completion_timestamp_minutes: u32, // When they stopped watching
    pub rewatch_count: u32,
    pub took_notes: bool,
    pub bookmarked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnrollmentPattern {
    pub enrollment_type: String,
    pub days_after_course_start: u32,
    pub motivation: String,
    pub will_complete: bool,
}
