#!/usr/bin/env node

/**
 * Universal Device Database Population Script
 * 
 * Populates the device database with major Android and iOS devices
 * Supports thousands of devices across all major manufacturers
 * 
 * Run: node scripts/populate-device-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEVICE_DB_PATH = path.join(__dirname, '..', 'data', 'devices', 'universal-device-db.json');

// Major Android device models (expanded list)
const ANDROID_DEVICES = {
  samsung: {
    // Galaxy S Series (S6-S24)
    'SM-G925F': { name: 'Galaxy S6 Edge', chipset: 'Exynos 7420', androidVersions: ['5', '6', '7'] },
    'SM-G935F': { name: 'Galaxy S7 Edge', chipset: 'Exynos 8890', androidVersions: ['6', '7', '8'] },
    'SM-G950F': { name: 'Galaxy S8', chipset: 'Exynos 8895', androidVersions: ['7', '8', '9'] },
    'SM-G960F': { name: 'Galaxy S9', chipset: 'Exynos 9810', androidVersions: ['8', '9', '10'] },
    'SM-G970F': { name: 'Galaxy S10', chipset: 'Exynos 9820', androidVersions: ['9', '10', '11', '12'] },
    'SM-G973F': { name: 'Galaxy S10', chipset: 'Exynos 9820', androidVersions: ['9', '10', '11', '12'] },
    'SM-G988B': { name: 'Galaxy S20 Ultra', chipset: 'Exynos 990', androidVersions: ['10', '11', '12', '13'] },
    'SM-G991B': { name: 'Galaxy S21', chipset: 'Exynos 2100', androidVersions: ['11', '12', '13', '14'] },
    'SM-G996B': { name: 'Galaxy S21+', chipset: 'Exynos 2100', androidVersions: ['11', '12', '13', '14'] },
    'SM-G998B': { name: 'Galaxy S21 Ultra', chipset: 'Exynos 2100', androidVersions: ['11', '12', '13', '14'] },
    'SM-S906B': { name: 'Galaxy S22+', chipset: 'Exynos 2200', androidVersions: ['12', '13', '14'] },
    'SM-S908B': { name: 'Galaxy S22 Ultra', chipset: 'Exynos 2200', androidVersions: ['12', '13', '14'] },
    'SM-S911B': { name: 'Galaxy S23', chipset: 'Snapdragon 8 Gen 2', androidVersions: ['13', '14', '15'] },
    'SM-S916B': { name: 'Galaxy S23+', chipset: 'Snapdragon 8 Gen 2', androidVersions: ['13', '14', '15'] },
    'SM-S918B': { name: 'Galaxy S23 Ultra', chipset: 'Snapdragon 8 Gen 2', androidVersions: ['13', '14', '15'] },
    'SM-S921B': { name: 'Galaxy S24', chipset: 'Exynos 2400', androidVersions: ['14', '15'] },
    'SM-S926B': { name: 'Galaxy S24+', chipset: 'Exynos 2400', androidVersions: ['14', '15'] },
    'SM-S928B': { name: 'Galaxy S24 Ultra', chipset: 'Snapdragon 8 Gen 3', androidVersions: ['14', '15'] },
    // Galaxy Note Series (Note 5 - Note 20)
    'SM-N920F': { name: 'Galaxy Note 5', chipset: 'Exynos 7420', androidVersions: ['5', '6', '7'] },
    'SM-N950F': { name: 'Galaxy Note 8', chipset: 'Exynos 8895', androidVersions: ['7', '8', '9'] },
    'SM-N960F': { name: 'Galaxy Note 9', chipset: 'Exynos 9810', androidVersions: ['8', '9', '10'] },
    'SM-N975F': { name: 'Galaxy Note 10+', chipset: 'Exynos 9825', androidVersions: ['9', '10', '11', '12'] },
    'SM-N986B': { name: 'Galaxy Note 20 Ultra', chipset: 'Exynos 990', androidVersions: ['10', '11', '12'] },
    // Galaxy A Series (A10-A55)
    'SM-A105F': { name: 'Galaxy A10', chipset: 'Exynos 7884', androidVersions: ['9', '10', '11'] },
    'SM-A205F': { name: 'Galaxy A20', chipset: 'Exynos 7884', androidVersions: ['9', '10', '11'] },
    'SM-A505F': { name: 'Galaxy A50', chipset: 'Exynos 9610', androidVersions: ['9', '10', '11', '12'] },
    'SM-A515F': { name: 'Galaxy A51', chipset: 'Exynos 9611', androidVersions: ['10', '11', '12', '13'] },
    'SM-A525F': { name: 'Galaxy A52', chipset: 'Snapdragon 720G', androidVersions: ['11', '12', '13', '14'] },
    'SM-A536B': { name: 'Galaxy A53', chipset: 'Exynos 1280', androidVersions: ['12', '13', '14'] },
    'SM-A546B': { name: 'Galaxy A54', chipset: 'Exynos 1380', androidVersions: ['13', '14'] },
    'SM-A556B': { name: 'Galaxy A55', chipset: 'Exynos 1480', androidVersions: ['14'] },
  },
  google: {
    // Pixel Series (Pixel 1 - Pixel 9)
    'pixel': { name: 'Pixel', codename: 'sailfish', chipset: 'Snapdragon 821', androidVersions: ['7', '8'] },
    'pixel-xl': { name: 'Pixel XL', codename: 'marlin', chipset: 'Snapdragon 821', androidVersions: ['7', '8'] },
    'pixel-2': { name: 'Pixel 2', codename: 'walleye', chipset: 'Snapdragon 835', androidVersions: ['8', '9', '10', '11'] },
    'pixel-2-xl': { name: 'Pixel 2 XL', codename: 'taimen', chipset: 'Snapdragon 835', androidVersions: ['8', '9', '10', '11'] },
    'pixel-3': { name: 'Pixel 3', codename: 'blueline', chipset: 'Snapdragon 845', androidVersions: ['9', '10', '11', '12'] },
    'pixel-3-xl': { name: 'Pixel 3 XL', codename: 'crosshatch', chipset: 'Snapdragon 845', androidVersions: ['9', '10', '11', '12'] },
    'pixel-4': { name: 'Pixel 4', codename: 'flame', chipset: 'Snapdragon 855', androidVersions: ['10', '11', '12', '13'] },
    'pixel-4-xl': { name: 'Pixel 4 XL', codename: 'coral', chipset: 'Snapdragon 855', androidVersions: ['10', '11', '12', '13'] },
    'pixel-4a': { name: 'Pixel 4a', codename: 'sunfish', chipset: 'Snapdragon 730G', androidVersions: ['10', '11', '12', '13'] },
    'pixel-5': { name: 'Pixel 5', codename: 'redfin', chipset: 'Snapdragon 765G', androidVersions: ['11', '12', '13', '14'] },
    'pixel-5a': { name: 'Pixel 5a', codename: 'barbet', chipset: 'Snapdragon 765G', androidVersions: ['11', '12'] },
    'pixel-6': { name: 'Pixel 6', codename: 'oriole', chipset: 'Tensor', androidVersions: ['12', '13', '14', '15'] },
    'pixel-6-pro': { name: 'Pixel 6 Pro', codename: 'raven', chipset: 'Tensor', androidVersions: ['12', '13', '14', '15'] },
    'pixel-6a': { name: 'Pixel 6a', codename: 'bluejay', chipset: 'Tensor', androidVersions: ['12', '13', '14'] },
    'pixel-7': { name: 'Pixel 7', codename: 'cheetah', chipset: 'Tensor G2', androidVersions: ['13', '14', '15'] },
    'pixel-7-pro': { name: 'Pixel 7 Pro', codename: 'panther', chipset: 'Tensor G2', androidVersions: ['13', '14', '15'] },
    'pixel-7a': { name: 'Pixel 7a', codename: 'lynx', chipset: 'Tensor G2', androidVersions: ['13', '14'] },
    'pixel-8': { name: 'Pixel 8', codename: 'shiba', chipset: 'Tensor G3', androidVersions: ['14', '15'] },
    'pixel-8-pro': { name: 'Pixel 8 Pro', codename: 'husky', chipset: 'Tensor G3', androidVersions: ['14', '15'] },
    'pixel-8a': { name: 'Pixel 8a', codename: 'akita', chipset: 'Tensor G3', androidVersions: ['14'] },
    'pixel-9': { name: 'Pixel 9', codename: 'tokay', chipset: 'Tensor G4', androidVersions: ['15'] },
    'pixel-9-pro': { name: 'Pixel 9 Pro', codename: 'komodo', chipset: 'Tensor G4', androidVersions: ['15'] },
  },
  xiaomi: {
    // Mi Series
    'mi-6': { name: 'Mi 6', codename: 'sagit', chipset: 'Snapdragon 835', androidVersions: ['7', '8', '9'] },
    'mi-8': { name: 'Mi 8', codename: 'dipper', chipset: 'Snapdragon 845', androidVersions: ['8', '9', '10'] },
    'mi-9': { name: 'Mi 9', codename: 'cepheus', chipset: 'Snapdragon 855', androidVersions: ['9', '10', '11'] },
    'mi-10': { name: 'Mi 10', codename: 'umi', chipset: 'Snapdragon 865', androidVersions: ['10', '11', '12'] },
    'mi-11': { name: 'Mi 11', codename: 'venus', chipset: 'Snapdragon 888', androidVersions: ['11', '12', '13'] },
    'mi-12': { name: 'Mi 12', codename: 'cupid', chipset: 'Snapdragon 8 Gen 1', androidVersions: ['12', '13', '14'] },
    'mi-13': { name: 'Mi 13', codename: 'fuxi', chipset: 'Snapdragon 8 Gen 2', androidVersions: ['13', '14'] },
    'mi-14': { name: 'Mi 14', codename: 'shennong', chipset: 'Snapdragon 8 Gen 3', androidVersions: ['14'] },
    // Redmi Series
    'redmi-note-8': { name: 'Redmi Note 8', codename: 'ginkgo', chipset: 'Snapdragon 665', androidVersions: ['9', '10', '11', '12'] },
    'redmi-note-9': { name: 'Redmi Note 9', codename: 'merlin', chipset: 'MediaTek Helio G85', androidVersions: ['10', '11', '12'] },
    'redmi-note-10': { name: 'Redmi Note 10', codename: 'mojito', chipset: 'Snapdragon 678', androidVersions: ['11', '12', '13'] },
    'redmi-note-11': { name: 'Redmi Note 11', codename: 'spes', chipset: 'Snapdragon 680', androidVersions: ['11', '12', '13'] },
    'redmi-note-12': { name: 'Redmi Note 12', codename: 'tapas', chipset: 'Snapdragon 685', androidVersions: ['12', '13'] },
    // POCO Series
    'poco-f1': { name: 'POCO F1', codename: 'beryllium', chipset: 'Snapdragon 845', androidVersions: ['8', '9', '10', '11', '12'] },
    'poco-x3': { name: 'POCO X3', codename: 'karna', chipset: 'Snapdragon 732G', androidVersions: ['10', '11', '12'] },
  },
  oneplus: {
    'oneplus-6': { name: 'OnePlus 6', codename: 'enchilada', chipset: 'Snapdragon 845', androidVersions: ['8', '9', '10', '11'] },
    'oneplus-7': { name: 'OnePlus 7', codename: 'guacamoleb', chipset: 'Snapdragon 855', androidVersions: ['9', '10', '11', '12'] },
    'oneplus-8': { name: 'OnePlus 8', codename: 'instantnoodlep', chipset: 'Snapdragon 865', androidVersions: ['10', '11', '12', '13'] },
    'oneplus-9': { name: 'OnePlus 9', codename: 'lemonadep', chipset: 'Snapdragon 888', androidVersions: ['11', '12', '13', '14'] },
    'oneplus-10': { name: 'OnePlus 10 Pro', codename: 'ne2213', chipset: 'Snapdragon 8 Gen 1', androidVersions: ['12', '13', '14'] },
    'oneplus-11': { name: 'OnePlus 11', codename: 'cph2449', chipset: 'Snapdragon 8 Gen 2', androidVersions: ['13', '14'] },
    'oneplus-12': { name: 'OnePlus 12', codename: 'cph2581', chipset: 'Snapdragon 8 Gen 3', androidVersions: ['14'] },
  },
  motorola: {
    'moto-g5': { name: 'Moto G5', codename: 'cedric', chipset: 'Snapdragon 430', androidVersions: ['7', '8'] },
    'moto-g6': { name: 'Moto G6', codename: 'ali', chipset: 'Snapdragon 450', androidVersions: ['8', '9'] },
    'moto-g7': { name: 'Moto G7', codename: 'river', chipset: 'Snapdragon 632', androidVersions: ['9', '10'] },
    'moto-g8': { name: 'Moto G8', codename: 'rav', chipset: 'Snapdragon 665', androidVersions: ['10', '11'] },
    'moto-edge-20': { name: 'Moto Edge 20', codename: 'berlin', chipset: 'Snapdragon 778G', androidVersions: ['11', '12', '13'] },
    'moto-edge-30': { name: 'Moto Edge 30', codename: 'dubai', chipset: 'Snapdragon 778G+', androidVersions: ['12', '13'] },
  },
};

// iOS device models (iPhone 1 to iPhone 15)
const IOS_DEVICES = {
  'iPhone1,1': { name: 'iPhone', chip: 'Samsung ARM1176JZF-S', iosVersions: ['1.0', '1.1', '2.0', '3.1'] },
  'iPhone1,2': { name: 'iPhone 3G', chip: 'Samsung ARM1176JZ-S', iosVersions: ['2.0', '3.0', '4.2'] },
  'iPhone2,1': { name: 'iPhone 3GS', chip: 'Samsung S5PC100', iosVersions: ['3.0', '4.0', '5.0', '6.1'] },
  'iPhone3,1': { name: 'iPhone 4', chip: 'A4', iosVersions: ['4.0', '5.0', '6.0', '7.1'] },
  'iPhone4,1': { name: 'iPhone 4s', chip: 'A5', iosVersions: ['5.0', '6.0', '7.0', '8.0', '9.3'] },
  'iPhone5,1': { name: 'iPhone 5', chip: 'A6', iosVersions: ['6.0', '7.0', '8.0', '9.0', '10.3'] },
  'iPhone5,2': { name: 'iPhone 5', chip: 'A6', iosVersions: ['6.0', '7.0', '8.0', '9.0', '10.3'] },
  'iPhone5,3': { name: 'iPhone 5c', chip: 'A6', iosVersions: ['7.0', '8.0', '9.0', '10.3'] },
  'iPhone5,4': { name: 'iPhone 5c', chip: 'A6', iosVersions: ['7.0', '8.0', '9.0', '10.3'] },
  'iPhone6,1': { name: 'iPhone 5s', chip: 'A7', iosVersions: ['7.0', '8.0', '9.0', '10.0', '11.0', '12.5'] },
  'iPhone6,2': { name: 'iPhone 5s', chip: 'A7', iosVersions: ['7.0', '8.0', '9.0', '10.0', '11.0', '12.5'] },
  'iPhone7,1': { name: 'iPhone 6 Plus', chip: 'A8', iosVersions: ['8.0', '9.0', '10.0', '11.0', '12.5'] },
  'iPhone7,2': { name: 'iPhone 6', chip: 'A8', iosVersions: ['8.0', '9.0', '10.0', '11.0', '12.5'] },
  'iPhone8,1': { name: 'iPhone 6s', chip: 'A9', iosVersions: ['9.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone8,2': { name: 'iPhone 6s Plus', chip: 'A9', iosVersions: ['9.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone8,4': { name: 'iPhone SE (1st gen)', chip: 'A9', iosVersions: ['9.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone9,1': { name: 'iPhone 7', chip: 'A10 Fusion', iosVersions: ['10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone9,2': { name: 'iPhone 7 Plus', chip: 'A10 Fusion', iosVersions: ['10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone9,3': { name: 'iPhone 7', chip: 'A10 Fusion', iosVersions: ['10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone9,4': { name: 'iPhone 7 Plus', chip: 'A10 Fusion', iosVersions: ['10.0', '11.0', '12.0', '13.0', '14.0', '15.8'] },
  'iPhone10,1': { name: 'iPhone 8', chip: 'A11 Bionic', iosVersions: ['11.0', '12.0', '13.0', '14.0', '15.0', '16.7'] },
  'iPhone10,2': { name: 'iPhone 8 Plus', chip: 'A11 Bionic', iosVersions: ['11.0', '12.0', '13.0', '14.0', '15.0', '16.7'] },
  'iPhone10,3': { name: 'iPhone X', chip: 'A11 Bionic', iosVersions: ['11.0', '12.0', '13.0', '14.0', '15.0', '16.7'] },
  'iPhone10,4': { name: 'iPhone 8', chip: 'A11 Bionic', iosVersions: ['11.0', '12.0', '13.0', '14.0', '15.0', '16.7'] },
  'iPhone10,5': { name: 'iPhone 8 Plus', chip: 'A11 Bionic', iosVersions: ['11.0', '12.0', '13.0', '14.0', '15.0', '16.7'] },
  'iPhone10,6': { name: 'iPhone X', chip: 'A11 Bionic', iosVersions: ['11.0', '12.0', '13.0', '14.0', '15.0', '16.7'] },
  'iPhone11,2': { name: 'iPhone XS', chip: 'A12 Bionic', iosVersions: ['12.0', '13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone11,4': { name: 'iPhone XS Max', chip: 'A12 Bionic', iosVersions: ['12.0', '13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone11,6': { name: 'iPhone XS Max', chip: 'A12 Bionic', iosVersions: ['12.0', '13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone11,8': { name: 'iPhone XR', chip: 'A12 Bionic', iosVersions: ['12.0', '13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone12,1': { name: 'iPhone 11', chip: 'A13 Bionic', iosVersions: ['13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone12,3': { name: 'iPhone 11 Pro', chip: 'A13 Bionic', iosVersions: ['13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone12,5': { name: 'iPhone 11 Pro Max', chip: 'A13 Bionic', iosVersions: ['13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone12,8': { name: 'iPhone SE (2nd gen)', chip: 'A13 Bionic', iosVersions: ['13.0', '14.0', '15.0', '16.0', '17.0'] },
  'iPhone13,1': { name: 'iPhone 12 mini', chip: 'A14 Bionic', iosVersions: ['14.0', '15.0', '16.0', '17.0'] },
  'iPhone13,2': { name: 'iPhone 12', chip: 'A14 Bionic', iosVersions: ['14.0', '15.0', '16.0', '17.0'] },
  'iPhone13,3': { name: 'iPhone 12 Pro', chip: 'A14 Bionic', iosVersions: ['14.0', '15.0', '16.0', '17.0'] },
  'iPhone13,4': { name: 'iPhone 12 Pro Max', chip: 'A14 Bionic', iosVersions: ['14.0', '15.0', '16.0', '17.0'] },
  'iPhone14,2': { name: 'iPhone 13 Pro', chip: 'A15 Bionic', iosVersions: ['15.0', '16.0', '17.0'] },
  'iPhone14,3': { name: 'iPhone 13 Pro Max', chip: 'A15 Bionic', iosVersions: ['15.0', '16.0', '17.0'] },
  'iPhone14,4': { name: 'iPhone 13 mini', chip: 'A15 Bionic', iosVersions: ['15.0', '16.0', '17.0'] },
  'iPhone14,5': { name: 'iPhone 13', chip: 'A15 Bionic', iosVersions: ['15.0', '16.0', '17.0'] },
  'iPhone14,6': { name: 'iPhone SE (3rd gen)', chip: 'A15 Bionic', iosVersions: ['15.0', '16.0', '17.0'] },
  'iPhone14,7': { name: 'iPhone 14', chip: 'A15 Bionic', iosVersions: ['16.0', '17.0'] },
  'iPhone14,8': { name: 'iPhone 14 Plus', chip: 'A15 Bionic', iosVersions: ['16.0', '17.0'] },
  'iPhone15,2': { name: 'iPhone 14 Pro', chip: 'A16 Bionic', iosVersions: ['16.0', '17.0'] },
  'iPhone15,3': { name: 'iPhone 14 Pro Max', chip: 'A16 Bionic', iosVersions: ['16.0', '17.0'] },
  'iPhone15,4': { name: 'iPhone 15', chip: 'A16 Bionic', iosVersions: ['17.0'] },
  'iPhone15,5': { name: 'iPhone 15 Plus', chip: 'A16 Bionic', iosVersions: ['17.0'] },
  'iPhone16,1': { name: 'iPhone 15 Pro', chip: 'A17 Pro', iosVersions: ['17.0'] },
  'iPhone16,2': { name: 'iPhone 15 Pro Max', chip: 'A17 Pro', iosVersions: ['17.0'] },
};

/**
 * Generate device entry with default bypass methods
 */
