/**
 * Evidence Manager
 * 
 * Manage evidence collection and ownership verification
 */

import type { Evidence, OwnershipVerification, EvidenceType, EvidenceValidationResult } from '@/types/evidence';

export class EvidenceManager {
  private evidence: Map<string, Evidence[]> = new Map();
  private ownershipVerifications: Map<string, OwnershipVerification> = new Map();

  /**
   * Calculate file hash (SHA-256)
   */
  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Upload evidence file
   */
  async uploadEvidence(
    caseId: string,
    type: EvidenceType,
    file: File,
    uploadedBy: string,
    metadata?: Record<string, any>
  ): Promise<Evidence> {
    const fileHash = await this.calculateFileHash(file);
    const fileName = file.name;

    // In production, this would:
    // 1. Save file to storage (local filesystem or cloud storage)
    // 2. Generate file path
    // 3. Store metadata in database
    // For now, create in-memory structure

    const evidence: Evidence = {
      id: `evidence-${caseId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      caseId,
      type,
      fileName,
      filePath: `/evidence/${caseId}/${fileHash}-${fileName}`, // Would be actual path
      fileHash,
      fileSize: file.size,
      mimeType: file.type,
      metadata,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    };

    // Store evidence
    if (!this.evidence.has(caseId)) {
      this.evidence.set(caseId, []);
    }
    this.evidence.get(caseId)!.push(evidence);

    return evidence;
  }

  /**
   * Get evidence for a case
   */
  getEvidence(caseId: string): Evidence[] {
    return this.evidence.get(caseId) || [];
  }

  /**
   * Remove evidence
   */
  removeEvidence(caseId: string, evidenceId: string): boolean {
    const evidenceList = this.evidence.get(caseId);
    if (!evidenceList) return false;

    const index = evidenceList.findIndex(e => e.id === evidenceId);
    if (index === -1) return false;

    evidenceList.splice(index, 1);
    return true;
  }

  /**
   * Calculate evidence completeness score
   */
  calculateEvidenceScore(
    caseId: string,
    requiredEvidence: EvidenceType[],
    platform: 'ios' | 'android'
  ): number {
    const evidenceList = this.getEvidence(caseId);
    const providedTypes = new Set(evidenceList.map(e => e.type));

    if (requiredEvidence.length === 0) {
      return 100; // No requirements
    }

    let score = 0;
    const weights: Record<EvidenceType, number> = {
      receipt: 40,
      invoice: 40,
      device_photo: 20,
      box_photo: 15,
      carrier_screenshot: 10,
      id_document: 15,
      other: 5,
    };

    for (const type of requiredEvidence) {
      if (providedTypes.has(type)) {
        score += weights[type] || 10;
      }
    }

    // Cap at 100
    return Math.min(100, score);
  }

  /**
   * Create or update ownership verification
   */
  createOwnershipVerification(
    caseId: string,
    signatureHash: string,
    requiredEvidence: EvidenceType[]
  ): OwnershipVerification {
    const evidenceList = this.getEvidence(caseId);
    const providedEvidence = evidenceList.map(e => e.type);
    const missingEvidence = requiredEvidence.filter(type => !providedEvidence.includes(type));

    // Calculate evidence score (would use actual scoring logic)
    const evidenceScore = this.calculateEvidenceScore(caseId, requiredEvidence, 'ios');

    const verification: OwnershipVerification = {
      id: `verification-${caseId}-${Date.now()}`,
      caseId,
      customerSignatureHash: signatureHash,
      attestationConfirmed: true,
      attestationDate: new Date().toISOString(),
      evidenceScore,
      requiredEvidence,
      providedEvidence,
      missingEvidence,
      verificationStatus: evidenceScore >= 70 ? 'complete' : 'insufficient',
      verifiedAt: new Date().toISOString(),
      verifiedBy: 'system',
    };

    this.ownershipVerifications.set(caseId, verification);
    return verification;
  }

  /**
   * Get ownership verification
   */
  getOwnershipVerification(caseId: string): OwnershipVerification | undefined {
    return this.ownershipVerifications.get(caseId);
  }

  /**
   * Validate evidence for a recovery pathway
   */
  validateEvidenceForPathway(
    caseId: string,
    pathway: string
  ): EvidenceValidationResult {
    const evidenceList = this.getEvidence(caseId);
    
    // Define required evidence per pathway
    const pathwayRequirements: Record<string, EvidenceType[]> = {
      apple_support_request: ['receipt', 'device_photo'],
      apple_account_recovery: [],
      carrier_unlock: ['id_document', 'receipt'],
      google_account_recovery: [],
    };

    const required = pathwayRequirements[pathway] || [];
    const provided = evidenceList.map(e => e.type);
    const missing = required.filter(type => !provided.includes(type));

    const score = this.calculateEvidenceScore(caseId, required, 'ios');
    const isValid = score >= 70 && missing.length === 0;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (missing.length > 0) {
      issues.push(`Missing required evidence: ${missing.join(', ')}`);
      recommendations.push(`Please upload: ${missing.join(', ')}`);
    }

    if (score < 70) {
      issues.push(`Evidence score (${score}) is below minimum (70)`);
      recommendations.push('Provide additional evidence to increase score');
    }

    return {
      isValid,
      score,
      issues,
      recommendations,
    };
  }
}

// Singleton instance
export const evidenceManager = new EvidenceManager();
