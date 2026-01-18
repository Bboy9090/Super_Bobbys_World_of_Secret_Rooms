"""
BootForge USB - OS-Specific Boot Profiles

Provides boot configurations for different operating systems and device types.
Each profile contains the necessary parameters for safe boot/imaging operations.
"""
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field
from enum import Enum
from datetime import datetime, timezone


class BootMode(Enum):
    """Boot modes supported by devices."""
    NORMAL = "normal"
    RECOVERY = "recovery"
    FASTBOOT = "fastboot"
    DOWNLOAD = "download"  # Samsung Odin mode
    EDL = "edl"  # Qualcomm Emergency Download
    DFU = "dfu"  # Apple Device Firmware Update
    BOOTLOADER = "bootloader"
    SAFE_MODE = "safe_mode"


class DeviceType(Enum):
    """Device types for boot profiles."""
    ANDROID_GENERIC = "android_generic"
    ANDROID_SAMSUNG = "android_samsung"
    ANDROID_PIXEL = "android_pixel"
    ANDROID_XIAOMI = "android_xiaomi"
    ANDROID_ONEPLUS = "android_oneplus"
    IOS_DEVICE = "ios_device"
    USB_STORAGE = "usb_storage"
    CUSTOM = "custom"


@dataclass
class BootSequence:
    """A sequence of boot commands."""
    name: str
    description: str
    steps: List[Dict[str, Any]]
    requires_unlock: bool = False
    dangerous: bool = False


@dataclass
class BootProfile:
    """Complete boot profile for a device/OS combination."""
    id: str
    name: str
    device_type: str
    platform: str
    version: str
    
    # Boot modes available
    supported_modes: List[str]
    default_mode: str
    
    # Key combinations
    key_combos: Dict[str, str]
    
    # Boot sequences
    sequences: List[BootSequence]
    
    # Safety flags
    requires_oem_unlock: bool
    requires_authorization: bool
    risk_level: str  # low, medium, high
    
    # Metadata
    vendor_ids: List[str]
    product_ids: List[str]
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result["sequences"] = [asdict(s) for s in self.sequences]
        return result


