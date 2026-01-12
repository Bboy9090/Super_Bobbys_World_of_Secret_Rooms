/**
 * Evidence & Ownership Verification Types
 * 
 * Types for evidence collection and ownership verification
 */

export type EvidenceType = 'receipt' | 'invoice' | 'device_photo' | 'box_photo' | 'carrier_screenshot' | 'id_document' | 'other';

export interface Evidence {
  id: string;
  caseId: string;
  type: EvidenceType;
  fileName: string;
  filePath: string;
  fileHash: string; // SHA-256
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
  uploadedAt: string;
  uploadedBy: string;
}

export interface OwnershipVerification {
  id: string;
  caseId: string;
  customerSignatureHash: string;
  attestationConfirmed: boolean;
  attestationDate: string;
  evidenceScore: number; // 0-100
  requiredEvidence: EvidenceType[];
  providedEvidence: EvidenceType[];
  missingEvidence: EvidenceType[];
  verificationStatus: 'pending' | 'complete' | 'insufficient' | 'failed';
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface EvidenceUploadRequest {
  caseId: string;
  type: EvidenceType;
  file: File;
  metadata?: Record<string, any>;
}

export interface EvidenceValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}
