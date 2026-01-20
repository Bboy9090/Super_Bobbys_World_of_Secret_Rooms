//! Enterprise Authentication Service
//! 
//! Provides SSO, OIDC, SAML, and role-based access control.
//! Global enterprise-grade authentication with multi-tenant support.

use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, Duration};
use std::collections::HashMap;

// ═══════════════════════════════════════════════════════════════════════════
// ROLES & PERMISSIONS (Role-Based Access Control)
// ═══════════════════════════════════════════════════════════════════════════

/// Enterprise roles with hierarchical permissions
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum Role {
    /// View-only access
    Viewer,
    /// Standard operator
    Operator,
    /// Senior technician
    Technician,
    /// Supervisor with team management
    Supervisor,
    /// Administrator with full access
    Admin,
    /// System administrator (Phoenix Key holder)
    SysAdmin,
    /// Auditor with read-only compliance access
    Auditor,
    /// Custom role
    Custom(String),
}

/// Permission scopes
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum Permission {
    // Device operations
    DeviceView,
    DeviceAnalyze,
    DeviceRoute,
    DeviceExecute,
    
    // Case management
    CaseView,
    CaseCreate,
    CaseEdit,
    CaseClose,
    CaseExport,
    
    // Customer management
    CustomerView,
    CustomerCreate,
    CustomerEdit,
    
    // Reports
    ReportView,
    ReportCreate,
    ReportExport,
    
    // System
    SystemConfig,
    SystemAudit,
    SystemAdmin,
    
    // Zones
    ZoneBoot,
    ZoneDevice,
    ZoneSignal,
    ZoneMemory,
    ZonePower,
    ZoneForge,
    ZoneShadow,
    ZoneChaos,
    ZoneCore,
    
    // Star levels
    StarBronze,
    StarSilver,
    StarGold,
    StarBlack,
}

/// Role permission mapping
pub fn get_role_permissions(role: &Role) -> Vec<Permission> {
    match role {
        Role::Viewer => vec![
            Permission::DeviceView,
            Permission::CaseView,
            Permission::CustomerView,
            Permission::ReportView,
            Permission::ZoneBoot,
            Permission::ZoneDevice,
            Permission::StarBronze,
        ],
        Role::Operator => vec![
            Permission::DeviceView,
            Permission::DeviceAnalyze,
            Permission::CaseView,
            Permission::CaseCreate,
            Permission::CustomerView,
            Permission::ReportView,
            Permission::ZoneBoot,
            Permission::ZoneDevice,
            Permission::ZoneSignal,
            Permission::ZoneMemory,
            Permission::StarBronze,
            Permission::StarSilver,
        ],
        Role::Technician => vec![
            Permission::DeviceView,
            Permission::DeviceAnalyze,
            Permission::DeviceRoute,
            Permission::CaseView,
            Permission::CaseCreate,
            Permission::CaseEdit,
            Permission::CustomerView,
            Permission::CustomerCreate,
            Permission::ReportView,
            Permission::ReportCreate,
            Permission::ZoneBoot,
            Permission::ZoneDevice,
            Permission::ZoneSignal,
            Permission::ZoneMemory,
            Permission::ZonePower,
            Permission::StarBronze,
            Permission::StarSilver,
            Permission::StarGold,
        ],
        Role::Supervisor => vec![
            Permission::DeviceView,
            Permission::DeviceAnalyze,
            Permission::DeviceRoute,
            Permission::DeviceExecute,
            Permission::CaseView,
            Permission::CaseCreate,
            Permission::CaseEdit,
            Permission::CaseClose,
            Permission::CaseExport,
            Permission::CustomerView,
            Permission::CustomerCreate,
            Permission::CustomerEdit,
            Permission::ReportView,
            Permission::ReportCreate,
            Permission::ReportExport,
            Permission::ZoneBoot,
            Permission::ZoneDevice,
            Permission::ZoneSignal,
            Permission::ZoneMemory,
            Permission::ZonePower,
            Permission::ZoneForge,
            Permission::ZoneShadow,
            Permission::StarBronze,
            Permission::StarSilver,
            Permission::StarGold,
        ],
        Role::Admin | Role::SysAdmin => vec![
            Permission::DeviceView,
            Permission::DeviceAnalyze,
            Permission::DeviceRoute,
            Permission::DeviceExecute,
            Permission::CaseView,
            Permission::CaseCreate,
            Permission::CaseEdit,
            Permission::CaseClose,
            Permission::CaseExport,
            Permission::CustomerView,
            Permission::CustomerCreate,
            Permission::CustomerEdit,
            Permission::ReportView,
            Permission::ReportCreate,
            Permission::ReportExport,
            Permission::SystemConfig,
            Permission::SystemAudit,
            Permission::SystemAdmin,
            Permission::ZoneBoot,
            Permission::ZoneDevice,
            Permission::ZoneSignal,
            Permission::ZoneMemory,
            Permission::ZonePower,
            Permission::ZoneForge,
            Permission::ZoneShadow,
            Permission::ZoneChaos,
            Permission::ZoneCore,
            Permission::StarBronze,
            Permission::StarSilver,
            Permission::StarGold,
            Permission::StarBlack,
        ],
        Role::Auditor => vec![
            Permission::DeviceView,
            Permission::CaseView,
            Permission::CustomerView,
            Permission::ReportView,
            Permission::ReportExport,
            Permission::SystemAudit,
            Permission::ZoneBoot,
            Permission::ZoneDevice,
            Permission::ZoneSignal,
            Permission::StarBronze,
            Permission::StarSilver,
        ],
        Role::Custom(_) => vec![Permission::StarBronze],
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// USER & SESSION
// ═══════════════════════════════════════════════════════════════════════════

/// Enterprise user identity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub roles: Vec<Role>,
    pub tenant_id: Option<String>,
    pub department: Option<String>,
    pub manager_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_login: Option<DateTime<Utc>>,
    pub mfa_enabled: bool,
    pub hardware_keys: Vec<String>,
    pub star_level: u8,
    pub metadata: HashMap<String, String>,
}

/// Authentication session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub session_id: String,
    pub user_id: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub mfa_verified: bool,
    pub hardware_verified: bool,
    pub auth_method: AuthMethod,
}