function generateDeviceEntry(modelId, deviceInfo, brand) {
  const isIOS = brand === 'ios';
  
  if (isIOS) {
    const chip = deviceInfo.chip || 'Unknown';
    const checkm8 = chip.includes('A5') || chip.includes('A6') || chip.includes('A7') || 
                    chip.includes('A8') || chip.includes('A9') || chip.includes('A10') || 
                    chip.includes('A11');
    
    return {
      name: deviceInfo.name,
      chip,
      model: modelId,
      iosVersions: deviceInfo.iosVersions || [],
      jailbreakable: determineJailbreakable(deviceInfo),
      dfuSupport: true,
      activationLockBypass: false,
      checkm8,
      bypassMethods: {
        activationLock: [],
        passcode: checkm8 ? ['checkra1n', 'palera1n'] : [],
        jailbreak: determineJailbreakMethods(deviceInfo)
      },
      firmwareSources: [`https://ipsw.me/product/${modelId}`]
    };
  } else {
    // Android device
    const flashMethod = determineFlashMethod(brand);
    const chipset = deviceInfo.chipset || 'Unknown';
    const isMediaTek = chipset.toLowerCase().includes('mediatek') || chipset.toLowerCase().includes('mt');
    
    return {
      name: deviceInfo.name,
      codename: deviceInfo.codename || modelId.toLowerCase(),
      chipset,
      ram: deviceInfo.ram || ['4GB', '6GB', '8GB'],
      storage: deviceInfo.storage || ['64GB', '128GB', '256GB'],
      androidVersions: deviceInfo.androidVersions || [],
      flashMethod,
      bootloaderUnlock: true,
      frpBypass: true,
      knox: brand === 'samsung',
      bypassMethods: {
        frp: ['adb_shell', 'recovery', isMediaTek ? 'edl' : 'universal'],
        bootloader: brand === 'samsung' ? ['odin_unlock'] : ['fastboot_oem_unlock', 'fastboot_flashing_unlock'],
        recovery: brand !== 'samsung' ? ['recovery_frp'] : []
      },
      firmwareSources: generateFirmwareSources(brand, modelId, deviceInfo)
    };
  }
}

