//! Unified Device State - Rust Implementation
//! 
//! Implements the canonical device state schema for libbootforge.
//! All device state across the system uses this unified format.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

/// Connection status for a device
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ConnectionStatus {
    Connected,
    Disconnected,
    Pending,
    Error,
}

/// Device boot/operational mode
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DeviceMode {
    Normal,
    Recovery,
    Fastboot,
    Download,
    Edl,
    Dfu,
    Bootloader,
    Unknown,
}

/// Android verified boot state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum VerifiedBootState {
    Green,
    Yellow,
    Orange,
    Red,
    Unknown,
}

/// Platform/OS type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum PlatformType {
    Android,
    Ios,
    Linux,
    Windows,
    Macos,
    Chromeos,
    Unknown,
}

/// Encryption state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum EncryptionState {
    Encrypted,
    Decrypted,
    Unsupported,
    Unknown,
}

/// Device classification
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DeviceClass {
    Clean,
    SoftwareModified,
    HardwareModified,
    ServiceModified,
    Unknown,
}

/// Risk level assessment
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// Current device state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceState {
    pub connection: ConnectionStatus,
    pub mode: DeviceMode,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub locked: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub verified_boot: Option<VerifiedBootState>,
}

/// Device identity information
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DeviceIdentity {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vendor_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub product_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub serial: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub manufacturer: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub brand: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_codename: Option<String>,
}

/// Platform/OS information
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PlatformInfo {
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub platform_type: Option<PlatformType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_level: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub build_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub security_patch: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kernel_version: Option<String>,
}

/// Hardware specifications
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct HardwareInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cpu_abi: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cpu_abi_list: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub soc: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ram_bytes: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub storage_bytes: Option<i64>,
}

/// Security state information
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityInfo {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub secure_boot: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub encryption_state: Option<EncryptionState>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frp_active: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mdm_enrolled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub knox_active: Option<bool>,
}

/// Device capabilities
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DeviceCapabilities {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub adb_enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub oem_unlock_allowed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fastboot_available: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recovery_available: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub root_access: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_recovery: Option<bool>,
}

/// REFORGE classification results
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DeviceClassification {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_class: Option<DeviceClass>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub risk_level: Option<RiskLevel>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub legal_status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub jurisdiction: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub requires_authorization: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub authority_route: Option<String>,
}

/// Power Star access requirements
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PowerStarRequirements {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_level: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub permissions_needed: Option<Vec<String>>,
}

/// Device history in system
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DeviceHistory {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub first_seen: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_seen: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connection_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_operation: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub case_ids: Option<Vec<String>>,
}

/// Unified Device State - Complete device information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedDeviceState {
    /// Unique device identifier
    pub device_id: String,
    
    /// Timestamp of state capture
    pub timestamp: DateTime<Utc>,
    
    /// Current device state
    pub state: DeviceState,
    
    /// Device identity
    #[serde(skip_serializing_if = "Option::is_none")]
    pub identity: Option<DeviceIdentity>,
    
    /// Platform information
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform: Option<PlatformInfo>,
    
    /// Hardware specifications
    #[serde(skip_serializing_if = "Option::is_none")]
    pub hardware: Option<HardwareInfo>,
    
    /// Security state
    #[serde(skip_serializing_if = "Option::is_none")]
    pub security: Option<SecurityInfo>,
    
    /// Device capabilities
    #[serde(skip_serializing_if = "Option::is_none")]
    pub capabilities: Option<DeviceCapabilities>,
    
    /// Classification results
    #[serde(skip_serializing_if = "Option::is_none")]
    pub classification: Option<DeviceClassification>,
    
    /// Power Star requirements
    #[serde(skip_serializing_if = "Option::is_none")]
    pub power_star: Option<PowerStarRequirements>,
    
    /// Device history
    #[serde(skip_serializing_if = "Option::is_none")]
    pub history: Option<DeviceHistory>,
    
    /// Additional metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

impl UnifiedDeviceState {
    /// Create a new device state with minimal required fields
    pub fn new(device_id: String, connection: ConnectionStatus, mode: DeviceMode) -> Self {
        Self {
            device_id,
            timestamp: Utc::now(),
            state: DeviceState {
                connection,
                mode,
                locked: None,
                verified_boot: None,
            },
            identity: None,
            platform: None,
            hardware: None,
            security: None,
            capabilities: None,
            classification: None,
            power_star: None,
            history: None,
            metadata: None,
        }
    }
    
    /// Create from a connected ADB device
    pub fn from_adb_device(serial: String, model: String, manufacturer: String) -> Self {
        let mut state = Self::new(
            serial.clone(),
            ConnectionStatus::Connected,
            DeviceMode::Normal,
        );
        
        state.identity = Some(DeviceIdentity {
            serial: Some(serial),
            model: Some(model),
            manufacturer: Some(manufacturer),
            ..Default::default()
        });
        
        state.platform = Some(PlatformInfo {
            platform_type: Some(PlatformType::Android),
            ..Default::default()
        });
        
        state.capabilities = Some(DeviceCapabilities {
            adb_enabled: Some(true),
            ..Default::default()
        });
        
        state
    }
    
    /// Serialize to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
    
    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
    
    /// Get required Power Star level for this device
    pub fn required_star_level(&self) -> u8 {
        if let Some(ref ps) = self.power_star {
            ps.required_level.unwrap_or(0)
        } else if let Some(ref class) = self.classification {
            // Determine from classification
            match class.risk_level {
                Some(RiskLevel::Critical) => 3,
                Some(RiskLevel::High) => 2,
                Some(RiskLevel::Medium) => 1,
                _ => 0,
            }
        } else {
            0
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_device_state() {
        let state = UnifiedDeviceState::new(
            "ABC123".to_string(),
            ConnectionStatus::Connected,
            DeviceMode::Normal,
        );
        
        assert_eq!(state.device_id, "ABC123");
        assert_eq!(state.state.connection, ConnectionStatus::Connected);
        assert_eq!(state.state.mode, DeviceMode::Normal);
    }

    #[test]
    fn test_from_adb_device() {
        let state = UnifiedDeviceState::from_adb_device(
            "ABC123".to_string(),
            "Pixel 7".to_string(),
            "Google".to_string(),
        );
        
        assert!(state.identity.is_some());
        assert_eq!(state.identity.as_ref().unwrap().model, Some("Pixel 7".to_string()));
    }

    #[test]
    fn test_json_serialization() {
        let state = UnifiedDeviceState::new(
            "ABC123".to_string(),
            ConnectionStatus::Connected,
            DeviceMode::Fastboot,
        );
        
        let json = state.to_json().unwrap();
        let parsed = UnifiedDeviceState::from_json(&json).unwrap();
        
        assert_eq!(parsed.device_id, state.device_id);
    }

    #[test]
    fn test_star_level_from_risk() {
        let mut state = UnifiedDeviceState::new(
            "ABC123".to_string(),
            ConnectionStatus::Connected,
            DeviceMode::Normal,
        );
        
        state.classification = Some(DeviceClassification {
            risk_level: Some(RiskLevel::High),
            ..Default::default()
        });
        
        assert_eq!(state.required_star_level(), 2);
    }
}
