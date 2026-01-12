/**
 * Workflow Loader
 * 
 * Loads workflow definitions from runtime/manifests/workflows.json
 */

import type { WorkflowDefinition } from '@/types/workflows';

// In production, this would load from file at runtime
// For now, inline the workflow definitions
const workflowsData = {
  version: "1.0.0",
  workflows: [
    {
      id: "universal_device_scan_v1",
      name: "Universal Device Scan",
      description: "Scan for all connected devices (iOS, Android, Fastboot) - read-only detection",
      version: "1.0.0",
      category: "scan",
      requiredGates: ["GATE_OWNERSHIP_ATTESTATION"],
      steps: [
        {
          id: "usb_enumerate",
          name: "USB Enumeration",
          actionId: "system.usb.enumerate",
          actionType: "usb_enumeration",
          retry: { max: 4, backoffMs: [250, 500, 1000, 2000] },
          outputs: ["usb_devices"]
        },
        {
          id: "adb_list",
          name: "ADB Device List",
          actionId: "android.adb.devices",
          actionType: "adb_scan",
          retry: { max: 2, backoffMs: [500, 1000] },
          outputs: ["adb_devices"]
        },
        {
          id: "fastboot_list",
          name: "Fastboot Device List",
          actionId: "android.fastboot.devices",
          actionType: "fastboot_scan",
          retry: { max: 2, backoffMs: [500, 1000] },
          outputs: ["fastboot_devices"]
        },
        {
          id: "ios_scan",
          name: "iOS Device Scan",
          actionId: "ios.ideviceinfo.identity",
          actionType: "ios_scan",
          retry: { max: 1, backoffMs: [500] },
          outputs: ["ios_devices"]
        },
        {
          id: "emit_device_passports",
          name: "Emit Device Passports",
          actionId: "bobby.emit.device_passports",
          actionType: "device_passport_emit",
          outputs: ["device_passports", "trust_states"]
        }
      ]
    },
    {
      id: "apple_activation_recovery_assistant_v1",
      name: "Orchard Gate — Apple Access & Recovery",
      description: "Diagnostics + ownership verification + official Apple recovery hand-off",
      version: "1.0.0",
      category: "apple_recovery",
      requiredGates: ["GATE_OWNERSHIP_ATTESTATION", "GATE_NO_CIRCUMVENTION", "GATE_TOOL_ALLOWLIST"],
      steps: [
        {
          id: "device_intake",
          name: "Device Intake (Read-Only)",
          actionId: "ios.ideviceinfo.identity",
          actionType: "device_intake_readonly",
          inputs: ["platform", "connection_state"],
          outputs: ["DevicePassport.json"]
        },
        {
          id: "status_assessment",
          name: "Activation & Access Status (Read-Only)",
          actionId: "ios.trapdoor.status",
          actionType: "status_assessment_readonly",
          inputs: ["DevicePassport.json"],
          outputs: ["AccessAssessment.json"]
        },
        {
          id: "ownership_packet",
          name: "Ownership Verification Vault",
          actionId: "bobby.collect.ownership_packet",
          actionType: "ownership_packet_collect",
          inputs: ["receipt", "photos", "serial_imei", "attestation"],
          outputs: ["OwnershipPacket.zip"]
        },
        {
          id: "support_bundle",
          name: "Support Bundle Export",
          actionId: "bobby.bundle.apple_support",
          actionType: "support_bundle_export",
          inputs: ["DevicePassport.json", "AccessAssessment.json", "OwnershipPacket.zip"],
          outputs: ["AppleSupportBundle.zip"]
        }
      ]
    },
    {
      id: "android_legal_repair_assistant_v1",
      name: "Android Legal Repair Assistant",
      description: "OEM-safe diagnostics + restore guidance",
      version: "1.0.0",
      category: "android_repair",
      requiredGates: ["GATE_OWNERSHIP_ATTESTATION", "GATE_NO_CIRCUMVENTION", "GATE_TOOL_ALLOWLIST"],
      steps: [
        {
          id: "device_intake",
          name: "Device Intake (Read-Only)",
          actionId: "android.adb.devices",
          actionType: "device_intake_readonly",
          inputs: ["platform", "connection_state"],
          outputs: ["DevicePassport.json"]
        },
        {
          id: "authorized_diagnostics",
          name: "Diagnostics (Authorized Only)",
          actionId: "android.adb.diagnostics",
          actionType: "authorized_diagnostics",
          requiredGates: ["GATE_DEVICE_AUTHORIZATION"],
          inputs: ["DevicePassport.json"],
          outputs: ["AndroidDiagnostics.json"]
        },
        {
          id: "repair_report",
          name: "Repair Report Export",
          actionId: "bobby.report.android_repair",
          actionType: "report_export",
          inputs: ["AndroidDiagnostics.json"],
          outputs: ["RepairReport.md"]
        }
      ]
    }
  ]
};

export class WorkflowLoader {
  private workflows: Map<string, WorkflowDefinition> = new Map();

  constructor() {
    this.loadWorkflows();
  }

  /**
   * Load workflows from manifest
   */
  private loadWorkflows(): void {
    for (const workflow of workflowsData.workflows) {
      this.workflows.set(workflow.id, workflow as WorkflowDefinition);
    }
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by category
   */
  getWorkflowsByCategory(category: string): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(w => w.category === category);
  }

  /**
   * Get workflows by tag
   */
  getWorkflowsByTag(tag: string): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(w => 
      (w as any).tags?.includes(tag)
    );
  }
}

export const workflowLoader = new WorkflowLoader();
