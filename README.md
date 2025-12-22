# BootForge USB

A cross-platform Rust library for USB device enumeration and information gathering.

## Overview

BootForge USB provides a unified interface for discovering and querying USB devices across Windows, macOS, and Linux platforms. It combines cross-platform enumeration using libusb (via rusb) with platform-specific APIs for enriching device information.

## Features

- **Cross-platform enumeration**: Works on Windows, macOS, and Linux
- **Detailed device information**: Vendor ID, Product ID, manufacturer, product name, serial number
- **Platform-specific enrichment**: 
  - Windows: Device paths via SetupAPI (planned)
  - macOS: IORegistry paths via IOKit (planned)
  - Linux: sysfs paths and udev integration
- **Normalized data structures**: Consistent API across all platforms
- **Extensible design**: Ready for future enhancements like hotplug monitoring

## Usage

Add this to your `Cargo.toml`:

```toml
[dependencies]
bootforge-usb = "0.1"
```

Basic enumeration example:

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

## Architecture

### Core Components

- **`types.rs`**: Defines core data structures like `UsbDeviceInfo`, `UsbIds`, `UsbBusType`, and `PlatformHint`
- **`enumerate/`**: Enumeration and enrichment modules
  - `mod.rs`: Cross-platform dispatcher and main `enumerate_all()` function
  - `libusb.rs`: Base enumeration using rusb/libusb
  - `windows.rs`: Windows-specific enrichment (placeholder for SetupAPI)
  - `macos.rs`: macOS-specific enrichment (placeholder for IOKit)
  - `linux.rs`: Linux-specific enrichment using sysfs

### Enumeration Flow

1. **Base Enumeration**: Uses libusb (rusb) to discover all USB devices
2. **Descriptor Reading**: Extracts basic information from USB device descriptors
3. **String Descriptors**: Attempts to read manufacturer, product, and serial number strings
4. **Platform Enrichment**: Applies OS-specific enrichment to add platform-specific paths and metadata

## Platform Support

| Platform | Status | Implementation |
|----------|--------|----------------|
| Linux | ✅ Implemented | libusb + sysfs |
| Windows | 🚧 Placeholder | libusb + SetupAPI (planned) |
| macOS | 🚧 Placeholder | libusb + IOKit (planned) |

## Future Enhancements

- **Hotplug monitoring**: Real-time device arrival/removal notifications
- **Driver information**: Query installed drivers and capabilities
- **Interface enumeration**: List interfaces and endpoints for each device
- **Power management**: Query power states and consumption
- **USB IDs database**: Human-readable vendor/product names

## Requirements

- Rust 2021 edition or later
- libusb 1.0 or compatible (rusb dependency)
- Platform-specific requirements:
  - Linux: udev development libraries (optional, for future enhancements)
  - Windows: Windows SDK (for future SetupAPI integration)
  - macOS: IOKit framework (for future integration)

## Development

Build the project:

```bash
cargo build
```

Run tests:

```bash
cargo test
```

Note: Some tests may require elevated permissions or USB devices connected to succeed.

## License

MIT OR Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
