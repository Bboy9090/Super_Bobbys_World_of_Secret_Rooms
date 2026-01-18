"""
Phoenix Core - Memory Persistence

Persistent memory system for Phoenix Core operations.
Stores device state, routing history, and session data.
"""
import os
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
import hashlib


# Storage paths
STORAGE_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")
PHOENIX_STORAGE = os.path.join(STORAGE_ROOT, "phoenix")
DEVICE_MEMORY_FILE = os.path.join(PHOENIX_STORAGE, "device_memory.json")
ROUTING_HISTORY_FILE = os.path.join(PHOENIX_STORAGE, "routing_history.json")
SESSION_STATE_FILE = os.path.join(PHOENIX_STORAGE, "session_state.json")

# Ensure directories exist
os.makedirs(PHOENIX_STORAGE, exist_ok=True)


@dataclass
class DeviceMemoryEntry:
    """A device in persistent memory."""
    device_id: str
    fingerprint: str  # Hash of device identifiers
    first_seen: str
    last_seen: str
    connection_count: int
    last_state: Dict[str, Any]
    last_routing: Optional[Dict[str, Any]] = None
    notes: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)


@dataclass
class RoutingHistoryEntry:
    """A routing decision in history."""
    id: str
    device_id: str
    authority_id: str
    authority_name: str
    priority: str
    reason: str
    timestamp: str
    resolved: bool = False
    resolution: Optional[str] = None
    resolved_at: Optional[str] = None


@dataclass 
class SessionState:
    """Persistent session state."""
    session_id: str
    started_at: str
    last_activity: str
    current_zone: str
    star_level: int
    active_device_id: Optional[str]
    routing_queue: List[str]
    preferences: Dict[str, Any]


def generate_fingerprint(device_state: Dict) -> str:
    """Generate a stable fingerprint for a device."""
    # Use available identifiers
    identity = device_state.get("identity", {})
    parts = [
        identity.get("vendor_id", ""),
        identity.get("product_id", ""),
        identity.get("serial", ""),
        identity.get("manufacturer", ""),
        identity.get("model", "")
    ]
    data = "|".join(str(p) for p in parts if p)
    return hashlib.sha256(data.encode()).hexdigest()[:16]


def _load_json(filepath: str) -> Dict:
    """Load JSON file, return empty dict if not exists."""
    if not os.path.exists(filepath):
        return {}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}


def _save_json(filepath: str, data: Dict) -> None:
    """Save data to JSON file."""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ═══════════════════════════════════════════════════════════════════════════
# Device Memory
# ═══════════════════════════════════════════════════════════════════════════

def get_device_memory(device_id: str) -> Optional[DeviceMemoryEntry]:
    """Get device from memory by ID."""
    data = _load_json(DEVICE_MEMORY_FILE)
    devices = data.get("devices", {})
    
    if device_id in devices:
        return DeviceMemoryEntry(**devices[device_id])
    return None


def get_device_by_fingerprint(fingerprint: str) -> Optional[DeviceMemoryEntry]:
    """Find device by fingerprint (handles serial changes)."""
    data = _load_json(DEVICE_MEMORY_FILE)
    devices = data.get("devices", {})
    
    for device_data in devices.values():
        if device_data.get("fingerprint") == fingerprint:
            return DeviceMemoryEntry(**device_data)
    return None


