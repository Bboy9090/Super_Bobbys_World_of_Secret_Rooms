/**
 * Cases API Routes
 * 
 * Case management endpoints for professional repair shop system
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage (would use database in production)
const cases = new Map();
const devicePassports = new Map();
const trustStates = new Map();
const evidence = new Map();
const ownershipVerifications = new Map();
const recoveryPathways = new Map();
const supportBundles = new Map();
const auditEvents = [];

/**
 * POST /api/v1/cases
 * Create a new case
 */
router.post('/', (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deviceType,
      deviceModel,
      serialNumber,
      imei,
      issueDescription,
      priority = 5,
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !deviceType || !issueDescription) {
      return res.sendEnvelope({
        ok: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Missing required fields: customerName, customerEmail, deviceType, issueDescription',
      }, 400);
    }

    // Generate ticket number
    const ticketNumber = `CASE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const case_ = {
      id: uuidv4(),
      ticketNumber,
      customerName,
      customerEmail,
      customerPhone,
      deviceType,
      deviceModel,
      serialNumber,
      imei,
      issueDescription,
      status: 'pending',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cases.set(case_.id, case_);

    // Log audit event
    auditEvents.push({
      id: uuidv4(),
      caseId: case_.id,
      actor: req.ip || 'system',
      actionType: 'case_create',
      actionId: 'case_create',
      actionName: 'Create Case',
      args: { customerName, deviceType },
      success: true,
      timestamp: new Date().toISOString(),
    });

    res.sendEnvelope({
      ok: true,
      data: case_,
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to create case', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/cases
 * List all cases (with optional filters)
 */
router.get('/', (req, res) => {
  try {
    const { status, priority, deviceType } = req.query;
    let filteredCases = Array.from(cases.values());

    if (status) {
      filteredCases = filteredCases.filter(c => c.status === status);
    }
    if (priority) {
      filteredCases = filteredCases.filter(c => c.priority === parseInt(priority));
    }
    if (deviceType) {
      filteredCases = filteredCases.filter(c => c.deviceType === deviceType);
    }

    // Sort by creation date (newest first)
    filteredCases.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.sendEnvelope({
      ok: true,
      data: {
        cases: filteredCases,
        total: filteredCases.length,
      },
    });
  } catch (error) {
    console.error('List cases error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to list cases', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/cases/:id
 * Get case details
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const case_ = cases.get(id);

    if (!case_) {
      return res.sendError('CASE_NOT_FOUND', 'Case not found', { caseId: id }, 404);
    }

    // Get related data
    const passport = Array.from(devicePassports.values()).find(p => p.caseId === id);
    const trustState = Array.from(trustStates.values()).find(t => t.caseId === id);
    const caseEvidence = Array.from(evidence.values()).filter(e => e.caseId === id);
    const ownership = ownershipVerifications.get(id);
    const pathway = Array.from(recoveryPathways.values()).find(p => p.caseId === id);
    const bundles = Array.from(supportBundles.values()).filter(b => b.caseId === id);

    res.sendEnvelope({
      ok: true,
      data: {
        case: case_,
        devicePassport: passport,
        trustState,
        evidence: caseEvidence,
        ownershipVerification: ownership,
        recoveryPathway: pathway,
        supportBundles: bundles,
      },
    });
  } catch (error) {
    console.error('Get case error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to get case', { error: error.message }, 500);
  }
});

/**
 * PUT /api/v1/cases/:id
 * Update case
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const case_ = cases.get(id);

    if (!case_) {
      return res.sendError('CASE_NOT_FOUND', 'Case not found', { caseId: id }, 404);
    }

    const updates = req.body;
    const updated = {
      ...case_,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'completed' ? new Date().toISOString() : case_.completedAt,
    };

    cases.set(id, updated);

    // Log audit event
    auditEvents.push({
      id: uuidv4(),
      caseId: id,
      actor: req.ip || 'system',
      actionType: 'case_update',
      actionId: 'case_update',
      actionName: 'Update Case',
      args: updates,
      success: true,
      timestamp: new Date().toISOString(),
    });

    res.sendEnvelope({
      ok: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to update case', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/cases/:id/intake
 * Collect device passport for case
 */
router.post('/:id/intake', async (req, res) => {
  try {
    const { id } = req.params;
    const case_ = cases.get(id);

    if (!case_) {
      return res.sendError('CASE_NOT_FOUND', 'Case not found', { caseId: id }, 404);
    }

    // In production, this would:
    // 1. Detect devices via ADB/iOS tools
    // 2. Create device passport
    // 3. Store in database
    
    const passport = {
      id: uuidv4(),
      caseId: id,
      platform: case_.deviceType === 'ios' ? 'ios' : 'android',
      model: case_.deviceModel,
      serial: case_.serialNumber,
      imei: case_.imei,
      connectionState: 'usb',
      mode: 'normal',
      collectedAt: new Date().toISOString(),
    };

    devicePassports.set(passport.id, passport);

    res.sendEnvelope({
      ok: true,
      data: passport,
    });
  } catch (error) {
    console.error('Device intake error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to collect device passport', { error: error.message }, 500);
  }
});

/**
 * POST /api/v1/cases/:id/trust-state
 * Assess trust state for case
 */
router.post('/:id/trust-state', async (req, res) => {
  try {
    const { id } = req.params;
    const case_ = cases.get(id);

    if (!case_) {
      return res.sendError('CASE_NOT_FOUND', 'Case not found', { caseId: id }, 404);
    }

    // In production, this would assess actual trust state
    const trustState = {
      id: uuidv4(),
      caseId: id,
      platform: case_.deviceType === 'ios' ? 'ios' : 'android',
      lockType: 'unknown',
      lockStatus: 'unknown',
      adbAuthorized: false,
      fastbootUnlocked: false,
      iosPaired: false,
      mdmEnrolled: false,
      assessedAt: new Date().toISOString(),
    };

    trustStates.set(trustState.id, trustState);

    res.sendEnvelope({
      ok: true,
      data: trustState,
    });
  } catch (error) {
    console.error('Trust state assessment error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to assess trust state', { error: error.message }, 500);
  }
});

/**
 * GET /api/v1/cases/:id/audit
 * Get audit log for case
 */
router.get('/:id/audit', (req, res) => {
  try {
    const { id } = req.params;
    const case_ = cases.get(id);

    if (!case_) {
      return res.sendError('CASE_NOT_FOUND', 'Case not found', { caseId: id }, 404);
    }

    const caseAuditEvents = auditEvents.filter(e => e.caseId === id);

    res.sendEnvelope({
      ok: true,
      data: {
        events: caseAuditEvents,
        total: caseAuditEvents.length,
      },
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.sendError('INTERNAL_ERROR', 'Failed to get audit log', { error: error.message }, 500);
  }
});

export default router;
