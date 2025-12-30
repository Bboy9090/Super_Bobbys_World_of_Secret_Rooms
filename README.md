# BootForge USB

**🚀 Ultimate Legendary God Mode USB Library for Rust**

A cross-platform Rust library for USB device enumeration and information gathering with advanced features including real-time hotplug monitoring, protocol detection, port topology mapping, full descriptor parsing, USB 3.0+ SuperSpeed support, Power Delivery status, and alternate mode detection.

## 🏆 God Mode Features

### Core Detection
- **Cross-platform enumeration**: Windows, macOS, and Linux
- **Detailed device information**: Vendor ID, Product ID, manufacturer, product name, serial number
- **Real-time hotplug monitoring**: Watch for USB device connection and disconnection events
- **Protocol detection**: Automatically detect ADB, Fastboot, Apple devices, MTP, and more
- **USB port topology**: Map USB hub connections and port paths
- **Driver status**: Query driver binding and health status
- **Stable device identification**: Track devices across reconnections using serial numbers or port paths

### God Mode Descriptors
- **Full configuration parsing**: All interfaces and endpoints
- **Endpoint details**: Bulk, Interrupt, Isochronous, Control with max packet sizes
- **Class-specific info**: HID, Audio, Video, CDC, Mass Storage details
- **USB 3.0+ SuperSpeed**: Companion descriptors, burst sizes, streams

### BOS & Capabilities
- **USB 2.0 Extension**: LPM (Link Power Management) support
- **SuperSpeed Capability**: U1/U2 exit latencies
- **SuperSpeedPlus**: USB 3.1/3.2 sublink speeds
- **Container ID**: Unique device identification
- **Platform Capabilities**: WebUSB, Microsoft OS 2.0

### Power Delivery (USB-PD)
- **Power profiles (PDOs)**: Fixed, Variable, Battery, PPS, EPR
- **Voltage/current**: Current power contract
- **Power roles**: Source, Sink, Dual-Role
- **EPR support**: Up to 240W (48V @ 5A)

### Alternate Modes (USB Type-C)
- **DisplayPort**: Pin assignments, resolutions, DP versions
- **Thunderbolt**: TB3/TB4/TB5, PCIe/DP tunneling
- **Vendor-specific**: Apple, Google, Samsung SVIDs

### Platform-Specific Enrichment
- **Windows**: SetupAPI, hardware IDs, device paths, driver status
- **macOS**: IOKit registry, location IDs, power/reset monitoring
- **Linux**: sysfs paths, udev integration, authorization, quirks

## Usage

Add this to your `Cargo.toml`:

```toml
[dependencies]
bootforge-usb = "0.2"
```

### Basic enumeration example:

```rust
use bootforge_usb::enumerate_all;

fn main() -> anyhow::Result<()> {
    let devices = enumerate_all()?;
    
    for device in devices {
        println!("Device: {}", device);
        println!("  Vendor ID: {:04x}", device.vendor_id);
        println!("  Product ID: {:04x}", device.product_id);
        
        if let Some(manufacturer) = device.manufacturer {
            println!("  Manufacturer: {}", manufacturer);
        }
        
        if let Some(product) = device.product {
            println!("  Product: {}", product);
        }
    }
    
    Ok(())
}
```

### Device watching with reconnection detection:

```rust
use bootforge_usb::{DeviceWatcher, PlatformWatcher, DeviceEvent};
use std::time::Duration;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut watcher = PlatformWatcher::default();
    let receiver = watcher.start()?;

    loop {
        match receiver.recv_timeout(Duration::from_secs(1)) {
            Ok(DeviceEvent::Added(device)) => {
                println!("📱 Device added: {}", device.id.as_hex_string());
            }
            Ok(DeviceEvent::Removed(device)) => {
                println!("🔌 Device removed: {}", device.id.as_hex_string());
            }
            Ok(DeviceEvent::Reconnected { device, previous_location }) => {
                println!("🔁 Device reconnected: {}", device.id.as_hex_string());
            }
            Ok(DeviceEvent::Changed(device)) => {
                println!("🔄 Device changed: {}", device.id.as_hex_string());
            }
            _ => continue,
        }
    }
}
```

