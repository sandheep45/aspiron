pub mod ports;

use std::sync::Arc;

app_state!(LiveSessionApplicationState, ports::LiveSessionRepository);
