"""
Phoenix Core - Authority Routing Table

Routes devices and operations to appropriate external authorities.
Determines escalation paths based on device state, risk level, and jurisdiction.
"""
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime, timezone


class AuthorityType(Enum):
    """Types of external authorities."""
    OEM = "oem"                    # Original Equipment Manufacturer
    CARRIER = "carrier"            # Mobile carrier
    ENTERPRISE = "enterprise"      # Enterprise MDM administrator
    LAW_ENFORCEMENT = "law_enforcement"
    LEGAL_COUNSEL = "legal_counsel"
    REPAIR_CENTER = "repair_center"
    CERTIFICATION_BODY = "certification_body"
    INTERNAL = "internal"          # Internal escalation
    NONE = "none"                  # No escalation needed


class EscalationPriority(Enum):
    """Escalation priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class Authority:
    """An external authority for routing."""
    id: str
    name: str
    authority_type: str
    contact_method: str  # "api", "email", "phone", "portal", "manual"
    endpoint: Optional[str] = None
    jurisdiction: Optional[str] = None
    capabilities: List[str] = field(default_factory=list)
    response_time_hours: int = 24
    requires_documentation: bool = True


@dataclass
class RoutingRule:
    """A rule for routing to authorities."""
    id: str
    name: str
    description: str
    conditions: Dict[str, Any]
    authority_id: str
    priority: str
    required_star_level: int
    auto_route: bool = False


@dataclass
class RoutingDecision:
    """Result of a routing decision."""
    should_route: bool
    authority: Optional[Authority]
    priority: str
    reason: str
    documentation_required: List[str]
    estimated_response_hours: int
    power_star_level: int
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))


# Authority Registry
AUTHORITIES: Dict[str, Authority] = {
    "apple_support": Authority(
        id="apple_support",
        name="Apple Support",
        authority_type=AuthorityType.OEM.value,
        contact_method="portal",
        endpoint="https://support.apple.com/",
        jurisdiction="global",
        capabilities=["activation_lock", "icloud_unlock", "device_verification"],
        response_time_hours=48,
        requires_documentation=True
    ),
    "samsung_support": Authority(
        id="samsung_support",
        name="Samsung Support",
        authority_type=AuthorityType.OEM.value,
        contact_method="portal",
        endpoint="https://www.samsung.com/support/",
        jurisdiction="global",
        capabilities=["frp_unlock", "knox_management", "device_verification"],
        response_time_hours=72,
        requires_documentation=True
    ),
    "google_support": Authority(
        id="google_support",
        name="Google Support",
        authority_type=AuthorityType.OEM.value,
        contact_method="portal",
        endpoint="https://support.google.com/",
        jurisdiction="global",
        capabilities=["frp_unlock", "google_account", "device_verification"],
        response_time_hours=48,
        requires_documentation=True
    ),
    "carrier_generic": Authority(
        id="carrier_generic",
        name="Mobile Carrier",
        authority_type=AuthorityType.CARRIER.value,
        contact_method="manual",
        jurisdiction="regional",
        capabilities=["sim_unlock", "account_verification"],
        response_time_hours=24,
        requires_documentation=True
    ),
    "enterprise_mdm": Authority(
        id="enterprise_mdm",
        name="Enterprise MDM Administrator",
        authority_type=AuthorityType.ENTERPRISE.value,
        contact_method="manual",
        jurisdiction="organization",
        capabilities=["mdm_removal", "policy_override", "device_ownership"],
        response_time_hours=4,
        requires_documentation=True
    ),
    "legal_counsel": Authority(
        id="legal_counsel",
        name="Legal Counsel",
        authority_type=AuthorityType.LEGAL_COUNSEL.value,
        contact_method="manual",
        jurisdiction="global",
        capabilities=["legal_review", "compliance_verification", "risk_assessment"],
        response_time_hours=72,
        requires_documentation=True
    ),
    "repair_center": Authority(
        id="repair_center",
        name="Authorized Repair Center",
        authority_type=AuthorityType.REPAIR_CENTER.value,
        contact_method="manual",
        jurisdiction="local",
        capabilities=["hardware_repair", "component_replacement", "diagnostics"],
        response_time_hours=24,
        requires_documentation=False
    ),
    "internal_review": Authority(
        id="internal_review",
        name="Internal Review Board",
        authority_type=AuthorityType.INTERNAL.value,
        contact_method="internal",
        jurisdiction="organization",
        capabilities=["policy_exception", "risk_override", "authorization"],
        response_time_hours=2,
        requires_documentation=True
    )
}

# Routing Rules
ROUTING_RULES: List[RoutingRule] = [
    RoutingRule(
        id="rule_apple_activation_lock",
        name="Apple Activation Lock",
        description="Route to Apple for iCloud/Activation Lock issues",
        conditions={
            "platform": "ios",
            "security.frp_active": True
        },
        authority_id="apple_support",
        priority=EscalationPriority.HIGH.value,
        required_star_level=2,
        auto_route=False
    ),
    RoutingRule(
        id="rule_samsung_frp",
        name="Samsung FRP Lock",
        description="Route to Samsung for Factory Reset Protection",
        conditions={
            "identity.manufacturer": "samsung",
            "security.frp_active": True
        },
        authority_id="samsung_support",
        priority=EscalationPriority.HIGH.value,
        required_star_level=2,
        auto_route=False
    ),
    RoutingRule(
        id="rule_google_frp",
        name="Google FRP Lock",
        description="Route to Google for Pixel/Android FRP",
        conditions={
            "platform.type": "android",
            "security.frp_active": True,
            "identity.manufacturer": "google"
        },
        authority_id="google_support",
        priority=EscalationPriority.HIGH.value,
        required_star_level=2,
        auto_route=False
    ),
    RoutingRule(
        id="rule_mdm_enrolled",
        name="Enterprise MDM Enrolled",
        description="Route to enterprise admin for MDM-managed devices",
        conditions={
            "security.mdm_enrolled": True
        },
        authority_id="enterprise_mdm",
        priority=EscalationPriority.CRITICAL.value,
        required_star_level=2,
        auto_route=True
    ),
    RoutingRule(
        id="rule_high_risk",
        name="High Risk Assessment",
        description="Route to legal for high-risk devices",
        conditions={
            "classification.risk_level": "high"
        },
        authority_id="legal_counsel",
        priority=EscalationPriority.HIGH.value,
        required_star_level=2,
        auto_route=False
    ),
    RoutingRule(
        id="rule_critical_risk",
        name="Critical Risk Assessment",
        description="Route to internal review for critical-risk devices",
        conditions={
            "classification.risk_level": "critical"
        },
        authority_id="internal_review",
        priority=EscalationPriority.CRITICAL.value,
        required_star_level=3,
        auto_route=True
    ),
    RoutingRule(
        id="rule_hardware_issue",
        name="Hardware Issue",
        description="Route to repair center for hardware problems",
        conditions={
            "classification.device_class": "hardware_modified"
        },
        authority_id="repair_center",
        priority=EscalationPriority.MEDIUM.value,
        required_star_level=1,
        auto_route=False
    )
]


def get_nested_value(data: Dict, path: str) -> Any:
    """Get a nested value from a dict using dot notation."""
    keys = path.split(".")
    value = data
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return None
    return value


def check_condition(device_state: Dict, conditions: Dict[str, Any]) -> bool:
    """Check if device state matches routing conditions."""
    for path, expected in conditions.items():
        actual = get_nested_value(device_state, path)
        if actual != expected:
            return False
    return True


def route_device(device_state: Dict, user_star_level: int = 0) -> RoutingDecision:
    """
    Determine the routing decision for a device.
    
    Args:
        device_state: Device state dictionary (Unified Device State schema)
        user_star_level: User's Power Star level (0-3)
    
    Returns:
        RoutingDecision with routing information
    """
    # Check each rule in order
    for rule in ROUTING_RULES:
        if check_condition(device_state, rule.conditions):
            authority = AUTHORITIES.get(rule.authority_id)
            
            if not authority:
                continue
            
            # Check if user has required star level
            if user_star_level < rule.required_star_level:
                return RoutingDecision(
                    should_route=True,
                    authority=authority,
                    priority=rule.priority,
                    reason=f"Matched rule: {rule.name}. Requires Star Level {rule.required_star_level}.",
                    documentation_required=["proof_of_ownership", "device_receipt", "id_verification"],
                    estimated_response_hours=authority.response_time_hours,
                    power_star_level=rule.required_star_level
                )
            
            return RoutingDecision(
                should_route=True,
                authority=authority,
                priority=rule.priority,
                reason=f"Matched rule: {rule.name}",
                documentation_required=["proof_of_ownership"] if authority.requires_documentation else [],
                estimated_response_hours=authority.response_time_hours,
                power_star_level=rule.required_star_level
            )
    
    # No routing needed
    return RoutingDecision(
        should_route=False,
        authority=None,
        priority=EscalationPriority.LOW.value,
        reason="No escalation required",
        documentation_required=[],
        estimated_response_hours=0,
        power_star_level=0
    )


def get_authorities_for_capability(capability: str) -> List[Authority]:
    """Get all authorities that have a specific capability."""
    return [a for a in AUTHORITIES.values() if capability in a.capabilities]


def export_routing_table_json() -> str:
    """Export the complete routing table as JSON."""
    return json.dumps({
        "authorities": {k: asdict(v) for k, v in AUTHORITIES.items()},
        "rules": [asdict(r) for r in ROUTING_RULES],
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }, indent=2)


def record_routing_decision(device_id: str, decision: RoutingDecision) -> Dict[str, Any]:
    """Record a routing decision to history."""
    record = {
        "device_id": device_id,
        "decision": asdict(decision),
        "recorded_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }
    
    # Would save to storage here
    return record


if __name__ == "__main__":
    # Example usage
    sample_device = {
        "device_id": "ABC123",
        "platform": {"type": "android"},
        "identity": {"manufacturer": "samsung"},
        "security": {"frp_active": True},
        "classification": {"risk_level": "medium"}
    }
    
    decision = route_device(sample_device, user_star_level=1)
    print(json.dumps(asdict(decision), indent=2))
