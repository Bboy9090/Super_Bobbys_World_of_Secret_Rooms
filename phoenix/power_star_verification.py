"""
Phoenix Core - Power Star Verification

Verifies and enforces Power Star permissions for all operations.
Integrates with the World Map zone access and authority routing.
"""
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timezone
import hashlib
import hmac
import os


class StarLevel(Enum):
    """Power Star levels."""
    BRONZE = 0      # View / Observe
    SILVER = 1      # Route / Prepare / Analyze
    GOLD = 2        # Execute via downstream
    BLACK_STAR = 3  # Core-only (Phoenix Key)


class Permission(Enum):
    """Available permissions."""
    VIEW = "view"
    OBSERVE = "observe"
    READ = "read"
    ROUTE = "route"
    PREPARE = "prepare"
    ANALYZE = "analyze"
    EXECUTE = "execute"
    EXPORT = "export"
    CORE = "core"
    PHOENIX = "phoenix"
    FORGE = "forge"


# Permission matrix
STAR_PERMISSIONS: Dict[int, List[str]] = {
    0: ["view", "observe", "read"],
    1: ["view", "observe", "read", "route", "prepare", "analyze"],
    2: ["view", "observe", "read", "route", "prepare", "analyze", "execute", "export"],
    3: ["view", "observe", "read", "route", "prepare", "analyze", "execute", "export", "core", "phoenix", "forge"]
}

# Zone access requirements
ZONE_REQUIREMENTS: Dict[str, int] = {
    "boot": 0,
    "device": 0,
    "signal": 1,
    "memory": 1,
    "power": 1,
    "forge": 2,
    "shadow": 2,
    "chaos": 2,
    "core": 3
}

# Operation requirements
OPERATION_REQUIREMENTS: Dict[str, Tuple[int, List[str]]] = {
    "view_device": (0, ["view"]),
    "analyze_device": (1, ["analyze"]),
    "route_device": (1, ["route"]),
    "export_report": (2, ["export"]),
    "execute_diagnostic": (2, ["execute"]),
    "access_core": (3, ["core"]),
    "phoenix_key_operation": (3, ["phoenix"]),
    "forge_operation": (3, ["forge"])
}


@dataclass
class StarVerificationResult:
    """Result of a star verification check."""
    allowed: bool
    user_level: int
    required_level: int
    user_permissions: List[str]
    required_permissions: List[str]
    missing_permissions: List[str]
    reason: str
    timestamp: str


@dataclass
class PhoenixKey:
    """Phoenix Key for Black Star verification."""
    key_id: str
    created_at: str
    expires_at: Optional[str]
    holder_id: str
    permissions: List[str]
    hardware_bound: bool
    hardware_id: Optional[str]
    signature: str


