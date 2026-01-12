/**
 * Workflows API Routes
 * 
 * Workflow execution endpoints for professional repair shop system
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage (would use database + BullMQ in production)
const workflowExecutions = new Map();
const workflowJobs = new Map();

/**
 * GET /api/v1/workflows
 * List all available workflows
 */
router.get('/', (req, res) => {
  try {
    // In production, this would load from workflows.json
    const workflows = [
      {
        id: 'universal_device_scan_v1',
        name: 'Universal Device Scan',
        description: 'Scan for all connected devices (iOS, Android, Fastboot)',
        category: 'scan',
        tags: ['scan', 'report'],
      },
      {
        id: 'apple_activation_recovery_assistant_v1',
        name: 'Orchard Gate — Apple Access & Recovery',
        description: 'Diagnostics + ownership verification + official Apple recovery hand-off',
        category: 'apple_recovery',
        tags: ['apple', 'recovery', 'guidance'],
      },
      {
        id: 'android_legal_repair_assistant_v1',
        name: 'Android Legal Repair Assistant',
        description: 'OEM-safe diagnostics + restore guidance',
        category: 'android_repair',
        tags: ['android', 'repair', 'guidance'],
      },
    ];

    res.sendEnvelope({
      ok: true,
      data: {
        workflows,
        total: workflows.length,
      },
    });
  } catch (error) {
    console.error('List workflows error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to list workflows', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/workflows/:id
 * Get workflow definition
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // In production, this would load from workflows.json
    const workflow = {
      id,
      name: 'Workflow',
      description: 'Workflow description',
      version: '1.0.0',
      category: 'scan',
      requiredGates: ['GATE_OWNERSHIP_ATTESTATION'],
      steps: [],
    };

    if (!workflow) {
      return res.sendError('WORKFLOW_NOT_FOUND', 'Workflow not found', { workflowId: id }, 404);
    }

    res.sendEnvelope({
      ok: true,
      data: workflow,
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to get workflow', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/workflows/:id/run
 * Execute a workflow
 */
router.post('/:id/run', (req, res) => {
  try {
    const { id } = req.params;
    const { caseId, context = {} } = req.body;

    if (!caseId) {
      return res.sendEnvelope({
        ok: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Missing required field: caseId',
      }, 400);
    }

    // Generate job ID
    const jobId = uuidv4();
    
    // Create workflow execution
    const execution = {
      id: jobId,
      caseId,
      workflowId: id,
      workflowName: 'Workflow',
      status: 'queued',
      completedSteps: 0,
      totalSteps: 0,
      steps: [],
      startedAt: new Date().toISOString(),
    };

    workflowExecutions.set(jobId, execution);
    workflowJobs.set(jobId, {
      id: jobId,
      caseId,
      workflowId: id,
      status: 'queued',
      queuedAt: new Date().toISOString(),
    });

    // In production, this would:
    // 1. Validate workflow exists
    // 2. Evaluate policy gates
    // 3. Enqueue job in BullMQ
    // 4. Return job ID

    res.sendEnvelope({
      ok: true,
      data: {
        jobId,
        execution,
      },
      message: 'Workflow execution queued',
    });
  } catch (error) {
    console.error('Run workflow error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to run workflow', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/cases/:caseId/workflows/:workflowId/run
 * Execute a workflow for a specific case
 */
router.post('/cases/:caseId/workflows/:workflowId/run', (req, res) => {
  try {
    const { caseId, workflowId } = req.params;
    const { context = {} } = req.body;

    // Generate job ID
    const jobId = uuidv4();
    
    // Create workflow execution
    const execution = {
      id: jobId,
      caseId,
      workflowId,
      workflowName: 'Workflow',
      status: 'queued',
      completedSteps: 0,
      totalSteps: 0,
      steps: [],
      startedAt: new Date().toISOString(),
    };

    workflowExecutions.set(jobId, execution);
    workflowJobs.set(jobId, {
      id: jobId,
      caseId,
      workflowId,
      status: 'queued',
      queuedAt: new Date().toISOString(),
    });

    res.sendEnvelope({
      ok: true,
      data: {
        jobId,
        execution,
      },
      message: 'Workflow execution queued',
    });
  } catch (error) {
    console.error('Run case workflow error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to run workflow', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/jobs/:jobId
 * Get workflow execution status
 */
router.get('/jobs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const execution = workflowExecutions.get(jobId);
    const job = workflowJobs.get(jobId);

    if (!execution && !job) {
      return res.sendError('JOB_NOT_FOUND', 'Job not found', { jobId }, 404);
    }

    res.sendEnvelope({
      ok: true,
      data: {
        execution: execution || null,
        job: job || null,
      },
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to get job', { error: error.message }, 500);
  }
});

export default router;
