/**
 * Case Manager
 * 
 * Core case management logic
 */

import type { Case, CaseCreateRequest, CaseUpdateRequest, CaseStatus } from '@/types/cases';

export class CaseManager {
  private cases: Map<string, Case> = new Map();

  /**
   * Generate unique ticket number
   */
  private generateTicketNumber(): string {
    const prefix = 'CASE';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create a new case
   */
  createCase(request: CaseCreateRequest): Case {
    const id = `case-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const ticketNumber = this.generateTicketNumber();
    
    const newCase: Case = {
      id,
      ticketNumber,
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      deviceType: request.deviceType,
      deviceModel: request.deviceModel,
      serialNumber: request.serialNumber,
      imei: request.imei,
      issueDescription: request.issueDescription,
      status: 'pending',
      priority: request.priority || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cases.set(id, newCase);
    return newCase;
  }

  /**
   * Get case by ID
   */
  getCase(id: string): Case | undefined {
    return this.cases.get(id);
  }

  /**
   * Get case by ticket number
   */
  getCaseByTicket(ticketNumber: string): Case | undefined {
    return Array.from(this.cases.values()).find(
      c => c.ticketNumber === ticketNumber
    );
  }

  /**
   * Update case
   */
  updateCase(id: string, updates: CaseUpdateRequest): Case | null {
    const existing = this.cases.get(id);
    if (!existing) {
      return null;
    }

    const updated: Case = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'completed' 
        ? new Date().toISOString() 
        : existing.completedAt,
    };

    this.cases.set(id, updated);
    return updated;
  }

  /**
   * Update case status
   */
  updateCaseStatus(id: string, status: CaseStatus): Case | null {
    return this.updateCase(id, { status });
  }

  /**
   * List all cases
   */
  listCases(filters?: {
    status?: CaseStatus;
    priority?: number;
    deviceType?: string;
  }): Case[] {
    let cases = Array.from(this.cases.values());

    if (filters) {
      if (filters.status) {
        cases = cases.filter(c => c.status === filters.status);
      }
      if (filters.priority) {
        cases = cases.filter(c => c.priority === filters.priority);
      }
      if (filters.deviceType) {
        cases = cases.filter(c => c.deviceType === filters.deviceType);
      }
    }

    // Sort by creation date (newest first)
    return cases.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Delete case (for cleanup/testing)
   */
  deleteCase(id: string): boolean {
    return this.cases.delete(id);
  }

  /**
   * Get case statistics
   */
  getStatistics(): {
    total: number;
    byStatus: Record<CaseStatus, number>;
    byPriority: Record<number, number>;
    byDeviceType: Record<string, number>;
  } {
    const cases = Array.from(this.cases.values());
    
    const byStatus: Record<CaseStatus, number> = {
      pending: 0,
      in_progress: 0,
      waiting_customer: 0,
      waiting_vendor: 0,
      completed: 0,
      closed: 0,
      cancelled: 0,
    };

    const byPriority: Record<number, number> = {};
    const byDeviceType: Record<string, number> = {};

    for (const case_ of cases) {
      byStatus[case_.status]++;
      
      byPriority[case_.priority] = (byPriority[case_.priority] || 0) + 1;
      byDeviceType[case_.deviceType] = (byDeviceType[case_.deviceType] || 0) + 1;
    }

    return {
      total: cases.length,
      byStatus,
      byPriority,
      byDeviceType,
    };
  }
}

// Singleton instance
export const caseManager = new CaseManager();
