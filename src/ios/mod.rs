//! # iOS Jailbreak & Bypass Module
//!
//! This module provides integration with iOS jailbreak and bypass tools,
//! including Checkm8, Dopamine, and activation/passcode bypass solutions.
//!
//! ## Device Support Matrix
//!
//! | Device Range | Chipset | Primary Exploit | Status |
//! |--------------|---------|----------------|--------|
//! | iPhone X & Older | A7 - A11 | Checkra1n / Palera1n | Permanent (Hardware-based) |
//! | iPhone XR to 15 Pro | A12 - A17 | Dopamine / Dopamine 2.x | Semi-Untethered (iOS 15.0 - 16.6.1) |
//! | iPhone 16 / 17 / 18 | A18 - A19 | Misaka26 / Nugget | Customization (MacDirtyCow/KFD-level) |
//! | Legacy Devices | 32-bit / Early 64 | Legacy-iOS-Kit | All-in-one tool |
//!
//! ## Legal Disclaimer
//!
//! All tools in this module are for legitimate device repair, forensic analysis,
//! security research, and authorized unlock services only. Users must ensure
//! they own the device or have proper authorization before use.

use crate::types::UsbDeviceInfo;
use anyhow::Result;
use serde::{Deserialize, Serialize};

pub mod checkm8;
pub mod dopamine;
pub mod bypass;
pub mod activator;

/// iOS chipset identifier
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IosChipset {
    A7,
    A8,
    A9,
    A10,
    A11,
    A12,
    A13,
    A14,
    A15,
    A16,
    A17,
    A18,
    A19,
    Unknown,
}

/// iOS device information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IosDevice {
    /// Device model identifier (e.g., "iPhone13,2")
    pub model: String,
    /// Chipset
    pub chipset: IosChipset,
    /// iOS version (e.g., "16.6.1")
    pub ios_version: String,
    /// USB device information
    pub usb_info: UsbDeviceInfo,
    /// Device is in recovery mode
    pub in_recovery: bool,
    /// Device is in DFU mode
    pub in_dfu: bool,
}

impl IosDevice {
    /// Detect iOS device from USB information
    pub fn from_usb(usb_info: UsbDeviceInfo) -> Result<Self> {
        // Placeholder: In production, this would identify iOS devices by VID/PID
        // Apple devices typically use vendor ID 0x05ac
        
        let chipset = detect_chipset(&usb_info)?;
        let model = detect_model(&usb_info)?;

        Ok(Self {
            model,
            chipset,
            ios_version: "Unknown".to_string(), // Would be detected from device
            usb_info,
            in_recovery: false,
            in_dfu: false,
        })
    }

    /// Check if device supports Checkm8 exploit
    pub fn supports_checkm8(&self) -> bool {
        matches!(
            self.chipset,
            IosChipset::A7 | IosChipset::A8 | IosChipset::A9 | IosChipset::A10 | IosChipset::A11
        )
    }

    /// Check if device supports Dopamine jailbreak
    pub fn supports_dopamine(&self) -> bool {
        matches!(
            self.chipset,
            IosChipset::A12 | IosChipset::A13 | IosChipset::A14 | IosChipset::A15 | IosChipset::A16 | IosChipset::A17
        )
    }
}

fn detect_chipset(_usb_info: &UsbDeviceInfo) -> Result<IosChipset> {
    // Placeholder: In production, this would query device for chipset info
    // For now, return Unknown
    Ok(IosChipset::Unknown)
}

fn detect_model(_usb_info: &UsbDeviceInfo) -> Result<String> {
    // Placeholder: In production, this would query device for model identifier
    Ok("Unknown".to_string())
}

/// Available jailbreak methods for an iOS device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailableJailbreaks {
    /// Checkm8-based jailbreaks (A7-A11)
    pub checkm8_methods: Vec<String>,
    /// Dopamine jailbreak (A12-A17)
    pub dopamine_methods: Vec<String>,
    /// Other methods (Misaka, etc.)
    pub other_methods: Vec<String>,
}

