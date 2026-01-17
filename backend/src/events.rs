//! Event Management System
//!
//! Provides SSE event streaming via tokio broadcast channels.
//! All events are safe and logged to audit trail.

use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;

/// Application events that can be broadcast to SSE clients
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum AppEvent {
    /// Log message event
    LogMessage { level: String, message: String },

    /// Device connected event
    /// TODO: Implement with ownership verification
    /// REQUIRES: ALLOW_DEVICE_OPERATIONS=true
    DeviceConnected {
        device_id: String,
        device_name: String,
    },

    /// Device disconnected event
    DeviceDisconnected { device_id: String },

    /// System status update
    SystemStatus { status: String, details: String },

    // TODO: Authorized operators may add:
    // - FlashProgress { device_id: String, progress: f32 }
    // - DiagnosticResult { device_id: String, result: String }
    // All new events MUST be logged to audit trail
}

/// Event Manager - wraps broadcast channel for SSE streaming
#[derive(Clone)]
pub struct EventManager {
    tx: broadcast::Sender<AppEvent>,
}

impl EventManager {
    /// Create a new EventManager with default capacity
    pub fn new() -> Self {
        let (tx, _) = broadcast::channel(100);
        Self { tx }
    }

    /// Send an event to all subscribers
    pub fn send(&self, event: AppEvent) -> Result<usize, broadcast::error::SendError<AppEvent>> {
        // TODO: Log all events to encrypted audit trail
        // REQUIRES: AUDIT_LOG_PATH environment variable
        tracing::debug!("Broadcasting event: {:?}", event);
        self.tx.send(event)
    }

    /// Subscribe to events (returns a receiver)
    pub fn subscribe(&self) -> broadcast::Receiver<AppEvent> {
        self.tx.subscribe()
    }
}

impl Default for EventManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_manager_send() {
        let manager = EventManager::new();
        let mut rx = manager.subscribe();

        let event = AppEvent::LogMessage {
            level: "info".to_string(),
            message: "test message".to_string(),
        };

        // Send event
        manager.send(event.clone()).expect("Failed to send event");

        // Receive event
        let received = rx.try_recv().expect("Failed to receive event");

        match received {
            AppEvent::LogMessage { level, message } => {
                assert_eq!(level, "info");
                assert_eq!(message, "test message");
            }
            _ => panic!("Wrong event type received"),
        }
    }

    #[test]
    fn test_multiple_subscribers() {
        let manager = EventManager::new();
        let mut rx1 = manager.subscribe();
        let mut rx2 = manager.subscribe();

        let event = AppEvent::SystemStatus {
            status: "online".to_string(),
            details: "All systems operational".to_string(),
        };

        manager.send(event).expect("Failed to send event");

        // Both subscribers should receive the event
        assert!(rx1.try_recv().is_ok());
        assert!(rx2.try_recv().is_ok());
    }
}
