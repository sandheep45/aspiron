use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::http::responses::users::OwnershipType;
use crate::setup::error::AppError;

pub fn parse_permission_name(
    permission_name: &str,
) -> Option<(ResourceTypeEnum, ActionTypeEnum, OwnershipType)> {
    let parts: Vec<&str> = permission_name.split('.').collect();

    match parts.as_slice() {
        [resource_str, action_str] => {
            let resource_type = resource_str.parse::<ResourceTypeEnum>().ok()?;
            let action = action_str.parse::<ActionTypeEnum>().ok()?;
            Some((resource_type, action, OwnershipType::All))
        }
        [resource_str, action_str, ownership_str] => {
            let resource_type = resource_str.parse::<ResourceTypeEnum>().ok()?;
            let action = action_str.parse::<ActionTypeEnum>().ok()?;
            let ownership = ownership_str.parse::<OwnershipType>().ok()?;
            Some((resource_type, action, ownership))
        }
        _ => None,
    }
}

pub fn parse_resource_type_result(resource: &str) -> Result<ResourceTypeEnum, AppError> {
    resource
        .parse::<ResourceTypeEnum>()
        .map_err(|_| AppError::validation("Invalid resource type"))
}

pub fn parse_action_type_result(action: &str) -> Result<ActionTypeEnum, AppError> {
    action
        .parse::<ActionTypeEnum>()
        .map_err(|_| AppError::validation("Invalid action type"))
}

pub fn parse_ownership_type_result(ownership: &str) -> Result<OwnershipType, AppError> {
    ownership
        .parse::<OwnershipType>()
        .map_err(|_| AppError::validation("Invalid ownership type"))
}
