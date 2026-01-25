use rand::{Rng, thread_rng};
use uuid::Uuid;

pub fn generate_random_uuids(count: usize) -> Vec<Uuid> {
    (0..count).map(|_| Uuid::new_v4()).collect()
}

pub fn generate_random_number(min: i32, max: i32) -> i32 {
    thread_rng().gen_range(min..=max)
}

pub fn generate_random_duration_seconds() -> i32 {
    // Generate duration between 5 minutes (300s) and 45 minutes (2700s)
    thread_rng().gen_range(300..=2700)
}

pub fn generate_mock_video_url(video_id: Uuid) -> String {
    format!("https://video-cdn.aspiron.dev/videos/{}.mp4", video_id)
}

pub fn generate_mock_thumbnail_url(video_id: Uuid) -> String {
    format!("https://thumbs.aspiron.dev/videos/{}.jpg", video_id)
}

pub fn generate_random_progress_percentage() -> i32 {
    // Simple fixed distribution for now
    thread_rng().gen_range(0..=100)
}
