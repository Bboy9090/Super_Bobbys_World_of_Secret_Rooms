/**
 * Workflow System Types
 * 
 * Extended types for workflow execution with policy gates
 */

export type WorkflowStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  actionId: string;
  actionType: string;
  requiredGates?: string[];
  retry?: {
    max: number;
    backoffMs: number[];
  };
  inputs?: Record<string, any>;
  outputs?: string[];
  status?: StepStatus;
  result?: Record<string, any>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  platform?: string[];
  category: string;
  requiredGates: string[];
  steps: WorkflowStep[];
  metadata?: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  caseId: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  currentStep?: string;
  completedSteps: number;
  totalSteps: number;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
  result?: Record<string, any>;
  error?: string;
}

export interface WorkflowJob {
  id: string;
  caseId: string;
  workflowId: string;
  status: WorkflowStatus;
  executionId?: string;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}