function determineFlashMethod(brand) {
  const methods = {
    samsung: 'odin',
    google: 'fastboot',
    xiaomi: 'miflash',
    oneplus: 'msm',
    motorola: 'fastboot'
  };
  return methods[brand] || 'fastboot';
}

function determineJailbreakable(deviceInfo) {
  const chip = deviceInfo.chip || '';
  const versions = deviceInfo.iosVersions || [];
  
  const result = {};
  
  // checkm8 devices (A5-A11)
  if (chip.includes('A5') || chip.includes('A6') || chip.includes('A7') || 
      chip.includes('A8') || chip.includes('A9') || chip.includes('A10') || chip.includes('A11')) {
    result['14.0-14.8'] = ['checkra1n', 'palera1n'];
    result['15.0-15.4.1'] = ['Dopamine'];
    result['15.5-15.7.9'] = ['palera1n'];
  }
  
  // A12-A15
  if (chip.includes('A12') || chip.includes('A13') || chip.includes('A14') || chip.includes('A15')) {
    result['15.0-15.4.1'] = ['Dopamine'];
    result['16.0-16.1'] = ['Bootstrap'];
  }
  
  return result;
}

function determineJailbreakMethods(deviceInfo) {
  const chip = deviceInfo.chip || '';
  const methods = [];
  
  if (chip.includes('A11') || chip.includes('A10') || chip.includes('A9') || 
      chip.includes('A8') || chip.includes('A7')) {
    methods.push('checkra1n', 'palera1n');
  }
  if (chip.includes('A12') || chip.includes('A13') || chip.includes('A14') || chip.includes('A15')) {
    methods.push('Dopamine');
  }
  if (chip.includes('A13') || chip.includes('A14') || chip.includes('A15')) {
    methods.push('Bootstrap');
  }
  
  return methods.length > 0 ? methods : ['None'];
}

