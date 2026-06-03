use backend::domain::notification::entities::NotificationLog;
use chrono::Utc;
use uuid::Uuid;

#[test]
fn test_notification_log_creation() {
    let notification = NotificationLog {
        id: Uuid::new_v4(),
        event_id: Uuid::new_v4(),
        status: "sent".to_string(),
        sent_at: Utc::now(),
    };

    assert_eq!(notification.status, "sent");
}

#[test]
fn test_notification_status_logic() {
    // This would test the actual notification trigger rules
    // For now, we just verify we can create notifications with different statuses

    let notifications = [
        NotificationLog {
            id: Uuid::new_v4(),
            event_id: Uuid::new_v4(),
            status: "sent".to_string(),
            sent_at: Utc::now(),
        },
        NotificationLog {
            id: Uuid::new_v4(),
            event_id: Uuid::new_v4(),
            status: "failed".to_string(),
            sent_at: Utc::now(),
        },
    ];

    let sent_count = notifications.iter().filter(|n| n.status == "sent").count();
    assert_eq!(sent_count, 1);

    let failed_count = notifications
        .iter()
        .filter(|n| n.status == "failed")
        .count();
    assert_eq!(failed_count, 1);
}
