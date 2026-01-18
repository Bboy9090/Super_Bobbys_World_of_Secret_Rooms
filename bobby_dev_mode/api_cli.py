#!/usr/bin/env python3
"""
Bobby Dev Mode API CLI - JSON interface for Tauri.

All operations execute REAL ADB commands against connected devices.
NO mocks, NO simulations.
"""
import json
import os
import sys
from io import StringIO
from contextlib import redirect_stdout
from datetime import datetime, timezone

# Add parent to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bobby_dev_mode.modules import MODULES
from bobby_dev_mode.adb_utils import adb, fastboot, check_device


def load_profile(profile_name: str) -> dict:
    """Load a device profile from JSON file."""
    profile_dir = os.path.join(os.path.dirname(__file__), "profiles")
    profile_path = os.path.join(profile_dir, f"{profile_name}.json")
    
    if not os.path.exists(profile_path):
        raise FileNotFoundError(f"Profile not found: {profile_name}")
    
    with open(profile_path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_profiles_json() -> list:
    """List profiles as JSON - returns REAL profile files."""
    profiles = []
    profile_dir = os.path.join(os.path.dirname(__file__), "profiles")
    
    if not os.path.exists(profile_dir):
        os.makedirs(profile_dir, exist_ok=True)
        return profiles
    
    for filename in os.listdir(profile_dir):
        if filename.endswith(".json"):
            profile_key = filename[:-5]
            try:
                profile = load_profile(profile_key)
                profiles.append({
                    "key": profile_key,
                    "name": profile.get("name", profile_key),
                    "brand": profile.get("brand", "Unknown"),
                    "model": profile.get("model", "Unknown")
                })
            except Exception as e:
                profiles.append({
                    "key": profile_key,
                    "name": profile_key,
                    "error": str(e)
                })
    return profiles


def check_device_json() -> dict:
    """Check if a REAL Android device is connected via ADB."""
    result = {
        "connected": False,
        "devices": [],
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }
    
    # Get real ADB devices
    output = adb(["devices", "-l"])
    lines = output.strip().splitlines()[1:]  # Skip header
    
    for line in lines:
        if line.strip() and "device" in line and "offline" not in line:
            parts = line.split()
            serial = parts[0]
            
            # Get real device info via ADB
            device_info = {
                "serial": serial,
                "status": "connected"
            }
            
            # Parse additional info from line
            for part in parts[1:]:
                if ":" in part:
                    key, val = part.split(":", 1)
                    device_info[key] = val
            
            # Get more real device properties
            try:
                model = adb(["-s", serial, "shell", "getprop", "ro.product.model"]).strip()
                manufacturer = adb(["-s", serial, "shell", "getprop", "ro.product.manufacturer"]).strip()
                android_ver = adb(["-s", serial, "shell", "getprop", "ro.build.version.release"]).strip()
                
                device_info["model"] = model
                device_info["manufacturer"] = manufacturer
                device_info["android_version"] = android_ver
            except:
                pass
            
            result["devices"].append(device_info)
    
    result["connected"] = len(result["devices"]) > 0
    
    # Also check fastboot devices
    fb_output = fastboot(["devices"])
    for line in fb_output.strip().splitlines():
        if line.strip():
            parts = line.split()
            result["devices"].append({
                "serial": parts[0],
                "status": "fastboot",
                "mode": "bootloader"
            })
    
    return result


def run_module_json(profile_name: str, module: str) -> dict:
    """Run a module on REAL connected device and return JSON output."""
    result = {
        "profile": profile_name,
        "module": module,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "output": "",
        "error": None,
        "device_connected": False
    }
    
    # First check if device is connected
    device_status = check_device_json()
    result["device_connected"] = device_status["connected"]
    result["devices"] = device_status["devices"]
    
    if not device_status["connected"]:
        result["error"] = "No Android device connected via ADB. Connect a device and enable USB debugging."
        return result
    
    try:
        profile = load_profile(profile_name)
        module_func = MODULES.get(module)
        
        if not module_func:
            result["error"] = f"Unknown module: {module}. Available: {list(MODULES.keys())}"
            return result
        
        # Capture output from REAL module execution
        buf = StringIO()
        with redirect_stdout(buf):
            module_func(profile)
        result["output"] = buf.getvalue()
        
        # Save to history
        try:
            from history.manager import save_devmode_run
            profile["id"] = profile_name
            ticket_id = save_devmode_run(profile, module, result["output"])
            result["ticket_id"] = ticket_id
        except ImportError:
            pass
        except Exception as e:
            result["history_error"] = str(e)
        
    except FileNotFoundError as e:
        result["error"] = str(e)
    except Exception as e:
        result["error"] = f"Module execution failed: {str(e)}"
    
    return result


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Command required. Usage: api_cli.py <command> [args...]"}))
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "list-profiles":
        profiles = list_profiles_json()
        print(json.dumps(profiles, indent=2))
    
    elif cmd == "list-modules":
        modules = list(MODULES.keys())
        print(json.dumps({
            "modules": modules,
            "descriptions": {
                "dossier": "Device information collection",
                "warhammer": "Safe package removal (debloat)",
                "darklab": "Performance and thermal testing",
                "forbidden": "Security and encryption analysis",
                "fastboot_arsenal": "Fastboot/flash guidance",
                "recovery_ops": "Recovery mode guidance"
            }
        }, indent=2))
    
    elif cmd == "check-device":
        result = check_device_json()
        print(json.dumps(result, indent=2))
    
    elif cmd == "run":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Usage: run <profile> <module>"}))
            sys.exit(1)
        profile_name = sys.argv[2]
        module = sys.argv[3]
        result = run_module_json(profile_name, module)
        print(json.dumps(result, indent=2))
    
    elif cmd == "get-device-info":
        # Get real device info without a profile
        device_status = check_device_json()
        if device_status["connected"] and device_status["devices"]:
            serial = device_status["devices"][0]["serial"]
            info = {
                "serial": serial,
                "connected": True
            }
            # Get comprehensive real device info
            props = [
                "ro.product.model", "ro.product.device", "ro.product.manufacturer",
                "ro.product.brand", "ro.build.display.id", "ro.build.version.release",
                "ro.build.version.sdk", "ro.bootloader", "ro.secure",
                "ro.boot.verifiedbootstate", "ro.product.cpu.abi"
            ]
            for prop in props:
                try:
                    val = adb(["-s", serial, "shell", "getprop", prop]).strip()
                    info[prop.replace("ro.", "").replace(".", "_")] = val
                except:
                    pass
            print(json.dumps(info, indent=2))
        else:
            print(json.dumps({"connected": False, "error": "No device connected"}))
    
    else:
        print(json.dumps({"error": f"Unknown command: {cmd}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
