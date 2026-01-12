/**
 * Policy Engine Types
 * 
 * Types for policy gates and compliance checking
 */

export type GateType = 'ownership_attestation' | 'device_authorization' | 'evidence_completeness' | 'destructive_confirmation' | 'tool_allowlist' | 'blocked_intent';

export type GateStatus = 'pending' | 'passed' | 'failed' | 'blocked' | 'not_applicable';

export interface PolicyGate {
  id: string;
  type: GateType;
  name: string;
  description: string;
  required: boolean;
  message?: string;
}

export interface PolicyGateResult {
  gateId: string;
  gateType: GateType;
  status: GateStatus;
  passed: boolean;
  blocked: boolean;
  reason?: string;
  evaluatedAt: string;
  evaluatedBy?: string;
  metadata?: Record<string, any>;
}

export interface PolicyEvaluation {
  caseId: string;
  gates: PolicyGateResult[];
  allPassed: boolean;
  blocked: boolean;
  blockingReason?: string;
  evaluatedAt: string;
}

export interface BlockedIntent {
  keywords: string[];
  patterns: RegExp[];
  message: string;
}
