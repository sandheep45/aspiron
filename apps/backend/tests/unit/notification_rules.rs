use chrono::{Duration, Utc};

use backend::domain::notification::rules::{
    CompletionRuleConfig, EngagementRuleConfig, ProgressRuleConfig, RecallRuleConfig,
    TriggeredRule, evaluate_completion_rule, evaluate_engagement_rule, evaluate_progress_rule,
    evaluate_recall_rule, evaluate_session_reminder_rule,
};

#[test]
fn test_recall_rule_triggers_below_critical() {
    let config = RecallRuleConfig::default();
    let result = evaluate_recall_rule(35.0, None, &config);
    assert_eq!(result, Some(TriggeredRule::LowRecallAccuracy));
}

#[test]
fn test_recall_rule_does_not_trigger_above_threshold() {
    let config = RecallRuleConfig::default();
    let result = evaluate_recall_rule(75.0, None, &config);
    assert_eq!(result, None);
}

#[test]
fn test_recall_rule_triggers_on_significant_drop() {
    let config = RecallRuleConfig::default();
    let result = evaluate_recall_rule(50.0, Some(75.0), &config);
    assert_eq!(result, Some(TriggeredRule::LowRecallAccuracy));
}

#[test]
fn test_recall_rule_small_drop_no_trigger() {
    let config = RecallRuleConfig::default();
    let result = evaluate_recall_rule(70.0, Some(75.0), &config);
    assert_eq!(result, None);
}

#[test]
fn test_progress_rule_triggers_on_stagnation() {
    let config = ProgressRuleConfig::default();
    let long_ago = Utc::now() - Duration::days(10);
    let result = evaluate_progress_rule(50.0, 45.0, long_ago, &config);
    assert_eq!(result, Some(TriggeredRule::StagnantProgress));
}

#[test]
fn test_progress_rule_slow_progress_triggers() {
    let config = ProgressRuleConfig::default();
    let five_days_ago = Utc::now() - Duration::days(5);
    let result = evaluate_progress_rule(12.0, 10.0, five_days_ago, &config);
    assert_eq!(result, Some(TriggeredRule::StagnantProgress));
}

#[test]
fn test_progress_rule_active_no_trigger() {
    let config = ProgressRuleConfig::default();
    let now = Utc::now();
    let result = evaluate_progress_rule(50.0, 45.0, now, &config);
    assert_eq!(result, None);
}

#[test]
fn test_engagement_rule_triggers_at_threshold() {
    let config = EngagementRuleConfig::default();
    assert_eq!(evaluate_engagement_rule(6, &config), None);
    assert_eq!(
        evaluate_engagement_rule(7, &config),
        Some(TriggeredRule::LowEngagement)
    );
    assert_eq!(
        evaluate_engagement_rule(14, &config),
        Some(TriggeredRule::LowEngagement)
    );
}

#[test]
fn test_engagement_rule_active_user_no_trigger() {
    let config = EngagementRuleConfig::default();
    let result = evaluate_engagement_rule(1, &config);
    assert_eq!(result, None);
}

#[test]
fn test_completion_rule_triggers_on_milestone() {
    let config = CompletionRuleConfig::default();
    let result = evaluate_completion_rule(50.0, 20.0, &config);
    assert_eq!(result, Some(TriggeredRule::CompletionMilestone));
}

#[test]
fn test_completion_rule_no_new_milestone() {
    let config = CompletionRuleConfig::default();
    let result = evaluate_completion_rule(45.0, 44.0, &config);
    assert_eq!(result, None);
}

#[test]
fn test_session_reminder_no_prior_recall() {
    let result = evaluate_session_reminder_rule(None, 1);
    assert_eq!(result, Some(TriggeredRule::SessionReminder));
}

#[test]
fn test_session_reminder_not_yet_due() {
    let recent = Utc::now();
    let result = evaluate_session_reminder_rule(Some(recent), 7);
    assert_eq!(result, None);
}

#[test]
fn test_session_reminder_overdue() {
    let long_ago = Utc::now() - Duration::days(10);
    let result = evaluate_session_reminder_rule(Some(long_ago), 7);
    assert_eq!(result, Some(TriggeredRule::SessionReminder));
}

#[test]
fn test_notification_log_creation() {
    let rule = TriggeredRule::LowRecallAccuracy;
    assert_eq!(format!("{:?}", rule), "LowRecallAccuracy");
}

#[test]
fn test_notification_status_logic() {
    let config = RecallRuleConfig::default();
    let result = evaluate_recall_rule(20.0, Some(35.0), &config);
    assert_eq!(result, Some(TriggeredRule::LowRecallAccuracy));
}
