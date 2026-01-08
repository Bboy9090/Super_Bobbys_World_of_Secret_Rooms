# BootForge Device Support Matrix

## iOS Device Support

### iPhone Jailbreak & Customization by Device/Chip

| Device Range | Chipset | Primary Exploit | Tool Status | BootForge Module |
|--------------|---------|----------------|-------------|------------------|
| iPhone X & Older | A7 - A11 | Palera1n / Checkra1n | Permanent (Hardware-based) | `ios::checkm8` |
| iPhone XR to 15 Pro | A12 - A17 | Dopamine / Dopamine 2.x | Semi-Untethered (iOS 15.0 - 16.6.1) | `ios::dopamine` |
| iPhone 16 / 17 / 18 | A18 - A19 | Misaka26 / Nugget | Customization (MacDirtyCow/KFD-level) | `ios::bypass` |
| Legacy Devices | 32-bit / Early 64 | Legacy-iOS-Kit | All-in-one GitHub tool | `ios::checkm8` |

### iPhone Activation & Passcode Bypass

| Tool | Platform | Target | License Tier | BootForge Integration |
|------|----------|--------|--------------|----------------------|
| iRemoval Pro | Windows | A12+ with signal | Professional | ✅ `ios::bypass::iremoval_pro` |
| Checkm8.info | Cross-platform | A11 and below | Professional | ✅ `ios::bypass::checkm8_info` |
| Sliver (GitHub) | Cross-platform | A4-A11 RAMDISK | Open Source | ✅ `ios::bypass::sliver` |
| HFZ Activator | Windows | Premium bypasses | Enterprise | ✅ `ios::activator::hfz` |
| AnyUnlock / 4uKey | Windows/macOS | Screen locks, MDM | Consumer | ✅ `ios::bypass::consumer` |

### iPad Support

| Model Range | Chipset | Supported | Notes |
|-------------|---------|-----------|-------|
| iPad (Early models) | A4-A5 | ✅ | Legacy support via Checkra1n |
| iPad Air/Pro (2013-2017) | A7-A10X | ✅ | Full Checkm8 support |
| iPad (2018-2021) | A12-A14 | ✅ | Dopamine support (iOS 15-16) |
| iPad (2022+) | A15-A18 | ⚠️ | Limited customization (Misaka/Nugget) |

### Apple Watch Support

| Model Range | Chipset | Supported | Notes |
|-------------|---------|-----------|-------|
| Apple Watch S0-S3 | S1-S3 | ⚠️ | Limited support, specialized tools required |
| Apple Watch S4+ | S4-S10 | ❌ | No public jailbreak available |

---

## Android Device Support

### Root Methods by Tool

| Tool Name | Method | Best For | BootForge Module |
|-----------|--------|----------|------------------|
| Magisk | Systemless Root | Universal (The gold standard) | ✅ `android::root::magisk` |
| KernelSU | Kernel-level | High security/Bypass (Pixel, Samsung, Xiaomi) | ✅ `android::root::kernelsu` |
| APatch | Kernel/System Hybrid | Newest Android 14/15/16 versions | ✅ `android::root::apatch` |
| Odin / SamFW | Official Flashing | All Samsung Galaxy models | ✅ `android::root::odin` |
| MTK Client | Bootloader Exploit | All MediaTek-based devices | ✅ `android::root::mtk` |
| Qualcomm QFIL | EDL Mode | All Snapdragon-based devices | ✅ `android::root::qfil` |

### Android FRP & Lock Bypass (Professional Tier)

| Tool | Coverage | License | BootForge Integration |
|------|----------|---------|----------------------|
| UnlockTool | Samsung, Xiaomi, Apple, Huawei, etc. | Professional | ✅ `android::bypass::unlocktool` |
| SamFW Tool | Samsung FRP, region changes | Free/Low-cost | ✅ `android::bypass::samfw` |
| Chimera Tool | IMEI repair, service unlocking | Enterprise | ✅ `android::bypass::chimera` |
| Octoplus Box | Physical + software servicing | Enterprise | ✅ `android::bypass::octoplus` |
| Global Unlocker | Network carrier unlocking | Professional | ✅ `android::unlock::global` |

### Manufacturer-Specific Support

#### Samsung Galaxy

| Model Series | Chipset | Root Method | FRP Bypass | BootForge Support |
|--------------|---------|-------------|------------|-------------------|
| Galaxy S (S6-S24) | Exynos/Snapdragon | Odin, Magisk, KernelSU | ✅ UnlockTool, SamFW | ✅ Full |
| Galaxy Note (Note 5-Note 20) | Exynos/Snapdragon | Odin, Magisk | ✅ UnlockTool | ✅ Full |
| Galaxy A Series | Exynos/MediaTek | MTK Client, Magisk | ✅ UnlockTool | ✅ Full |
| Galaxy Tab | Exynos/Snapdragon | Odin, Magisk | ✅ UnlockTool | ✅ Full |

#### Google Pixel

