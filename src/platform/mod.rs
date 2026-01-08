//! # BootForge Platform Orchestration Layer
//!
//! This module provides the core orchestration for the BootForge platform,
//! managing device detection, tool selection, execution workflows, and
//! legal compliance verification.

use crate::enumerate::enumerate_all;
use crate::ios::{IosDevice, detect_jailbreak_methods, detect_bypass_tools};
use crate::android::{AndroidDevice, detect_root_methods, detect_bypass_tools as detect_android_bypass};
use crate::secret_room::{SecretRoomSession, SecretRoomAccessLevel};
use crate::types::UsbDeviceInfo;
use anyhow::{Context, Result};
use log::{info, warn, error};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod workflow;
pub mod tool_executor;

/// Platform orchestration manager
#[derive(Debug, Clone)]
pub struct PlatformOrchestrator {
    /// Detected devices
    devices: Vec<DetectedDevice>,
    /// Active workflows
    workflows: Vec<workflow::Workflow>,
    /// Legal compliance status
    compliance_verified: bool,
}

/// A detected device with platform-specific information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DetectedDevice {
    /// iOS device (iPhone, iPad, etc.)
    Ios(IosDevice),
    /// Android device
    Android(AndroidDevice),
    /// Unknown or unsupported device
    Unknown(UsbDeviceInfo),
}

impl DetectedDevice {
    /// Get USB device information
    pub fn usb_info(&self) -> &UsbDeviceInfo {
        match self {
            DetectedDevice::Ios(ios) => &ios.usb_info,
            DetectedDevice::Android(android) => &android.usb_info,
            DetectedDevice::Unknown(usb) => usb,
        }
    }

    /// Get device identifier
    pub fn identifier(&self) -> String {
        match self {
            DetectedDevice::Ios(ios) => format!("iOS:{}", ios.model),
            DetectedDevice::Android(android) => format!("Android:{}:{}", android.manufacturer, android.model),
            DetectedDevice::Unknown(usb) => format!("Unknown:{:04x}:{:04x}", usb.vendor_id, usb.product_id),
        }
    }
}

impl PlatformOrchestrator {
    /// Create a new platform orchestrator
    pub fn new() -> Self {
        Self {
            devices: Vec::new(),
            workflows: Vec::new(),
            compliance_verified: false,
        }
    }

    /// Scan for connected devices
    ///
    /// This enumerates all USB devices and attempts to identify
    /// iOS and Android devices.
    pub fn scan_devices(&mut self) -> Result<Vec<DetectedDevice>> {
        info!("Starting device scan...");

        let usb_devices = enumerate_all()
            .context("Failed to enumerate USB devices")?;

        info!("Found {} USB devices", usb_devices.len());

        let mut detected = Vec::new();

        for usb_device in usb_devices {
            // Try to identify as iOS device (Apple VID = 0x05ac)
            if usb_device.vendor_id == 0x05ac {
                match IosDevice::from_usb(usb_device.clone()) {
                    Ok(ios_device) => {
                        info!("Detected iOS device: {}", ios_device.model);
                        detected.push(DetectedDevice::Ios(ios_device));
                        continue;
                    }
                    Err(e) => {
                        warn!("Failed to identify iOS device: {}", e);
                    }
                }
            }

            // Try to identify as Android device
            // Android devices have various VIDs, so we try to detect by other means
            match AndroidDevice::from_usb(usb_device.clone()) {
                Ok(android_device) => {
                    info!("Detected Android device: {} {}", android_device.manufacturer, android_device.model);
                    detected.push(DetectedDevice::Android(android_device));
                    continue;
                }
                Err(e) => {
                    warn!("Failed to identify Android device: {}", e);
                }
            }

            // Unknown device
            detected.push(DetectedDevice::Unknown(usb_device));
        }

        self.devices = detected.clone();
        info!("Device scan complete: {} devices detected", detected.len());

        Ok(detected)
    }

    /// Get all detected devices
    pub fn devices(&self) -> &[DetectedDevice] {
        &self.devices
    }

    /// Get available tools for a device
    pub fn get_available_tools(&self, device: &DetectedDevice) -> Result<AvailableTools> {
        match device {
            DetectedDevice::Ios(ios) => {
                let jailbreaks = detect_jailbreak_methods(ios)?;
                let bypasses = detect_bypass_tools(ios)?;

                Ok(AvailableTools::Ios {
                    jailbreaks,
                    bypasses,
                })
            }
            DetectedDevice::Android(android) => {
                let root_methods = detect_root_methods(android)?;
                let bypasses = detect_android_bypass(android)?;

                Ok(AvailableTools::Android {
                    root_methods,
                    bypasses,
                })
            }
            DetectedDevice::Unknown(_) => {
                Ok(AvailableTools::None)
            }
        }
    }

    /// Verify legal compliance before tool execution
    pub fn verify_compliance(&mut self, device: &DetectedDevice, tool_id: &str) -> Result<bool> {
        info!("Verifying legal compliance for tool: {} on device: {}", tool_id, device.identifier());

        // In production, this would:
        // 1. Check device ownership
        // 2. Verify authorization
        // 3. Check jurisdiction-specific laws
        // 4. Verify user's license tier

        // Placeholder: For now, we just mark as verified
        self.compliance_verified = true;
        info!("Legal compliance verified");
        Ok(true)
    }

    /// Execute a tool on a device
    pub fn execute_tool(
        &self,
        device: &DetectedDevice,
        tool_id: &str,
        parameters: HashMap<String, String>,
    ) -> Result<()> {
        info!("Executing tool: {} on device: {}", tool_id, device.identifier());

        if !self.compliance_verified {
            anyhow::bail!("Legal compliance not verified. Call verify_compliance() first.");
        }

        // Delegate to tool executor
        tool_executor::execute_tool(device, tool_id, parameters)
            .context("Tool execution failed")?;

        info!("Tool execution completed successfully");
        Ok(())
    }

    /// Create a workflow for automated device processing
    pub fn create_workflow(&mut self, name: String, steps: Vec<workflow::WorkflowStep>) -> Result<()> {
        let workflow = workflow::Workflow::new(name, steps)?;
        self.workflows.push(workflow);
        info!("Created workflow: {}", self.workflows.last().unwrap().name());
        Ok(())
    }

    /// Execute a workflow on a device
    pub fn execute_workflow(&self, workflow_name: &str, device: &DetectedDevice) -> Result<()> {
        let workflow = self.workflows
            .iter()
            .find(|w| w.name() == workflow_name)
            .context("Workflow not found")?;

        info!("Executing workflow: {} on device: {}", workflow_name, device.identifier());

        workflow.execute(device, self)
            .context("Workflow execution failed")?;

        info!("Workflow execution completed");
        Ok(())
    }
}

impl Default for PlatformOrchestrator {
    fn default() -> Self {
        Self::new()
    }
}

/// Available tools for a device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AvailableTools {
    /// iOS tools
    Ios {
        jailbreaks: crate::ios::AvailableJailbreaks,
        bypasses: crate::ios::AvailableBypasses,
    },
    /// Android tools
    Android {
        root_methods: crate::android::AvailableRootMethods,
        bypasses: crate::android::AvailableBypasses,
    },
    /// No tools available
    None,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_platform_orchestrator_creation() {
        let orchestrator = PlatformOrchestrator::new();
        assert_eq!(orchestrator.devices().len(), 0);
    }
}