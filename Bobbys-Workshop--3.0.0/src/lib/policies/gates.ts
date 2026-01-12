/**
 * Policy Gates Implementation
 * 
 * Implementation of policy gate validation logic
 */

import type { PolicyGate, PolicyGateResult, GateType, GateStatus } from '@/types/policies';
import type { OwnershipVerification } from '@/types/evidence';
import type { TrustState, DevicePassport } from '@/types/devices';
import type { RecoveryRoute } from '@/types/recovery';

export interface GateContext {
  caseId: string;
  ownershipVerification?: OwnershipVerification;
  trustState?: TrustState;
  devicePassport?: DevicePassport;
  recoveryRoute?: RecoveryRoute;
  evidenceScore?: number;
  userInput?: string;
  metadata?: Record<string, any>;
}

export class PolicyGateEngine {
  /**
   * Evaluate ownership attestation gate
   */
  static evaluateOwnershipAttestation(
    gate: PolicyGate,
    context: GateContext
  ): PolicyGateResult {
    const { ownershipVerification, userInput } = context;

    if (!ownershipVerification) {
      return {
        gateId: gate.id,
        gateType: 'ownership_attestation',
        status: 'failed',
        passed: false,
        blocked: true,
        reason: 'Ownership attestation not provided',
        evaluatedAt: new Date().toISOString(),
      };
    }

    if (!ownershipVerification.attestationConfirmed) {
      return {
        gateId: gate.id,
        gateType: 'ownership_attestation',
        status: 'failed',
        passed: false,
        blocked: true,
        reason: 'Ownership attestation not confirmed',
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Check typed phrase if required
    const requiredPhrase = gate.requirements?.typed_phrase;
    if (requiredPhrase && userInput !== requiredPhrase) {
      return {
        gateId: gate.id,
        gateType: 'ownership_attestation',
        status: 'failed',
        passed: false,
        blocked: true,
        reason: `Typed confirmation required: "${requiredPhrase}"`,
        evaluatedAt: new Date().toISOString(),
      };
    }

    return {
      gateId: gate.id,
      gateType: 'ownership_attestation',
      status: 'passed',
      passed: true,
      blocked: false,
      reason: 'Ownership attestation confirmed',
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate evidence completeness gate
   */
  static evaluateEvidenceCompleteness(
    gate: PolicyGate,
    context: GateContext
  ): PolicyGateResult {
    const { evidenceScore, recoveryRoute } = context;

    if (evidenceScore === undefined) {
      return {
        gateId: gate.id,
        gateType: 'evidence_completeness',
        status: 'failed',
        passed: false,
        blocked: true,
        reason: 'Evidence score not available',
        evaluatedAt: new Date().toISOString(),
      };
    }

    const minimumScore = gate.requirements?.minimumScore || 70;
    
    if (evidenceScore < minimumScore) {
      return {
        gateId: gate.id,
        gateType: 'evidence_completeness',
        status: 'failed',
        passed: false,
        blocked: true,
        reason: `Evidence score ${evidenceScore} is below minimum ${minimumScore}`,
        evaluatedAt: new Date().toISOString(),
        metadata: { evidenceScore, minimumScore },
      };
    }

    return {
      gateId: gate.id,
      gateType: 'evidence_completeness',
      status: 'passed',
      passed: true,
      blocked: false,
      reason: `Evidence score ${evidenceScore} meets minimum ${minimumScore}`,
      evaluatedAt: new Date().toISOString(),
      metadata: { evidenceScore, minimumScore },
    };
  }

  /**
   * Evaluate device authorization gate
   */
  static evaluateDeviceAuthorization(
    gate: PolicyGate,
    context: GateContext
  ): PolicyGateResult {
    const { trustState, devicePassport } = context;

    if (!trustState || !devicePassport) {
      return {
        gateId: gate.id,
        gateType: 'device_authorization',
        status: 'not_applicable',
        passed: true,
        blocked: false,
        reason: 'Device authorization check not applicable',
        evaluatedAt: new Date().toISOString(),
      };
    }

    // iOS: Check if device is paired/trusted
    if (devicePassport.platform === 'ios') {
      if (!trustState.iosPaired) {
        return {
          gateId: gate.id,
          gateType: 'device_authorization',
          status: 'failed',
          passed: false,
          blocked: false, // Not blocking, just informational
          reason: 'iOS device is not paired/trusted',
          evaluatedAt: new Date().toISOString(),
        };
      }
      return {
        gateId: gate.id,
        gateType: 'device_authorization',
        status: 'passed',
        passed: true,
        blocked: false,
        reason: 'iOS device is paired/trusted',
        evaluatedAt: new Date().toISOString(),
      };
    }

    // Android: Check ADB authorization
    if (devicePassport.platform === 'android') {
      if (!trustState.adbAuthorized) {
        return {
          gateId: gate.id,
          gateType: 'device_authorization',
          status: 'failed',
          passed: false,
          blocked: false, // Not blocking, just informational
          reason: 'Android device is not ADB authorized',
          evaluatedAt: new Date().toISOString(),
        };
      }
      return {
        gateId: gate.id,
        gateType: 'device_authorization',
        status: 'passed',
        passed: true,
        blocked: false,
        reason: 'Android device is ADB authorized',
        evaluatedAt: new Date().toISOString(),
      };
    }

    return {
      gateId: gate.id,
      gateType: 'device_authorization',
      status: 'not_applicable',
      passed: true,
      blocked: false,
      reason: 'Device authorization check not applicable for this platform',
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate destructive action confirmation gate
   */
  static evaluateDestructiveConfirmation(
    gate: PolicyGate,
    context: GateContext
  ): PolicyGateResult {
    const { userInput } = context;

    const requiredPhrase = gate.requirements?.typed_phrase || 'ERASE AND RESTORE';
    
    if (!userInput || userInput !== requiredPhrase) {
      return {
        gateId: gate.id,
        gateType: 'destructive_confirmation',
        status: 'failed',
        passed: false,
        blocked: true,
        reason: `Typed confirmation required: "${requiredPhrase}"`,
        evaluatedAt: new Date().toISOString(),
        metadata: { requiredPhrase, userInput },
      };
    }

    return {
      gateId: gate.id,
      gateType: 'destructive_confirmation',
      status: 'passed',
      passed: true,
      blocked: false,
      reason: 'Destructive action confirmed',
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate blocked intent detection gate
   */
  static evaluateBlockedIntent(
    gate: PolicyGate,
    context: GateContext
  ): PolicyGateResult {
    const { metadata } = context;
    const blockedKeywords = gate.requirements?.blocked_keywords || [];

    if (!metadata || !metadata.inputText) {
      return {
        gateId: gate.id,
        gateType: 'blocked_intent',
        status: 'passed',
        passed: true,
        blocked: false,
        reason: 'No input text to check',
        evaluatedAt: new Date().toISOString(),
      };
    }

    const inputText = (metadata.inputText as string).toLowerCase();
    
    for (const keyword of blockedKeywords) {
      if (inputText.includes(keyword.toLowerCase())) {
        return {
          gateId: gate.id,
          gateType: 'blocked_intent',
          status: 'blocked',
          passed: false,
          blocked: true,
          reason: `Blocked keyword detected: "${keyword}"`,
          evaluatedAt: new Date().toISOString(),
          metadata: { keyword, inputText },
        };
      }
    }

    return {
      gateId: gate.id,
      gateType: 'blocked_intent',
      status: 'passed',
      passed: true,
      blocked: false,
      reason: 'No blocked keywords detected',
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate a single gate
   */
  static evaluateGate(gate: PolicyGate, context: GateContext): PolicyGateResult {
    switch (gate.type) {
      case 'ownership_attestation':
        return this.evaluateOwnershipAttestation(gate, context);
      case 'evidence_completeness':
        return this.evaluateEvidenceCompleteness(gate, context);
      case 'device_authorization':
        return this.evaluateDeviceAuthorization(gate, context);
      case 'destructive_confirmation':
        return this.evaluateDestructiveConfirmation(gate, context);
      case 'blocked_intent':
        return this.evaluateBlockedIntent(gate, context);
      default:
        return {
          gateId: gate.id,
          gateType: gate.type,
          status: 'pending',
          passed: false,
          blocked: false,
          reason: `Unknown gate type: ${gate.type}`,
          evaluatedAt: new Date().toISOString(),
        };
    }
  }
}
