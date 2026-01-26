#!/usr/bin/env node
/**
 * iOS Diagnostics Script
 * 
 * Automated diagnostics for iOS devices using libimobiledevice
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Check if libimobiledevice tools are available
 */
async function checkLibimobiledevice() {
  try {
    await execAsync('which ideviceinfo');
    return true;
  } catch (error) {
    log('ERROR: libimobiledevice not found. Please install libimobiledevice tools.', colors.red);
    log('macOS: brew install libimobiledevice', colors.yellow);
    log('Linux: sudo apt-get install libimobiledevice-utils', colors.yellow);
    return false;
  }
}

/**
 * Get connected iOS devices
 */
async function getDevices() {
  try {
    const { stdout } = await execAsync('idevice_id -l');
    const devices = stdout.split('\n').filter(line => line.trim());
    return devices.map(id => ({ id: id.trim() }));
  } catch (error) {
    log(`Error getting devices: ${error.message}`, colors.red);
    return [];
  }
}

/**
 * Get device information
 */
async function getDeviceInfo(deviceId) {
  try {
    const { stdout } = await execAsync(`ideviceinfo -u ${deviceId}`);
    const info = {};
    
    stdout.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const cleanKey = key.trim();
        const value = valueParts.join(':').trim();
        info[cleanKey] = value;
      }
    });
    
    return {
      deviceName: info['DeviceName'] || 'Unknown',
      model: info['ProductType'] || 'Unknown',
      iosVersion: info['ProductVersion'] || 'Unknown',
      serialNumber: info['SerialNumber'] || 'Unknown',
      udid: info['UniqueDeviceID'] || deviceId,
      batteryLevel: info['BatteryCurrentCapacity'] ? parseInt(info['BatteryCurrentCapacity']) : null,
      isCharging: info['BatteryIsCharging'] === 'true',
      wifiAddress: info['WiFiAddress'] || null,
      bluetoothAddress: info['BluetoothAddress'] || null,
      buildVersion: info['BuildVersion'] || 'Unknown',
    };
  } catch (error) {
    log(`Error getting device info: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Get battery diagnostics
 */
async function getBatteryInfo(deviceId) {
  try {
    const { stdout } = await execAsync(`ideviceinfo -u ${deviceId} -k BatteryCurrentCapacity -k BatteryIsCharging`);
    const lines = stdout.split('\n');
    
    const capacity = lines.find(l => l.includes('BatteryCurrentCapacity'));
    const charging = lines.find(l => l.includes('BatteryIsCharging'));
    
    return {
      level: capacity ? parseInt(capacity.split(':')[1].trim()) : null,
      isCharging: charging ? charging.split(':')[1].trim() === 'true' : false,
      health: 'Unknown', // iOS doesn't expose battery health via libimobiledevice
      technology: 'Li-ion', // Standard for iOS devices
    };
  } catch (error) {
    log(`Error getting battery info: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Get hardware diagnostics
 */
async function getHardwareInfo(deviceId) {
  try {
    const info = await getDeviceInfo(deviceId);
    
    // Get disk usage
    let diskInfo = null;
    try {
      const { stdout } = await execAsync(`ideviceinfo -u ${deviceId} -k TotalDiskCapacity -k TotalSystemAvailable`);
      const lines = stdout.split('\n');
      const total = lines.find(l => l.includes('TotalDiskCapacity'));
      const available = lines.find(l => l.includes('TotalSystemAvailable'));
      
      const totalBytes = total ? parseInt(total.split(':')[1].trim()) : null;
      const availableBytes = available ? parseInt(available.split(':')[1].trim()) : null;
      
      diskInfo = {
        totalGB: totalBytes ? (totalBytes / 1024 / 1024 / 1024).toFixed(2) : null,
        availableGB: availableBytes ? (availableBytes / 1024 / 1024 / 1024).toFixed(2) : null,
        usedGB: (totalBytes && availableBytes) 
          ? ((totalBytes - availableBytes) / 1024 / 1024 / 1024).toFixed(2) 
          : null,
      };
    } catch (err) {
      log('Could not get disk info', colors.yellow);
    }
    
    return {
      ...info,
      disk: diskInfo,
    };
  } catch (error) {
    log(`Error getting hardware info: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Get network diagnostics
 */
async function getNetworkInfo(deviceId) {
  try {
    const { stdout } = await execAsync(`ideviceinfo -u ${deviceId} -k WiFiAddress -k BluetoothAddress`);
    const lines = stdout.split('\n');
    
    const wifi = lines.find(l => l.includes('WiFiAddress'));
    const bluetooth = lines.find(l => l.includes('BluetoothAddress'));
    
    return {
      wifiConnected: !!wifi && wifi.split(':').length > 1,
      wifiAddress: wifi ? wifi.split(':').slice(1).join(':').trim() : null,
      bluetoothAddress: bluetooth ? bluetooth.split(':').slice(1).join(':').trim() : null,
    };
  } catch (error) {
    log(`Error getting network info: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Enter DFU mode
 */
async function enterDFUMode(deviceId) {
  log('\n=== DFU Mode Instructions ===', colors.blue);
  log('To enter DFU mode manually:', colors.yellow);
  log('1. Connect device to computer', colors.reset);
  log('2. Press and hold Power + Home (or Volume Down on newer models) for 10 seconds', colors.reset);
  log('3. Release Power button but keep holding Home/Volume Down for 5 more seconds', colors.reset);
  log('4. Screen should remain black - device is now in DFU mode', colors.reset);
  log('\nNote: Automated DFU entry requires additional tools not available in libimobiledevice', colors.yellow);
  
  return false; // Can't be automated with libimobiledevice alone
}

/**
 * Enter Recovery mode
 */
async function enterRecoveryMode(deviceId) {
  try {
    log(`Entering Recovery mode for device ${deviceId}...`, colors.yellow);
    await execAsync(`ideviceenterrecovery ${deviceId}`);
    log('Device entering Recovery mode', colors.green);
    return true;
  } catch (error) {
    log(`Error entering Recovery mode: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Get system logs (syslog)
 */
async function getSystemLogs(deviceId) {
  try {
    log('Capturing system logs (10 seconds)...', colors.yellow);
    const { stdout } = await execAsync(`timeout 10 idevicesyslog -u ${deviceId} 2>&1 || true`);
    return stdout;
  } catch (error) {
    log(`Error getting system logs: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Main diagnostics function
 */
async function runDiagnostics() {
  log('\n=== iOS Device Diagnostics ===\n', colors.blue);
  
  // Check libimobiledevice
  if (!(await checkLibimobiledevice())) {
    process.exit(1);
  }
  
  // Get devices
  const devices = await getDevices();
  if (devices.length === 0) {
    log('No devices connected', colors.yellow);
    log('Make sure device is unlocked and "Trust This Computer" is accepted', colors.yellow);
    process.exit(0);
  }
  
  log(`Found ${devices.length} device(s)\n`, colors.green);
  
  // Run diagnostics on each device
  for (const device of devices) {
    log(`\n--- Device: ${device.id} ---\n`, colors.blue);
    
    // Device info
    log('Device Information:', colors.yellow);
    const info = await getDeviceInfo(device.id);
    if (info) {
      console.log(JSON.stringify(info, null, 2));
    }
    
    // Battery info
    log('\nBattery Information:', colors.yellow);
    const battery = await getBatteryInfo(device.id);
    if (battery) {
      console.log(JSON.stringify(battery, null, 2));
    }
    
    // Hardware info
    log('\nHardware Information:', colors.yellow);
    const hardware = await getHardwareInfo(device.id);
    if (hardware) {
      console.log(JSON.stringify(hardware, null, 2));
    }
    
    // Network info
    log('\nNetwork Information:', colors.yellow);
    const network = await getNetworkInfo(device.id);
    if (network) {
      console.log(JSON.stringify(network, null, 2));
    }
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  runDiagnostics();
} else if (command === 'battery') {
  const devices = await getDevices();
  if (devices.length > 0) {
    const battery = await getBatteryInfo(devices[0].id);
    console.log(JSON.stringify(battery, null, 2));
  }
} else if (command === 'hardware') {
  const devices = await getDevices();
  if (devices.length > 0) {
    const hardware = await getHardwareInfo(devices[0].id);
    console.log(JSON.stringify(hardware, null, 2));
  }
} else if (command === 'network') {
  const devices = await getDevices();
  if (devices.length > 0) {
    const network = await getNetworkInfo(devices[0].id);
    console.log(JSON.stringify(network, null, 2));
  }
} else if (command === 'dfu') {
  const devices = await getDevices();
  if (devices.length > 0) {
    await enterDFUMode(devices[0].id);
  }
} else if (command === 'recovery') {
  const devices = await getDevices();
  if (devices.length > 0) {
    await enterRecoveryMode(devices[0].id);
  }
} else if (command === 'logs') {
  const devices = await getDevices();
  if (devices.length > 0) {
    const logs = await getSystemLogs(devices[0].id);
    console.log(logs);
  }
} else {
  log(`Unknown command: ${command}`, colors.red);
  log('Available commands: battery, hardware, network, dfu, recovery, logs', colors.yellow);
}