/// Authentication method
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthMethod {
    Password,
    Oidc { provider: String },
    Saml { provider: String },
    ApiKey,
    PhoenixKey,
    HardwareToken,
}

// ═══════════════════════════════════════════════════════════════════════════
// OIDC (OpenID Connect)
// ═══════════════════════════════════════════════════════════════════════════

/// OIDC provider configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OidcConfig {
    pub provider_id: String,
    pub provider_name: String,
    pub issuer_url: String,
    pub client_id: String,
    pub client_secret_ref: String, // Reference to secret store
    pub authorization_endpoint: String,
    pub token_endpoint: String,
    pub userinfo_endpoint: String,
    pub jwks_uri: String,
    pub scopes: Vec<String>,
    pub claim_mappings: ClaimMappings,
    pub enabled: bool,
}

/// Claim mappings from OIDC to internal user
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaimMappings {
    pub sub_claim: String,
    pub email_claim: String,
    pub name_claim: String,
    pub roles_claim: Option<String>,
    pub groups_claim: Option<String>,
}

/// OIDC token response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OidcTokens {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub refresh_token: Option<String>,
    pub id_token: String,
}

// ═══════════════════════════════════════════════════════════════════════════
// SAML
// ═══════════════════════════════════════════════════════════════════════════

/// SAML provider configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamlConfig {
    pub provider_id: String,
    pub provider_name: String,
    pub entity_id: String,
    pub sso_url: String,
    pub slo_url: Option<String>,
    pub certificate: String,
    pub attribute_mappings: SamlAttributeMappings,
    pub enabled: bool,
}

/// SAML attribute mappings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SamlAttributeMappings {
    pub email_attribute: String,
    pub name_attribute: String,
    pub roles_attribute: Option<String>,
    pub groups_attribute: Option<String>,
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-TENANT
// ═══════════════════════════════════════════════════════════════════════════

/// Tenant configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tenant {
    pub id: String,
    pub name: String,
    pub domain: String,
    pub subscription_tier: SubscriptionTier,
    pub auth_config: TenantAuthConfig,
    pub feature_flags: HashMap<String, bool>,
    pub rate_limits: RateLimits,
    pub created_at: DateTime<Utc>,
    pub active: bool,
}

/// Subscription tiers
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SubscriptionTier {
    Free,
    Professional,
    Business,
    Enterprise,
    Unlimited,
}

/// Tenant auth configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantAuthConfig {
    pub password_auth_enabled: bool,
    pub oidc_providers: Vec<OidcConfig>,
    pub saml_providers: Vec<SamlConfig>,
    pub mfa_required: bool,
    pub session_timeout_hours: i32,
    pub max_sessions_per_user: i32,
}

/// Rate limits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimits {
    pub api_requests_per_minute: i32,
    pub device_operations_per_hour: i32,
    pub report_exports_per_day: i32,
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORIZATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════

