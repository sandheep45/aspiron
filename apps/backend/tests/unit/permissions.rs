use backend::application::users::permission::{
    parse_action_type_result, parse_ownership_type_result, parse_permission_name,
    parse_resource_type_result,
};
use backend::entries::entity_enums::action_types::ActionTypeEnum;
use backend::entries::entity_enums::resource_types::ResourceTypeEnum;
use backend::http::responses::users::OwnershipType;

#[test]
fn parse_permission_name_returns_none_for_empty_string() {
    assert!(parse_permission_name("").is_none());
}

#[test]
fn parse_permission_name_returns_none_for_single_part() {
    assert!(parse_permission_name("CONTENT").is_none());
}

#[test]
fn parse_permission_name_returns_none_for_four_parts() {
    assert!(parse_permission_name("A.B.C.D").is_none());
}

#[test]
fn parse_permission_name_returns_none_for_invalid_resource() {
    assert!(parse_permission_name("INVALID.READ").is_none());
}

#[test]
fn parse_permission_name_returns_none_for_invalid_action() {
    assert!(parse_permission_name("CONTENT.INVALID").is_none());
}

#[test]
fn parse_permission_name_parses_two_part_with_all_ownership() {
    let result = parse_permission_name("CONTENT.READ");
    assert_eq!(
        result,
        Some((
            ResourceTypeEnum::CONTENT,
            ActionTypeEnum::READ,
            OwnershipType::All
        ))
    );
}

#[test]
fn parse_permission_name_parses_three_part_with_own_ownership() {
    let result = parse_permission_name("CONTENT.READ.own");
    assert_eq!(
        result,
        Some((
            ResourceTypeEnum::CONTENT,
            ActionTypeEnum::READ,
            OwnershipType::Own
        ))
    );
}

#[test]
fn parse_permission_name_parses_three_part_with_all_ownership() {
    let result = parse_permission_name("USER.CREATE.all");
    assert_eq!(
        result,
        Some((
            ResourceTypeEnum::USER,
            ActionTypeEnum::CREATE,
            OwnershipType::All
        ))
    );
}

#[test]
fn parse_permission_name_parses_invalid_ownership_as_none() {
    assert!(parse_permission_name("CONTENT.READ.invalid").is_none());
}

#[test]
fn parse_permission_name_parses_all_resource_types() {
    let cases = [
        ("USER", ResourceTypeEnum::USER),
        ("CONTENT", ResourceTypeEnum::CONTENT),
        ("ASSESSMENT", ResourceTypeEnum::ASSESSMENT),
        ("COMMUNITY", ResourceTypeEnum::COMMUNITY),
        ("SYSTEM", ResourceTypeEnum::SYSTEM),
        ("SUBJECT", ResourceTypeEnum::SUBJECT),
        ("CHAPTER", ResourceTypeEnum::CHAPTER),
        ("TOPIC", ResourceTypeEnum::TOPIC),
        ("VIDEO", ResourceTypeEnum::VIDEO),
        ("QUIZ", ResourceTypeEnum::QUIZ),
        ("QUESTION", ResourceTypeEnum::QUESTION),
        ("THREAD", ResourceTypeEnum::THREAD),
        ("POST", ResourceTypeEnum::POST),
        ("NOTE", ResourceTypeEnum::NOTE),
    ];
    for (name, expected) in &cases {
        let result = parse_permission_name(&format!("{}.READ", name));
        assert_eq!(
            result,
            Some((expected.clone(), ActionTypeEnum::READ, OwnershipType::All)),
            "Failed for resource: {}",
            name
        );
    }
}

#[test]
fn parse_permission_name_parses_all_action_types() {
    let cases = [
        ("CREATE", ActionTypeEnum::CREATE),
        ("READ", ActionTypeEnum::READ),
        ("UPDATE", ActionTypeEnum::UPDATE),
        ("DELETE", ActionTypeEnum::DELETE),
        ("MANAGE", ActionTypeEnum::MANAGE),
        ("PUBLISH", ActionTypeEnum::PUBLISH),
        ("MODERATE", ActionTypeEnum::MODERATE),
        ("GRADE", ActionTypeEnum::GRADE),
        ("TAKE", ActionTypeEnum::TAKE),
        ("VIEW_RESULTS", ActionTypeEnum::VIEW_RESULTS),
        ("VIEW_ANY_RESULTS", ActionTypeEnum::VIEW_ANY_RESULTS),
        ("ASSIGN_ROLES", ActionTypeEnum::ASSIGN_ROLES),
        ("VIEW_ANALYTICS", ActionTypeEnum::VIEW_ANALYTICS),
        ("MANAGE_SETTINGS", ActionTypeEnum::MANAGE_SETTINGS),
        ("AUDIT", ActionTypeEnum::AUDIT),
    ];
    for (name, expected) in &cases {
        let result = parse_permission_name(&format!("CONTENT.{}", name));
        assert_eq!(
            result,
            Some((
                ResourceTypeEnum::CONTENT,
                expected.clone(),
                OwnershipType::All
            )),
            "Failed for action: {}",
            name
        );
    }
}

#[test]
fn parse_permission_name_parses_both_ownership_types() {
    let result_own = parse_permission_name("CONTENT.READ.own");
    assert_eq!(
        result_own,
        Some((
            ResourceTypeEnum::CONTENT,
            ActionTypeEnum::READ,
            OwnershipType::Own
        ))
    );
    let result_all = parse_permission_name("CONTENT.READ.all");
    assert_eq!(
        result_all,
        Some((
            ResourceTypeEnum::CONTENT,
            ActionTypeEnum::READ,
            OwnershipType::All
        ))
    );
}

#[test]
fn parse_resource_type_result_returns_ok_for_valid_input() {
    let result = parse_resource_type_result("CONTENT");
    assert_eq!(result.unwrap(), ResourceTypeEnum::CONTENT);
}

#[test]
fn parse_resource_type_result_returns_error_for_invalid_input() {
    let result = parse_resource_type_result("INVALID");
    assert!(result.is_err());
}

#[test]
fn parse_action_type_result_returns_ok_for_valid_input() {
    let result = parse_action_type_result("READ");
    assert_eq!(result.unwrap(), ActionTypeEnum::READ);
}

#[test]
fn parse_action_type_result_returns_error_for_invalid_input() {
    let result = parse_action_type_result("INVALID");
    assert!(result.is_err());
}

#[test]
fn parse_ownership_type_result_returns_ok_for_own() {
    let result = parse_ownership_type_result("own");
    assert_eq!(result.unwrap(), OwnershipType::Own);
}

#[test]
fn parse_ownership_type_result_returns_ok_for_all() {
    let result = parse_ownership_type_result("all");
    assert_eq!(result.unwrap(), OwnershipType::All);
}

#[test]
fn parse_ownership_type_result_returns_error_for_invalid_input() {
    let result = parse_ownership_type_result("invalid");
    assert!(result.is_err());
}
