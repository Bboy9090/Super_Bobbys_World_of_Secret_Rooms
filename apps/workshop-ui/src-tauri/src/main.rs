#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::command;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
async fn analyze_device(device_info: String, actor: String) -> Result<String, String> {
    // Mock device analysis for now - in full implementation this would use forgeworks-core
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
    // Mock metrics - in full implementation this would query the database
    let metrics = r#"{
        "activeUnits": 42,
        "auditCoverage": 98.5,
        "escalations": 3
    }"#;

    Ok(metrics.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            analyze_device,
            get_ops_metrics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}