/**
 * Recovery Pathway Types
 * 
 * Types for recovery pathway selection and execution
 */

export type RecoveryRoute = 
  | 'apple_account_recovery'
  | 'apple_support_request'
  | 'apple_store_appointment'
  | 'google_account_recovery'
  | 'carrier_unlock'
  | 'carrier_account_verification'
  | 'oem_service_center'
  | 'device_restore_guidance'
  | 'insufficient_information'
  | 'not_applicable';

export type PathwayStatus = 'pending' | 'in_progress' | 'waiting_response' | 'completed' | 'failed' | 'cancelled';

export interface RecoveryPathway {
  id: string;
  caseId: string;
  route: RecoveryRoute;
  status: PathwayStatus;
  successProbability: number; // 0-100
  reason: string;
  nextSteps: string[];
  warnings?: string[];
  requiredEvidence: string[];
  evidenceProvided: string[];
  startedAt: string;
  completedAt?: string;
  outcome?: string;
  outcomeDetails?: string;
}

export interface RouteResult {
  route: RecoveryRoute;
  reason: string;
  nextSteps: string[];
  warnings?: string[];
  successProbability: number;
  requiredEvidence: string[];
}

export interface SupportBundle {
  id: string;
  caseId: string;
  bundleType: 'apple' | 'android' | 'carrier' | 'generic';
  filePath: string;
  fileHash: string;
  fileSize: number;
  includes: {
    devicePassport: boolean;
    trustState: boolean;
    evidence: boolean;
    caseNotes: boolean;
    auditLog: boolean;
  };
  generatedAt: string;
  generatedBy: string;
}

export interface CaseNotes {
  caseId: string;
  deviceInfo: string;
  issueDescription: string;
  customerInfo: string;
  evidenceSummary: string;
  recoveryAttempts: string;
  nextSteps: string;
  generatedAt: string;
}