def remember_device(device_id: str, device_state: Dict) -> DeviceMemoryEntry:
    """Store or update device in memory."""
    data = _load_json(DEVICE_MEMORY_FILE)
    if "devices" not in data:
        data["devices"] = {}
    
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    fingerprint = generate_fingerprint(device_state)
    
    if device_id in data["devices"]:
        # Update existing
        entry = data["devices"][device_id]
        entry["last_seen"] = now
        entry["connection_count"] = entry.get("connection_count", 0) + 1
        entry["last_state"] = device_state
        entry["fingerprint"] = fingerprint
    else:
        # Check for existing fingerprint (device with different ID)
        existing = get_device_by_fingerprint(fingerprint)
        if existing:
            # Same device, new ID - merge
            entry = asdict(existing)
            entry["device_id"] = device_id
            entry["last_seen"] = now
            entry["connection_count"] = entry.get("connection_count", 0) + 1
            entry["last_state"] = device_state
        else:
            # New device
            entry = {
                "device_id": device_id,
                "fingerprint": fingerprint,
                "first_seen": now,
                "last_seen": now,
                "connection_count": 1,
                "last_state": device_state,
                "last_routing": None,
                "notes": [],
                "tags": []
            }
    
    data["devices"][device_id] = entry
    data["last_updated"] = now
    _save_json(DEVICE_MEMORY_FILE, data)
    
    return DeviceMemoryEntry(**entry)


