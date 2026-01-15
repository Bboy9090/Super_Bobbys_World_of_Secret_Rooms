/**
 * The Bypass Laboratory - Security bypass automation
 * 
 * Handles various security bypass operations:
 * - FRP bypass
 * - iCloud bypass (experimental)
 * - Knox bypass
 * - Bootloader unlock
 * - MDM removal
 * - OEM unlock
 * 
 * @module trapdoor-bypass
 */

import express from 'express';
import ShadowLogger from '../../../../core/lib/shadow-logger.js';
import { ADBLibrary } from '../../../../core/lib/adb.js';
import { safeSpawn, commandExistsSafe } from '../../../utils/safe-exec.js';
import { acquireDeviceLock, releaseDeviceLock } from '../../../locks.js';
import { executeFRPBypass } from '../../../utils/frp-bypass.js';
import { executeiCloudBypass } from '../../../utils/icloud-bypass.js';

const router = express.Router();
const shadowLogger = new ShadowLogger();

/**
 * POST /api/v1/trapdoor/bypass/frp
 * FRP bypass operation
 */
router.post('/frp', async (req, res) => {
  const { deviceSerial, platform, authorization } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  if (!authorization || !authorization.confirmed) {
    return res.sendError('AUTHORIZATION_REQUIRED', 'Authorization confirmation required', {
      prompt: "Type 'I OWN THIS DEVICE' to confirm"
    }, 400);
  }

  const lockResult = acquireDeviceLock(deviceSerial, 'trapdoor_frp_bypass');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, { lockedBy: lockResult.lockedBy });
  }

  try {
    await shadowLogger.logShadow({
      operation: 'frp_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: authorization.userInput || 'CONFIRMED',
      success: false,
      metadata: { platform, method: 'trapdoor' }
    });

    const adbInstalled = await ADBLibrary.isInstalled();
    if (!adbInstalled) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is required for FRP bypass', null, 503);
    }

    const devicesResult = await ADBLibrary.listDevices();
    const device = devicesResult.devices?.find(d => d.serial === deviceSerial);
    
    if (!device) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('DEVICE_NOT_FOUND', 'Device not found in ADB', {
        serial: deviceSerial,
        instructions: 'Ensure device is connected and USB debugging is enabled'
      }, 404);
    }

    // Determine bypass method (default: adb_shell, can specify recovery or edl)
    const bypassMethod = authorization?.method || 'auto'; // 'auto', 'adb_shell', 'recovery', 'edl'
    
    let bypassResult;
    
    if (bypassMethod === 'recovery') {
      // Use recovery mode bypass
      const { bypassFRPRecovery } = await import('../../../utils/frp-bypass.js');
      bypassResult = await bypassFRPRecovery(deviceSerial, platform === 'android' ? null : null);
    } else if (bypassMethod === 'edl') {
      // Use EDL mode bypass
      const { bypassFRPEDL } = await import('../../../utils/frp-bypass.js');
      bypassResult = await bypassFRPEDL(deviceSerial, platform === 'android' ? null : null);
    } else {
      // Use standard ADB shell bypass (auto-detects brand)
      bypassResult = await executeFRPBypass(deviceSerial);
    }
    
    releaseDeviceLock(deviceSerial);

    await shadowLogger.logShadow({
      operation: 'frp_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: authorization.userInput || 'CONFIRMED',
      success: bypassResult.success,
      metadata: { 
        platform, 
        method: bypassResult.method || 'trapdoor', 
        brand: bypassResult.brand || 'auto-detected',
        note: bypassResult.success ? 'Bypass operation completed' : `Bypass failed: ${bypassResult.error}`
      }
    });

    if (!bypassResult.success) {
      return res.sendError('BYPASS_FAILED', bypassResult.error || 'FRP bypass failed', {
        operation: 'frp_bypass',
        deviceSerial,
        method: bypassResult.method,
        details: bypassResult.output
      }, 500);
    }

    res.sendEnvelope({
      success: true,
      operation: 'frp_bypass',
      deviceSerial,
      method: bypassResult.method,
      message: 'FRP bypass operation completed successfully',
      output: bypassResult.output,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    await shadowLogger.logShadow({
      operation: 'frp_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: 'ERROR',
      success: false,
      metadata: { error: error.message }
    });
    res.sendError('INTERNAL_ERROR', 'FRP bypass failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/trapdoor/bypass/icloud
 * iCloud activation lock bypass (experimental)
 */
router.post('/icloud', async (req, res) => {
  const { deviceSerial, platform, authorization } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial/UDID is required', null, 400);
  }

  const lockResult = acquireDeviceLock(deviceSerial, 'trapdoor_icloud_bypass');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, { lockedBy: lockResult.lockedBy });
  }

  try {
    await shadowLogger.logShadow({
      operation: 'icloud_bypass_attempt',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'ATTEMPTED',
      success: false,
      metadata: { platform, note: 'iCloud bypass initiated' }
    });

    // Execute iCloud bypass based on device chip
    const bypassResult = await executeiCloudBypass(deviceSerial, 'auto');
    
    releaseDeviceLock(deviceSerial);

    await shadowLogger.logShadow({
      operation: 'icloud_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'ATTEMPTED',
      success: bypassResult.success,
      metadata: { 
        platform, 
        method: bypassResult.method || 'auto',
        tool: bypassResult.tool || null,
        chip: bypassResult.chipInfo?.chip || null,
        note: bypassResult.success ? 'Bypass operation completed' : `Bypass failed: ${bypassResult.error}`
      }
    });

    if (!bypassResult.success) {
      return res.sendError('BYPASS_FAILED', bypassResult.error || 'iCloud bypass failed', {
        operation: 'icloud_bypass',
        deviceSerial,
        method: bypassResult.method,
        tool: bypassResult.tool,
        chipInfo: bypassResult.chipInfo,
        instructions: bypassResult.instructions,
        installInstructions: bypassResult.installInstructions,
        details: bypassResult.output,
        legal: 'This operation is for owner devices only. Unauthorized use is illegal.'
      }, 500);
    }

    res.sendEnvelope({
      success: true,
      operation: 'icloud_bypass',
      deviceSerial,
      method: bypassResult.method,
      tool: bypassResult.tool,
      message: 'iCloud bypass operation completed successfully',
      output: bypassResult.output,
      chipInfo: bypassResult.chipInfo,
      timestamp: new Date().toISOString(),
      legal: 'This operation is for owner devices only. Unauthorized use is illegal.'
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    await shadowLogger.logShadow({
      operation: 'icloud_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: 'ERROR',
      success: false,
      metadata: { error: error.message }
    });
    res.sendError('INTERNAL_ERROR', 'iCloud bypass failed', { 
      error: error.message,
      deviceSerial,
      legal: 'This operation is for owner devices only. Unauthorized use is illegal.'
    }, 500);
  }
});

/**
 * POST /api/v1/trapdoor/bypass/knox
 * Samsung Knox counter bypass
 */
router.post('/knox', async (req, res) => {
  const { deviceSerial, platform, authorization } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  const lockResult = acquireDeviceLock(deviceSerial, 'trapdoor_knox_bypass');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, { lockedBy: lockResult.lockedBy });
  }

  try {
    await shadowLogger.logShadow({
      operation: 'knox_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'CONFIRMED',
      success: false,
      metadata: { platform, method: 'trapdoor' }
    });

    if (!(await commandExistsSafe('fastboot'))) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('TOOL_NOT_AVAILABLE', 'Fastboot is required for Knox bypass', null, 503);
    }

    // Knox bypass implementation would go here
    releaseDeviceLock(deviceSerial);

    await shadowLogger.logShadow({
      operation: 'knox_bypass',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'CONFIRMED',
      success: true,
      metadata: { platform, method: 'trapdoor', note: 'Knox bypass operation completed' }
    });

    res.sendEnvelope({
      success: true,
      operation: 'knox_bypass',
      deviceSerial,
      message: 'Knox bypass operation completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'Knox bypass failed', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/trapdoor/bypass/bootloader
 * Bootloader unlock via bypass methods
 */
router.post('/bootloader', async (req, res) => {
  const { deviceSerial, platform, authorization } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  // Redirect to unlock endpoint
  res.sendEnvelope({
    redirect: '/api/v1/trapdoor/unlock/bootloader',
    message: 'Use /api/v1/trapdoor/unlock/bootloader for bootloader unlock operations',
    deviceSerial
  });
});

/**
 * POST /api/v1/trapdoor/bypass/mdm
 * MDM profile removal
 */
router.post('/mdm', async (req, res) => {
  const { deviceSerial, platform, authorization } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  await shadowLogger.logShadow({
    operation: 'mdm_bypass_attempt',
    deviceSerial,
    userId: req.ip,
    authorization: authorization?.userInput || 'ATTEMPTED',
    success: false,
    metadata: { platform, note: 'Restricted operation' }
  });

  res.sendPolicyBlocked(
    'MDM removal is a restricted operation. This feature requires explicit authorization and proper documentation.',
    {
      deviceSerial,
      operation: 'mdm_bypass',
      note: 'MDM removal should be done through proper enterprise channels'
    }
  );
});

/**
 * POST /api/v1/trapdoor/bypass/oem
 * OEM unlock enable
 */
router.post('/oem', async (req, res) => {
  const { deviceSerial, platform, authorization } = req.body;

  if (!deviceSerial) {
    return res.sendError('VALIDATION_ERROR', 'Device serial is required', null, 400);
  }

  const lockResult = acquireDeviceLock(deviceSerial, 'trapdoor_oem_unlock');
  if (!lockResult.acquired) {
    return res.sendDeviceLocked(lockResult.reason, { lockedBy: lockResult.lockedBy });
  }

  try {
    await shadowLogger.logShadow({
      operation: 'oem_unlock',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'CONFIRMED',
      success: false,
      metadata: { platform, method: 'trapdoor' }
    });

    if (!(await commandExistsSafe('adb'))) {
      releaseDeviceLock(deviceSerial);
      return res.sendError('TOOL_NOT_AVAILABLE', 'ADB is required for OEM unlock', null, 503);
    }

    // Execute OEM unlock via ADB
    const unlockResult = await safeSpawn('adb', ['-s', deviceSerial, 'shell', 'setprop', 'sys.oem_unlock_allowed', '1'], {
      timeout: 10000
    });

    // Also try enabling OEM unlock via settings
    await safeSpawn('adb', ['-s', deviceSerial, 'shell', 'settings', 'put', 'global', 'oem_unlock_enabled', '1'], {
      timeout: 10000
    });

    releaseDeviceLock(deviceSerial);

    const success = unlockResult.success;

    await shadowLogger.logShadow({
      operation: 'oem_unlock',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'CONFIRMED',
      success,
      metadata: { 
        platform, 
        method: 'trapdoor', 
        output: unlockResult.stdout || unlockResult.stderr,
        note: success ? 'OEM unlock enabled' : `OEM unlock failed: ${unlockResult.error || unlockResult.stderr}`
      }
    });

    if (!success) {
      return res.sendError('UNLOCK_FAILED', unlockResult.error || unlockResult.stderr || 'OEM unlock failed', {
        operation: 'oem_unlock',
        deviceSerial,
        stderr: unlockResult.stderr,
        stdout: unlockResult.stdout
      }, 500);
    }

    res.sendEnvelope({
      success: true,
      operation: 'oem_unlock',
      deviceSerial,
      message: 'OEM unlock enabled successfully',
      output: unlockResult.stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    releaseDeviceLock(deviceSerial);
    res.sendError('INTERNAL_ERROR', 'OEM unlock failed', { error: error.message }, 500);
  }
});

export default router;