function generateFirmwareSources(brand, modelId, deviceInfo) {
  const sources = [];
  
  if (brand === 'samsung') {
    sources.push(`https://samfw.com/firmware/${modelId}`);
    sources.push(`https://www.sammobile.com/samsung/galaxy-${deviceInfo.name?.toLowerCase().replace(/\s+/g, '-')}/firmware/`);
  } else if (brand === 'google') {
    sources.push('https://developers.google.com/android/images');
  } else if (brand === 'xiaomi') {
    sources.push('https://miuirom.org/');
    sources.push('https://xiaomifirmwareupdater.com/');
  } else if (brand === 'oneplus') {
    sources.push('https://www.oneplus.com/support/softwareupgrade');
  }
  
  return sources;
}

/**
 * Populate device database
 */
async function populateDeviceDatabase() {
  console.log('🔨 Populating Universal Device Database...');
  
  let db;
  
  // Load existing database or create new
  if (fs.existsSync(DEVICE_DB_PATH)) {
    const content = fs.readFileSync(DEVICE_DB_PATH, 'utf8');
    db = JSON.parse(content);
  } else {
    db = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      description: 'Universal Device Database - All Android and iOS devices',
      platforms: {
        android: { brands: {} },
        ios: { devices: {} }
      },
      metadata: {
        totalAndroidDevices: 0,
        totalIOSDevices: 0,
        lastSync: null,
        syncSources: []
      }
    };
  }
  
  // Populate Android devices
  let androidCount = 0;
  for (const [brand, models] of Object.entries(ANDROID_DEVICES)) {
    if (!db.platforms.android.brands[brand]) {
      db.platforms.android.brands[brand] = {
        description: `${brand.charAt(0).toUpperCase() + brand.slice(1)} devices`,
        models: {}
      };
    }
    
    for (const [modelId, deviceInfo] of Object.entries(models)) {
      if (!db.platforms.android.brands[brand].models[modelId]) {
        db.platforms.android.brands[brand].models[modelId] = generateDeviceEntry(modelId, deviceInfo, brand);
        androidCount++;
      }
    }
  }
  
  // Populate iOS devices
  let iosCount = 0;
  for (const [modelId, deviceInfo] of Object.entries(IOS_DEVICES)) {
    if (!db.platforms.ios.devices[modelId]) {
      db.platforms.ios.devices[modelId] = generateDeviceEntry(modelId, deviceInfo, 'ios');
      iosCount++;
    }
  }
  
  // Update metadata
  db.lastUpdated = new Date().toISOString();
  db.metadata.totalAndroidDevices = Object.values(db.platforms.android.brands)
    .reduce((sum, brand) => sum + Object.keys(brand.models || {}).length, 0);
  db.metadata.totalIOSDevices = Object.keys(db.platforms.ios.devices || {}).length;
  db.metadata.lastSync = new Date().toISOString();
  
  // Ensure directory exists
  const dbDir = path.dirname(DEVICE_DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Save database
  fs.writeFileSync(DEVICE_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  
  console.log('✅ Device database populated!');
  console.log(`   Android devices: ${androidCount} added (${db.metadata.totalAndroidDevices} total)`);
  console.log(`   iOS devices: ${iosCount} added (${db.metadata.totalIOSDevices} total)`);
  console.log(`   Database saved to: ${DEVICE_DB_PATH}`);
  
  return db;
}

// Run if executed directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) || 
    process.argv[1].includes('populate-device-database.js')) {
  populateDeviceDatabase().catch(console.error);
}

export { populateDeviceDatabase, ANDROID_DEVICES, IOS_DEVICES };
