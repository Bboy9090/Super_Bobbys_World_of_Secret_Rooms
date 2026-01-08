//! Legal compliance checking for Secret Room tools
//!
//! This module provides legal compliance verification before allowing
//! execution of gray area tools.

use crate::secret_room::tools::GrayAreaTool;
use crate::secret_room::SecretRoomAccessLevel;
use anyhow::Result;
use serde::{Deserialize, Serialize};

/// Legal compliance checker for Secret Room tools
#[derive(Debug, Clone)]
pub struct LegalComplianceChecker {
    access_level: SecretRoomAccessLevel,
    /// User's stated legal basis for tool use
    legal_basis: Option<LegalBasis>,
    /// Verified authorization (if provided)
    authorization_verified: bool,
}

/// Legal basis for tool use
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LegalBasis {
    /// Device ownership - user owns the device
    DeviceOwnership {
        /// Device serial number or identifier
        device_id: String,
        /// Proof of ownership (receipt, etc.)
        ownership_proof: Option<String>,
    },
    /// Written authorization from device owner
    WrittenAuthorization {
        /// Authorization document reference
        authorization_ref: String,
        /// Owner contact information (optional, for verification)
        owner_contact: Option<String>,
    },
    /// Legal authority (court order, search warrant, etc.)
    LegalAuthority {
        /// Type of legal authority
        authority_type: String,
        /// Document reference number
        document_ref: String,
        /// Issuing authority
        issuing_authority: String,
    },
    /// Security research exemption (DMCA Section 1201, etc.)
    SecurityResearch {
        /// Research project identifier
        project_id: String,
        /// Institution or organization
        institution: String,
        /// Responsible disclosure plan
        disclosure_plan: Option<String>,
    },
    /// Authorized service provider
    AuthorizedService {
        /// Service provider identifier
        provider_id: String,
        /// Authorization from OEM or customer
        authorization_ref: String,
    },
}

impl LegalComplianceChecker {
    /// Create a new legal compliance checker
    pub fn new(access_level: SecretRoomAccessLevel) -> Result<Self> {
        Ok(Self {
            access_level,
            legal_basis: None,
            authorization_verified: false,
        })
    }

    /// Set the legal basis for tool use
    ///
    /// This should be called before attempting to use tools,
    /// documenting the user's legal justification.
    pub fn set_legal_basis(&mut self, basis: LegalBasis) {
        self.legal_basis = Some(basis);
    }

    /// Verify authorization (if applicable)
    ///
    /// In a full implementation, this might:
    /// - Verify legal documents
    /// - Check against databases
    /// - Contact authorization sources
    pub fn verify_authorization(&mut self) -> Result<bool> {
        // Placeholder: In production, this would perform actual verification
        // For now, we assume authorization is provided correctly if legal basis is set
        self.authorization_verified = self.legal_basis.is_some();
        Ok(self.authorization_verified)
    }

    /// Check if a tool is compliant for execution
    ///
    /// This performs:
    /// - Access level verification
    /// - Legal basis verification
    /// - Tool-specific compliance checks
    pub fn check_tool_compliance(&self, tool: &GrayAreaTool) -> Result<bool> {
        // Note: We accept a reference, but tool cannot be Debug due to Box<dyn Fn>
        // In production, we might pass tool metadata instead
        // Check if legal basis is required and provided
        if tool.requires_legal_basis && self.legal_basis.is_none() {
            log::warn!("Tool {} requires legal basis but none provided", tool.id);
            return Ok(false);
        }

        // Check authorization if required
        if tool.requires_authorization && !self.authorization_verified {
            log::warn!("Tool {} requires verified authorization", tool.id);
            return Ok(false);
        }

        // Check access level
        if !tool.is_accessible_at(self.access_level) {
            log::warn!("Tool {} not accessible at access level {:?}", tool.id, self.access_level);
            return Ok(false);
        }

        // Check jurisdiction-specific compliance
        // In production, this would check against actual jurisdiction databases
        if tool.restricted_jurisdictions.is_some() {
            log::warn!("Tool {} may be restricted in some jurisdictions", tool.id);
            // In production, verify user's jurisdiction
        }

        Ok(true)
    }

    /// Get compliance status summary
    pub fn get_compliance_status(&self) -> ComplianceStatus {
        ComplianceStatus {
            legal_basis_provided: self.legal_basis.is_some(),
            authorization_verified: self.authorization_verified,
            access_level: self.access_level,
        }
    }
}

/// Compliance status summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceStatus {
    pub legal_basis_provided: bool,
    pub authorization_verified: bool,
    pub access_level: SecretRoomAccessLevel,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::secret_room::tools::{GrayAreaTool, ToolRiskLevel};

    fn create_test_tool() -> GrayAreaTool {
        GrayAreaTool {
            id: "test_tool".to_string(),
            name: "Test Tool".to_string(),
            description: "A test tool".to_string(),
            risk_level: ToolRiskLevel::Medium,
            requires_legal_basis: true,
            requires_authorization: true,
            restricted_jurisdictions: None,
            minimum_access_level: SecretRoomAccessLevel::Enterprise,
            execute: Box::new(|_| Ok(())),
        }
    }

    #[test]
    fn test_compliance_checker_creation() {
        let checker = LegalComplianceChecker::new(SecretRoomAccessLevel::Enterprise)
            .expect("Should create checker");
        assert_eq!(checker.access_level, SecretRoomAccessLevel::Enterprise);
    }

    #[test]
    fn test_compliance_check_without_legal_basis() {
        let checker = LegalComplianceChecker::new(SecretRoomAccessLevel::Enterprise)
            .expect("Should create checker");
        let tool = create_test_tool();

        // Tool requires legal basis, but none provided
        let result = checker.check_tool_compliance(&tool).expect("Should return result");
        assert!(!result, "Should fail compliance check without legal basis");
    }

    #[test]
    fn test_compliance_check_with_legal_basis() {
        let mut checker = LegalComplianceChecker::new(SecretRoomAccessLevel::Enterprise)
            .expect("Should create checker");
        let tool = create_test_tool();

        // Set legal basis
        checker.set_legal_basis(LegalBasis::DeviceOwnership {
            device_id: "TEST123".to_string(),
            ownership_proof: None,
        });

        // Verify authorization
        checker.verify_authorization().expect("Should verify");

        // Should pass compliance check
        let result = checker.check_tool_compliance(&tool).expect("Should return result");
        assert!(result, "Should pass compliance check with legal basis");
    }
}