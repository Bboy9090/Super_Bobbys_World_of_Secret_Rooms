//! Workflow automation for device processing
//!
//! This module provides workflow automation capabilities, allowing
//! users to define sequences of operations to perform on devices.

use crate::platform::{PlatformOrchestrator, DetectedDevice};
use anyhow::{Context, Result};
use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// A workflow step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    /// Step name/description
    pub name: String,
    /// Tool ID to execute
    pub tool_id: String,
    /// Tool parameters
    pub parameters: HashMap<String, String>,
    /// Whether this step is required (workflow fails if step fails)
    pub required: bool,
}

impl WorkflowStep {
    /// Create a new workflow step
    pub fn new(name: String, tool_id: String, parameters: HashMap<String, String>, required: bool) -> Self {
        Self {
            name,
            tool_id,
            parameters,
            required,
        }
    }
}

/// A workflow for automated device processing
#[derive(Debug, Clone)]
pub struct Workflow {
    /// Workflow name
    name: String,
    /// Workflow steps
    steps: Vec<WorkflowStep>,
}

impl Workflow {
    /// Create a new workflow
    pub fn new(name: String, steps: Vec<WorkflowStep>) -> Result<Self> {
        if steps.is_empty() {
            anyhow::bail!("Workflow must have at least one step");
        }

        Ok(Self { name, steps })
    }

    /// Get workflow name
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Execute the workflow on a device
    pub fn execute(&self, device: &DetectedDevice, orchestrator: &PlatformOrchestrator) -> Result<()> {
        info!("Executing workflow: {} ({} steps)", self.name, self.steps.len());

        for (index, step) in self.steps.iter().enumerate() {
            info!("Step {}/{}: {}", index + 1, self.steps.len(), step.name);

            match orchestrator.execute_tool(device, &step.tool_id, step.parameters.clone()) {
                Ok(()) => {
                    info!("Step {} completed successfully", index + 1);
                }
                Err(e) => {
                    if step.required {
                        anyhow::bail!("Required step '{}' failed: {}", step.name, e);
                    } else {
                        warn!("Optional step '{}' failed: {}", step.name, e);
                    }
                }
            }
        }

        info!("Workflow '{}' completed successfully", self.name);
        Ok(())
    }

    /// Get workflow steps
    pub fn steps(&self) -> &[WorkflowStep] {
        &self.steps
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_workflow_creation() {
        let steps = vec![
            WorkflowStep::new(
                "Step 1".to_string(),
                "test_tool".to_string(),
                HashMap::new(),
                true,
            ),
        ];

        let workflow = Workflow::new("Test Workflow".to_string(), steps);
        assert!(workflow.is_ok());
    }

    #[test]
    fn test_workflow_empty_steps() {
        let workflow = Workflow::new("Empty Workflow".to_string(), Vec::new());
        assert!(workflow.is_err());
    }
}