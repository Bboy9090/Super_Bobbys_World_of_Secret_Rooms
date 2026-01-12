/**
 * Case Management Types
 * 
 * Types for professional repair shop case management system
 */

export type CaseStatus = 'pending' | 'in_progress' | 'waiting_customer' | 'waiting_vendor' | 'completed' | 'closed' | 'cancelled';

export type CasePriority = 1 | 2 | 3 | 4 | 5; // 1 = Highest, 5 = Lowest

export type DeviceType = 'ios' | 'android' | 'tablet' | 'laptop' | 'other';

export interface Case {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: DeviceType;
  deviceModel?: string;
  serialNumber?: string;
  imei?: string;
  issueDescription: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  assignedTo?: string;
  estimatedCompletion?: string;
}

export interface CaseCreateRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: DeviceType;
  deviceModel?: string;
  serialNumber?: string;
  imei?: string;
  issueDescription: string;
  priority?: CasePriority;
}

export interface CaseUpdateRequest {
  status?: CaseStatus;
  priority?: CasePriority;
  assignedTo?: string;
  estimatedCompletion?: string;
  issueDescription?: string;
}
