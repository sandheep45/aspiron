use chrono::{DateTime, Datelike, Duration, Timelike, Utc};
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimestampConfig {
    pub start_date: DateTime<Utc>,
    pub end_date: DateTime<Utc>,
    pub peak_hours: Vec<(u32, u32)>, // (hour_start, hour_end) for peak activity
    pub weekend_factor: f64,         // Activity multiplier for weekends
    pub time_zone: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DistributedTimestamp {
    pub timestamp: DateTime<Utc>,
    pub context: String, // What this timestamp represents
    pub sequence: u32,   // Order in creation sequence
}

pub struct TimestampDistributor {
    rng: rand::rngs::StdRng,
    config: TimestampConfig,
    counter: u32,
}

impl TimestampDistributor {
    pub fn new(seed: u64, config: TimestampConfig) -> Self {
        Self {
            rng: rand::rngs::StdRng::seed_from_u64(seed),
            config,
            counter: 0,
        }
    }

    // Create default config for educational platform (6 months of activity)
    pub fn educational_platform_default() -> TimestampConfig {
        let end_date = Utc::now();
        let start_date = end_date - Duration::days(180); // 6 months ago

        TimestampConfig {
            start_date,
            end_date,
            peak_hours: vec![(9, 11), (14, 16), (19, 21)], // Morning, afternoon, evening peaks
            weekend_factor: 0.7,                           // Less activity on weekends
            time_zone: "UTC".to_string(),
        }
    }

    // Create config for content creation (older dates, gradual rollout)
    pub fn content_creation_config() -> TimestampConfig {
        let end_date = Utc::now() - Duration::days(30); // Content created up to 30 days ago
        let start_date = end_date - Duration::days(120); // Starting 4 months before that

        TimestampConfig {
            start_date,
            end_date,
            peak_hours: vec![(10, 15)], // Content creators work during business hours
            weekend_factor: 0.3,        // Much less content creation on weekends
            time_zone: "UTC".to_string(),
        }
    }

    // Generate timestamp with realistic activity patterns
    pub fn generate_timestamp(&mut self, context: &str) -> DistributedTimestamp {
        self.counter += 1;

        // Base timestamp within the configured range
        let base_timestamp = self.generate_base_timestamp();

        // Apply temporal adjustments based on context
        let adjusted_timestamp = self.adjust_timestamp_for_context(base_timestamp, context);

        DistributedTimestamp {
            timestamp: adjusted_timestamp,
            context: context.to_string(),
            sequence: self.counter,
        }
    }

    // Generate multiple timestamps with logical sequence
    pub fn generate_timestamp_sequence(
        &mut self,
        contexts: Vec<&str>,
    ) -> Vec<DistributedTimestamp> {
        let mut timestamps = Vec::new();

        for context in contexts {
            timestamps.push(self.generate_timestamp(context));
        }

        // Ensure logical ordering (e.g., topics created after chapters, videos after topics)
        self.apply_logical_ordering(&mut timestamps);

        timestamps
    }

    fn generate_base_timestamp(&mut self) -> DateTime<Utc> {
        let total_seconds = (self.config.end_date - self.config.start_date).num_seconds();
        let random_seconds = self.rng.gen_range(0..total_seconds);
        let mut timestamp = self.config.start_date + Duration::seconds(random_seconds);

        // Apply time-of-day weighting
        timestamp = self.apply_activity_pattern(timestamp);

        timestamp
    }

    fn apply_activity_pattern(&mut self, timestamp: DateTime<Utc>) -> DateTime<Utc> {
        let hour = timestamp.hour();
        let weekday = timestamp.weekday().num_days_from_monday(); // 0 = Monday, 6 = Sunday

        // Check if it's a weekend
        let is_weekend = weekday >= 5;
        let activity_multiplier = if is_weekend {
            self.config.weekend_factor
        } else {
            1.0
        };

        // Check if it's during peak hours
        let is_peak_time = self
            .config
            .peak_hours
            .iter()
            .any(|(start, end)| hour >= *start && hour <= *end);

        // Use weighted random to bias towards peak times
        let use_this_time = if is_peak_time {
            self.rng.gen_range(0.0..1.0) < 0.7 * activity_multiplier // 70% chance during peak
        } else {
            self.rng.gen_range(0.0..1.0) < 0.3 * activity_multiplier // 30% chance during off-peak
        };

        if !use_this_time {
            // Regenerate for a better time
            let target_hour = if is_weekend {
                // Weekend: bias towards evening hours
                if self.rng.gen_bool(0.6) { 19 } else { 10 }
            } else {
                // Weekday: bias towards peak hours
                let peak_ranges = &self.config.peak_hours;
                let chosen_range = peak_ranges[self.rng.gen_range(0..peak_ranges.len())];
                self.rng.gen_range(chosen_range.0..=chosen_range.1)
            };

            timestamp
                .with_hour(target_hour)
                .unwrap_or(timestamp)
                .with_minute(self.rng.gen_range(0..60))
                .unwrap_or(timestamp)
                .with_second(self.rng.gen_range(0..60))
                .unwrap_or(timestamp)
        } else {
            timestamp
        }
    }

    fn adjust_timestamp_for_context(
        &mut self,
        base_timestamp: DateTime<Utc>,
        context: &str,
    ) -> DateTime<Utc> {
        match context {
            // Content creation sequence (older dates)
            c if c.contains("subject") => {
                base_timestamp - Duration::days(self.rng.gen_range(90..120))
            }
            c if c.contains("chapter") => {
                base_timestamp - Duration::days(self.rng.gen_range(60..90))
            }
            c if c.contains("topic") => base_timestamp - Duration::days(self.rng.gen_range(30..60)),
            c if c.contains("video") => base_timestamp - Duration::days(self.rng.gen_range(7..30)),

            // User activity (more recent)
            c if c.contains("user") => base_timestamp - Duration::days(self.rng.gen_range(0..7)),
            c if c.contains("enrollment") => {
                base_timestamp - Duration::days(self.rng.gen_range(1..30))
            }
            c if c.contains("progress") => {
                base_timestamp - Duration::minutes(self.rng.gen_range(1..1440))
            } // Within last day
            c if c.contains("note") => {
                base_timestamp - Duration::minutes(self.rng.gen_range(0..720))
            } // Within last 12 hours

            // Assessment activity
            c if c.contains("quiz") => base_timestamp - Duration::days(self.rng.gen_range(1..14)),
            c if c.contains("question") => {
                base_timestamp - Duration::days(self.rng.gen_range(0..7))
            }
            c if c.contains("attempt") => {
                base_timestamp - Duration::minutes(self.rng.gen_range(5..180))
            }

            // Community activity (very recent)
            c if c.contains("thread") => base_timestamp - Duration::days(self.rng.gen_range(0..3)),
            c if c.contains("post") => base_timestamp - Duration::hours(self.rng.gen_range(1..48)),
            c if c.contains("comment") => {
                base_timestamp - Duration::minutes(self.rng.gen_range(1..240))
            }

            // Default
            _ => base_timestamp,
        }
    }

    fn apply_logical_ordering(&self, timestamps: &mut [DistributedTimestamp]) {
        // Sort by timestamp to maintain chronological order
        timestamps.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));

        // Apply sequence numbers based on chronological order
        for (index, timestamp) in timestamps.iter_mut().enumerate() {
            timestamp.sequence = (index + 1) as u32;
        }
    }

    // Utility methods for specific scenarios
    pub fn generate_user_creation_timestamps(
        &mut self,
        num_users: usize,
    ) -> Vec<DistributedTimestamp> {
        let contexts: Vec<String> = (1..=num_users)
            .map(|i| format!("user_creation_{}", i))
            .collect();

        let contexts_refs: Vec<&str> = contexts.iter().map(|s| s.as_str()).collect();
        self.generate_timestamp_sequence(contexts_refs)
    }

    pub fn generate_content_hierarchy_timestamps(&mut self) -> Vec<DistributedTimestamp> {
        let contexts = vec![
            "subject_creation",
            "chapter_creation",
            "topic_creation",
            "video_creation",
            "transcript_creation",
            "assessment_creation",
        ];

        self.generate_timestamp_sequence(contexts)
    }

    pub fn generate_learning_activity_timestamps(
        &mut self,
        user_id: &str,
    ) -> Vec<DistributedTimestamp> {
        let enrollment = format!("enrollment_{}", user_id);
        let video_watch = format!("video_watch_{}", user_id);
        let note_creation = format!("note_creation_{}", user_id);
        let progress_update = format!("progress_update_{}", user_id);
        let quiz_attempt = format!("quiz_attempt_{}", user_id);

        let contexts = vec![
            enrollment.as_str(),
            video_watch.as_str(),
            note_creation.as_str(),
            progress_update.as_str(),
            quiz_attempt.as_str(),
        ];

        self.generate_timestamp_sequence(contexts)
    }

    // Get statistics about generated timestamps
    pub fn get_timestamp_stats(&self, timestamps: &[DistributedTimestamp]) -> TimestampStats {
        if timestamps.is_empty() {
            return TimestampStats::default();
        }

        let timestamps_vec: Vec<DateTime<Utc>> = timestamps.iter().map(|dt| dt.timestamp).collect();

        let min_timestamp = timestamps_vec.iter().min().unwrap();
        let max_timestamp = timestamps_vec.iter().max().unwrap();
        let total_duration = *max_timestamp - *min_timestamp;

        // Calculate average time between events
        let mut intervals = Vec::new();
        for window in timestamps_vec.windows(2) {
            intervals.push(window[1] - window[0]);
        }

        let avg_interval = if intervals.is_empty() {
            Duration::zero()
        } else {
            let total_interval: Duration = intervals.iter().sum();
            total_interval / intervals.len() as i32
        };

        // Group by context type
        let mut context_counts = std::collections::HashMap::new();
        for timestamp in timestamps {
            let context_type = timestamp.context.split('_').next().unwrap_or("unknown");
            *context_counts.entry(context_type.to_string()).or_insert(0) += 1;
        }

        TimestampStats {
            total_events: timestamps.len(),
            earliest_timestamp: *min_timestamp,
            latest_timestamp: *max_timestamp,
            total_span: total_duration,
            average_interval: avg_interval,
            context_distribution: context_counts,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimestampStats {
    pub total_events: usize,
    pub earliest_timestamp: DateTime<Utc>,
    pub latest_timestamp: DateTime<Utc>,
    pub total_span: Duration,
    pub average_interval: Duration,
    pub context_distribution: std::collections::HashMap<String, usize>,
}

impl Default for TimestampStats {
    fn default() -> Self {
        Self {
            total_events: 0,
            earliest_timestamp: Utc::now(),
            latest_timestamp: Utc::now(),
            total_span: Duration::zero(),
            average_interval: Duration::zero(),
            context_distribution: std::collections::HashMap::new(),
        }
    }
}
