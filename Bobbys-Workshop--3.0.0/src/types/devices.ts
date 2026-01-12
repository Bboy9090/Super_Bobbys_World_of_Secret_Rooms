/**
 * Device Detection & Trust State Types
 * 
 * Types for device connectivity, detection, and trust state profiling
 */

export type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

export type ConnectionState = 'usb' | 'none' | 'network' | 'bluetooth';

export type DeviceMode = 'normal' | 'recovery' | 'fastboot' | 'dfu' | 'download' | 'edl' | 'unknown';

export type LockType = 'icloud' | 'frp' | 'carrier' | 'mdm' | 'sim' | 'bootloader' | 'none' | 'unknown';

export type LockStatus = 'likely_enabled' | 'likely_not_enabled' | 'unknown';

export interface DevicePassport {
  id: string;
  caseId: string;
  platform: Platform;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  buildNumber?: string;
  serial?: string;
  imei?: string;
  meid?: string;
  udid?: string; // iOS only
  connectionState: ConnectionState;
  mode: DeviceMode;
  batteryLevel?: number;
  batteryHealth?: string;
  storageCapacity?: number;
  storageUsed?: number;
  collectedAt: string;
}

export interface TrustState {
  id: string;
  caseId: string;
  platform: Platform;
  lockType: LockType;
  lockStatus: LockStatus;
  adbAuthorized: boolean;
  fastbootUnlocked: boolean;
  iosPaired: boolean;
  bootloaderStatus?: 'locked' | 'unlocked' | 'unlockable' | 'unknown';
  frpStatus?: LockStatus;
  activationLockStatus?: LockStatus;
  carrierLockStatus?: LockStatus;
  mdmEnrolled: boolean;
  supervisionStatus?: 'supervised' | 'unsupervised' | 'unknown';
  authorizationMethod?: string;
  lastAuthorized?: string;
  assessedAt: string;
}

export interface USBDevice {
  vid: string;
  pid: string;
  serial?: string;
  manufacturer?: string;
  product?: string;
  devicePath?: string;
  mode: DeviceMode;
  connectionTime: string;
}

export interface DeviceDiagnostics {
  passport: DevicePassport;
  trustState: TrustState;
  usbDevice?: USBDevice;
  properties?: Record<string, string>; // Device properties (getprop, etc.)
  errors?: string[];
  warnings?: string[];
}
