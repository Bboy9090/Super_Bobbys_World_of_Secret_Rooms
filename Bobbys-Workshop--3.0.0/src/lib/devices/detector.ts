/**
 * Device Detector
 * 
 * Device detection and enumeration logic
 */

import type { DevicePassport, TrustState, USBDevice, Platform, DeviceMode, ConnectionState } from '@/types/devices';
import { getAPIUrl } from '@/lib/apiConfig';

export class DeviceDetector {
  /**
   * Detect iOS devices via usbmuxd/libimobiledevice
   */
  async detectIOSDevices(): Promise<DevicePassport[]> {
    try {
      const response = await fetch(getAPIUrl('/api/v1/ios/scan'));
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      if (!data.ok || !data.data?.devices) {
        return [];
      }

      return data.data.devices.map((device: any) => ({
        id: `ios-${device.udid || device.serial || Date.now()}`,
        caseId: '', // Will be set when attached to a case
        platform: 'ios' as Platform,
        model: device.model,
        osVersion: device.iosVersion,
        serial: device.serial,
        imei: device.imei,
        udid: device.udid,
        connectionState: 'usb' as ConnectionState,
        mode: this.parseIOSMode(device.mode),
        collectedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('iOS device detection error:', error);
      return [];
    }
  }

  /**
   * Detect Android devices via ADB
   */
  async detectAndroidDevices(): Promise<DevicePassport[]> {
    try {
      const response = await fetch(getAPIUrl('/api/v1/adb/devices'));
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      if (!data.ok || !data.data?.devices) {
        return [];
      }

      return data.data.devices.map((device: any) => ({
        id: `android-${device.serial || Date.now()}`,
        caseId: '', // Will be set when attached to a case
        platform: 'android' as Platform,
        model: device.model,
        manufacturer: device.manufacturer,
        osVersion: device.androidVersion,
        buildNumber: device.buildNumber,
        serial: device.serial,
        imei: device.imei,
        connectionState: this.parseConnectionState(device.state),
        mode: device.state === 'fastboot' ? 'fastboot' : 'normal',
        collectedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Android device detection error:', error);
      return [];
    }
  }

  /**
   * Detect Fastboot devices
   */
  async detectFastbootDevices(): Promise<DevicePassport[]> {
    try {
      const response = await fetch(getAPIUrl('/api/v1/fastboot/devices'));
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      if (!data.ok || !data.data?.devices) {
        return [];
      }

      return data.data.devices.map((device: any) => ({
        id: `fastboot-${device.serial || Date.now()}`,
        caseId: '',
        platform: 'android' as Platform,
        model: device.model,
        manufacturer: device.manufacturer,
        serial: device.serial,
        connectionState: 'usb' as ConnectionState,
        mode: 'fastboot' as DeviceMode,
        collectedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Fastboot device detection error:', error);
      return [];
    }
  }

  /**
   * Detect all connected devices
   */
  async detectAllDevices(): Promise<DevicePassport[]> {
    const [iosDevices, androidDevices, fastbootDevices] = await Promise.all([
      this.detectIOSDevices(),
      this.detectAndroidDevices(),
      this.detectFastbootDevices(),
    ]);

    // Combine and deduplicate by serial/UDID
    const deviceMap = new Map<string, DevicePassport>();

    for (const device of [...iosDevices, ...androidDevices, ...fastbootDevices]) {
      const key = device.serial || device.udid || device.id;
      if (!deviceMap.has(key)) {
        deviceMap.set(key, device);
      } else {
        // Merge devices with same serial (e.g., normal + fastboot mode)
        const existing = deviceMap.get(key)!;
        if (device.mode !== 'normal' && existing.mode === 'normal') {
          deviceMap.set(key, device); // Prefer non-normal mode
        }
      }
    }

    return Array.from(deviceMap.values());
  }

  /**
   * Parse iOS mode from device state
   */
  private parseIOSMode(mode?: string): DeviceMode {
    if (!mode) return 'normal';
    const lower = mode.toLowerCase();
    if (lower.includes('dfu')) return 'dfu';
    if (lower.includes('recovery')) return 'recovery';
    if (lower.includes('normal')) return 'normal';
    return 'unknown';
  }

  /**
   * Parse connection state from ADB state
   */
  private parseConnectionState(state?: string): ConnectionState {
    if (!state) return 'none';
    const lower = state.toLowerCase();
    if (lower === 'device' || lower === 'authorized') return 'usb';
    if (lower === 'unauthorized') return 'usb';
    if (lower === 'offline') return 'none';
    return 'none';
  }

  /**
   * Create device passport for a case
   */
  async createDevicePassport(caseId: string, deviceSerialOrUDID?: string): Promise<DevicePassport | null> {
    const devices = await this.detectAllDevices();
    
    if (deviceSerialOrUDID) {
      const device = devices.find(d => 
        d.serial === deviceSerialOrUDID || 
        d.udid === deviceSerialOrUDID
      );
      if (device) {
        return { ...device, caseId, id: `passport-${caseId}-${Date.now()}` };
      }
    }

    // If no serial specified, use first detected device
    if (devices.length > 0) {
      const device = devices[0];
      return { ...device, caseId, id: `passport-${caseId}-${Date.now()}` };
    }

    return null;
  }
}

// Singleton instance
export const deviceDetector = new DeviceDetector();
