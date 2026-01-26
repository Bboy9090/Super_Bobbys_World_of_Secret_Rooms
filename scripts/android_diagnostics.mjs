#!/usr/bin/env node
/**
 * Android Diagnostics Script
 * 
 * Automated diagnostics for Android devices using ADB
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
 * Check if ADB is available
 */
async function checkADB() {
  try {
    await execAsync('adb version');
    return true;
  } catch (error) {
    log('ERROR: ADB not found. Please install Android platform tools.', colors.red);
    return false;
  }
}

/**
 * Get connected Android devices
 */
async function getDevices() {
  try {
    const { stdout } = await execAsync('adb devices');
    const lines = stdout.split('\n').slice(1).filter(line => line.trim() && !line.includes('List of devices'));
    const devices = lines.map(line => {
      const [id, status] = line.split('\t');
      return { id: id.trim(), status: status.trim() };
    }).filter(d => d.status === 'device');
    
    return devices;
  } catch (error) {
    log(`Error getting devices: ${error.message}`, colors.red);
    return [];
  }
}

/**
 * Get battery diagnostics
 */
async function getBatteryInfo(deviceId) {
  try {
    const { stdout } = await execAsync(`adb -s ${deviceId} shell dumpsys battery`);
    
    const level = stdout.match(/level: (\d+)/)?.[1] || 'Unknown';
    const health = stdout.match(/health: (\d+)/)?.[1] || 'Unknown';
    const voltage = stdout.match(/voltage: (\d+)/)?.[1] || 'Unknown';
    const temperature = stdout.match(/temperature: (\d+)/)?.[1] || 'Unknown';
    const technology = stdout.match(/technology: (.+)/)?.[1] || 'Unknown';
    const status = stdout.match(/status: (\d+)/)?.[1] || 'Unknown';
    
    // Convert health code to text
    const healthMap = {
      '2': 'Good',
      '3': 'Overheat',
      '4': 'Dead',
      '5': 'Over Voltage',
      '6': 'Unspecified Failure',
      '7': 'Cold',
    };
    
    const statusMap = {
      '2': 'Charging',
      '3': 'Discharging',
      '4': 'Not Charging',
      '5': 'Full',
    };
    
    return {
      level: parseInt(level),
      health: healthMap[health] || health,
      voltage: parseInt(voltage) / 1000, // Convert to volts
      temperature: parseInt(temperature) / 10, // Convert to celsius
      technology: technology.trim(),
      isCharging: statusMap[status] === 'Charging',
      status: statusMap[status] || status,
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
    const model = await execAsync(`adb -s ${deviceId} shell getprop ro.product.model`);
    const manufacturer = await execAsync(`adb -s ${deviceId} shell getprop ro.product.manufacturer`);
    const androidVersion = await execAsync(`adb -s ${deviceId} shell getprop ro.build.version.release`);
    const serialNumber = await execAsync(`adb -s ${deviceId} shell getprop ro.serialno`);
    
    // Get display info
    const displayInfo = await execAsync(`adb -s ${deviceId} shell wm size`);
    const densityInfo = await execAsync(`adb -s ${deviceId} shell wm density`);
    
    // Get memory info
    const memInfo = await execAsync(`adb -s ${deviceId} shell cat /proc/meminfo | grep MemTotal`);
    const totalMem = memInfo.stdout.match(/MemTotal:\s+(\d+)/)?.[1];
    
    // Get storage info
    const storageInfo = await execAsync(`adb -s ${deviceId} shell df /data | tail -1`);
    const storageParts = storageInfo.stdout.trim().split(/\s+/);
    
    return {
      model: model.stdout.trim(),
      manufacturer: manufacturer.stdout.trim(),
      androidVersion: androidVersion.stdout.trim(),
      serialNumber: serialNumber.stdout.trim(),
      display: displayInfo.stdout.trim().split('\n')[0],
      density: densityInfo.stdout.trim(),
      totalMemoryKB: parseInt(totalMem),
      totalMemoryGB: (parseInt(totalMem) / 1024 / 1024).toFixed(2),
      storageTotal: storageParts[1],
      storageUsed: storageParts[2],
      storageAvailable: storageParts[3],
      storagePercent: storageParts[4],
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
    const wifiInfo = await execAsync(`adb -s ${deviceId} shell dumpsys wifi | grep "mWifiInfo"`);
    const cellularInfo = await execAsync(`adb -s ${deviceId} shell dumpsys telephony.registry | grep "mDataConnectionState"`);
    
    const ssid = wifiInfo.stdout.match(/SSID: "?([^",]+)"?/)?.[1] || null;
    const signalLevel = wifiInfo.stdout.match(/rssi: (-?\d+)/)?.[1] || null;
    
    return {
      wifiConnected: !!ssid,
      wifiSsid: ssid,
      wifiSignalStrength: signalLevel ? parseInt(signalLevel) : null,
      cellularConnected: cellularInfo.stdout.includes('2'),
    };
  } catch (error) {
    log(`Error getting network info: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Enter Fastboot mode
 */
async function enterFastboot(deviceId) {
  try {
    log(`Entering Fastboot mode for device ${deviceId}...`, colors.yellow);
    await execAsync(`adb -s ${deviceId} reboot bootloader`);
    log('Device rebooting to Fastboot mode', colors.green);
    return true;
  } catch (error) {
    log(`Error entering Fastboot: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Enter Recovery mode
 */
async function enterRecovery(deviceId) {
  try {
    log(`Entering Recovery mode for device ${deviceId}...`, colors.yellow);
    await execAsync(`adb -s ${deviceId} reboot recovery`);
    log('Device rebooting to Recovery mode', colors.green);
    return true;
  } catch (error) {
    log(`Error entering Recovery: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Get system logs
 */
async function getSystemLogs(deviceId, lines = 100) {
  try {
    const { stdout } = await execAsync(`adb -s ${deviceId} logcat -d -t ${lines}`);
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
  log('\n=== Android Device Diagnostics ===\n', colors.blue);
  
  // Check ADB
  if (!(await checkADB())) {
    process.exit(1);
  }
  
  // Get devices
  const devices = await getDevices();
  if (devices.length === 0) {
    log('No devices connected', colors.yellow);
    process.exit(0);
  }
  
  log(`Found ${devices.length} device(s)\n`, colors.green);
  
  // Run diagnostics on each device
  for (const device of devices) {
    log(`\n--- Device: ${device.id} ---\n`, colors.blue);
    
    // Hardware info
    log('Hardware Information:', colors.yellow);
    const hardware = await getHardwareInfo(device.id);
    if (hardware) {
      console.log(JSON.stringify(hardware, null, 2));
    }
    
    // Battery info
    log('\nBattery Information:', colors.yellow);
    const battery = await getBatteryInfo(device.id);
    if (battery) {
      console.log(JSON.stringify(battery, null, 2));
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
} else if (command === 'fastboot') {
  const devices = await getDevices();
  if (devices.length > 0) {
    await enterFastboot(devices[0].id);
  }
} else if (command === 'recovery') {
  const devices = await getDevices();
  if (devices.length > 0) {
    await enterRecovery(devices[0].id);
  }
} else if (command === 'logs') {
  const devices = await getDevices();
  if (devices.length > 0) {
    const logs = await getSystemLogs(devices[0].id);
    console.log(logs);
  }
} else {
  log(`Unknown command: ${command}`, colors.red);
  log('Available commands: battery, hardware, network, fastboot, recovery, logs', colors.yellow);
}