/// Authorization check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthzResult {
    pub allowed: bool,
    pub reason: String,
    pub required_permissions: Vec<Permission>,
    pub user_permissions: Vec<Permission>,
    pub missing_permissions: Vec<Permission>,
    pub star_level_required: u8,
    pub user_star_level: u8,
}

/// Check if user has permission
pub fn check_permission(user: &User, permission: &Permission) -> bool {
    for role in &user.roles {
        let perms = get_role_permissions(role);
        if perms.contains(permission) {
            return true;
        }
    }
    false
}

/// Check if user can access zone
pub fn check_zone_access(user: &User, zone: &str) -> AuthzResult {
    let zone_perm = match zone {
        "boot" => Permission::ZoneBoot,
        "device" => Permission::ZoneDevice,
        "signal" => Permission::ZoneSignal,
        "memory" => Permission::ZoneMemory,
        "power" => Permission::ZonePower,
        "forge" => Permission::ZoneForge,
        "shadow" => Permission::ZoneShadow,
        "chaos" => Permission::ZoneChaos,
        "core" => Permission::ZoneCore,
        _ => Permission::ZoneBoot,
    };
    
    let star_required = match zone {
        "signal" | "memory" | "power" => 1,
        "forge" | "shadow" | "chaos" => 2,
        "core" => 3,
        _ => 0,
    };
    
    let has_perm = check_permission(user, &zone_perm);
    let has_star = user.star_level >= star_required;
    
    AuthzResult {
        allowed: has_perm && has_star,
        reason: if has_perm && has_star {
            "Access granted".to_string()
        } else if !has_perm {
            format!("Missing zone permission")
        } else {
            format!("Requires star level {}", star_required)
        },
        required_permissions: vec![zone_perm.clone()],
        user_permissions: get_user_permissions(user),
        missing_permissions: if has_perm { vec![] } else { vec![zone_perm] },
        star_level_required: star_required,
        user_star_level: user.star_level,
    }
}

/// Get all permissions for a user
pub fn get_user_permissions(user: &User) -> Vec<Permission> {
    let mut perms = Vec::new();
    for role in &user.roles {
        for perm in get_role_permissions(role) {
            if !perms.contains(&perm) {
                perms.push(perm);
            }
        }
    }
    perms
}

/// Get user's effective star level from roles
pub fn get_effective_star_level(user: &User) -> u8 {
    let perms = get_user_permissions(user);
    
    if perms.contains(&Permission::StarBlack) {
        3
    } else if perms.contains(&Permission::StarGold) {
        2
    } else if perms.contains(&Permission::StarSilver) {
        1
    } else {
        0
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════════════════════════════════════════

/// Authentication audit event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthAuditEvent {
    pub event_id: String,
    pub timestamp: DateTime<Utc>,
    pub event_type: AuthEventType,
    pub user_id: Option<String>,
    pub tenant_id: Option<String>,
    pub ip_address: String,
    pub user_agent: Option<String>,
    pub success: bool,
    pub failure_reason: Option<String>,
    pub metadata: HashMap<String, String>,
}

/// Auth event types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthEventType {
    Login,
    Logout,
    TokenRefresh,
    PasswordChange,
    MfaEnroll,
    MfaVerify,
    SessionExpired,
    AccessDenied,
    RoleChange,
    PermissionCheck,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_role_permissions() {
        let perms = get_role_permissions(&Role::Operator);
        assert!(perms.contains(&Permission::DeviceAnalyze));
        assert!(!perms.contains(&Permission::SystemAdmin));
    }

    #[test]
    fn test_check_permission() {
        let user = User {
            id: "user1".to_string(),
            email: "user@example.com".to_string(),
            name: "Test User".to_string(),
            roles: vec![Role::Technician],
            tenant_id: None,
            department: None,
            manager_id: None,
            created_at: Utc::now(),
            last_login: None,
            mfa_enabled: false,
            hardware_keys: vec![],
            star_level: 2,
            metadata: HashMap::new(),
        };
        
        assert!(check_permission(&user, &Permission::DeviceRoute));
        assert!(!check_permission(&user, &Permission::SystemAdmin));
    }

    #[test]
    fn test_zone_access() {
        let user = User {
            id: "user1".to_string(),
            email: "user@example.com".to_string(),
            name: "Test User".to_string(),
            roles: vec![Role::Technician],
            tenant_id: None,
            department: None,
            manager_id: None,
            created_at: Utc::now(),
            last_login: None,
            mfa_enabled: false,
            hardware_keys: vec![],
            star_level: 2,
            metadata: HashMap::new(),
        };
        
        let result = check_zone_access(&user, "forge");
        assert!(result.allowed);
        
        let result = check_zone_access(&user, "core");
        assert!(!result.allowed);
    }
}
