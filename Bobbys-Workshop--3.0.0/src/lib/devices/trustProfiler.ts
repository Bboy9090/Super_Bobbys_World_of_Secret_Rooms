/**
 * Trust State Profiler
 * 
 * Assess device trust state and lock status
 */

import type { TrustState, DevicePassport, LockType, LockStatus } from '@/types/devices';
import { getAPIUrl } from '@/lib/apiConfig';

export class TrustStateProfiler {
  /**
   * Assess trust state for a device passport
   */
  async assessTrustState(caseId: string, passport: DevicePassport): Promise<TrustState> {
    if (passport.platform === 'ios') {
      return this.assessIOSTrustState(caseId, passport);
    } else if (passport.platform === 'android') {
      return this.assessAndroidTrustState(caseId, passport);
    }

    // Default/unknown platform
    return {
      id: `trust-${caseId}-${Date.now()}`,
      caseId,
      platform: passport.platform,
      lockType: 'unknown',
      lockStatus: 'unknown',
      adbAuthorized: false,
      fastbootUnlocked: false,
      iosPaired: false,
      mdmEnrolled: false,
      assessedAt: new Date().toISOString(),
    };
  }

  /**
   * Assess iOS trust state
   */
  private async assessIOSTrustState(caseId: string, passport: DevicePassport): Promise<TrustState> {
    // Check activation lock status (read-only assessment)
    let activationLockStatus: LockStatus = 'unknown';
    try {
      const response = await fetch(getAPIUrl('/api/v1/trapdoor/status'));
      if (response.ok) {
        const data = await response.json();
        // This is a read-only check, not a bypass
        if (data.data?.activationLock) {
          activationLockStatus = 'likely_enabled';
        } else {
          activationLockStatus = 'likely_not_enabled';
        }
      }
    } catch (error) {
      console.error('Activation lock assessment error:', error);
    }

    // Check if device is paired (usbmuxd trust)
    const iosPaired = passport.connectionState === 'usb' && passport.mode === 'normal';

    return {
      id: `trust-${caseId}-${Date.now()}`,
      caseId,
      platform: 'ios',
      lockType: activationLockStatus === 'likely_enabled' ? 'icloud' : 'none',
      lockStatus: activationLockStatus,
      activationLockStatus,
      adbAuthorized: false, // N/A for iOS
      fastbootUnlocked: false, // N/A for iOS
      iosPaired,
      supervisionStatus: 'unknown',
      mdmEnrolled: false, // Would need additional check
      assessedAt: new Date().toISOString(),
    };
  }

  /**
   * Assess Android trust state
   */
  private async assessAndroidTrustState(caseId: string, passport: DevicePassport): Promise<TrustState> {
    // Check ADB authorization
    let adbAuthorized = false;
    let frpStatus: LockStatus = 'unknown';
    let bootloaderStatus: 'locked' | 'unlocked' | 'unlockable' | 'unknown' = 'unknown';

    if (passport.serial) {
      try {
        // Check ADB authorization
        const adbResponse = await fetch(getAPIUrl('/api/v1/adb/devices'));
        if (adbResponse.ok) {
          const adbData = await adbResponse.json();
          if (adbData.data?.devices) {
            const device = adbData.data.devices.find((d: any) => d.serial === passport.serial);
            if (device && device.state === 'device') {
              adbAuthorized = true;
            }
          }
        }

        // Check FRP status (read-only)
        try {
          const frpResponse = await fetch(getAPIUrl('/api/v1/frp/detect'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serial: passport.serial }),
          });
          if (frpResponse.ok) {
            const frpData = await frpResponse.json();
            if (frpData.data?.frpLocked) {
              frpStatus = 'likely_enabled';
            } else {
              frpStatus = 'likely_not_enabled';
            }
          }
        } catch (error) {
          console.error('FRP detection error:', error);
        }

        // Check bootloader status (read-only)
        try {
          const bootResponse = await fetch(getAPIUrl('/api/v1/security/bootloader-status'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serial: passport.serial }),
          });
          if (bootResponse.ok) {
            const bootData = await bootResponse.json();
            if (bootData.data?.unlocked) {
              bootloaderStatus = 'unlocked';
            } else if (bootData.data?.unlockable) {
              bootloaderStatus = 'unlockable';
            } else {
              bootloaderStatus = 'locked';
            }
          }
        } catch (error) {
          console.error('Bootloader status check error:', error);
        }
      } catch (error) {
        console.error('Android trust state assessment error:', error);
      }
    }

    // Check fastboot unlock status
    const fastbootUnlocked = bootloaderStatus === 'unlocked';

    // Determine primary lock type
    let lockType: LockType = 'none';
    if (frpStatus === 'likely_enabled') {
      lockType = 'frp';
    } else if (bootloaderStatus === 'locked') {
      lockType = 'bootloader';
    }

    return {
      id: `trust-${caseId}-${Date.now()}`,
      caseId,
      platform: 'android',
      lockType,
      lockStatus: frpStatus !== 'unknown' ? frpStatus : 'unknown',
      frpStatus,
      adbAuthorized,
      fastbootUnlocked,
      bootloaderStatus,
      iosPaired: false, // N/A for Android
      mdmEnrolled: false, // Would need additional check
      assessedAt: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const trustStateProfiler = new TrustStateProfiler();
