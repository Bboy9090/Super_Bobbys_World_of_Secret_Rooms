#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

//! REFORGE OS - Tauri Backend
//! 
//! All commands execute REAL device operations via Python modules.
//! NO mocks, NO placeholders, NO simulations.

use std::process::{Command, Stdio};
use std::path::PathBuf;
use std::env;
use tauri::command;
use serde::{Deserialize, Serialize};

/// Find the workspace root directory
fn find_workspace_root() -> PathBuf {
    // Try current directory first
    if let Ok(current_dir) = env::current_dir() {
        let mut path = current_dir.clone();
        
        // Check if we're in a subdirectory
        if path.ends_with("workshop-ui") || path.ends_with("src-tauri") {
            while path.file_name().map(|n| n != "apps").unwrap_or(false) {
                path.pop();
            }
            if path.file_name().map(|n| n == "apps").unwrap_or(false) {
                path.pop(); // Go to workspace root
            }
            return path;
        }
        
        // Check if bootforge_cli.py exists here
        if current_dir.join("bootforge_cli.py").exists() {
            return current_dir;
        }
        
        // Walk up to find workspace root
        let mut check_path = current_dir.clone();
        for _ in 0..6 {
            if check_path.join("bootforge_cli.py").exists() {
                return check_path;
            }
            check_path.pop();
        }
        
        return current_dir;
    }
    
    // Fallback: resolve from executable location
    if let Ok(exe_path) = env::current_exe() {
        let mut path = exe_path;
        for _ in 0..6 {
            path.pop();
            if path.join("bootforge_cli.py").exists() {
                return path;
            }
        }
    }
    
    PathBuf::from(".")
}

/// Execute a Python script with arguments and return the output
fn run_python_script(script: &str, args: &[&str]) -> Result<String, String> {
    let workspace = find_workspace_root();
    let script_path = workspace.join(script);
    
    // Try python3 first, then python
    let python_cmd = if cfg!(target_os = "windows") {
        "python"
    } else {
        "python3"
    };
    
    let output = Command::new(python_cmd)
        .current_dir(&workspace)
        .arg(&script_path)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute Python: {} (script: {:?})", e, script_path))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(stdout)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        Err(format!("Script error: {}\nOutput: {}", stderr, stdout))
    }
}

/// Execute a Python module with arguments
fn run_python_module(module_path: &str, args: &[&str]) -> Result<String, String> {
    let workspace = find_workspace_root();
    
    let python_cmd = if cfg!(target_os = "windows") {
        "python"
    } else {
        "python3"
    };
    
    // For module paths like "bobby_dev_mode/api_cli.py", we run as script
    let script_path = workspace.join(module_path);
    
    let output = Command::new(python_cmd)
        .current_dir(&workspace)
        .arg(&script_path)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute module: {} (path: {:?})", e, script_path))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Module error: {}", stderr))
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// DRIVE OPERATIONS - Real disk detection via bootforge
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn list_drives() -> Result<String, String> {
    run_python_script("bootforge_cli.py", &["list", "--json"])
}

#[command]
async fn probe_drive(device_id: String) -> Result<String, String> {
    run_python_script("bootforge_cli.py", &["probe", &device_id, "--json"])
}

#[command]
async fn get_drive_smart(device_id: String) -> Result<String, String> {
    run_python_script("bootforge_cli.py", &["smart", &device_id, "--json"])
}

// ═══════════════════════════════════════════════════════════════════════════
// OS DEPLOYMENT - Real recipe management via Phoenix Key
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn list_os_recipes() -> Result<String, String> {
    run_python_script("phoenix_api_cli.py", &["list", "--json"])
}

#[command]
async fn get_os_recipe(recipe_key: String) -> Result<String, String> {
    run_python_script("phoenix_api_cli.py", &["get", &recipe_key])
}

#[command]
async fn deploy_os(recipe_key: String, target_dev: String) -> Result<String, String> {
    run_python_script("phoenix_api_cli.py", &["deploy", &recipe_key, &target_dev])
}

// ═══════════════════════════════════════════════════════════════════════════
// ANDROID DEV MODE - Real ADB device operations
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn devmode_list_profiles() -> Result<String, String> {
    run_python_module("bobby_dev_mode/api_cli.py", &["list-profiles"])
}

#[command]
async fn devmode_list_modules() -> Result<String, String> {
    run_python_module("bobby_dev_mode/api_cli.py", &["list-modules"])
}

#[command]
async fn devmode_run_module(profile: String, module: String) -> Result<String, String> {
    run_python_module("bobby_dev_mode/api_cli.py", &["run", &profile, &module])
}

#[command]
async fn devmode_check_device() -> Result<String, String> {
    run_python_module("bobby_dev_mode/api_cli.py", &["check-device"])
}

