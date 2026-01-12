-- Professional Repair Shop Database Schema
-- Bobby's Workshop - Case Management System

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    device_type VARCHAR(50) NOT NULL, -- 'ios' | 'android' | 'tablet' | 'laptop' | 'other'
    device_model VARCHAR(100),
    serial_number VARCHAR(100),
    imei VARCHAR(20),
    issue_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'in_progress' | 'waiting_customer' | 'waiting_vendor' | 'completed' | 'closed' | 'cancelled'
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 5),
    assigned_to VARCHAR(255),
    estimated_completion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Device Passports Table
CREATE TABLE IF NOT EXISTS device_passports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    os_version VARCHAR(50),
    build_number VARCHAR(50),
    serial VARCHAR(100),
    imei VARCHAR(20),
    meid VARCHAR(20),
    udid VARCHAR(100), -- iOS only
    connection_state VARCHAR(50) NOT NULL, -- 'usb' | 'none' | 'network' | 'bluetooth'
    mode VARCHAR(50) NOT NULL, -- 'normal' | 'recovery' | 'fastboot' | 'dfu' | 'download' | 'edl' | 'unknown'
    battery_level INTEGER,
    battery_health VARCHAR(50),
    storage_capacity BIGINT,
    storage_used BIGINT,
    collected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trust States Table
CREATE TABLE IF NOT EXISTS trust_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    lock_type VARCHAR(100), -- 'icloud' | 'frp' | 'carrier' | 'mdm' | 'sim' | 'bootloader' | 'none' | 'unknown'
    lock_status VARCHAR(50), -- 'likely_enabled' | 'likely_not_enabled' | 'unknown'
    adb_authorized BOOLEAN DEFAULT false,
    fastboot_unlocked BOOLEAN DEFAULT false,
    ios_paired BOOLEAN DEFAULT false,
    bootloader_status VARCHAR(50), -- 'locked' | 'unlocked' | 'unlockable' | 'unknown'
    frp_status VARCHAR(50),
    activation_lock_status VARCHAR(50),
    carrier_lock_status VARCHAR(50),
    mdm_enrolled BOOLEAN DEFAULT false,
    supervision_status VARCHAR(50), -- 'supervised' | 'unsupervised' | 'unknown'
    authorization_method VARCHAR(100),
    last_authorized TIMESTAMP,
    assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Table
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'receipt' | 'invoice' | 'device_photo' | 'box_photo' | 'carrier_screenshot' | 'id_document' | 'other'
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    metadata JSONB,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255) NOT NULL
);

-- Ownership Verification Table
CREATE TABLE IF NOT EXISTS ownership_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
    customer_signature_hash VARCHAR(64) NOT NULL,
    attestation_confirmed BOOLEAN NOT NULL DEFAULT false,
    attestation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evidence_score INTEGER NOT NULL DEFAULT 0 CHECK (evidence_score >= 0 AND evidence_score <= 100),
    required_evidence TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    provided_evidence TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    missing_evidence TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'complete' | 'insufficient' | 'failed'
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    notes TEXT
);

-- Recovery Pathways Table
CREATE TABLE IF NOT EXISTS recovery_pathways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    route VARCHAR(100) NOT NULL, -- RecoveryRoute enum
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending' | 'in_progress' | 'waiting_response' | 'completed' | 'failed' | 'cancelled'
    success_probability INTEGER DEFAULT 0 CHECK (success_probability >= 0 AND success_probability <= 100),
    reason TEXT NOT NULL,
    next_steps TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    required_evidence TEXT[] DEFAULT ARRAY[]::TEXT[],
    evidence_provided TEXT[] DEFAULT ARRAY[]::TEXT[],
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    outcome TEXT,
    outcome_details TEXT
);

-- Support Bundles Table
CREATE TABLE IF NOT EXISTS support_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    bundle_type VARCHAR(50) NOT NULL, -- 'apple' | 'android' | 'carrier' | 'generic'
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    includes JSONB NOT NULL, -- { devicePassport: boolean, trustState: boolean, evidence: boolean, caseNotes: boolean, auditLog: boolean }
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(255) NOT NULL
);

-- Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    job_id UUID,
    actor VARCHAR(255) NOT NULL, -- user ID or 'system'
    action_type VARCHAR(100) NOT NULL, -- AuditActionType enum
    action_id VARCHAR(255) NOT NULL,
    action_name VARCHAR(255) NOT NULL,
    args JSONB,
    result JSONB,
    success BOOLEAN NOT NULL DEFAULT true,
    error TEXT,
    policy_gates JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB
);

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    workflow_id VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued', -- 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
    current_step VARCHAR(255),
    completed_steps INTEGER DEFAULT 0,
    total_steps INTEGER NOT NULL,
    steps JSONB NOT NULL, -- Array of WorkflowStep
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER, -- milliseconds
    result JSONB,
    error TEXT
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_ticket_number ON cases(ticket_number);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_device_passports_case_id ON device_passports(case_id);
CREATE INDEX IF NOT EXISTS idx_trust_states_case_id ON trust_states(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_type ON evidence(type);
CREATE INDEX IF NOT EXISTS idx_ownership_verification_case_id ON ownership_verification(case_id);
CREATE INDEX IF NOT EXISTS idx_recovery_pathways_case_id ON recovery_pathways(case_id);
CREATE INDEX IF NOT EXISTS idx_recovery_pathways_status ON recovery_pathways(status);
CREATE INDEX IF NOT EXISTS idx_support_bundles_case_id ON support_bundles(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_case_id ON audit_events(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_events_action_type ON audit_events(action_type);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_case_id ON workflow_executions(case_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
