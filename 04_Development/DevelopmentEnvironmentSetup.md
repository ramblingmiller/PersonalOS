---
title: PersonalOS Development Environment Setup
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, development, setup]
---

# PersonalOS Development Environment Setup

## Overview

This document provides step-by-step instructions for setting up a development environment for PersonalOS from scratch.

## Prerequisites

### Operating System
- **Linux**: Ubuntu 20.04+ or equivalent (primary development platform)
- **macOS**: 11+ (future support)
- **Windows**: 10+ with WSL2 (future support)

### Required Knowledge
- Basic command line usage
- Git fundamentals
- JavaScript/TypeScript basics
- Basic Rust understanding (can learn as you go)

## Installation Steps

### 1. Install System Dependencies

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install build essentials
sudo apt install -y build-essential curl wget git

# Install libraries needed by Tauri
sudo apt install -y libwebkit2gtk-4.0-dev \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

#### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Xcode Command Line Tools (if not already installed)
xcode-select --install
```

### 2. Install Rust

```bash
# Install rustup (Rust installer)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow prompts (choose default installation)
# Restart terminal OR run:
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version

# Should output something like:
# rustc 1.70.0 (or later)
# cargo 1.70.0 (or later)
```

**Troubleshooting**:
- If `rustc` not found, add to PATH: `export PATH="$HOME/.cargo/bin:$PATH"`
- Add to `.bashrc` or `.zshrc` for persistence

### 3. Install Node.js and npm

#### Option A: Using nvm (Recommended)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal OR run:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node --version  # Should be v18.x or later
npm --version   # Should be 9.x or later
```

#### Option B: System Package Manager

```bash
# Linux
sudo apt install -y nodejs npm

# macOS
brew install node
```

### 4. Install Tauri CLI

```bash
# Install Tauri CLI globally
cargo install tauri-cli

# Verify installation
cargo tauri --version

# Should output: tauri-cli 2.x.x (or later)
```

**Note**: This may take 5-10 minutes as it compiles from source.

### 5. Clone the Repository

```bash
# Navigate to your projects directory
cd ~/Personal_Projects

# Create PersonalOS directory (if starting fresh)
mkdir PersonalOS
cd PersonalOS

# Initialize git repository
git init

# Set up .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
target/

# Build output
dist/
build/
src-tauri/target/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Env files
.env
.env.local

# Logs
*.log
npm-debug.log*

# Database
*.db
*.db-shm
*.db-wal

# User data (for testing)
test-vault/
EOF
```

### 6. Initialize Tauri Project

```bash
# Create a new Tauri app (choose options as shown)
npm create tauri-app@latest

# When prompted:
# Project name: personal-os
# Choose framework: React
# Add TypeScript: Yes
# Choose variant: TypeScript

# This creates the project structure
cd personal-os
```

**Alternative** (if already have project structure):

```bash
# Just install dependencies
npm install
```

### 7. Install Project Dependencies

```bash
# Install npm dependencies
npm install

# Install additional dependencies we'll need
npm install @codemirror/lang-markdown @codemirror/theme-one-dark
npm install lucide-react
npm install zustand  # For state management

# Install dev dependencies
npm install -D @types/node
npm install -D tailwindcss postcss autoprefixer
```

### 8. Initialize Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p

# This creates tailwind.config.js and postcss.config.js
```

Configure `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 9. Configure TypeScript

Ensure `tsconfig.json` has strict mode:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 10. Verify Installation

```bash
# Test development build
npm run tauri dev
```

**Expected result**:
- Vite dev server starts on port 3000
- Rust backend compiles (may take a few minutes first time)
- Tauri window opens showing the app

**If it works**: ✅ Development environment ready!

## Development Workflow

### Running the App

```bash
# Development mode (hot reload)
npm run tauri dev

# The app will:
# 1. Start Vite dev server
# 2. Compile Rust backend
# 3. Open application window
# 4. Auto-reload on file changes
```

### Building for Production

```bash
# Create production build
npm run tauri build

# Output will be in: src-tauri/target/release/bundle/
# - Linux: .deb, .AppImage
# - macOS: .dmg, .app
# - Windows: .msi, .exe
```

### Running Tests

```bash
# Frontend tests (once configured)
npm test

# Rust tests
cd src-tauri
cargo test
```

## IDE Setup

### Recommended: VSCode / Cursor

#### Required Extensions

```bash
# Install these extensions:
# - rust-analyzer (for Rust support)
# - Tauri (for Tauri support)
# - ESLint (for JavaScript/TypeScript linting)
# - Prettier (for code formatting)
# - Tailwind CSS IntelliSense (for Tailwind support)
```

#### VSCode Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "rust-analyzer.checkOnSave.command": "clippy",
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["className:\\s*[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```

### Alternative: Any Text Editor

Minimum requirements:
- TypeScript language support
- Rust syntax highlighting
- Terminal access

## Troubleshooting

### Rust not found

```bash
# Add to PATH
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Tauri dependency errors (Linux)

```bash
# Install missing webkit/gtk dependencies
sudo apt install -y libwebkit2gtk-4.0-dev libgtk-3-dev
```

### npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Rust compilation errors

```bash
# Update Rust to latest
rustup update

# Clean and rebuild
cd src-tauri
cargo clean
cargo build
```

### "tauri" command not found

```bash
# Reinstall Tauri CLI
cargo install tauri-cli --force

# Verify cargo bin is in PATH
echo $PATH | grep .cargo/bin
```

### Port 3000 already in use

```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts:
# server: { port: 3001 }
```

## Performance Optimization

### Faster Rust Compilation

Add to `~/.cargo/config.toml`:

```toml
[build]
jobs = 8  # Adjust based on CPU cores

[target.x86_64-unknown-linux-gnu]
linker = "clang"
rustflags = ["-C", "link-arg=-fuse-ld=lld"]
```

Install dependencies:

```bash
# Linux
sudo apt install -y clang lld
```

### Faster npm installs

```bash
# Use pnpm instead of npm (optional)
npm install -g pnpm
pnpm install  # Instead of npm install
```

## Environment Variables

Create `.env` file (for development only, not committed):

```bash
# .env
VITE_DEV_MODE=true
TAURI_DEBUG=true
```

## Next Steps

After setup is complete:

1. ✅ Verify `npm run tauri dev` works
2. ✅ Read TechnologyStack.md for architecture overview
3. ✅ Read CodingStandards.md for code guidelines
4. ✅ Start with Phase 1 tasks in DevelopmentRoadmap.md

## Setup Verification Checklist

- [ ] Rust installed and in PATH
- [ ] Node.js and npm installed
- [ ] Tauri CLI installed
- [ ] Project dependencies installed
- [ ] `npm run tauri dev` works
- [ ] Can see Tauri window open
- [ ] Hot reload works (change frontend code, see update)
- [ ] No console errors
- [ ] IDE setup complete

## Getting Help

If stuck:
1. Check Tauri documentation: https://tauri.app
2. Check Rust documentation: https://doc.rust-lang.org
3. Review error messages carefully
4. Search GitHub issues
5. Ask in Tauri Discord

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial setup guide | Kris |



