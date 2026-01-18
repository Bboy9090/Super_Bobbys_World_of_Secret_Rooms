"""
BootForge USB - Driver Packs Auto-Bundle System

Auto-bundles required drivers for cross-platform USB device support.
Detects OS and provides appropriate driver packages.
"""
import os
import platform
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum


class DriverType(Enum):
    """Types of drivers that can be bundled."""
    USB_SERIAL = "usb_serial"
    ADB = "adb"
    FASTBOOT = "fastboot"
    MTP = "mtp"
    DFU = "dfu"
    EDL = "edl"
    JTAG = "jtag"
    STORAGE = "storage"


class OSPlatform(Enum):
    """Supported operating systems."""
    WINDOWS = "windows"
    MACOS = "macos"
    LINUX = "linux"


@dataclass
class DriverPack:
    """A driver package for a specific platform."""
    name: str
    driver_type: str
    platform: str
    version: str
    vendor_ids: List[str]
    product_ids: List[str]
    install_command: Optional[str]
    download_url: Optional[str]
    bundled: bool
    status: str  # "installed", "available", "missing", "bundled"


@dataclass
class DriverBundle:
    """Complete driver bundle for the current system."""
    platform: str
    platform_version: str
    architecture: str
    drivers: List[DriverPack]
    auto_install_available: bool
    last_updated: str


# Driver pack definitions by platform
DRIVER_PACKS: Dict[str, List[Dict[str, Any]]] = {
    "windows": [
        {
            "name": "Google USB Driver",
            "driver_type": DriverType.ADB.value,
            "version": "latest",
            "vendor_ids": ["18d1"],  # Google
            "product_ids": ["*"],
            "install_command": None,
            "download_url": "https://developer.android.com/studio/run/win-usb",
            "bundled": False
        },
        {
            "name": "Samsung USB Driver",
            "driver_type": DriverType.ADB.value,
            "version": "1.7.50",
            "vendor_ids": ["04e8"],  # Samsung
            "product_ids": ["*"],
            "install_command": None,
            "download_url": "https://developer.samsung.com/mobile/android-usb-driver.html",
            "bundled": False
        },
        {
            "name": "Qualcomm HS-USB QDLoader 9008",
            "driver_type": DriverType.EDL.value,
            "version": "2.1.2.2",
            "vendor_ids": ["05c6"],  # Qualcomm
            "product_ids": ["9008"],
            "install_command": None,
            "download_url": None,
            "bundled": False
        },
        {
            "name": "MediaTek USB VCOM Driver",
            "driver_type": DriverType.USB_SERIAL.value,
            "version": "5.2",
            "vendor_ids": ["0e8d"],  # MediaTek
            "product_ids": ["*"],
            "install_command": None,
            "download_url": None,
            "bundled": False
        },
        {
            "name": "Apple Mobile Device USB Driver",
            "driver_type": DriverType.DFU.value,
            "version": "bundled",
            "vendor_ids": ["05ac"],  # Apple
            "product_ids": ["*"],
            "install_command": None,
            "download_url": "https://support.apple.com/itunes",
            "bundled": False
        },
        {
            "name": "libusb-win32",
            "driver_type": DriverType.FASTBOOT.value,
            "version": "1.2.7.3",
            "vendor_ids": ["*"],
            "product_ids": ["*"],
            "install_command": None,
            "download_url": "https://github.com/libusb/libusb",
            "bundled": True
        }
    ],
    "macos": [
        {
            "name": "Android Debug Bridge (ADB)",
            "driver_type": DriverType.ADB.value,
            "version": "platform-tools",
            "vendor_ids": ["*"],
            "product_ids": ["*"],
            "install_command": "brew install android-platform-tools",
            "download_url": "https://developer.android.com/tools/releases/platform-tools",
            "bundled": True
        },
        {
            "name": "libimobiledevice",
            "driver_type": DriverType.DFU.value,
            "version": "latest",
            "vendor_ids": ["05ac"],
            "product_ids": ["*"],
            "install_command": "brew install libimobiledevice",
            "download_url": "https://libimobiledevice.org/",
            "bundled": True
        },
        {
            "name": "libusb",
            "driver_type": DriverType.USB_SERIAL.value,
            "version": "1.0.26",
            "vendor_ids": ["*"],
            "product_ids": ["*"],
            "install_command": "brew install libusb",
            "download_url": "https://libusb.info/",
            "bundled": True
        }
    ],
    "linux": [
        {
            "name": "ADB udev rules",
            "driver_type": DriverType.ADB.value,
            "version": "latest",
            "vendor_ids": ["*"],
            "product_ids": ["*"],
            "install_command": "sudo apt install android-sdk-platform-tools-common",
            "download_url": None,
            "bundled": True
        },
        {
            "name": "libusb-1.0",
            "driver_type": DriverType.USB_SERIAL.value,
            "version": "1.0.26",
            "vendor_ids": ["*"],
            "product_ids": ["*"],
            "install_command": "sudo apt install libusb-1.0-0",
            "download_url": None,
            "bundled": True
        },
        {
            "name": "libimobiledevice",
            "driver_type": DriverType.DFU.value,
            "version": "latest",
            "vendor_ids": ["05ac"],
            "product_ids": ["*"],
            "install_command": "sudo apt install libimobiledevice6",
            "download_url": None,
            "bundled": True
        },
        {
            "name": "Qualcomm EDL udev rules",
            "driver_type": DriverType.EDL.value,
            "version": "custom",
            "vendor_ids": ["05c6"],
            "product_ids": ["9008"],
            "install_command": None,
            "download_url": None,
            "bundled": True
        }
    ]
}


