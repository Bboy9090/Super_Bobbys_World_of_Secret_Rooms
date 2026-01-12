/**
 * Workflow Executor
 * 
 * Execute workflows with policy gates
 */

import type { WorkflowDefinition, WorkflowExecution, WorkflowStep } from '@/types/workflows';
import type { PolicyEvaluation } from '@/types/policies';
import { policyEngine } from '../policies';
import { auditLogger } from '../audit';
import { workflowLoader } from './loader';

export class WorkflowExecutor {
  /**
   * Get workflow definition by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return workflowLoader.getWorkflow(workflowId);
  }

  /**
   * Execute a workflow
   */
  async execute(
    caseId: string,
    workflow: WorkflowDefinition | string,
    context: Record<string, any>
  ): Promise<WorkflowExecution> {
    // If workflow is a string ID, load it
    const workflowDef = typeof workflow === 'string' 
      ? workflowLoader.getWorkflow(workflow)
      : workflow;

    if (!workflowDef) {
      throw new Error(`Workflow not found: ${typeof workflow === 'string' ? workflow : workflow.id}`);
    }

    const executionId = `exec-${caseId}-${Date.now()}`;
    
    const execution: WorkflowExecution = {
      id: executionId,
      caseId,
      workflowId: workflowDef.id,
      workflowName: workflowDef.name,
      status: 'running',
      completedSteps: 0,
      totalSteps: workflowDef.steps.length,
      steps: workflowDef.steps.map(step => ({ ...step, status: 'pending' })),
      startedAt: new Date().toISOString(),
    };

    // Log execution start
    auditLogger.log({
      caseId,
      jobId: executionId,
      actor: 'system',
      actionType: 'pathway_execute',
      actionId: workflowDef.id,
      actionName: workflowDef.name,
      args: { workflowId: workflowDef.id, caseId },
      success: true,
    });

    try {
      // Evaluate policy gates
      const gateEvaluation = policyEngine.evaluate({
        caseId,
        recoveryRoute: workflowDef.id as any,
        metadata: context,
      }, workflowDef.requiredGates);

      if (gateEvaluation.blocked) {
        execution.status = 'failed';
        execution.error = gateEvaluation.blockingReason;
        execution.completedAt = new Date().toISOString();
        return execution;
      }

      // Execute steps
      for (let i = 0; i < workflowDef.steps.length; i++) {
        const step = workflowDef.steps[i];
        execution.currentStep = step.id;
        execution.steps[i].status = 'running';
        execution.steps[i].startedAt = new Date().toISOString();

        try {
          // In production, this would execute the actual action
          // For now, simulate success
          await this.executeStep(step, context);

          execution.steps[i].status = 'completed';
          execution.steps[i].completedAt = new Date().toISOString();
          execution.completedSteps++;

          auditLogger.log({
            caseId,
            jobId: executionId,
            actor: 'system',
            actionType: 'pathway_execute',
            actionId: step.actionId,
            actionName: step.name,
            args: step.inputs,
            success: true,
          });
        } catch (error) {
          execution.steps[i].status = 'failed';
          execution.steps[i].error = error instanceof Error ? error.message : String(error);
          execution.steps[i].completedAt = new Date().toISOString();
          
          // Handle failure based on step config
          if (step.retry?.max && step.retry.max > 0) {
            // Retry logic would go here
          } else {
            execution.status = 'failed';
            execution.error = `Step ${step.name} failed: ${execution.steps[i].error}`;
            break;
          }
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
        execution.completedAt = new Date().toISOString();
      }

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date().toISOString();
      return execution;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: WorkflowStep, context: Record<string, any>): Promise<void> {
    // In production, this would:
    // 1. Look up the action by actionId
    // 2. Execute the action with the tool
    // 3. Validate outputs
    // 4. Store results in context for next steps
    
    // For now, simulate execution
    return new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const workflowExecutor = new WorkflowExecutor();