| Model | Chipset | Root Method | BootForge Support |
|-------|---------|-------------|-------------------|
| Pixel 1-3 | Snapdragon | Magisk, KernelSU | ✅ Full |
| Pixel 4-6 | Snapdragon/Tensor | Magisk, KernelSU, APatch | ✅ Full |
| Pixel 7+ | Tensor | Magisk, KernelSU, APatch | ✅ Full |

#### Xiaomi

| Series | Chipset | Root Method | BootForge Support |
|--------|---------|-------------|-------------------|
| Redmi/Note Series | MediaTek/Snapdragon | MTK Client, Magisk, KernelSU | ✅ Full |
| Mi Series | Snapdragon | QFIL, Magisk | ✅ Full |
| POCO Series | Snapdragon | QFIL, Magisk | ✅ Full |

#### OnePlus

| Series | Chipset | Root Method | BootForge Support |
|--------|---------|-------------|-------------------|
| OnePlus 1-7 | Snapdragon | Fastboot, Magisk | ✅ Full |
| OnePlus 8+ | Snapdragon | Fastboot, Magisk, KernelSU | ✅ Full |

#### Oppo/Vivo

| Series | Chipset | Root Method | BootForge Support |
|--------|---------|-------------|-------------------|
| Oppo/Vivo Devices | MediaTek/Snapdragon | MTK Client, QFIL | ✅ Partial |

#### Huawei

| Series | Chipset | Root Method | BootForge Support |
|--------|---------|-------------|-------------------|
| Pre-2019 Devices | Kirin | Specialized tools | ⚠️ Limited |
| Post-2019 Devices | N/A | Bootloader locked | ❌ Not supported |

---

## Android Version Support

### Root Compatibility by Android Version

| Android Version | Magisk | KernelSU | APatch | Notes |
|-----------------|--------|----------|--------|-------|
| Android 8-10 | ✅ Full | ⚠️ Limited | ❌ No | Magisk is primary method |
| Android 11-12 | ✅ Full | ✅ Full | ⚠️ Limited | Both Magisk and KernelSU supported |
| Android 13 | ✅ Full | ✅ Full | ✅ Full | All methods available |
| Android 14 | ✅ Full | ✅ Full | ✅ Full | APatch recommended for new devices |
| Android 15+ | ✅ Full | ✅ Full | ✅ Full | APatch and KernelSU preferred |

---

## Bootloader Unlock Status

### Unlockable Devices

| Manufacturer | Unlockable Models | Method | BootForge Support |
|--------------|-------------------|--------|-------------------|
| Google | All Pixel devices | OEM Unlock | ✅ Full |
| OnePlus | Most devices (pre-2021) | OEM Unlock | ✅ Full |
| Xiaomi | Most devices (with MI unlock) | MI Unlock Tool | ✅ Full |
| Samsung | US models (varies by carrier) | OEM Unlock | ⚠️ Partial |
| Motorola | Most devices | OEM Unlock | ✅ Full |
| Sony | Most devices | OEM Unlock | ✅ Full |

### Locked Bootloader Devices

| Manufacturer | Lock Status | BootForge Support |
|--------------|-------------|-------------------|
| Huawei (2019+) | Bootloader permanently locked | ❌ Not supported |
| Samsung (Some carriers) | Carrier-locked bootloader | ⚠️ Limited (requires carrier unlock) |
| Verizon (US) | Bootloader locked on most devices | ⚠️ Limited |

---

## Special Device Categories

### Gaming Devices

| Device | Platform | BootForge Support | Notes |
|--------|----------|-------------------|-------|
| Nintendo Switch | Custom | ⚠️ Specialized | Requires specialized tools |
| Steam Deck | Linux/Android | ✅ Full | Standard Android tools |

### IoT and Embedded Devices

| Category | BootForge Support | Notes |
|----------|-------------------|-------|
| Smart TVs | ⚠️ Limited | Manufacturer-specific tools required |
| Smart Watches | ⚠️ Limited | Limited root/jailbreak support |
| Embedded Linux | ✅ Full | Standard Linux tools apply |

---

## Support Status Legend

- ✅ **Full Support**: Complete tool integration, regular updates, comprehensive documentation
- ⚠️ **Partial/Limited Support**: Some tools available, may require manual steps, limited documentation
- ❌ **Not Supported**: No tools available or device is incompatible

---

## Tool Status Definitions

- **Permanent (Hardware-based)**: Exploit is hardware-based and cannot be patched by software updates
- **Semi-Untethered**: Requires re-jailbreaking after device reboot, but persists until reboot
- **Customization**: Limited customization without full root/jailbreak access
- **Open Source**: Tool source code is publicly available
- **Professional**: Requires paid license for commercial use
- **Enterprise**: Requires enterprise-level license and may include hardware dongles

---

## Update Frequency

- **Critical Updates**: Within 24-48 hours of exploit/tool release
- **Major Updates**: Weekly or bi-weekly
- **Minor Updates**: As needed for bug fixes and compatibility
- **Device Database**: Updated continuously as new devices are tested

---

## Contributing Device Support

If you have a device that's not listed or have additional information about device support, please:

1. Submit device information through the BootForge platform
2. Provide tool compatibility test results
3. Share documentation or guides (if available)

---

*Last Updated: [To be updated regularly]*
*Document Version: 1.0*