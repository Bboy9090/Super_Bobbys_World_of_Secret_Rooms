/**
 * Recovery Pathway Engine
 * 
 * Determines appropriate recovery pathway based on device state and evidence
 */

import type { RecoveryRoute, RouteResult, RecoveryPathway } from '@/types/recovery';
import type { DevicePassport, TrustState } from '@/types/devices';
import type { OwnershipVerification, EvidenceType } from '@/types/evidence';
import type { Platform } from '@/types/devices';

export class RecoveryPathwayEngine {
  /**
   * Decide recovery route based on device state and evidence
   */
  decideRecoveryRoute(
    passport: DevicePassport,
    trustState: TrustState,
    ownershipVerification: OwnershipVerification
  ): RouteResult {
    // Baseline: ownership attestation required
    if (!ownershipVerification.attestationConfirmed) {
      return {
        route: 'insufficient_information',
        reason: 'Ownership attestation missing.',
        nextSteps: ['Collect user attestation.', 'Re-run assessment.'],
        successProbability: 0,
        requiredEvidence: [],
      };
    }

    // iOS routing
    if (passport.platform === 'ios') {
      return this.decideIOSRoute(passport, trustState, ownershipVerification);
    }

    // Android routing
    if (passport.platform === 'android') {
      return this.decideAndroidRoute(passport, trustState, ownershipVerification);
    }

    return {
      route: 'insufficient_information',
      reason: 'Unsupported platform or missing critical fields.',
      nextSteps: ['Verify platform selection and re-run intake.'],
      successProbability: 0,
      requiredEvidence: [],
    };
  }

  /**
   * Decide iOS recovery route
   */
  private decideIOSRoute(
    passport: DevicePassport,
    trustState: TrustState,
    ownershipVerification: OwnershipVerification
  ): RouteResult {
    // If Activation Lock is likely enabled
    if (trustState.activationLockStatus === 'likely_enabled') {
      const hasMinimumProof = 
        ownershipVerification.evidenceScore >= 70 &&
        ownershipVerification.providedEvidence.includes('receipt') &&
        ownershipVerification.providedEvidence.includes('device_photo');

      if (!hasMinimumProof) {
        return {
          route: 'apple_support_request',
          reason: 'Activation Lock appears likely enabled, but proof packet is incomplete.',
          nextSteps: [
            'Collect proof-of-purchase (receipt/invoice).',
            'Capture device label/box photo showing serial/IMEI.',
            'Export Support Bundle and proceed via official support channels.',
          ],
          warnings: ['Outcomes depend on provider review. No guarantees.'],
          successProbability: 40,
          requiredEvidence: ['receipt', 'device_photo', 'box_photo'],
        };
      }

      return {
        route: 'apple_support_request',
        reason: 'Activation Lock appears likely enabled; official review is required.',
        nextSteps: [
          'Export Apple Support Bundle (passport + assessment + proof packet).',
          'Use official support channels for review.',
          'Track the case outcome in Bobby\'s World.',
        ],
        warnings: ['Outcomes depend on provider review. No guarantees.'],
        successProbability: 70,
        requiredEvidence: ownershipVerification.requiredEvidence,
      };
    }

    // If not enabled / unknown, guide to account recovery
    if (trustState.activationLockStatus === 'likely_not_enabled') {
      return {
        route: 'apple_account_recovery',
        reason: 'Activation Lock does not appear enabled based on available signals.',
        nextSteps: [
          'If the user forgot credentials, use official account recovery.',
          'If the device is unusable, follow official restore guidance.',
          'Export Repair Report for records.',
        ],
        successProbability: 85,
        requiredEvidence: [],
      };
    }

    // Unknown status
    return {
      route: 'apple_account_recovery',
      reason: 'Activation Lock status is unknown; safest path is official recovery guidance.',
      nextSteps: [
        'Collect more device metadata if available (without bypass).',
        'Use official account recovery options if credentials are the blocker.',
        'If necessary, prepare proof packet for support review.',
      ],
      warnings: ['Unknown status means no assumptions. Stay on official pathways.'],
      successProbability: 50,
      requiredEvidence: ['receipt'],
    };
  }

  /**
   * Decide Android recovery route
   */
  private decideAndroidRoute(
    passport: DevicePassport,
    trustState: TrustState,
    ownershipVerification: OwnershipVerification
  ): RouteResult {
    // If FRP locked
    if (trustState.frpStatus === 'likely_enabled') {
      return {
        route: 'google_account_recovery',
        reason: 'Factory Reset Protection appears enabled. Google account recovery required.',
        nextSteps: [
          'Use official Google account recovery.',
          'If account is recoverable, FRP will be removed automatically.',
          'If account is not recoverable, device owner may need to contact Google Support.',
        ],
        successProbability: 60,
        requiredEvidence: [],
      };
    }

    // If carrier locked
    if (trustState.carrierLockStatus === 'likely_enabled') {
      return {
        route: 'carrier_unlock',
        reason: 'Carrier lock detected. Contact original carrier for unlock.',
        nextSteps: [
          'Identify the original carrier.',
          'Contact carrier support with account verification.',
          'Request IMEI unlock if device is paid off.',
        ],
        successProbability: 80,
        requiredEvidence: ['id_document'],
      };
    }

    // If bootloader locked (informational only)
    if (trustState.bootloaderStatus === 'locked') {
      return {
        route: 'device_restore_guidance',
        reason: 'Device appears functional but bootloader is locked.',
        nextSteps: [
          'Device can be used normally.',
          'If flashing is needed, bootloader unlock may be required (OEM dependent).',
        ],
        successProbability: 90,
        requiredEvidence: [],
      };
    }

    // No locks detected
    return {
      route: 'not_applicable',
      reason: 'No locks detected. Device appears to be in working condition.',
      nextSteps: [
        'Device can be used normally.',
        'If issues persist, consult device diagnostics.',
      ],
      successProbability: 100,
      requiredEvidence: [],
    };
  }

  /**
   * Create recovery pathway from route result
   */
  createPathway(caseId: string, routeResult: RouteResult): RecoveryPathway {
    return {
      id: `pathway-${caseId}-${Date.now()}`,
      caseId,
      route: routeResult.route,
      status: 'pending',
      successProbability: routeResult.successProbability,
      reason: routeResult.reason,
      nextSteps: routeResult.nextSteps,
      warnings: routeResult.warnings,
      requiredEvidence: routeResult.requiredEvidence,
      evidenceProvided: [],
      startedAt: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const recoveryPathwayEngine = new RecoveryPathwayEngine();