def get_current_platform() -> OSPlatform:
    """Detect the current operating system."""
    system = platform.system().lower()
    if system == "windows":
        return OSPlatform.WINDOWS
    elif system == "darwin":
        return OSPlatform.MACOS
    elif system == "linux":
        return OSPlatform.LINUX
    else:
        return OSPlatform.LINUX  # Default to Linux


def check_driver_status(driver: Dict[str, Any]) -> str:
    """Check if a driver is installed/available."""
    # This would actually check the system - simplified for now
    if driver.get("bundled"):
        return "bundled"
    return "available"


def get_driver_bundle() -> DriverBundle:
    """Get the complete driver bundle for the current system."""
    current_platform = get_current_platform()
    platform_drivers = DRIVER_PACKS.get(current_platform.value, [])
    
    drivers = []
    for driver_def in platform_drivers:
        status = check_driver_status(driver_def)
        driver = DriverPack(
            name=driver_def["name"],
            driver_type=driver_def["driver_type"],
            platform=current_platform.value,
            version=driver_def["version"],
            vendor_ids=driver_def["vendor_ids"],
            product_ids=driver_def["product_ids"],
            install_command=driver_def.get("install_command"),
            download_url=driver_def.get("download_url"),
            bundled=driver_def.get("bundled", False),
            status=status
        )
        drivers.append(driver)
    
    from datetime import datetime, timezone
    
    return DriverBundle(
        platform=current_platform.value,
        platform_version=platform.version(),
        architecture=platform.machine(),
        drivers=drivers,
        auto_install_available=current_platform != OSPlatform.WINDOWS,
        last_updated=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    )


def get_drivers_for_device(vendor_id: str, product_id: str) -> List[DriverPack]:
    """Get applicable drivers for a specific device."""
    bundle = get_driver_bundle()
    applicable = []
    
    for driver in bundle.drivers:
        vid_match = "*" in driver.vendor_ids or vendor_id.lower() in [v.lower() for v in driver.vendor_ids]
        pid_match = "*" in driver.product_ids or product_id.lower() in [p.lower() for p in driver.product_ids]
        
        if vid_match and pid_match:
            applicable.append(driver)
    
    return applicable


def export_driver_bundle_json() -> str:
    """Export driver bundle as JSON."""
    bundle = get_driver_bundle()
    return json.dumps({
        "platform": bundle.platform,
        "platform_version": bundle.platform_version,
        "architecture": bundle.architecture,
        "auto_install_available": bundle.auto_install_available,
        "last_updated": bundle.last_updated,
        "drivers": [asdict(d) for d in bundle.drivers]
    }, indent=2)


if __name__ == "__main__":
    print(export_driver_bundle_json())
