# BootForge Platform

**The Ultimate Professional Device Repair & Bypass Platform**

BootForge is not just a product—it's a **comprehensive platform** designed for professional device repair, forensic analysis, legitimate unlock services, and security research. Built on a modular, extensible architecture, BootForge integrates hardware tools, software exploits, and legal safeguards into a unified ecosystem.

---

## 🚀 Platform Overview

BootForge represents the evolution from single-purpose tools (Pandora Codex) and experimental workshops (Bobby's Workshop) to a **comprehensive, legally-compliant, professional platform** for device repair and security research.

### Key Features

- ✅ **Cross-Platform USB Device Enumeration** - Windows, macOS, and Linux support
- ✅ **iOS Jailbreak Integration** - Checkm8, Dopamine, Palera1n, and more
- ✅ **Android Root Tools** - Magisk, KernelSU, APatch, and OEM tools
- ✅ **Professional Bypass Tools** - Activation, FRP, passcode, and MDM bypass
- ✅ **Bobby's Secret Room** - Encrypted gray-area tools with legal safeguards
- ✅ **Comprehensive Legal Framework** - Regulatory compliance built-in
- ✅ **Hardware Integration** - Support for JTAG, DDR, and professional service tools
- ✅ **Modular Architecture** - Extensible plugin system

---

## 📚 Documentation

### Core Documentation

- **[Platform Architecture](./docs/PLATFORM_ARCHITECTURE.md)** - Complete system architecture and design philosophy
- **[Legal Disclaimers](./docs/LEGAL_DISCLAIMERS.md)** - Comprehensive legal framework and compliance documentation
- **[Device Support Matrix](./docs/DEVICE_SUPPORT_MATRIX.md)** - Complete device compatibility and tool support
- **[Hardware BOM](./docs/HARDWARE_BOM.md)** - Professional hardware kit bill of materials

### Quick Links

- [iOS Module Documentation](./src/ios/mod.rs)
- [Android Module Documentation](./src/android/mod.rs)
- [Secret Room Documentation](./src/secret_room/mod.rs)

---

## 🛠️ Installation

### Prerequisites

- Rust 2021 edition or later
- libusb 1.0 or compatible (rusb dependency)
- Platform-specific requirements:
  - **Linux**: udev development libraries (optional)
  - **Windows**: Windows SDK (for SetupAPI integration)
  - **macOS**: IOKit framework (for IORegistry integration)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/Bboy9090/Bootforge-usb.git
cd Bootforge-usb

# Build the project
cargo build --release

# Run tests
cargo test

# Run the example
cargo run --example list_devices
```

---

## 📦 Core Modules

### USB Enumeration (`bootforge-usb`)

The foundational USB device enumeration library:
>>>>>>> b777ddd (feat: Complete BootForge Platform implementation)

```rust
use bootforge_usb::enumerate_all;

fn main() -> anyhow::Result<()> {
    let devices = enumerate_all()?;
    
<<<<<<< HEAD
    for device in &devices {
        println!("Found: {:04X}:{:04X} - {} {}",
            device.vendor_id, device.product_id,
            device.manufacturer.as_deref().unwrap_or("Unknown"),
            device.product.as_deref().unwrap_or("Device"));
=======
    for device in devices {
        println!("Device: {}", device);
        println!("  Vendor ID: {:04x}", device.vendor_id);
        println!("  Product ID: {:04x}", device.product_id);
>>>>>>> b777ddd (feat: Complete BootForge Platform implementation)
    }
    
    Ok(())
}
```

<<<<<<< HEAD
### Device Query API

```rust
use bootforge_usb::{DeviceQuery, presets, database};

// Find Android devices
let android = DeviceQuery::new()
    .vendor_id(0x18D1)  // Google
    .filter(&devices);

// Use presets
let serial_adapters = presets::serial_adapters().filter(&devices);
let game_controllers = presets::game_controllers().filter(&devices);

// Look up device names
let db = database();
for device in &devices {
    let desc = db.device_description(device.vendor_id, device.product_id);
    println!("{}", desc);
}
```

### Real-Time Hotplug Monitoring

```rust
use bootforge_usb::{PlatformWatcher, DeviceWatcher, DeviceEvent};

let watcher = PlatformWatcher::new()?;

for event in watcher.events() {
    match event {
        DeviceEvent::Added(device) => println!("+ {}", device),
        DeviceEvent::Removed(device) => println!("- {}", device),
        DeviceEvent::Reconnected { device, .. } => println!("↺ {}", device),
        _ => {}
    }
}
```

### Protocol Communication

```rust
use bootforge_usb::{DeviceHandle, AdbClient, FastbootClient};

// ADB Communication
let handle = DeviceHandle::open(0x18D1, 0x4EE1)?;
let mut adb = AdbClient::new(&handle, 0x81, 0x01);
adb.connect("host::bootforge")?;
let output = adb.shell("getprop ro.product.model")?;
println!("Model: {}", output);

// Fastboot Communication
let mut fb = FastbootClient::new(&handle, 0x81, 0x01);
let info = fb.get_device_info()?;
println!("Product: {:?}", info.product);
```

### HID Report Descriptor Parsing

```rust
use bootforge_usb::ReportDescriptor;

let report_data = get_hid_report_descriptor(device)?;
let desc = ReportDescriptor::parse(&report_data)?;

println!("Device Type: {}", desc.device_type());
println!("Input Fields: {}", desc.input_fields.len());

for field in &desc.input_fields {
    println!("  {} bits @ offset {}", field.total_bits(), field.bit_offset);
}
```

### Device Control

```rust
use bootforge_usb::{DeviceControl, HubControl, PermissionHelper};

// Reset a device
DeviceControl::reset(0x1234, 0x5678)?;

// Power cycle a hub port
HubControl::power_off_port(hub_vid, hub_pid, 1)?;
std::thread::sleep(Duration::from_secs(1));
HubControl::power_on_port(hub_vid, hub_pid, 1)?;

// Check permissions
let status = PermissionHelper::check(&device);
if !status.has_access() {
    println!("{}", PermissionHelper::get_instructions(&device, &status));
}
```

## 📦 Module Overview

```
bootforge_usb
├── enumerate        # Device enumeration (libusb + platform-specific)
├── watcher          # Hotplug monitoring (Linux udev, Windows, macOS)
├── descriptors      # Full USB descriptor parsing
│   ├── bos          # Binary Object Store (USB 2.1+)
│   ├── superspeed   # USB 3.0+ capabilities
│   ├── power_delivery  # USB-PD status
│   └── alternate_modes # DisplayPort, Thunderbolt
├── communication    # Device I/O layer
│   ├── control      # Control transfers
│   ├── bulk         # Bulk transfers with retry
│   ├── interrupt    # Interrupt transfers, HID helpers
│   └── session      # Session management
├── protocols        # Protocol implementations
│   ├── adb          # Android Debug Bridge
│   ├── fastboot     # Android bootloader
│   ├── mtp          # Media Transfer Protocol
│   ├── ptp          # Picture Transfer Protocol
│   ├── cdc          # USB Serial (ACM, ECM, NCM)
│   └── dfu          # Device Firmware Upgrade
├── hid              # HID report descriptor parser
├── database         # USB ID database
├── query            # Device filtering & search
├── cache            # Device info caching
├── permissions      # Permission helpers
└── control          # Device/hub control
```

## 🔌 Supported Protocols

| Protocol | Detection | Communication | Description |
|----------|-----------|---------------|-------------|
| **ADB** | ✅ | ✅ Full | Android Debug Bridge |
| **Fastboot** | ✅ | ✅ Full | Android bootloader |
| **MTP** | ✅ | ✅ Full | Media Transfer Protocol |
| **PTP** | ✅ | ✅ Full | Picture Transfer Protocol |
| **CDC-ACM** | ✅ | ✅ Full | USB Serial |
| **DFU** | ✅ | ✅ Full | Device Firmware Upgrade |
| **HID** | ✅ | ✅ Full | Human Interface Device |

## 🖥️ Platform Support

| Feature | Linux | macOS | Windows |
|---------|:-----:|:-----:|:-------:|
| Enumeration | ✅ | ✅ | ✅ |
| Hotplug | ✅ (udev) | ✅ (IOKit) | ✅ (DevNotify) |
| Port Path | ✅ | ✅ | ✅ |
| Driver Status | ✅ | ✅ | ✅ |
| Power Control | ✅ | ⚠️ | ⚠️ |
| Hub Control | ✅ | ✅ | ✅ |

## 📊 USB Capabilities

- **USB 1.x/2.0**: Full support, LPM detection
- **USB 3.0/3.1/3.2**: SuperSpeed/SuperSpeed+ capabilities
- **USB4**: Basic detection and tunneling modes
- **USB-PD**: Power Delivery status and contracts
- **Alt Modes**: DisplayPort, Thunderbolt detection
- **Type-C**: Orientation and alternate mode status

## 🔧 Query Presets

```rust
use bootforge_usb::presets;

presets::android_devices()    // Google, Samsung, etc.
presets::apple_devices()      // All Apple VID
presets::serial_adapters()    // FTDI, CH340, CP210x
presets::storage_devices()    // Mass storage class
presets::hid_devices()        // HID class
presets::audio_devices()      // Audio class
presets::video_devices()      // Video class
presets::dev_boards()         // Arduino, Raspberry Pi, etc.
presets::security_keys()      // YubiKey, Nitrokey, etc.
presets::game_controllers()   // Xbox, PlayStation, Switch
```

## 🧪 Testing

```bash
cargo test                    # Run all 99 tests
cargo clippy                  # Lint (0 warnings)
cargo doc --open              # Generate documentation
```

## 📝 License

Licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))
- MIT License ([LICENSE-MIT](LICENSE-MIT))

at your option.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**BootForge USB** - *The Ultimate USB Library for Rust* 🔱⚡
=======
### iOS Module

Detect and work with iOS devices:

```rust
use bootforge_usb::{enumerate_all, ios};

let devices = enumerate_all()?;
for usb_device in devices {
    if usb_device.vendor_id == 0x05ac { // Apple VID
        let ios_device = ios::IosDevice::from_usb(usb_device)?;
        let jailbreaks = ios::detect_jailbreak_methods(&ios_device)?;
        println!("Available jailbreaks: {:?}", jailbreaks);
    }
}
```

### Android Module

Detect and work with Android devices:

```rust
use bootforge_usb::{enumerate_all, android};

let devices = enumerate_all()?;
for usb_device in devices {
    let android_device = android::AndroidDevice::from_usb(usb_device)?;
    let root_methods = android::detect_root_methods(&android_device)?;
    println!("Available root methods: {:?}", root_methods);
}
```

### Bobby's Secret Room

Access gray-area tools with legal safeguards:

```rust
use bootforge_usb::secret_room;

// Initialize Secret Room module
secret_room::initialize()?;

// Create a session (requires Enterprise+ license)
let session = secret_room::SecretRoomSession::new(
    secret_room::SecretRoomAccessLevel::Enterprise,
    "user_id".to_string(),
    "enterprise".to_string(),
)?;

// List available tools
let tools = session.list_available_tools()?;
println!("Available tools: {}", tools.len());
```

---

## 🔧 Supported Tools

### iOS Jailbreak Tools

- **Checkm8** (A7-A11): Checkra1n, Palera1n
- **Dopamine** (A12-A17): iOS 15.0-16.6.1
- **Misaka26/Nugget** (A18-A19): Customization without full jailbreak

### iOS Bypass Tools

- **iRemoval Pro**: A12+ activation bypass with signal
- **Checkm8.info**: A11 and below professional bypass
- **Sliver**: A4-A11 RAMDISK and passcode bypass
- **HFZ Activator**: Premium bypass solutions
- **AnyUnlock/4uKey**: Consumer-level screen lock bypass

### Android Root Tools

- **Magisk**: Universal systemless root (the gold standard)
- **KernelSU**: Kernel-level root for Pixel, Samsung, Xiaomi
- **APatch**: Kernel/System hybrid for Android 14/15/16
- **Odin/SamFW**: Official Samsung flashing tools
- **MTK Client**: MediaTek bootloader exploit
- **Qualcomm QFIL**: Snapdragon EDL mode flashing

### Android Bypass Tools

- **UnlockTool**: Professional FRP bypass (Samsung, Xiaomi, Huawei)
- **SamFW Tool**: Free/low-cost Samsung FRP bypass
- **Chimera Tool**: Enterprise IMEI repair and unlocking
- **Octoplus Box**: Physical and software servicing
- **Global Unlocker**: Network carrier unlocking

---

## ⚖️ Legal Compliance

**IMPORTANT**: All BootForge tools are for legitimate purposes only:

- ✅ Authorized device repair services
- ✅ Forensic analysis (with proper authorization)
- ✅ Security research (DMCA exemptions apply)
- ✅ Data recovery (device owner authorization required)
- ✅ Educational purposes

**Prohibited Uses**:
- ❌ Unauthorized device access
- ❌ Circumventing security on devices you don't own
- ❌ Privacy violations
- ❌ Illegal activities

See [Legal Disclaimers](./docs/LEGAL_DISCLAIMERS.md) for complete legal framework.

---

## 🏗️ Architecture

BootForge is built on a modular architecture:

```
┌─────────────────────────────────────────┐
│         BootForge Platform UI           │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│      Platform Orchestration Layer       │
│  • Device Detection                     │
│  • Tool Chain Management                │
│  • Legal Compliance                     │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│          Core Service Layer             │
│  • USB Device Manager                   │
│  • Device Database                      │
│  • Exploit Library Manager              │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Plugin Module Layer             │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ iOS Mod. │  │Android   │  │Secret  ││
│  │          │  │Module    │  │Room    ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────┘
```

---

## 📋 Hardware Requirements

See [Hardware BOM](./docs/HARDWARE_BOM.md) for complete hardware package.

**Professional Kit** (~$2,680):
- USB Hub and adapters
- JTAG/DDR interfaces (EasyJTAG, RIFF Box)
- Power management tools
- Diagnostic equipment (USB analyzer, logic analyzer)
- Storage and backup solutions

**Enterprise Kit** (~$6,380):
- All Professional Kit components
- Octoplus Box
- UFI Box
- Chimera Tool

---

## 📊 Device Support

BootForge supports:

- **iOS**: iPhone (A7-A19), iPad (all models), Apple Watch (limited)
- **Android**: Samsung, Google Pixel, Xiaomi, OnePlus, Oppo, Vivo, and more
- **Root Methods**: Magisk, KernelSU, APatch, OEM tools
- **Bypass Tools**: FRP, activation, passcode, MDM

See [Device Support Matrix](./docs/DEVICE_SUPPORT_MATRIX.md) for complete compatibility information.

---

## 🔐 License Tiers

| Tier | Hardware Access | Software Access | Secret Room | Price |
|------|----------------|-----------------|-------------|-------|
| **Consumer** | USB enumeration only | Basic device info | ❌ No | Free |
| **Professional** | Full hardware kit | All standard tools | ❌ No | $299/year |
| **Enterprise** | Full + Enterprise hardware | All tools + priority | ⚠️ Limited | $999/year |
| **Research** | Full hardware | All tools + research | ✅ Full | $2,999/year |
| **Institutional** | Custom packages | White-label options | ✅ Full + Custom | Custom |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Development Setup

```bash
# Install Rust toolchain
rustup install stable

# Clone and build
git clone https://github.com/Bboy9090/Bootforge-usb.git
cd Bootforge-usb
cargo build

# Run tests
cargo test

# Check code quality
cargo clippy
cargo fmt
```

---

## 📝 License

BootForge Platform is licensed under **MIT OR Apache-2.0**.

Individual tools integrated into BootForge may have their own licenses:
- **Magisk**: GPL v3
- **Checkra1n/Palera1n**: GPL v3
- **Dopamine**: Various (check individual repositories)

---

## ⚠️ Disclaimer

**USE AT YOUR OWN RISK.** BootForge tools may:

- Permanently damage devices
- Void warranties
- Cause data loss
- Violate laws if used without authorization

See [Legal Disclaimers](./docs/LEGAL_DISCLAIMERS.md) for complete terms.

---

## 🌐 Resources

- **Platform Architecture**: [docs/PLATFORM_ARCHITECTURE.md](./docs/PLATFORM_ARCHITECTURE.md)
- **Legal Framework**: [docs/LEGAL_DISCLAIMERS.md](./docs/LEGAL_DISCLAIMERS.md)
- **Device Support**: [docs/DEVICE_SUPPORT_MATRIX.md](./docs/DEVICE_SUPPORT_MATRIX.md)
- **Hardware BOM**: [docs/HARDWARE_BOM.md](./docs/HARDWARE_BOM.md)

---

## 🙏 Acknowledgments

BootForge integrates and builds upon the work of:

- **topjohnwu** - Magisk
- **tiann** - KernelSU
- **Axi0mX** - Checkm8 exploit
- **opa334** - Dopamine
- **LukeZGD** - Legacy-iOS-Kit
- **bsway** - APatch
- And many other contributors to the open-source jailbreak and root community

---

**Platform, Not Product.**

*BootForge Platform v0.1.0 - Building the Future of Professional Device Repair*
>>>>>>> b777ddd (feat: Complete BootForge Platform implementation)