### God Mode - Full descriptor enumeration:

```rust
use bootforge_usb::descriptors::{parse_device_descriptors, UsbSpeed};

fn main() -> anyhow::Result<()> {
    let context = rusb::Context::new()?;
    
    for device in context.devices()?.iter() {
        if let Ok(desc) = parse_device_descriptors(&device) {
            println!("Device: {:04X}:{:04X}", desc.vendor_id, desc.product_id);
            println!("  Speed: {} ({} Mbps)", desc.speed.name(), desc.speed.bandwidth_mbps());
            
            // Iterate configurations
            for config in &desc.configurations {
                println!("  Config {}: {} interfaces, {} mA max", 
                    config.number, config.interfaces.len(), config.max_power_ma);
                
                // Iterate interfaces
                for iface in &config.interfaces {
                    println!("    Interface {}: {} endpoints",
                        iface.number, iface.endpoints.len());
                    
                    // Iterate endpoints
                    for ep in &iface.endpoints {
                        println!("      EP{} {:?}: {:?} ({} bytes)",
                            ep.number, ep.direction, ep.transfer_type, ep.max_packet_size);
                    }
                }
            }
            
            // Check BOS capabilities
            if let Some(bos) = &desc.bos {
                println!("  BOS: {} capabilities", bos.num_capabilities);
            }
        }
    }
    
    Ok(())
}
```

### Protocol detection example:

```rust
use bootforge_usb::{api::UsbEnumerator, classify_device_protocols, enumerate::FallbackEnumerator};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let enumerator = FallbackEnumerator::default();
    let devices = enumerator.enumerate()?;

    for device in devices {
        let protocols = classify_device_protocols(&device);
        println!("Device {} supports: {:?}", device.id.as_hex_string(), protocols);
    }

    Ok(())
}
```

## Architecture

### Detection Pipeline

USB device discovery follows a four-stage pipeline:

1. **Stage 1: Transport Scanning** - Query USB bus via libusb to discover candidate devices
2. **Stage 2: Descriptor Reading** - Read string descriptors (manufacturer, product, serial)
3. **Stage 3: Platform Enrichment** - Add OS-specific paths, driver status, and metadata
4. **Stage 4: Protocol Classification** - Detect high-level protocols (ADB, Fastboot, Apple, MTP)

### Device Identity Resolution

Track devices across reconnections using a priority-based strategy:

1. **Serial Number** (preferred) - Most stable, unique per device
2. **Port Path** - Stable if device stays in same physical port
3. **Location Fingerprint** (fallback) - VID/PID + bus/address combination

### Module Organization

