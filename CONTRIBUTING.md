# Contributing to REFORGE OS

Thank you for your interest in contributing to REFORGE OS! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Contributions](#making-contributions)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security Considerations](#security-considerations)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ with npm 9+
- **Rust** 1.70+ (stable toolchain)
- **Python** 3.8+
- **Git** 2.30+
- **Tauri CLI** (`cargo install tauri-cli`)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/reforge-os.git
   cd reforge-os
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-ORG/reforge-os.git
   ```

---

## Development Setup

### Frontend (React/TypeScript)

```bash
cd apps/workshop-ui
npm install
npm run vite:dev
```

### Desktop App (Tauri)

```bash
cd apps/workshop-ui
npm run dev
```

### Backend (Rust)

```bash
cd backend
cargo build
cargo run
```

### Python Modules

```bash
# Ensure Python virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Test modules
python bootforge_cli.py list --json
python phoenix_api_cli.py list --json
```

---

## Making Contributions

### Types of Contributions

We welcome several types of contributions:

| Type | Description |
|------|-------------|
| **Bug Fixes** | Fix issues reported in GitHub Issues |
| **Features** | Implement new features (discuss first) |
| **Documentation** | Improve docs, fix typos, add examples |
| **Tests** | Add or improve test coverage |
| **Performance** | Optimize code without changing behavior |
| **Refactoring** | Improve code quality and maintainability |

### What NOT to Contribute

Due to the compliance-first nature of this project:

- **No exploit code** - We do not accept any circumvention tools
- **No bypass mechanisms** - Even theoretical implementations
- **No device modification code** - Analysis only
- **No credential handling** - We do not store credentials

---

## Coding Standards

### TypeScript/React

```typescript
// Use TypeScript strict mode
// Use functional components with hooks
// Use proper type annotations

interface DeviceProps {
  deviceId: string;
  onAnalyze: (result: AnalysisResult) => void;
}

function DeviceCard({ deviceId, onAnalyze }: DeviceProps) {
  const [loading, setLoading] = useState<boolean>(false);
  
  // Implementation
}
```

### Rust

```rust
// Use Clippy for linting
// Follow Rust API Guidelines
// Document public items

/// Analyzes a device and returns the analysis result.
/// 
/// # Arguments
/// * `device_id` - The unique identifier of the device
/// 
/// # Returns
/// The analysis result or an error
pub fn analyze_device(device_id: &str) -> Result<AnalysisResult, AnalysisError> {
    // Implementation
}
```

### Python

```python
"""Module docstring explaining purpose."""

from typing import Optional, Dict, Any


def analyze_device(device_id: str) -> Dict[str, Any]:
    """
    Analyze a device and return results.
    
    Args:
        device_id: The unique identifier of the device
        
    Returns:
        Dictionary containing analysis results
    """
    # Implementation
```

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(analysis): add device fingerprinting support

fix(ui): resolve tab switching animation glitch

docs(readme): update installation instructions

test(audit): add hash chain verification tests
```

---

## Testing Guidelines

### Frontend Tests

```bash
cd apps/workshop-ui
npm run test
npm run test:coverage
```

### Rust Tests

```bash
cd backend
cargo test --verbose

# Individual service
cd services/audit-logging
cargo test
```

### Test Requirements

- All new features must have tests
- Bug fixes should include regression tests
- Maintain minimum 80% code coverage
- Tests must pass before PR merge

---

## Pull Request Process

### Before Submitting

1. **Update your fork:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Write clean, documented code
   - Add or update tests
   - Update documentation if needed

4. **Run checks:**
   ```bash
   # Frontend
   npm run lint
   npm run typecheck
   npm run test

   # Rust
   cargo fmt --check
   cargo clippy
   cargo test
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat(scope): description of changes"
   ```

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template completely

4. Wait for review and CI checks

### PR Review Criteria

Reviewers will check for:

- [ ] Code quality and style
- [ ] Test coverage
- [ ] Documentation updates
- [ ] No security vulnerabilities
- [ ] No compliance violations
- [ ] Performance considerations
- [ ] Backward compatibility

---

## Security Considerations

### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Report security issues privately to: security@reforge-os.com

### Security Guidelines

When contributing, ensure:

1. **No sensitive data** in commits (keys, tokens, passwords)
2. **No exploit code** of any kind
3. **Input validation** for all user inputs
4. **Safe error handling** (no sensitive info in errors)
5. **Audit logging** for significant operations

---

## Development Resources

### Documentation

- [Platform Overview](docs/public/platform-overview.md)
- [Service Architecture](docs/enterprise/infrastructure/service-architecture.md)
- [Security Policy](SECURITY.md)

### Tooling

| Tool | Purpose |
|------|---------|
| ESLint | JavaScript/TypeScript linting |
| Prettier | Code formatting |
| Clippy | Rust linting |
| rustfmt | Rust formatting |
| Vitest | Frontend testing |
| Cargo Test | Rust testing |

### Useful Commands

```bash
# Format all code
npm run format
cargo fmt

# Lint all code
npm run lint
cargo clippy

# Run all tests
npm run test
cargo test

# Type check
npm run typecheck
```

---

## Questions?

- Open a GitHub Discussion for questions
- Check existing issues before creating new ones
- Join our community channels (if available)

---

Thank you for contributing to REFORGE OS!

*Platform, Not Product. Authority, Not Exploits.*
