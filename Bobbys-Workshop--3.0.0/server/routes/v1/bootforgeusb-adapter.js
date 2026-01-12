/**
 * BootForgeUSB Adapter Layer
 * 
 * Transforms Rust CLI output (UsbDeviceInfo) to Frontend DTO (DeviceRecord)
 * Canonical contract boundary - frontend never touches raw CLI format
 */

/**
 * Rust CLI Output Format (UsbDeviceInfo from libbootforge)
 * @typedef {Object} RustUsbDeviceInfo
 * @property {string} id - UUID
 * @property {number} vendor_id - u16 (e.g., 0x18d1)
 * @property {number} product_id - u16 (e.g., 0x4ee7)
 * @property {string|null} serial
 * @property {string|null} manufacturer
 * @property {string|null} product
 * @property {string} platform - DevicePlatform enum (e.g., "Android", "Apple")
 * @property {string} mode - DeviceMode enum (e.g., "Normal", "Fastboot", "DFU")
 * @property {string} state - DeviceState enum
 * @property {string} protocol - ProtocolType enum
 * @property {number|null} bus
 * @property {number|null} port
 * @property {string|null} speed
 * @property {string} first_seen - ISO 8601 timestamp
 * @property {string} last_seen - ISO 8601 timestamp
 */

/**
 * Frontend DTO Format (DeviceRecord)
 * @typedef {Object} DeviceRecordDTO
 * @property {string} device_uid - Unique device identifier
 * @property {string} platform_hint - Platform identifier (lowercase)
 * @property {string} mode - Device mode string
 * @property {number} confidence - Confidence score (0-1)
 * @property {Object} evidence - Evidence object
 * @property {Object} evidence.usb - USB evidence
 * @property {string} evidence.usb.vid - Vendor ID as hex string
 * @property {string} evidence.usb.pid - Product ID as hex string
 * @property {string|null} evidence.usb.manufacturer
 * @property {string|null} evidence.usb.product
 * @property {string|null} evidence.usb.serial
 * @property {number} evidence.usb.bus
 * @property {number} evidence.usb.address - Port number or address
 * @property {Object} evidence.tools - Tool evidence (ADB, Fastboot, etc.)
 * @property {string[]} notes
 * @property {string[]} matched_tool_ids
 * @property {string} [first_seen] - ISO 8601 timestamp (from cache)
 * @property {string} [last_seen] - ISO 8601 timestamp (from cache)
 */

/**
 * Transform Rust CLI output to Frontend DTO
 * 
 * @param {RustUsbDeviceInfo[]} rustDevices - Raw devices from Rust CLI
 * @returns {DeviceRecordDTO[]} - Transformed devices for frontend
 */
export function transformRustDevicesToDTO(rustDevices) {
  if (!Array.isArray(rustDevices)) {
    return [];
  }

  return rustDevices.map(device => {
    // Generate device_uid from VID:PID:serial
    const vidHex = `0x${device.vendor_id.toString(16).padStart(4, '0')}`;
    const pidHex = `0x${device.product_id.toString(16).padStart(4, '0')}`;
    const serialPart = device.serial || 'unknown';
    const deviceUid = `usb-${device.vendor_id.toString(16)}:${device.product_id.toString(16)}-${device.bus || 0}-${device.port || 0}`;

    // Map platform enum to lowercase hint
    const platformHint = mapPlatformToHint(device.platform);

    // Map mode enum to string
    const modeString = mapModeToString(device.mode);

    // Calculate confidence (simplified - can be enhanced)
    const confidence = calculateConfidence(device);

    // Map protocol to tool evidence
    const toolEvidence = mapProtocolToToolEvidence(device.protocol, device.serial);

    return {
      device_uid: deviceUid,
      platform_hint: platformHint,
      mode: modeString,
      confidence: confidence,
      evidence: {
        usb: {
          vid: vidHex,
          pid: pidHex,
          manufacturer: device.manufacturer || null,
          product: device.product || null,
          serial: device.serial || null,
          bus: device.bus || 0,
          address: device.port || device.bus || 0, // Use port as address, fallback to bus
          interface_hints: [] // Empty for now, can be populated if needed
        },
        tools: toolEvidence
      },
      notes: generateNotes(device),
      matched_tool_ids: device.serial ? [device.serial] : [],
      // Include cache timestamps
      first_seen: device.first_seen,
      last_seen: device.last_seen
    };
  });
}

