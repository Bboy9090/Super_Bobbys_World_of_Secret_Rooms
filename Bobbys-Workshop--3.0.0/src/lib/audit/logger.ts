/**
 * Audit Logger
 * 
 * Immutable audit logging system
 */

import type { AuditEvent, AuditActionType } from '@/types/audit';

export class AuditLogger {
  private events: AuditEvent[] = [];

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const auditEvent: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.events.push(auditEvent);
    return auditEvent;
  }

  /**
   * Get audit events for a case
   */
  getCaseEvents(caseId: string): AuditEvent[] {
    return this.events.filter(e => e.caseId === caseId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get all events (filtered)
   */
  getAllEvents(filters?: {
    caseId?: string;
    actionType?: AuditActionType;
    startDate?: string;
    endDate?: string;
  }): AuditEvent[] {
    let filtered = [...this.events];

    if (filters?.caseId) {
      filtered = filtered.filter(e => e.caseId === filters.caseId);
    }
    if (filters?.actionType) {
      filtered = filtered.filter(e => e.actionType === filters.actionType);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const auditLogger = new AuditLogger();
