/**
 * Policy Engine
 * 
 * Main policy evaluation engine
 */

import type { PolicyGate, PolicyGateResult, PolicyEvaluation } from '@/types/policies';
import type { GateContext } from './gates';
import { PolicyGateEngine } from './gates';

// Policies manifest - in production, this would be loaded from file at runtime
const policiesManifest = {
  version: "1.0.0",
  name: "Lawful Lock Policy Pack",
  global: {
    audit: { enabled: true, immutable: true },
    ui_language: {
      banned_terms: ["bypass", "exploit", "activation lock removal", "icloud unlock", "remove icloud lock", "apple id bypass", "frp bypass", "unlock", "crack", "hack"],
      required_disclaimer: "This tool assists with diagnostics, ownership verification, and official recovery pathways. It does not bypass security or remove locks."
    }
  },
  gates: [
    { id: "GATE_OWNERSHIP_ATTESTATION", name: "Ownership Attestation Required", type: "ownership_attestation", required: true, message: "Ownership attestation is required before continuing.", requirements: { checkbox: "I own this device or have written permission to service it.", typed_phrase: "I CONFIRM AUTHORIZED SERVICE" } },
    { id: "GATE_EVIDENCE_COMPLETENESS", name: "Evidence Completeness Check", type: "evidence_completeness", required: true, message: "Sufficient evidence required for recovery pathway.", requirements: { minimumScore: 70, pathwaySpecific: true } },
    { id: "GATE_DEVICE_AUTHORIZATION", name: "Device Authorization Check", type: "device_authorization", required: false, message: "Device must be authorized for this operation.", requirements: { platformSpecific: true } },
    { id: "GATE_DESTRUCTIVE_CONFIRMATION", name: "Destructive Action Confirmation", type: "destructive_confirmation", required: false, message: "Typed confirmation is required for destructive actions.", requirements: { typed_phrase: "ERASE AND RESTORE", warning: "This may erase data. Ensure backups are complete. Proceed only if you understand the impact." } },
    { id: "GATE_NO_CIRCUMVENTION", name: "No Circumvention Allowed", type: "blocked_intent", required: true, message: "This action is blocked because it resembles circumvention. Use official recovery pathways only.", requirements: { blocked_keywords: ["bypass", "exploit", "unlock icloud", "activation lock removal", "frp bypass", "mdm bypass", "crack", "hack"] } }
  ],
  rules: []
};

export class PolicyEngine {
  private policies: typeof policiesManifest;

  constructor() {
    this.policies = policiesManifest;
  }

  /**
   * Get all policy gates
   */
  getGates(): PolicyGate[] {
    return this.policies.gates.map((gate: any) => ({
      id: gate.id,
      type: gate.type as PolicyGate['type'],
      name: gate.name,
      description: gate.description || '',
      required: gate.required !== false,
      message: gate.message,
      requirements: gate.requirements,
    }));
  }

  /**
   * Get gates required for a specific workflow/recovery route
   */
  getRequiredGates(workflowId?: string, route?: string): PolicyGate[] {
    const allGates = this.getGates();
    
    // If route-specific rules exist, filter gates
    if (route) {
      const rule = this.policies.rules?.find((r: any) => 
        r.applies_to?.includes(route)
      );
      if (rule) {
        // Return gates that are relevant to this rule
        return allGates.filter(gate => gate.required);
      }
    }

    // Return all required gates by default
    return allGates.filter(gate => gate.required);
  }

  /**
   * Evaluate all policy gates for a context
   */
  evaluate(context: GateContext, requiredGateIds?: string[]): PolicyEvaluation {
    const gates = requiredGateIds
      ? this.getGates().filter(gate => requiredGateIds.includes(gate.id))
      : this.getRequiredGates(undefined, context.recoveryRoute);

    const gateResults: PolicyGateResult[] = gates.map(gate => 
      PolicyGateEngine.evaluateGate(gate, context)
    );

    const allPassed = gateResults.every(result => result.passed);
    const blocked = gateResults.some(result => result.blocked);
    const blockingReason = blocked
      ? gateResults.find(result => result.blocked)?.reason
      : undefined;

    return {
      caseId: context.caseId,
      gates: gateResults,
      allPassed,
      blocked,
      blockingReason,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if a specific gate passes
   */
  checkGate(gateId: string, context: GateContext): PolicyGateResult {
    const gate = this.getGates().find(g => g.id === gateId);
    if (!gate) {
      throw new Error(`Gate not found: ${gateId}`);
    }

    return PolicyGateEngine.evaluateGate(gate, context);
  }

  /**
   * Validate UI text for banned terms
   */
  validateUIText(text: string): { valid: boolean; bannedTerms: string[] } {
    const bannedTerms = this.policies.global.ui_language.banned_terms || [];
    const foundTerms: string[] = [];
    const lowerText = text.toLowerCase();

    for (const term of bannedTerms) {
      if (lowerText.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }

    return {
      valid: foundTerms.length === 0,
      bannedTerms: foundTerms,
    };
  }

  /**
   * Get required disclaimer
   */
  getRequiredDisclaimer(): string {
    return this.policies.global.ui_language.required_disclaimer;
  }
}

// Singleton instance
export const policyEngine = new PolicyEngine();