# Pre-defined boot profiles
BOOT_PROFILES: Dict[str, BootProfile] = {
    "android_generic": BootProfile(
        id="android_generic",
        name="Android Generic",
        device_type=DeviceType.ANDROID_GENERIC.value,
        platform="android",
        version="*",
        supported_modes=[
            BootMode.NORMAL.value,
            BootMode.RECOVERY.value,
            BootMode.FASTBOOT.value,
            BootMode.SAFE_MODE.value
        ],
        default_mode=BootMode.NORMAL.value,
        key_combos={
            "recovery": "Power + Volume Up",
            "fastboot": "Power + Volume Down",
            "safe_mode": "Hold Power, then hold Volume Down on boot animation"
        },
        sequences=[
            BootSequence(
                name="Enter Recovery",
                description="Boot into recovery mode for system maintenance",
                steps=[
                    {"action": "power_off", "wait": 3},
                    {"action": "hold_keys", "keys": ["power", "volume_up"], "duration": 10},
                    {"action": "release", "keys": ["power"]},
                    {"action": "wait_for_mode", "mode": "recovery", "timeout": 30}
                ],
                requires_unlock=False,
                dangerous=False
            ),
            BootSequence(
                name="Enter Fastboot",
                description="Boot into fastboot/bootloader mode",
                steps=[
                    {"action": "power_off", "wait": 3},
                    {"action": "hold_keys", "keys": ["power", "volume_down"], "duration": 10},
                    {"action": "wait_for_mode", "mode": "fastboot", "timeout": 30}
                ],
                requires_unlock=False,
                dangerous=False
            )
        ],
        requires_oem_unlock=False,
        requires_authorization=False,
        risk_level="low",
        vendor_ids=["*"],
        product_ids=["*"]
    ),
    
    "android_samsung": BootProfile(
        id="android_samsung",
        name="Samsung Galaxy",
        device_type=DeviceType.ANDROID_SAMSUNG.value,
        platform="android",
        version="*",
        supported_modes=[
            BootMode.NORMAL.value,
            BootMode.RECOVERY.value,
            BootMode.DOWNLOAD.value,
            BootMode.SAFE_MODE.value
        ],
        default_mode=BootMode.NORMAL.value,
        key_combos={
            "recovery": "Power + Volume Up + Bixby (or Home)",
            "download": "Power + Volume Down + Bixby (or Home)",
            "safe_mode": "Hold Volume Down during boot"
        },
        sequences=[
            BootSequence(
                name="Enter Recovery",
                description="Boot into Samsung recovery mode",
                steps=[
                    {"action": "power_off", "wait": 3},
                    {"action": "hold_keys", "keys": ["power", "volume_up", "bixby"], "duration": 10},
                    {"action": "release", "keys": ["power"]},
                    {"action": "wait_for_mode", "mode": "recovery", "timeout": 30}
                ],
                requires_unlock=False,
                dangerous=False
            ),
            BootSequence(
                name="Enter Download Mode",
                description="Boot into Odin/Download mode for flashing",
                steps=[
                    {"action": "power_off", "wait": 3},
                    {"action": "hold_keys", "keys": ["power", "volume_down", "bixby"], "duration": 10},
                    {"action": "wait_for_warning", "timeout": 10},
                    {"action": "confirm", "key": "volume_up"},
                    {"action": "wait_for_mode", "mode": "download", "timeout": 30}
                ],
                requires_unlock=True,
                dangerous=True
            )
        ],
        requires_oem_unlock=True,
        requires_authorization=True,
        risk_level="medium",
        vendor_ids=["04e8"],
        product_ids=["*"]
    ),
    
    "android_pixel": BootProfile(
        id="android_pixel",
        name="Google Pixel",
        device_type=DeviceType.ANDROID_PIXEL.value,
        platform="android",
        version="*",
        supported_modes=[
            BootMode.NORMAL.value,
            BootMode.RECOVERY.value,
            BootMode.FASTBOOT.value,
            BootMode.SAFE_MODE.value
        ],
        default_mode=BootMode.NORMAL.value,
        key_combos={
            "recovery": "Fastboot menu > Recovery",
            "fastboot": "Power + Volume Down",
            "safe_mode": "Hold Power, tap Safe Mode"
        },
        sequences=[
            BootSequence(
                name="Enter Fastboot",
                description="Boot into Pixel fastboot mode",
                steps=[
                    {"action": "power_off", "wait": 3},
                    {"action": "hold_keys", "keys": ["power", "volume_down"], "duration": 10},
                    {"action": "wait_for_mode", "mode": "fastboot", "timeout": 30}
                ],
                requires_unlock=False,
                dangerous=False
            ),
            BootSequence(
                name="Enter Recovery via Fastboot",
                description="Navigate to recovery from fastboot menu",
                steps=[
                    {"action": "enter_fastboot"},
                    {"action": "navigate", "using": "volume_down", "to": "Recovery mode"},
                    {"action": "select", "key": "power"},
                    {"action": "wait_for_mode", "mode": "recovery", "timeout": 30}
                ],
                requires_unlock=False,
                dangerous=False
            )
        ],
        requires_oem_unlock=True,
        requires_authorization=False,
        risk_level="low",
        vendor_ids=["18d1"],
        product_ids=["*"]
    ),
    
    "ios_device": BootProfile(
        id="ios_device",
        name="Apple iOS Device",
        device_type=DeviceType.IOS_DEVICE.value,
        platform="ios",
        version="*",
        supported_modes=[
            BootMode.NORMAL.value,
            BootMode.RECOVERY.value,
            BootMode.DFU.value
        ],
        default_mode=BootMode.NORMAL.value,
        key_combos={
            "recovery": "Connect to computer, use Finder/iTunes",
            "dfu": "Complex sequence - varies by model"
        },
        sequences=[
            BootSequence(
                name="Enter Recovery Mode",
                description="Boot into iOS recovery mode for restore",
                steps=[
                    {"action": "connect_to_computer"},
                    {"action": "force_restart_sequence", "model": "varies"},
                    {"action": "hold_until_recovery", "timeout": 30}
                ],
                requires_unlock=False,
                dangerous=False
            ),
            BootSequence(
                name="Enter DFU Mode",
                description="Device Firmware Update mode - lowest level restore",
                steps=[
                    {"action": "connect_to_computer"},
                    {"action": "power_off", "wait": 3},
                    {"action": "dfu_sequence", "model": "varies"},
                    {"action": "verify_dfu", "timeout": 10}
                ],
                requires_unlock=False,
                dangerous=True
            )
        ],
        requires_oem_unlock=False,
        requires_authorization=True,
        risk_level="high",
        vendor_ids=["05ac"],
        product_ids=["*"]
    ),
    
    "usb_storage": BootProfile(
        id="usb_storage",
        name="USB Storage Device",
        device_type=DeviceType.USB_STORAGE.value,
        platform="generic",
        version="*",
        supported_modes=[
            BootMode.NORMAL.value
        ],
        default_mode=BootMode.NORMAL.value,
        key_combos={},
        sequences=[
            BootSequence(
                name="Mount Device",
                description="Mount USB storage for imaging",
                steps=[
                    {"action": "detect_device"},
                    {"action": "verify_unmounted"},
                    {"action": "prepare_for_imaging"}
                ],
                requires_unlock=False,
                dangerous=False
            )
        ],
        requires_oem_unlock=False,
        requires_authorization=False,
        risk_level="low",
        vendor_ids=["*"],
        product_ids=["*"]
    )
}


def get_boot_profile(profile_id: str) -> Optional[BootProfile]:
    """Get a specific boot profile by ID."""
    return BOOT_PROFILES.get(profile_id)


def get_profile_for_device(vendor_id: str, product_id: str) -> Optional[BootProfile]:
    """Find the best matching profile for a device."""
    # Check specific matches first
    for profile in BOOT_PROFILES.values():
        vid_match = "*" in profile.vendor_ids or vendor_id.lower() in [v.lower() for v in profile.vendor_ids]
        pid_match = "*" in profile.product_ids or product_id.lower() in [p.lower() for p in profile.product_ids]
        
        if vid_match and pid_match and "*" not in profile.vendor_ids:
            return profile
    
    # Fall back to generic Android
    return BOOT_PROFILES.get("android_generic")


def list_all_profiles() -> List[Dict[str, Any]]:
    """List all available boot profiles."""
    return [
        {
            "id": p.id,
            "name": p.name,
            "device_type": p.device_type,
            "platform": p.platform,
            "supported_modes": p.supported_modes,
            "risk_level": p.risk_level
        }
        for p in BOOT_PROFILES.values()
    ]


def export_profile_json(profile_id: str) -> Optional[str]:
    """Export a profile as JSON."""
    profile = get_boot_profile(profile_id)
    if profile:
        return json.dumps(profile.to_dict(), indent=2)
    return None


def export_all_profiles_json() -> str:
    """Export all profiles as JSON."""
    return json.dumps({
        "profiles": [p.to_dict() for p in BOOT_PROFILES.values()],
        "count": len(BOOT_PROFILES),
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }, indent=2)


if __name__ == "__main__":
    print(export_all_profiles_json())