def update_device_routing(device_id: str, routing_decision: Dict) -> None:
    """Update device's last routing decision."""
    data = _load_json(DEVICE_MEMORY_FILE)
    if "devices" in data and device_id in data["devices"]:
        data["devices"][device_id]["last_routing"] = routing_decision
        data["devices"][device_id]["last_seen"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        _save_json(DEVICE_MEMORY_FILE, data)


def add_device_note(device_id: str, note: str) -> None:
    """Add a note to a device."""
    data = _load_json(DEVICE_MEMORY_FILE)
    if "devices" in data and device_id in data["devices"]:
        if "notes" not in data["devices"][device_id]:
            data["devices"][device_id]["notes"] = []
        data["devices"][device_id]["notes"].append({
            "text": note,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        })
        _save_json(DEVICE_MEMORY_FILE, data)


def add_device_tag(device_id: str, tag: str) -> None:
    """Add a tag to a device."""
    data = _load_json(DEVICE_MEMORY_FILE)
    if "devices" in data and device_id in data["devices"]:
        if "tags" not in data["devices"][device_id]:
            data["devices"][device_id]["tags"] = []
        if tag not in data["devices"][device_id]["tags"]:
            data["devices"][device_id]["tags"].append(tag)
            _save_json(DEVICE_MEMORY_FILE, data)


def list_all_devices() -> List[DeviceMemoryEntry]:
    """List all remembered devices."""
    data = _load_json(DEVICE_MEMORY_FILE)
    devices = data.get("devices", {})
    return [DeviceMemoryEntry(**d) for d in devices.values()]


def forget_device(device_id: str) -> bool:
    """Remove device from memory."""
    data = _load_json(DEVICE_MEMORY_FILE)
    if "devices" in data and device_id in data["devices"]:
        del data["devices"][device_id]
        _save_json(DEVICE_MEMORY_FILE, data)
        return True
    return False


# ═══════════════════════════════════════════════════════════════════════════
# Routing History
# ═══════════════════════════════════════════════════════════════════════════

def record_routing(device_id: str, authority_id: str, authority_name: str,
                   priority: str, reason: str) -> RoutingHistoryEntry:
    """Record a routing decision."""
    data = _load_json(ROUTING_HISTORY_FILE)
    if "entries" not in data:
        data["entries"] = []
    
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    entry_id = f"ROUTE-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
    
    entry = {
        "id": entry_id,
        "device_id": device_id,
        "authority_id": authority_id,
        "authority_name": authority_name,
        "priority": priority,
        "reason": reason,
        "timestamp": now,
        "resolved": False,
        "resolution": None,
        "resolved_at": None
    }
    
    data["entries"].insert(0, entry)
    
    # Keep only last 500 entries
    if len(data["entries"]) > 500:
        data["entries"] = data["entries"][:500]
    
    _save_json(ROUTING_HISTORY_FILE, data)
    
    # Update device memory
    update_device_routing(device_id, entry)
    
    return RoutingHistoryEntry(**entry)


def resolve_routing(entry_id: str, resolution: str) -> bool:
    """Mark a routing entry as resolved."""
    data = _load_json(ROUTING_HISTORY_FILE)
    entries = data.get("entries", [])
    
    for entry in entries:
        if entry["id"] == entry_id:
            entry["resolved"] = True
            entry["resolution"] = resolution
            entry["resolved_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            _save_json(ROUTING_HISTORY_FILE, data)
            return True
    
    return False


def get_routing_history(device_id: Optional[str] = None, limit: int = 50) -> List[RoutingHistoryEntry]:
    """Get routing history, optionally filtered by device."""
    data = _load_json(ROUTING_HISTORY_FILE)
    entries = data.get("entries", [])
    
    if device_id:
        entries = [e for e in entries if e["device_id"] == device_id]
    
    return [RoutingHistoryEntry(**e) for e in entries[:limit]]


def get_pending_routings() -> List[RoutingHistoryEntry]:
    """Get all unresolved routing entries."""
    data = _load_json(ROUTING_HISTORY_FILE)
    entries = data.get("entries", [])
    pending = [e for e in entries if not e.get("resolved", False)]
    return [RoutingHistoryEntry(**e) for e in pending]


# ═══════════════════════════════════════════════════════════════════════════
# Session State
# ═══════════════════════════════════════════════════════════════════════════

def get_session_state() -> Optional[SessionState]:
    """Get current session state."""
    data = _load_json(SESSION_STATE_FILE)
    if data:
        return SessionState(**data)
    return None


def save_session_state(session: SessionState) -> None:
    """Save session state."""
    session.last_activity = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    _save_json(SESSION_STATE_FILE, asdict(session))


def create_session(star_level: int = 0) -> SessionState:
    """Create a new session."""
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    session = SessionState(
        session_id=f"SESSION-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
        started_at=now,
        last_activity=now,
        current_zone="boot",
        star_level=star_level,
        active_device_id=None,
        routing_queue=[],
        preferences={}
    )
    save_session_state(session)
    return session


def update_session_zone(zone: str) -> Optional[SessionState]:
    """Update current zone in session."""
    session = get_session_state()
    if session:
        session.current_zone = zone
        save_session_state(session)
    return session


def update_session_star_level(level: int) -> Optional[SessionState]:
    """Update star level in session."""
    session = get_session_state()
    if session:
        session.star_level = level
        save_session_state(session)
    return session


def set_active_device(device_id: Optional[str]) -> Optional[SessionState]:
    """Set the active device in session."""
    session = get_session_state()
    if session:
        session.active_device_id = device_id
        save_session_state(session)
    return session


def add_to_routing_queue(entry_id: str) -> Optional[SessionState]:
    """Add routing entry to queue."""
    session = get_session_state()
    if session:
        if entry_id not in session.routing_queue:
            session.routing_queue.append(entry_id)
            save_session_state(session)
    return session


def remove_from_routing_queue(entry_id: str) -> Optional[SessionState]:
    """Remove routing entry from queue."""
    session = get_session_state()
    if session and entry_id in session.routing_queue:
        session.routing_queue.remove(entry_id)
        save_session_state(session)
    return session


# ═══════════════════════════════════════════════════════════════════════════
# Export/Import
# ═══════════════════════════════════════════════════════════════════════════

def export_all_memory() -> str:
    """Export all persistent memory as JSON."""
    return json.dumps({
        "devices": _load_json(DEVICE_MEMORY_FILE),
        "routing_history": _load_json(ROUTING_HISTORY_FILE),
        "session": _load_json(SESSION_STATE_FILE),
        "exported_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }, indent=2)


def get_memory_stats() -> Dict[str, Any]:
    """Get memory statistics."""
    devices = _load_json(DEVICE_MEMORY_FILE).get("devices", {})
    history = _load_json(ROUTING_HISTORY_FILE).get("entries", [])
    pending = [e for e in history if not e.get("resolved", False)]
    
    return {
        "total_devices": len(devices),
        "total_routings": len(history),
        "pending_routings": len(pending),
        "session_active": get_session_state() is not None
    }


if __name__ == "__main__":
    print(json.dumps(get_memory_stats(), indent=2))
