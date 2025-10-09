---
title: PersonalOS Project Structure
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, project-structure]
---

# PersonalOS Project Structure

## Directory Layout

```
personal-os/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── WikilinkNavigator.tsx
│   │   ├── sidebar/
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileItem.tsx
│   │   │   └── ContextMenu.tsx
│   │   ├── ai/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ContextSelector.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   └── layout/
│   │       ├── App.tsx
│   │       ├── Sidebar.tsx
│   │       ├── EditorPane.tsx
│   │       └── StatusBar.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useFileSystem.ts
│   │   ├── useEditor.ts
│   │   ├── useSearch.ts
│   │   └── useAI.ts
│   ├── stores/                   # State management (Zustand)
│   │   ├── fileStore.ts
│   │   ├── editorStore.ts
│   │   └── settingsStore.ts
│   ├── services/                 # Business logic
│   │   ├── fileService.ts
│   │   ├── searchService.ts
│   │   └── aiService.ts
│   ├── utils/                    # Utility functions
│   │   ├── markdown.ts
│   │   ├── wikilink.ts
│   │   ├── validation.ts
│   │   └── formatting.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── file.ts
│   │   ├── editor.ts
│   │   └── ai.ts
│   ├── styles/                   # Global styles
│   │   └── index.css
│   ├── main.tsx                  # Entry point
│   └── App.tsx                   # Root component
├── src-tauri/                    # Backend source code (Rust)
│   ├── src/
│   │   ├── commands/             # Tauri command handlers
│   │   │   ├── mod.rs
│   │   │   ├── file.rs          # File operations
│   │   │   ├── search.rs        # Search operations
│   │   │   └── ai.rs            # AI operations
│   │   ├── services/             # Backend services
│   │   │   ├── mod.rs
│   │   │   ├── file_service.rs
│   │   │   ├── index_service.rs
│   │   │   └── ai_service.rs
│   │   ├── models/               # Data models
│   │   │   ├── mod.rs
│   │   │   ├── file.rs
│   │   │   └── config.rs
│   │   ├── utils/                # Utility functions
│   │   │   ├── mod.rs
│   │   │   ├── path.rs
│   │   │   └── crypto.rs
│   │   ├── main.rs               # Entry point
│   │   └── lib.rs                # Library root
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   └── build.rs                  # Build script
├── public/                       # Static assets
│   └── vite.svg
├── tests/                        # Test files
│   ├── unit/
│   └── integration/
├── docs/                         # Documentation (THIS FOLDER)
│   ├── 01_Foundation/
│   ├── 02_Architecture/
│   ├── 03_Design/
│   ├── 04_Development/
│   ├── 05_Implementation/
│   ├── 06_Testing/
│   └── 07_Operations/
├── .vscode/                      # VSCode settings
│   └── settings.json
├── node_modules/                 # npm dependencies (gitignored)
├── target/                       # Rust build output (gitignored)
├── dist/                         # Vite build output (gitignored)
├── .gitignore
├── package.json                  # npm dependencies
├── package-lock.json
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
├── tailwind.config.js            # Tailwind config
├── postcss.config.js             # PostCSS config
├── eslint.config.js              # ESLint config
└── README.md                     # Project readme
```

## File Descriptions

### Frontend Files

#### `src/main.tsx`
Entry point for the React application. Renders the root component.

#### `src/App.tsx`
Root component. Sets up global providers and layout.

#### `src/components/`
Reusable React components organized by feature.

#### `src/hooks/`
Custom React hooks for shared logic.

#### `src/stores/`
Zustand state management stores.

#### `src/services/`
API layer that communicates with Tauri backend.

#### `src/utils/`
Pure utility functions (no side effects).

#### `src/types/`
TypeScript type definitions and interfaces.

### Backend Files

#### `src-tauri/src/main.rs`
Entry point for Tauri application.

#### `src-tauri/src/lib.rs`
Library root, exports all public modules.

#### `src-tauri/src/commands/`
Tauri command handlers (exposed to frontend via IPC).

#### `src-tauri/src/services/`
Backend business logic.

#### `src-tauri/src/models/`
Data structures and models.

### Configuration Files

#### `package.json`
Frontend dependencies and scripts.

#### `Cargo.toml`
Backend (Rust) dependencies.

#### `tauri.conf.json`
Tauri-specific configuration (app name, window settings, permissions).

#### `tsconfig.json`
TypeScript compiler configuration.

#### `vite.config.ts`
Vite bundler configuration.

#### `tailwind.config.js`
Tailwind CSS configuration (colors, spacing, etc.).

## Import Path Conventions

### Frontend

```typescript
// Absolute imports (configured in tsconfig.json)
import { FileTree } from '@/components/sidebar/FileTree';
import { useFileSystem } from '@/hooks/useFileSystem';
import { FileData } from '@/types/file';

// Relative imports for nearby files
import { FileItem } from './FileItem';
import { ContextMenu } from './ContextMenu';
```

### Backend

```rust
// Crate-level imports
use crate::commands::file::read_file;
use crate::services::FileService;
use crate::models::FileData;

// External crate imports
use serde::{Deserialize, Serialize};
use tauri::command;
```

## Module Organization

### Frontend Module Pattern

```typescript
// FileTree/index.ts
export { FileTree } from './FileTree';
export type { FileTreeProps } from './FileTree';

// FileTree/FileTree.tsx
import { FileItem } from './FileItem';

export interface FileTreeProps {
  rootPath: string;
}

export function FileTree({ rootPath }: FileTreeProps) {
  // Implementation
}
```

### Backend Module Pattern

```rust
// services/mod.rs
mod file_service;
mod index_service;

pub use file_service::FileService;
pub use index_service::IndexService;

// services/file_service.rs
use std::fs;
use std::path::Path;

pub struct FileService {
    root: PathBuf,
}

impl FileService {
    pub fn new(root: PathBuf) -> Self {
        Self { root }
    }
    
    pub fn read_file(&self, path: &Path) -> Result<String> {
        fs::read_to_string(path)
            .map_err(|e| e.into())
    }
}
```

## Build Output

### Development
```
dist/                   # Vite output (not committed)
src-tauri/target/debug/ # Rust debug build (not committed)
```

### Production
```
src-tauri/target/release/bundle/
├── deb/                # Linux .deb package
│   └── personal-os_0.1.0_amd64.deb
├── appimage/           # Linux AppImage
│   └── personal-os_0.1.0_amd64.AppImage
├── dmg/                # macOS disk image (future)
└── msi/                # Windows installer (future)
```

## Data Files (Runtime)

```
~/.config/personalos/       # Linux
~/Library/Application Support/personalos/  # macOS

├── config.json             # App configuration
├── index.db                # SQLite database
└── logs/                   # Application logs
    └── app.log
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial project structure | Kris |



