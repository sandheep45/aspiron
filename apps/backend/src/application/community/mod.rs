pub mod ports;

use std::sync::Arc;

app_state!(CommunityApplicationState, ports::CommunityRepository);