/// Detect available jailbreak methods for a device
pub fn detect_jailbreak_methods(device: &IosDevice) -> Result<AvailableJailbreaks> {
    let mut checkm8_methods = Vec::new();
    let mut dopamine_methods = Vec::new();
    let mut other_methods = Vec::new();

    if device.supports_checkm8() {
        checkm8_methods.push("Checkra1n".to_string());
        checkm8_methods.push("Palera1n".to_string());
    }

    if device.supports_dopamine() {
        dopamine_methods.push("Dopamine".to_string());
        dopamine_methods.push("Dopamine 2.x".to_string());
    }

    // Add other methods based on iOS version
    other_methods.push("Misaka26".to_string());
    other_methods.push("Nugget".to_string());

    Ok(AvailableJailbreaks {
        checkm8_methods,
        dopamine_methods,
        other_methods,
    })
}

/// Available bypass tools for iOS devices
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailableBypasses {
    /// Activation bypass tools
    pub activation: Vec<BypassToolInfo>,
    /// Passcode bypass tools
    pub passcode: Vec<BypassToolInfo>,
    /// Screen Time bypass tools
    pub screen_time: Vec<BypassToolInfo>,
    /// MDM bypass tools
    pub mdm: Vec<BypassToolInfo>,
}

/// Information about a bypass tool
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BypassToolInfo {
    /// Tool name
    pub name: String,
    /// Tool identifier
    pub id: String,
    /// Supported devices/chipsets
    pub supported_devices: Vec<String>,
    /// Tool status/availability
    pub status: String,
    /// License requirement
    pub license_required: bool,
}

/// Detect available bypass tools for a device
pub fn detect_bypass_tools(device: &IosDevice) -> Result<AvailableBypasses> {
    let mut activation = Vec::new();
    let mut passcode = Vec::new();
    let screen_time = Vec::new();
    let mdm = Vec::new();

    // Add iRemoval Pro for A12+ devices
    if matches!(
        device.chipset,
        IosChipset::A12 | IosChipset::A13 | IosChipset::A14 | IosChipset::A15 | IosChipset::A16 | IosChipset::A17 | IosChipset::A18 | IosChipset::A19
    ) {
        activation.push(BypassToolInfo {
            name: "iRemoval Pro".to_string(),
            id: "iremoval_pro".to_string(),
            supported_devices: vec!["A12+".to_string()],
            status: "Available".to_string(),
            license_required: true,
        });
    }

    // Add Checkm8.info for A11 and below
    if device.supports_checkm8() {
        activation.push(BypassToolInfo {
            name: "Checkm8.info".to_string(),
            id: "checkm8_info".to_string(),
            supported_devices: vec!["A7-A11".to_string()],
            status: "Available".to_string(),
            license_required: true,
        });

        passcode.push(BypassToolInfo {
            name: "Sliver".to_string(),
            id: "sliver".to_string(),
            supported_devices: vec!["A4-A11".to_string()],
            status: "Available (GitHub)".to_string(),
            license_required: false,
        });
    }

    // Add consumer-level tools
    activation.push(BypassToolInfo {
        name: "AnyUnlock".to_string(),
        id: "anyunlock".to_string(),
        supported_devices: vec!["All".to_string()],
        status: "Available".to_string(),
        license_required: true,
    });

    passcode.push(BypassToolInfo {
        name: "4uKey".to_string(),
        id: "4ukey".to_string(),
        supported_devices: vec!["All".to_string()],
        status: "Available".to_string(),
        license_required: true,
    });

    Ok(AvailableBypasses {
        activation,
        passcode,
        screen_time,
        mdm,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::UsbDeviceInfo;

    fn create_test_ios_device(chipset: IosChipset) -> IosDevice {
        IosDevice {
            model: "iPhone13,2".to_string(),
            chipset,
            ios_version: "16.6.1".to_string(),
            usb_info: UsbDeviceInfo::new(0x05ac, 0x1234), // Apple VID
            in_recovery: false,
            in_dfu: false,
        }
    }

    #[test]
    fn test_checkm8_support() {
        let device = create_test_ios_device(IosChipset::A11);
        assert!(device.supports_checkm8());
        assert!(!device.supports_dopamine());
    }

    #[test]
    fn test_dopamine_support() {
        let device = create_test_ios_device(IosChipset::A15);
        assert!(!device.supports_checkm8());
        assert!(device.supports_dopamine());
    }

    #[test]
    fn test_detect_jailbreak_methods() {
        let device = create_test_ios_device(IosChipset::A11);
        let methods = detect_jailbreak_methods(&device).expect("Should detect methods");
        assert!(!methods.checkm8_methods.is_empty());
    }
}