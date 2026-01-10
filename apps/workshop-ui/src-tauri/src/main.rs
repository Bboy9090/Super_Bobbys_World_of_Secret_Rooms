#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use tauri::command;

// Helper to run Python scripts
fn run_python(script: &str, args: &[&str]) -> Result<String, String> {
    use std::path::PathBuf;
    use std::env;
    
    // Get the workspace root - try multiple methods
    let mut script_path = if let Ok(current_dir) = env::current_dir() {
        // In dev mode, current_dir is usually the workspace root
        let mut path = current_dir;
        // If we're in apps/workshop-ui, go up two levels
        if path.ends_with("workshop-ui") {
            path.pop();
            path.pop();
        } else if path.ends_with("apps") {
            path.pop();
        }
        path.push(script);
        path
    } else {
        // Fallback: try to resolve from executable location
        let mut path = PathBuf::from(env::current_exe().unwrap());
        path.pop(); // Remove exe name
        path.pop(); // Remove debug/release
        path.pop(); // Remove target
        path.pop(); // Remove src-tauri
        path.pop(); // Remove workshop-ui
        path.pop(); // Remove apps
        path.push(script);
        path
    };
    
    let output = Command::new("python")
        .arg(&script_path)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("Failed to execute Python script: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Python script error: {}", stderr))
    }
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
async fn analyze_device(device_info: String, actor: String) -> Result<String, String> {
    // For now, return mock data - can integrate with Python backend later
    let mock_report = r#"{
        "device": {
            "model": "iPhone 13 Pro",
            "platform": "iOS",
            "security_state": "Restricted",
            "classification": "Userland-Only"
        },
        "ownership": {
            "verified": true,
            "confidence": 85
        },
        "legal": {
            "status": "Conditional",
            "jurisdiction": "US",
            "risk_level": "Medium"
        },
        "routing": {
            "path": "OEM Support",
            "reason": "Device requires OEM authorization for repair"
        },
        "audit_integrity_verified": true
    }"#;

    Ok(mock_report.to_string())
}

#[command]
async fn get_ops_metrics() -> Result<String, String> {
    // Mock metrics - can integrate with Python backend later
    let metrics = r#"{
        "activeUnits": 42,
        "auditCoverage": 98.5,
        "escalations": 3,
        "complianceScore": 99.2,
        "activeUsers": 156,
        "processedDevices": 2847
    }"#;

    Ok(metrics.to_string())
}

#[command]
async fn get_compliance_summary(device_id: Option<String>) -> Result<String, String> {
    // Mock compliance summary
    let summary = r#"{
        "device_id": "device-123",
        "compliance_score": 95,
        "audit_events": 142,
        "verified_hashes": 142,
        "jurisdiction": "US",
        "status": "Compliant"
    }"#;

    Ok(summary.to_string())
}

#[command]
async fn export_compliance_report(device_id: String) -> Result<String, String> {
    // Mock export - can integrate with reports module later
    Ok(format!("Report exported for device: {}", device_id))
}

#[command]
async fn get_certifications() -> Result<String, String> {
    // Mock certifications
    let certs = r#"{
        "certifications": [
            {"id": "cert-1", "name": "Level I Technician", "status": "Active"},
            {"id": "cert-2", "name": "Level II Specialist", "status": "Active"}
        ]
    }"#;

    Ok(certs.to_string())
}

#[command]
async fn get_legal_classification(device_id: Option<String>) -> Result<String, String> {
    // Mock legal classification
    let classification = r#"{
        "device_id": "device-123",
        "jurisdiction": "US",
        "status": "Conditional",
        "risk_level": "Medium",
        "requires_authorization": true,
        "authority": "OEM Support"
    }"#;

    Ok(classification.to_string())
}

#[command]
async fn get_interpretive_context(device_id: Option<String>) -> Result<String, String> {
    // Mock interpretive context (Pandora Codex)
    let context = r#"{
        "device_id": "device-123",
        "context": "Internal classification context",
        "risk_factors": ["High security state", "Restricted platform"],
        "recommendations": ["OEM authorization required", "Legal review recommended"]
    }"#;

    Ok(context.to_string())
}

// BootForge commands
#[command]
async fn list_drives() -> Result<String, String> {
    run_python("bootforge_cli.py", &["list", "--json"])
}

#[command]
async fn get_drive_smart(device_id: String) -> Result<String, String> {
    run_python("bootforge_cli.py", &["smart", &device_id])
}

// Phoenix Key commands
#[command]
async fn list_os_recipes() -> Result<String, String> {
    run_python("phoenix_api_cli.py", &["list", "--json"])
}

#[command]
async fn deploy_os(recipe_key: String, target_dev: String) -> Result<String, String> {
    run_python("phoenix_api_cli.py", &["deploy", &recipe_key, &target_dev])
}

// Bobby Dev Mode commands
#[command]
async fn devmode_list_profiles() -> Result<String, String> {
    run_python("bobby_dev_mode/api_cli.py", &["list-profiles"])
}

#[command]
async fn devmode_run_module(profile: String, module: String) -> Result<String, String> {
    run_python("bobby_dev_mode/api_cli.py", &["run", &profile, &module])
}

// History/CRM commands
#[command]
async fn list_cases() -> Result<String, String> {
    // Mock for now - can integrate with Python history module
    Ok(r#"["case-1", "case-2", "case-3"]"#.to_string())
}

#[command]
async fn load_case(ticket_id: String) -> Result<String, String> {
    // Mock for now - can integrate with Python history module
    Ok(format!(r#"{{"ticket_id": "{}", "type": "diagnostic", "timestamp": "2024-01-01T00:00:00Z"}}"#, ticket_id))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            analyze_device,
            get_ops_metrics,
            get_compliance_summary,
            export_compliance_report,
            get_certifications,
            get_legal_classification,
            get_interpretive_context,
            list_drives,
            get_drive_smart,
            list_os_recipes,
            deploy_os,
            devmode_list_profiles,
            devmode_run_module,
            list_cases,
            load_case,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}