// ═══════════════════════════════════════════════════════════════════════════
// CASE HISTORY - Real case file management
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn list_cases() -> Result<String, String> {
    run_python_script("reforge_api.py", &["history", "list"])
}

#[command]
async fn load_case(ticket_id: String) -> Result<String, String> {
    run_python_script("reforge_api.py", &["history", "get", &ticket_id])
}

#[command]
async fn create_case(case_type: String, device_info: String) -> Result<String, String> {
    run_python_script("reforge_api.py", &["history", "create", &case_type, &device_info])
}

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE ANALYSIS - Real device detection and analysis
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn analyze_device(device_info: String, actor: String) -> Result<String, String> {
    run_python_script("reforge_api.py", &["analyze", &device_info, "--actor", &actor])
}

#[command]
async fn detect_connected_devices() -> Result<String, String> {
    run_python_script("reforge_api.py", &["detect-devices"])
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE & METRICS - Real audit and metrics from storage
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn get_ops_metrics() -> Result<String, String> {
    run_python_script("reforge_api.py", &["metrics"])
}

#[command]
async fn get_compliance_summary(device_id: Option<String>) -> Result<String, String> {
    match device_id {
        Some(id) => run_python_script("reforge_api.py", &["compliance", "summary", &id]),
        None => run_python_script("reforge_api.py", &["compliance", "summary"]),
    }
}

#[command]
async fn export_compliance_report(device_id: String, format: Option<String>) -> Result<String, String> {
    let fmt = format.unwrap_or_else(|| "pdf".to_string());
    run_python_script("reforge_api.py", &["compliance", "export", &device_id, "--format", &fmt])
}

#[command]
async fn get_audit_log(limit: Option<u32>) -> Result<String, String> {
    let limit_str = limit.unwrap_or(100).to_string();
    run_python_script("reforge_api.py", &["audit", "log", "--limit", &limit_str])
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGAL CLASSIFICATION - Real jurisdiction-aware classification
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn get_legal_classification(device_id: Option<String>) -> Result<String, String> {
    match device_id {
        Some(id) => run_python_script("reforge_api.py", &["legal", "classify", &id]),
        None => run_python_script("reforge_api.py", &["legal", "jurisdictions"]),
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS - Real certification tracking
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn get_certifications() -> Result<String, String> {
    run_python_script("reforge_api.py", &["certifications", "list"])
}

#[command]
async fn verify_certification(cert_id: String) -> Result<String, String> {
    run_python_script("reforge_api.py", &["certifications", "verify", &cert_id])
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

#[command]
fn greet(name: &str) -> String {
    format!("Welcome to REFORGE OS, {}!", name)
}

#[command]
async fn get_system_info() -> Result<String, String> {
    run_python_script("reforge_api.py", &["system", "info"])
}

#[command]
async fn health_check() -> Result<String, String> {
    run_python_script("reforge_api.py", &["health"])
}

// ═══════════════════════════════════════════════════════════════════════════
// CRM - Customer and Device Management
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn list_customers() -> Result<String, String> {
    run_python_script("reforge_api.py", &["crm", "customers", "list"])
}

#[command]
async fn add_customer(name: String, contact: String) -> Result<String, String> {
    run_python_script("reforge_api.py", &["crm", "customers", "add", &name, &contact])
}

#[command]
async fn list_customer_devices(customer_id: String) -> Result<String, String> {
    run_python_script("reforge_api.py", &["crm", "devices", "list", &customer_id])
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS - PDF/HTML Export
// ═══════════════════════════════════════════════════════════════════════════

#[command]
async fn export_case_report(ticket_id: String, format: Option<String>) -> Result<String, String> {
    let fmt = format.unwrap_or_else(|| "pdf".to_string());
    run_python_script("reforge_api.py", &["reports", "export", &ticket_id, "--format", &fmt])
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // System
            greet,
            get_system_info,
            health_check,
            // Drives
            list_drives,
            probe_drive,
            get_drive_smart,
            // OS Deployment
            list_os_recipes,
            get_os_recipe,
            deploy_os,
            // Android Dev Mode
            devmode_list_profiles,
            devmode_list_modules,
            devmode_run_module,
            devmode_check_device,
            // Device Analysis
            analyze_device,
            detect_connected_devices,
            // Cases/History
            list_cases,
            load_case,
            create_case,
            // Compliance & Metrics
            get_ops_metrics,
            get_compliance_summary,
            export_compliance_report,
            get_audit_log,
            // Legal
            get_legal_classification,
            // Certifications
            get_certifications,
            verify_certification,
            // CRM
            list_customers,
            add_customer,
            list_customer_devices,
            // Reports
            export_case_report,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
