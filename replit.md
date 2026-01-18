# REFORGE OS (Bobby's Workshop 3.0)

## Overview

REFORGE OS is a compliance-first device repair and analysis platform designed for professional phone repair shops. It combines three merged systems: Bobby's Workshop (public UX layer), ForgeWorks (compliance core), and Pandora Codex (internal R&D). The platform provides device detection, diagnostics, legal recovery pathway routing, and professional case management - all without executing any bypass or circumvention operations.

**Core Philosophy**: Analyze over action, interpret over execution, route to authority over bypass. The platform preserves power as judgment, not action.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS with custom design tokens ("Bronx Night" theme, urban workbench aesthetic)
- **State Management**: Zustand stores
- **Desktop App**: Tauri for native desktop builds
- **UI Pattern**: Modular node-based GUI with drag-and-drop canvas, module palette, and visual workspace
- **Key Components**: Secret Rooms system (9 specialized workspaces), workbench modules, device panels

### Backend Architecture
- **Node.js/Express Server** (Port 3001): Legacy routes, USB enumeration, ADB/Fastboot operations, workflow execution
- **Python FastAPI Server** (Port 8000): Advanced modules including Sonic Codex (audio forensics), Ghost Codex (metadata operations), Pandora Codex (hardware analysis), Phoenix Key authentication
- **Rust Core** (`crates/bootforge-usb/`): Cross-platform USB enumeration using nusb library, device detection, local device cache
- **API Pattern**: Manifest-driven catalog system, canonical contract pattern (DTO adapters transform Rust CLI output to frontend format at boundary)

### Data Storage
- **Device Cache**: Local JSON file (`~/.bobbys-workshop/devices.json`) for tracking device history with first_seen/last_seen timestamps
- **Runtime Manifests**: JSON configuration files in `runtime/manifests/` for policies, tools, actions, and workflows
- **Audit Logging**: Immutable event logging system for compliance

### Key Design Patterns
- **Policy Engine**: 5 gate types (ownership attestation, evidence completeness, device authorization, destructive confirmation, blocked intent detection)
- **Workflow Engine**: JSON-defined workflows with step-based execution and policy gate enforcement
- **Case Management**: Professional intake system with ticket generation and evidence tracking
- **Trust State Profiling**: Device authorization status tracking (authorized/unauthorized/offline)

## External Dependencies

### Core Dependencies
- **nusb**: Cross-platform USB device enumeration (Rust crate)
- **libusb**: Low-level USB access (system dependency)
- **Tauri**: Desktop application framework
- **FastAPI/Uvicorn**: Python async web framework (port 8000)
- **Express**: Node.js web framework (port 3001)

### Platform Tools Integration
- **ADB/Fastboot**: Android device communication (detected via system PATH)
- **Apple Lockdown**: iOS device communication
- **udev** (Linux): Device enrichment
- **SetupAPI** (Windows): Device enrichment (stub exists, needs implementation)
- **IOKit** (macOS): Device enrichment (stub exists, needs implementation)

### Development Tools
- **Vite**: Frontend build tool
- **Cargo**: Rust package manager
- **Concurrently**: Parallel script execution for dev mode