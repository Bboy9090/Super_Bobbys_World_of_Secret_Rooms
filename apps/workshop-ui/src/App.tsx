import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import DeviceOverview from "./pages/DeviceOverview";
import ComplianceSummary from "./pages/ComplianceSummary";
import LegalClassification from "./pages/LegalClassification";
import CustodianVaultGate from "./pages/CustodianVaultGate";
import CertificationDashboard from "./pages/CertificationDashboard";
import OpsDashboard from "./pages/OpsDashboard";
import "./App.css";

type TabType = "dashboard" | "analysis" | "compliance" | "legal" | "certification" | "operations" | "vault";

function App() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [deviceId, setDeviceId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/assets/icons/app-icon.svg" alt="REFORGE OS" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">REFORGE OS</h1>
              <p className="text-sm text-gray-400">Analysis • Classification • Lawful Routing</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Professional Repair Platform
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "analysis"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Device Analysis
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "compliance"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Compliance Summary
            </button>
            <button
              onClick={() => setActiveTab("legal")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "legal"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Legal Classification
            </button>
            <button
              onClick={() => setActiveTab("certification")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "certification"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Certification
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "vault"
                  ? "border-amber-500 text-amber-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Custodian Vault
            </button>
            <button
              onClick={() => setActiveTab("operations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "operations"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Operations
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === "dashboard" && <DeviceOverview />}
        {activeTab === "analysis" && <DeviceOverview onDeviceSelected={setDeviceId} />}
        {activeTab === "compliance" && <ComplianceSummary deviceId={deviceId || undefined} />}
        {activeTab === "legal" && <LegalClassification deviceId={deviceId || undefined} />}
        {activeTab === "certification" && <CertificationDashboard />}
        {activeTab === "vault" && <CustodianVaultGate deviceId={deviceId || undefined} />}
        {activeTab === "operations" && <OpsDashboard />}
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>This platform provides analysis and documentation only.</p>
          <p className="mt-1">No modification, circumvention, or account interference is performed or advised.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;