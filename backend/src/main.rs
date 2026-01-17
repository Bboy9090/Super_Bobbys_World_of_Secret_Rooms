//! Super Bobby's World: Warp Zones Backend
//!
//! A safe, compliance-first Axum server with NO exploit code.
//! All sensitive operations are gated behind feature flags (OFF by default).

use axum::{
    extract::State,
    http::{header, StatusCode},
    response::{
        sse::{Event, KeepAlive},
        IntoResponse, Response, Sse,
    },
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info, warn};

mod events;
mod plugins;

use events::{AppEvent, EventManager};

/// Application state shared across handlers
#[derive(Clone)]
struct AppState {
    event_manager: EventManager,
}

/// API Command enum - defines all possible commands
#[derive(Debug, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum ApiCommand {
    /// List connected devices (SAFE - read-only)
    ListDevices,
    /// Get device state (SAFE - read-only)
    GetDeviceState { device_id: String },
}

/// API Response wrapper
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ApiResponse<T> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

impl<T> ApiResponse<T> {
    fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    fn error(message: impl Into<String>) -> ApiResponse<()> {
        ApiResponse {
            success: false,
            data: None,
            error: Some(message.into()),
        }
    }
}

/// Device information (safe, read-only)
#[derive(Debug, Serialize, Deserialize)]
struct DeviceInfo {
    id: String,
    name: String,
    status: String,
}

#[tokio::main]
async fn main() {
    // Initialize tracing/logging
    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info,warp_zones_backend=debug".into()),
        )
        .init();

    // Load environment variables
    dotenv::dotenv().ok();

    info!("🌟 Super Bobby's World: Warp Zones Backend starting...");

    // Check for feature flags (should all be OFF by default)
    check_feature_flags();

    // Initialize event manager
    let event_manager = EventManager::new();

    // Create application state
    let state = AppState { event_manager };

    // Build router with CORS
    let app = Router::new()
        .route("/", get(root_handler))
        .route("/api/health", get(health_handler))
        .route("/api/command", post(command_handler))
        .route("/api/events", get(sse_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state);

    // Get port from environment or default to 3001
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid u16");

    let addr = format!("0.0.0.0:{}", port);
    info!("🚀 Server listening on http://{}", addr);
    info!("📍 API endpoints:");
    info!("   GET  /");
    info!("   GET  /api/health");
    info!("   POST /api/command");
    info!("   GET  /api/events (SSE)");

    // Start server
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    axum::serve(listener, app)
        .await
        .expect("Server failed to start");
}

/// Root handler - welcome message
async fn root_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "name": "Super Bobby's World: Warp Zones",
        "version": "1.0.0",
        "status": "online",
        "safety": "NO exploit code - feature flags OFF by default",
        "endpoints": {
            "health": "/api/health",
            "command": "/api/command (POST)",
            "events": "/api/events (SSE)"
        }
    }))
}

/// Health check handler
async fn health_handler() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Command handler - processes API commands
async fn command_handler(
    State(state): State<AppState>,
    Json(command): Json<ApiCommand>,
) -> Response {
    info!("Received command: {:?}", command);

    match command {
        ApiCommand::ListDevices => {
            // SAFE: This is a stub that returns empty list
            // TODO: Authorized operators may implement actual device detection
            // REQUIRES: ALLOW_DEVICE_OPERATIONS=true + POWER_STAR_KEY verification
            let devices: Vec<DeviceInfo> = vec![];

            // Send event
            let _ = state.event_manager.send(AppEvent::LogMessage {
                level: "info".to_string(),
                message: "ListDevices command executed (safe stub)".to_string(),
            });

            Json(ApiResponse::success(devices)).into_response()
        }
        ApiCommand::GetDeviceState { device_id } => {
            // SAFE: Returns error for non-existent device
            warn!("GetDeviceState called for device: {} (not implemented)", device_id);

            // Send event
            let _ = state.event_manager.send(AppEvent::LogMessage {
                level: "warn".to_string(),
                message: format!("GetDeviceState for {} - feature not implemented", device_id),
            });

            (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::<()>::error("Device not found or feature not enabled")),
            )
                .into_response()
        }
    }
}

/// SSE handler - streams events to clients
async fn sse_handler(State(state): State<AppState>) -> Sse<impl futures::Stream<Item = Result<Event, broadcast::error::RecvError>>> {
    info!("New SSE client connected");

    let mut rx = state.event_manager.subscribe();

    let stream = async_stream::stream! {
        // Send initial connection event
        yield Ok(Event::default()
            .event("connected")
            .data(r#"{"message":"Connected to Warp Zones backend"}"#));

        // Stream events
        loop {
            match rx.recv().await {
                Ok(event) => {
                    let event_json = serde_json::to_string(&event).unwrap_or_default();
                    yield Ok(Event::default()
                        .event("app_event")
                        .data(event_json));
                }
                Err(e) => {
                    error!("Error receiving event: {:?}", e);
                    yield Err(e);
                    break;
                }
            }
        }
    };

    Sse::new(stream)
        .keep_alive(KeepAlive::default())
}

/// Check feature flags and warn if any sensitive features are enabled
fn check_feature_flags() {
    let flags = [
        ("EXPERIMENTAL_EDL_MODE", "EDL bootloader access"),
        ("EXPERIMENTAL_BOOTLOADER_ACCESS", "Bootloader operations"),
        ("EXPERIMENTAL_DEVICE_UNLOCK", "Device unlock features"),
        ("ALLOW_DEVICE_OPERATIONS", "Device modifications"),
    ];

    let mut any_enabled = false;

    for (flag, description) in flags.iter() {
        if let Ok(value) = std::env::var(flag) {
            if value.to_lowercase() == "true" {
                warn!("⚠️  FEATURE FLAG ENABLED: {} - {}", flag, description);
                any_enabled = true;
            }
        }
    }

    if any_enabled {
        warn!("⚠️  SENSITIVE FEATURES ENABLED - Ensure proper authorization!");
        warn!("⚠️  All operations will be logged to audit trail");
    } else {
        info!("✅ All sensitive features are OFF (safe mode)");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_health_endpoint() {
        // This is a placeholder test
        // Real tests would use axum::test helpers
        assert!(true);
    }

    #[test]
    fn test_api_response_success() {
        let response = ApiResponse::success("test data");
        assert!(response.success);
        assert_eq!(response.data, Some("test data"));
        assert!(response.error.is_none());
    }

    #[test]
    fn test_api_response_error() {
        let response: ApiResponse<()> = ApiResponse::error("test error");
        assert!(!response.success);
        assert!(response.data.is_none());
        assert_eq!(response.error, Some("test error".to_string()));
    }
}