class PowerStarVerifier:
    """Verifies Power Star permissions."""
    
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key or os.environ.get("PHOENIX_SECRET", "default-dev-key")
    
    def get_permissions(self, star_level: int) -> List[str]:
        """Get all permissions for a star level."""
        return STAR_PERMISSIONS.get(star_level, [])
    
    def has_permission(self, star_level: int, permission: str) -> bool:
        """Check if a star level has a specific permission."""
        return permission in self.get_permissions(star_level)
    
    def can_access_zone(self, star_level: int, zone: str) -> bool:
        """Check if star level can access a zone."""
        required = ZONE_REQUIREMENTS.get(zone, 0)
        return star_level >= required
    
    def verify_operation(self, star_level: int, operation: str) -> StarVerificationResult:
        """Verify if a star level can perform an operation."""
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
        if operation not in OPERATION_REQUIREMENTS:
            return StarVerificationResult(
                allowed=False,
                user_level=star_level,
                required_level=0,
                user_permissions=self.get_permissions(star_level),
                required_permissions=[],
                missing_permissions=[],
                reason=f"Unknown operation: {operation}",
                timestamp=now
            )
        
        required_level, required_perms = OPERATION_REQUIREMENTS[operation]
        user_perms = self.get_permissions(star_level)
        missing = [p for p in required_perms if p not in user_perms]
        
        allowed = star_level >= required_level and len(missing) == 0
        
        return StarVerificationResult(
            allowed=allowed,
            user_level=star_level,
            required_level=required_level,
            user_permissions=user_perms,
            required_permissions=required_perms,
            missing_permissions=missing,
            reason="Access granted" if allowed else f"Requires {self._level_name(required_level)}",
            timestamp=now
        )
    
    def verify_zone_access(self, star_level: int, zone: str) -> StarVerificationResult:
        """Verify if star level can access a zone."""
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
        required = ZONE_REQUIREMENTS.get(zone, 0)
        allowed = star_level >= required
        
        return StarVerificationResult(
            allowed=allowed,
            user_level=star_level,
            required_level=required,
            user_permissions=self.get_permissions(star_level),
            required_permissions=[],
            missing_permissions=[],
            reason="Zone access granted" if allowed else f"Zone requires {self._level_name(required)}",
            timestamp=now
        )
    
    def verify_device_access(self, star_level: int, device_state: Dict) -> StarVerificationResult:
        """Verify if star level can access a device based on its state."""
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
        # Get required level from device state
        power_star = device_state.get("power_star", {})
        required = power_star.get("required_level", 0)
        required_perms = power_star.get("permissions_needed", [])
        
        # Also check classification risk
        classification = device_state.get("classification", {})
        risk = classification.get("risk_level", "low")
        if risk == "critical":
            required = max(required, 3)
        elif risk == "high":
            required = max(required, 2)
        elif risk == "medium":
            required = max(required, 1)
        
        user_perms = self.get_permissions(star_level)
        missing = [p for p in required_perms if p not in user_perms]
        allowed = star_level >= required and len(missing) == 0
        
        return StarVerificationResult(
            allowed=allowed,
            user_level=star_level,
            required_level=required,
            user_permissions=user_perms,
            required_permissions=required_perms,
            missing_permissions=missing,
            reason="Device access granted" if allowed else f"Device requires {self._level_name(required)}",
            timestamp=now
        )
    
    def _level_name(self, level: int) -> str:
        """Get human-readable name for star level."""
        names = {0: "Bronze Star", 1: "Silver Star", 2: "Gold Star", 3: "Black Star"}
        return names.get(level, f"Level {level}")
    
    # ═══════════════════════════════════════════════════════════════════════
    # Phoenix Key Operations (Black Star)
    # ═══════════════════════════════════════════════════════════════════════
    
    def generate_phoenix_key(self, holder_id: str, hardware_id: Optional[str] = None,
                             expires_hours: int = 24) -> PhoenixKey:
        """Generate a Phoenix Key for Black Star access."""
        now = datetime.now(timezone.utc)
        key_id = f"PHOENIX-{now.strftime('%Y%m%d-%H%M%S')}-{holder_id[:8]}"
        
        # Create signature
        data = f"{key_id}|{holder_id}|{hardware_id or 'none'}"
        signature = hmac.new(
            self.secret_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        expires_at = None
        if expires_hours > 0:
            from datetime import timedelta
            expires_at = (now + timedelta(hours=expires_hours)).isoformat().replace("+00:00", "Z")
        
        return PhoenixKey(
            key_id=key_id,
            created_at=now.isoformat().replace("+00:00", "Z"),
            expires_at=expires_at,
            holder_id=holder_id,
            permissions=STAR_PERMISSIONS[3],
            hardware_bound=hardware_id is not None,
            hardware_id=hardware_id,
            signature=signature
        )
    
    def verify_phoenix_key(self, key: PhoenixKey, hardware_id: Optional[str] = None) -> Tuple[bool, str]:
        """Verify a Phoenix Key is valid."""
        # Check expiration
        if key.expires_at:
            expires = datetime.fromisoformat(key.expires_at.replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > expires:
                return False, "Phoenix Key has expired"
        
        # Check hardware binding
        if key.hardware_bound:
            if hardware_id != key.hardware_id:
                return False, "Phoenix Key is bound to different hardware"
        
        # Verify signature
        data = f"{key.key_id}|{key.holder_id}|{key.hardware_id or 'none'}"
        expected_sig = hmac.new(
            self.secret_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(key.signature, expected_sig):
            return False, "Invalid Phoenix Key signature"
        
        return True, "Phoenix Key verified"
    
    def elevate_with_phoenix_key(self, key: PhoenixKey, hardware_id: Optional[str] = None) -> Tuple[int, str]:
        """Elevate to Black Star level using Phoenix Key."""
        valid, reason = self.verify_phoenix_key(key, hardware_id)
        if valid:
            return 3, "Elevated to Black Star"
        return 0, reason


# Global verifier instance
_verifier = PowerStarVerifier()


def verify_permission(star_level: int, permission: str) -> bool:
    """Quick permission check."""
    return _verifier.has_permission(star_level, permission)


def verify_zone(star_level: int, zone: str) -> StarVerificationResult:
    """Verify zone access."""
    return _verifier.verify_zone_access(star_level, zone)


def verify_operation(star_level: int, operation: str) -> StarVerificationResult:
    """Verify operation access."""
    return _verifier.verify_operation(star_level, operation)


def verify_device(star_level: int, device_state: Dict) -> StarVerificationResult:
    """Verify device access."""
    return _verifier.verify_device_access(star_level, device_state)


def get_star_info(level: int) -> Dict[str, Any]:
    """Get information about a star level."""
    names = {0: "Bronze", 1: "Silver", 2: "Gold", 3: "Black Star"}
    icons = {0: "⭐", 1: "⭐⭐", 2: "⭐⭐⭐", 3: "🌟"}
    
    return {
        "level": level,
        "name": names.get(level, "Unknown"),
        "icon": icons.get(level, "?"),
        "permissions": STAR_PERMISSIONS.get(level, []),
        "zones_accessible": [z for z, req in ZONE_REQUIREMENTS.items() if req <= level]
    }


if __name__ == "__main__":
    # Example usage
    verifier = PowerStarVerifier()
    
    # Test zone access
    result = verifier.verify_zone_access(1, "forge")
    print(f"Silver -> Forge: {result.allowed} ({result.reason})")
    
    result = verifier.verify_zone_access(2, "forge")
    print(f"Gold -> Forge: {result.allowed} ({result.reason})")
    
    # Test Phoenix Key
    key = verifier.generate_phoenix_key("user123", hardware_id="HW-ABC123")
    print(f"\nPhoenix Key: {key.key_id}")
    
    valid, reason = verifier.verify_phoenix_key(key, "HW-ABC123")
    print(f"Verification: {valid} - {reason}")