```
bootforge-usb/
├── src/
│   ├── lib.rs                    # Public API surface
│   ├── api.rs                    # UsbEnumerator trait
│   ├── model.rs                  # Core data structures
│   ├── errors.rs                 # Error types
│   ├── types.rs                  # Legacy types (backward compat)
│   │
│   ├── descriptors/              # GOD MODE - Full descriptor parsing
│   │   ├── mod.rs                # Main descriptor types and parsing
│   │   ├── configuration.rs      # Configuration descriptors
│   │   ├── interface.rs          # Interface descriptors with class-specific
│   │   ├── endpoint.rs           # Endpoint descriptors with SS companion
│   │   ├── bos.rs                # BOS and device capabilities
│   │   ├── superspeed.rs         # USB 3.0+ SuperSpeed/Plus
│   │   ├── power_delivery.rs     # USB-PD status and PDOs
│   │   └── alternate_modes.rs    # DisplayPort, Thunderbolt alt modes
│   │
│   ├── enumerate/                # Detection pipeline
│   │   ├── mod.rs                # Main enumerate_all() entry point
│   │   ├── common.rs             # FallbackEnumerator (uses libusb)
│   │   ├── libusb.rs             # Stage 1: Transport scanning
│   │   ├── windows.rs            # Stage 3: Windows enrichment
│   │   ├── macos.rs              # Stage 3: macOS enrichment
│   │   └── linux.rs              # Stage 3: Linux enrichment
│   │
│   ├── watcher/                  # Hotplug monitoring
│   │   ├── mod.rs                # DeviceWatcher trait, events, debouncing
│   │   ├── linux.rs              # udev-based monitoring
│   │   ├── windows.rs            # RegisterDeviceNotification
│   │   └── macos.rs              # IOKit notifications
│   │
│   ├── handshake/                # Protocol detection
│   │   ├── mod.rs                # classify_device_protocols()
│   │   ├── adb_probe.rs          # ADB detection
│   │   ├── fastboot_probe.rs     # Fastboot detection
│   │   ├── apple_probe.rs        # Apple device detection
│   │   └── mtp_probe.rs          # MTP detection
│   │
│   └── ports/                    # Topology mapping
│       └── mod.rs                # Port path parsing, hub enumeration
│
├── examples/
│   ├── list_devices.rs           # Basic enumeration
│   ├── watch_devices.rs          # Hotplug monitoring
│   ├── detect_protocols.rs       # Protocol classification
│   └── god_mode.rs               # Full descriptor enumeration
│
└── docs/
    ├── ARCHITECTURE.md           # Detection pipeline diagrams
    └── GLOSSARY.md               # Term definitions
```

## Platform Support

| Platform | Status | Implementation |
|----------|--------|----------------|
| Linux | ✅ Fully Implemented | libusb + sysfs + udev |
| Windows | ✅ Fully Implemented | libusb + SetupAPI + RegisterDeviceNotification |
| macOS | ✅ Fully Implemented | libusb + IOKit + IOServiceAddMatchingNotification |

## Examples

See the `examples/` directory for complete working examples:

- `list_devices.rs`: Basic device enumeration
- `watch_devices.rs`: Real-time hotplug monitoring
- `detect_protocols.rs`: Protocol detection demonstration
- `god_mode.rs`: Full descriptor enumeration with all God Mode features

Run examples with:

```bash
cargo run --example list_devices
cargo run --example watch_devices
cargo run --example detect_protocols
cargo run --example god_mode
```

## Features

- `udev` (Linux only): Enables udev-based hotplug monitoring on Linux

```toml
[dependencies]
bootforge-usb = { version = "0.2", features = ["udev"] }
```

## Requirements

- Rust 2021 edition or later
- libusb 1.0 or compatible (rusb dependency)
- Platform-specific requirements:
  - Linux: udev development libraries (optional, for hotplug monitoring)
  - Windows: Windows SDK
  - macOS: IOKit framework (included with Xcode)

## God Mode Capabilities Summary

| Capability | Status |
|------------|--------|
| Interface enumeration | ✅ |
| Endpoint enumeration | ✅ |
| Configuration parsing | ✅ |
| USB 3.0 SuperSpeed | ✅ |
| USB 3.1/3.2 SuperSpeedPlus | ✅ |
| USB4 detection | ✅ |
| BOS descriptor | ✅ |
| USB 2.0 LPM | ✅ |
| Container ID | ✅ |
| WebUSB detection | ✅ |
| Microsoft OS 2.0 | ✅ |
| Power Delivery status | ✅ |
| Fixed/Variable/PPS PDOs | ✅ |
| EPR (240W) support | ✅ |
| DisplayPort Alt Mode | ✅ |
| Thunderbolt Alt Mode | ✅ |
| Windows hotplug | ✅ |
| macOS hotplug | ✅ |
| Linux hotplug | ✅ |
| Event debouncing | ✅ |
| Reconnection correlation | ✅ |
| Session tracking | ✅ |

## License

MIT OR Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
