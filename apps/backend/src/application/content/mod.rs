pub mod chapters_page_types;
pub mod get_chapters;
pub mod get_chapters_page_chapters;
pub mod get_chapters_page_insights;
pub mod get_chapters_page_summary;
pub mod get_offline_token;
pub mod get_subjects;
pub mod get_topic;
pub mod get_topics;
pub mod get_videos;
pub mod ports;

use std::sync::Arc;

app_state!(ContentApplicationState, ports::ContentRepository);
