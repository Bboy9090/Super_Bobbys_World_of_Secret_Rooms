/**
 * Audit & Compliance Types
 * 
 * Types for audit logging and compliance tracking
 */

export type AuditActionType = 
  | 'case_create'
  | 'case_update'
  | 'case_status_change'
  | 'device_intake'
  | 'trust_state_assess'
  | 'evidence_upload'
  | 'evidence_remove'
  | 'ownership_verify'
  | 'pathway_select'
  | 'pathway_execute'
  | 'bundle_generate'
  | 'policy_evaluate'
  | 'gate_check'
  | 'device_checkout'
  | 'system_config_change';

export interface AuditEvent {
  id: string;
  caseId?: string;
  jobId?: string;
  actor: string; // user ID or 'system'
  actionType: AuditActionType;
  actionId: string;
  actionName: string;
  args?: Record<string, any>;
  result?: Record<string, any>;
  success: boolean;
  error?: string;
  policyGates?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  events: AuditEvent[];
  total: number;
  filtered: number;
  startDate?: string;
  endDate?: string;
}

export interface ComplianceReport {
  periodStart: string;
  periodEnd: string;
  totalCases: number;
  policyGatePassRate: number;
  evidenceCompletenessRate: number;
  auditLogCoverage: number;
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  id: string;
  caseId?: string;
  type: 'policy_gate_failure' | 'missing_evidence' | 'incomplete_documentation' | 'audit_gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  occurredAt: string;
  resolved: boolean;
  resolvedAt?: string;
}
