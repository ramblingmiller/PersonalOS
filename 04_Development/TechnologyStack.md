---
title: PersonalOS Technology Stack
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, technology, stack]
---

# PersonalOS Technology Stack

## Overview

This document details every technology used in PersonalOS and the rationale for each choice.

## Core Framework

### Tauri 2.x
**Purpose**: Desktop application framework  
**Why**: Lightweight, secure, Rust-backed, multi-platform  
**Alternatives Considered**: Electron (rejected - too heavy), Neutralino (less mature)

```toml
# Cargo.toml
[dependencies]
tauri = { version = "2.8" }
```

## Frontend Stack

### React 18+
**Purpose**: UI library  
**Why**: Familiar, large ecosystem, excellent TypeScript support  
**Alternatives**: Svelte (smaller bundle), Vue (good middle ground)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### TypeScript 5+
**Purpose**: Type-safe JavaScript  
**Why**: Catch errors at compile-time, better IDE support  
**Configuration**: Strict mode enabled

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Vite
**Purpose**: Build tool and dev server  
**Why**: Fast HMR, excellent TypeScript/React support, modern  
**Alternatives**: Webpack (slower), Create React App (outdated)

```javascript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
  },
});
```

## UI & Styling

### Tailwind CSS 4+
**Purpose**: Utility-first CSS framework  
**Why**: Fast development, consistent design, great documentation  
**Alternatives**: Styled-components, CSS Modules

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
};
```

### CodeMirror 6
**Purpose**: Code/markdown editor  
**Why**: Modern, performant, extensible, used by Obsidian  
**Alternatives**: Monaco (heavier), Ace (older)

```javascript
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
```

### Lucide React
**Purpose**: Icon library  
**Why**: Clean, consistent, tree-shakeable, good React support  
**Alternatives**: React Icons, Heroicons

```jsx
import { File, Folder, Search } from 'lucide-react';
```

## State Management

### Zustand
**Purpose**: Global state management  
**Why**: Simple API, small bundle, no boilerplate  
**Alternatives**: Redux (too complex), Context API (performance concerns)

```typescript
import { create } from 'zustand';

interface AppState {
  currentFile: string | null;
  setCurrentFile: (path: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentFile: null,
  setCurrentFile: (path) => set({ currentFile: path }),
}));
```

## Backend Stack

### Rust 1.70+
**Purpose**: Backend language (Tauri requirement)  
**Why**: Performance, safety, memory efficiency  
**Learning Curve**: Moderate, but worth it

```rust
// src-tauri/src/lib.rs
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path)
        .map_err(|e| e.to_string())
}
```

### Serde
**Purpose**: Serialization/deserialization  
**Why**: Standard Rust serialization library

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct FileData {
    path: String,
    content: String,
}
```

## Data Layer

### SQLite
**Purpose**: Local database for indexing  
**Why**: Embedded, fast, SQL, full-text search support  
**Library**: rusqlite

```rust
use rusqlite::{Connection, Result};

fn init_db() -> Result<Connection> {
    let conn = Connection::open("personalos.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY,
            path TEXT UNIQUE,
            content TEXT
        )",
        [],
    )?;
    Ok(conn)
}
```

### File System
**Purpose**: Primary data storage  
**Format**: Plain markdown (.md) files  
**Encoding**: UTF-8

## AI Integration

### OpenAI API
**Purpose**: AI chat and analysis  
**Models**: GPT-4, GPT-3.5-turbo  
**Client**: reqwest (HTTP client)

```rust
use reqwest::Client;

async fn call_openai(prompt: &str, api_key: &str) -> Result<String> {
    let client = Client::new();
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&json!({
            "model": "gpt-4",
            "messages": [{"role": "user", "content": prompt}]
        }))
        .send()
        .await?;
    // Parse and return response
}
```

### Anthropic API
**Purpose**: Alternative AI provider  
**Models**: Claude 3  
**Support**: Same architecture as OpenAI

## Development Tools

### ESLint
**Purpose**: JavaScript/TypeScript linting  
**Configuration**: Strict rules

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
  ]
}
```

### Prettier
**Purpose**: Code formatting  
**Configuration**: Opinionated defaults

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Clippy
**Purpose**: Rust linting  
**Why**: Catches common Rust mistakes

```bash
cargo clippy -- -D warnings
```

## Testing

### Vitest (Frontend)
**Purpose**: Unit testing for React/TS  
**Why**: Fast, Vite-native, Jest-compatible API

```typescript
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    expect(true).toBe(true);
  });
});
```

### Rust Built-in Tests
**Purpose**: Backend unit tests  
**Why**: Built into Rust, no dependencies needed

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function() {
        assert_eq!(2 + 2, 4);
    }
}
```

## Security

### OS Keyring
**Purpose**: Secure API key storage  
**Library**: keyring-rs

```rust
use keyring::Entry;

fn store_api_key(key: &str) -> Result<()> {
    let entry = Entry::new("PersonalOS", "openai_key")?;
    entry.set_password(key)?;
    Ok(())
}
```

### Crypto (Web Crypto API)
**Purpose**: Encryption (Phase 2)  
**Use**: Vault encryption

## Version Control

### Git
**Purpose**: Source control  
**Workflow**: Feature branches, main branch

```bash
# Standard git workflow
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
```

## Package Management

### Cargo (Rust)
**Purpose**: Rust package manager  
**Lock File**: Cargo.lock (committed)

### npm (JavaScript)
**Purpose**: Node package manager  
**Lock File**: package-lock.json (committed)  
**Alternative**: pnpm (faster, optional)

## Dependencies Matrix

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Core** |
| | Tauri | 2.8+ | Desktop framework |
| | React | 18+ | UI library |
| | TypeScript | 5+ | Type safety |
| | Rust | 1.70+ | Backend language |
| **UI** |
| | Tailwind CSS | 4+ | Styling |
| | CodeMirror | 6+ | Editor |
| | Lucide React | Latest | Icons |
| **State** |
| | Zustand | 4+ | State management |
| **Data** |
| | SQLite | 3+ | Database |
| | rusqlite | 0.29+ | Rust SQLite bindings |
| **AI** |
| | reqwest | 0.11+ | HTTP client |
| **Build** |
| | Vite | 5+ | Build tool |
| | ESLint | 8+ | Linting |
| | Prettier | 3+ | Formatting |
| **Testing** |
| | Vitest | 1+ | Frontend tests |

## Update Strategy

### Major Version Updates
- Review changelog carefully
- Test thoroughly
- Update one dependency at a time

### Security Updates
- Apply immediately
- Use `cargo audit` and `npm audit`

### Dependency Monitoring
```bash
# Check for outdated packages
npm outdated
cargo outdated  # cargo install cargo-outdated

# Update dependencies
npm update
cargo update
```

## Bundle Size Considerations

### Frontend Bundle Target
- **Goal**: < 1 MB gzipped
- **Strategy**: Code splitting, tree shaking, lazy loading

### Backend Binary Target
- **Goal**: < 20 MB
- **Strategy**: Compile with --release, strip symbols

```toml
# Cargo.toml
[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
strip = true
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial technology stack | Kris |

