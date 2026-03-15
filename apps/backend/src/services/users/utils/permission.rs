use crate::entries::dtos::response::users::OwnershipType;
use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::setup::error::AppError;

pub fn parse_permission_name(
    permission_name: &str,
) -> Option<(ResourceTypeEnum, ActionTypeEnum, OwnershipType)> {
    let parts: Vec<&str> = permission_name.split('.').collect();

    match parts.as_slice() {
        [resource_str, action_str, ownership_str] => {
            let resource_type = parse_resource_type(resource_str)?;
            let action = parse_action_type(action_str)?;
            let ownership = parse_ownership_type(ownership_str)?;

            Some((resource_type, action, ownership))
        }
        _ => None,
    }
}

pub fn parse_resource_type_result(resource: &str) -> Result<ResourceTypeEnum, AppError> {
    parse_resource_type(resource).ok_or_else(|| AppError::validation("Invalid resource type"))
}

pub fn parse_action_type_result(action: &str) -> Result<ActionTypeEnum, AppError> {
    parse_action_type(action).ok_or_else(|| AppError::validation("Invalid action type"))
}

pub fn parse_ownership_type_result(ownership: &str) -> Result<OwnershipType, AppError> {
    parse_ownership_type(ownership).ok_or_else(|| AppError::validation("Invalid ownership type"))
}

fn parse_resource_type(resource: &str) -> Option<ResourceTypeEnum> {
    match resource {
        "USER" => Some(ResourceTypeEnum::USER),
        "CONTENT" => Some(ResourceTypeEnum::CONTENT),
        "ASSESSMENT" => Some(ResourceTypeEnum::ASSESSMENT),
        "COMMUNITY" => Some(ResourceTypeEnum::COMMUNITY),
        "SYSTEM" => Some(ResourceTypeEnum::SYSTEM),
        "SUBJECT" => Some(ResourceTypeEnum::SUBJECT),
        "CHAPTER" => Some(ResourceTypeEnum::CHAPTER),
        "TOPIC" => Some(ResourceTypeEnum::TOPIC),
        "VIDEO" => Some(ResourceTypeEnum::VIDEO),
        "QUIZ" => Some(ResourceTypeEnum::QUIZ),
        "QUESTION" => Some(ResourceTypeEnum::QUESTION),
        "THREAD" => Some(ResourceTypeEnum::THREAD),
        "POST" => Some(ResourceTypeEnum::POST),
        "NOTE" => Some(ResourceTypeEnum::NOTE),
        _ => None,
    }
}

fn parse_action_type(action: &str) -> Option<ActionTypeEnum> {
    match action {
        "CREATE" => Some(ActionTypeEnum::CREATE),
        "READ" => Some(ActionTypeEnum::READ),
        "UPDATE" => Some(ActionTypeEnum::UPDATE),
        "DELETE" => Some(ActionTypeEnum::DELETE),
        "MANAGE" => Some(ActionTypeEnum::MANAGE),
        "PUBLISH" => Some(ActionTypeEnum::PUBLISH),
        "MODERATE" => Some(ActionTypeEnum::MODERATE),
        "GRADE" => Some(ActionTypeEnum::GRADE),
        "TAKE" => Some(ActionTypeEnum::TAKE),
        "VIEW_RESULTS" => Some(ActionTypeEnum::VIEW_RESULTS),
        "VIEW_ANY_RESULTS" => Some(ActionTypeEnum::VIEW_ANY_RESULTS),
        "ASSIGN_ROLES" => Some(ActionTypeEnum::ASSIGN_ROLES),
        "VIEW_ANALYTICS" => Some(ActionTypeEnum::VIEW_ANALYTICS),
        "MANAGE_SETTINGS" => Some(ActionTypeEnum::MANAGE_SETTINGS),
        "AUDIT" => Some(ActionTypeEnum::AUDIT),
        _ => None,
    }
}

fn parse_ownership_type(ownership: &str) -> Option<OwnershipType> {
    match ownership {
        "own" => Some(OwnershipType::Own),
        "all" => Some(OwnershipType::All),
        _ => None,
    }
}