/**
 * Map Rust DevicePlatform enum to frontend platform_hint
 */
function mapPlatformToHint(platform) {
  const platformMap = {
    'Apple': 'ios',
    'Android': 'android',
    'Samsung': 'android',
    'Qualcomm': 'android',
    'Mediatek': 'android',
    'Xiaomi': 'android',
    'OnePlus': 'android',
    'Huawei': 'android',
    'LG': 'android',
    'Sony': 'android',
    'Motorola': 'android',
    'Nokia': 'android',
    'Asus': 'android',
    'Oppo': 'android',
    'Vivo': 'android',
    'Realme': 'android',
    'Google': 'android',
    'WindowsPc': 'windows',
    'Mac': 'macos',
    'LinuxPc': 'linux',
    'Unknown': 'unknown'
  };
  return platformMap[platform] || 'unknown';
}

/**
 * Map Rust DeviceMode enum to frontend mode string
 */
function mapModeToString(mode) {
  const modeMap = {
    'Normal': 'Normal OS (Confirmed)',
    'Recovery': 'Recovery Mode (Confirmed)',
    'Fastboot': 'Fastboot Mode (Confirmed)',
    'Download': 'Download Mode (Confirmed)',
    'DFU': 'DFU Mode (Confirmed)',
    'Sideload': 'Sideload Mode (Confirmed)',
    'MTP': 'MTP Mode (Confirmed)',
    'PTP': 'PTP Mode (Confirmed)',
    'Charging': 'Charging Mode',
    'Unknown': 'Unknown Mode'
  };
  return modeMap[mode] || 'Unknown Mode';
}

/**
 * Calculate confidence score based on device information
 */
function calculateConfidence(device) {
  let confidence = 0.5; // Base confidence

  // Boost confidence if we have manufacturer/product info
  if (device.manufacturer) confidence += 0.1;
  if (device.product) confidence += 0.1;
  if (device.serial) confidence += 0.1;

  // Boost confidence if platform is known (not Unknown)
  if (device.platform !== 'Unknown') confidence += 0.1;

  // Boost confidence if mode is specific (not Unknown)
  if (device.mode !== 'Unknown') confidence += 0.1;

  return Math.min(confidence, 1.0); // Cap at 1.0
}

/**
 * Map protocol to tool evidence structure
 */
function mapProtocolToToolEvidence(protocol, serial) {
  const evidence = {
    adb: {
      present: false,
      seen: false,
      raw: '',
      device_ids: []
    },
    fastboot: {
      present: false,
      seen: false,
      raw: '',
      device_ids: []
    },
    idevice_id: {
      present: false,
      seen: false,
      raw: '',
      device_ids: []
    }
  };

  // Map protocol to tool evidence
  switch (protocol) {
    case 'ADB':
      evidence.adb.present = true;
      evidence.adb.seen = true;
      if (serial) {
        evidence.adb.device_ids = [serial];
      }
      break;
    case 'Fastboot':
      evidence.fastboot.present = true;
      evidence.fastboot.seen = true;
      if (serial) {
        evidence.fastboot.device_ids = [serial];
      }
      break;
    case 'AppleLockdown':
      evidence.idevice_id.present = true;
      evidence.idevice_id.seen = true;
      if (serial) {
        evidence.idevice_id.device_ids = [serial];
      }
      break;
  }

  return evidence;
}

/**
 * Generate notes array from device information
 */
function generateNotes(device) {
  const notes = [];

  if (device.speed) {
    notes.push(`USB Speed: ${device.speed}`);
  }

  if (device.protocol !== 'Unknown') {
    notes.push(`Protocol: ${device.protocol}`);
  }

  if (device.state) {
    notes.push(`State: ${device.state}`);
  }

  return notes;
}
