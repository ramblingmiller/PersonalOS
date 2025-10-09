---
title: PersonalOS Technical Architecture
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, architecture, technical]
---

# PersonalOS Technical Architecture

## Architecture Overview

PersonalOS follows a **layered architecture** with clear separation between frontend (UI), backend (Rust), and data layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  (React + TypeScript + CodeMirror + Tailwind CSS)           │
├─────────────────────────────────────────────────────────────┤
│                   Application Logic Layer                    │
│  - State Management (React Context/Zustand)                 │
│  - UI Components                                             │
│  - Event Handlers                                            │
├─────────────────────────────────────────────────────────────┤
│                      IPC Bridge Layer                        │
│  (Tauri Commands - Frontend ↔ Backend Communication)        │
├─────────────────────────────────────────────────────────────┤
│                    Backend Services Layer                    │
│  (Rust)                                                      │
│  - File System Service                                       │
│  - Search & Index Service                                    │
│  - AI Integration Service                                    │
│  - Configuration Service                                     │
├─────────────────────────────────────────────────────────────┤
│                        Data Layer                            │
│  - File System (Markdown files)                             │
│  - SQLite Index (search, backlinks, metadata)               │
│  - Config File (settings, API keys)                         │
└─────────────────────────────────────────────────────────────┘
```

## System Components

### 1. Frontend Layer (React + TypeScript)

#### 1.1 Core Components

**Main Layout**
- `App.tsx`: Root component, main layout orchestration
- `Sidebar.tsx`: File tree and navigation
- `EditorPane.tsx`: Main content area with tabs
- `ChatPanel.tsx`: AI assistant interface (collapsible)
- `CommandPalette.tsx`: Quick actions and search
- `StatusBar.tsx`: Bottom status information

**Editor Components**
- `MarkdownEditor.tsx`: CodeMirror wrapper
- `EditorToolbar.tsx`: Format actions
- `WikilinkNavigator.tsx`: Wikilink detection and navigation
- `FrontmatterParser.tsx`: YAML frontmatter handling

**File Management**
- `FileTree.tsx`: Recursive file/folder display
- `FileContextMenu.tsx`: Right-click actions
- `FileSearch.tsx`: File name search
- `ContentSearch.tsx`: Full-text search

**AI Components**
- `ChatInterface.tsx`: Message input/display
- `ConversationHistory.tsx`: Chat history
- `ContextSelector.tsx`: Choose files to send to AI
- `AISettings.tsx`: API key configuration

#### 1.2 State Management

**Global State** (React Context or Zustand):
- `FileSystemContext`: Current vault, open files, file tree state
- `EditorContext`: Active editor, cursor position, selections
- `AIContext`: Chat history, API configuration
- `SettingsContext`: User preferences, theme

**Local State**:
- Component-level state using `useState` for UI interactions
- Form state for settings and dialogs

#### 1.3 Frontend Services

```typescript
// Frontend utility services
interface FileService {
  openFile(path: string): Promise<string>;
  saveFile(path: string, content: string): Promise<void>;
  createFile(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}

interface SearchService {
  searchFiles(query: string): Promise<SearchResult[]>;
  searchContent(query: string): Promise<ContentResult[]>;
}

interface AIService {
  sendMessage(message: string, context: FileContext[]): Promise<string>;
  streamResponse(message: string): AsyncIterator<string>;
}
```

### 2. IPC Bridge Layer (Tauri Commands)

Tauri provides secure IPC between frontend (JavaScript) and backend (Rust).

#### 2.1 Command Interface

```rust
// Backend Rust commands exposed to frontend
#[tauri::command]
async fn read_file(path: String) -> Result<String, String>

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String>

#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<FileEntry>, String>

#[tauri::command]
async fn search_files(query: String, root: String) -> Result<Vec<FileMatch>, String>

#[tauri::command]
async fn search_content(query: String) -> Result<Vec<ContentMatch>, String>

#[tauri::command]
async fn get_file_metadata(path: String) -> Result<FileMetadata, String>

#[tauri::command]
async fn ai_chat(message: String, context: Vec<String>) -> Result<String, String>
```

#### 2.2 Event System

```rust
// Backend → Frontend events
emit("file-changed", { path: "/path/to/file.md" })
emit("index-updated", { total_files: 1234 })
emit("ai-response-chunk", { chunk: "..." })
```

### 3. Backend Layer (Rust)

#### 3.1 File System Service

**Responsibilities**:
- Read/write files securely
- Directory traversal
- File watching for external changes
- Validation and error handling

```rust
pub struct FileSystemService {
    vault_root: PathBuf,
    watcher: Option<RecommendedWatcher>,
}

impl FileSystemService {
    pub fn read_file(&self, path: &Path) -> Result<String>;
    pub fn write_file(&self, path: &Path, content: &str) -> Result<()>;
    pub fn list_dir(&self, path: &Path) -> Result<Vec<DirEntry>>;
    pub fn watch_directory(&mut self) -> Result<()>;
}
```

#### 3.2 Index Service

**Responsibilities**:
- Maintain SQLite index of files
- Extract metadata (frontmatter, tags, links)
- Provide fast search
- Track backlinks

```rust
pub struct IndexService {
    db: Connection,
}

impl IndexService {
    pub fn index_file(&self, path: &Path) -> Result<()>;
    pub fn search_files(&self, query: &str) -> Result<Vec<FileMatch>>;
    pub fn search_content(&self, query: &str) -> Result<Vec<ContentMatch>>;
    pub fn get_backlinks(&self, file: &str) -> Result<Vec<String>>;
}
```

**Database Schema** (SQLite):
```sql
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    path TEXT UNIQUE NOT NULL,
    title TEXT,
    modified_time INTEGER,
    created_time INTEGER,
    size INTEGER,
    content_hash TEXT
);

CREATE TABLE metadata (
    file_id INTEGER,
    key TEXT,
    value TEXT,
    FOREIGN KEY(file_id) REFERENCES files(id)
);

CREATE TABLE tags (
    file_id INTEGER,
    tag TEXT,
    FOREIGN KEY(file_id) REFERENCES files(id)
);

CREATE TABLE links (
    source_file_id INTEGER,
    target_path TEXT,
    link_type TEXT, -- 'wikilink', 'markdown', etc.
    FOREIGN KEY(source_file_id) REFERENCES files(id)
);

-- Full-text search
CREATE VIRTUAL TABLE files_fts USING fts5(
    path,
    title,
    content
);
```

#### 3.3 AI Integration Service

**Responsibilities**:
- Manage API connections
- Send requests with context
- Stream responses
- Handle rate limits and errors

```rust
pub struct AIService {
    provider: AIProvider,
    api_key: String,
}

pub enum AIProvider {
    OpenAI,
    Anthropic,
    Custom(String),
}

impl AIService {
    pub async fn send_message(
        &self,
        message: &str,
        context: Vec<String>
    ) -> Result<String>;
    
    pub async fn stream_response(
        &self,
        message: &str
    ) -> impl Stream<Item = Result<String>>;
}
```

#### 3.4 Configuration Service

**Responsibilities**:
- Store/retrieve settings
- Encrypt sensitive data (API keys)
- Manage vault configuration

```rust
pub struct ConfigService {
    config_path: PathBuf,
}

#[derive(Serialize, Deserialize)]
pub struct AppConfig {
    pub vault_path: Option<PathBuf>,
    pub theme: Theme,
    pub ai_provider: Option<AIProvider>,
    pub recent_files: Vec<PathBuf>,
    pub window_state: WindowState,
}
```

### 4. Data Layer

#### 4.1 File System
- **Primary storage**: Plain markdown files
- **Location**: User-selected vault directory
- **Format**: UTF-8 encoded `.md` files
- **Structure**: User-defined, arbitrary hierarchy

#### 4.2 Index Database
- **Purpose**: Fast search and queries
- **Technology**: SQLite
- **Location**: `~/.config/personalos/index.db` (Linux)
- **Sync**: Rebuilt if out of date

#### 4.3 Configuration
- **Location**: `~/.config/personalos/config.json`
- **Sensitive data**: Encrypted using OS keyring
- **Format**: JSON

## Data Flow Examples

### Opening a File

```
User clicks file in tree
    ↓
FileTree.tsx triggers openFile()
    ↓
Calls Tauri command: invoke('read_file', { path })
    ↓
Rust FileSystemService.read_file()
    ↓
Returns file content
    ↓
Frontend updates EditorContext state
    ↓
MarkdownEditor displays content
```

### Searching Content

```
User types in search box
    ↓
SearchInput.tsx debounces input
    ↓
Calls Tauri command: invoke('search_content', { query })
    ↓
Rust IndexService.search_content()
    ↓
SQLite FTS query
    ↓
Returns results with context
    ↓
Frontend displays in SearchResults.tsx
```

### AI Chat

```
User sends message to AI
    ↓
ChatInterface.tsx calls sendMessage()
    ↓
Gathers context (current file, selected files)
    ↓
Calls Tauri command: invoke('ai_chat', { message, context })
    ↓
Rust AIService.send_message()
    ↓
HTTP request to AI API (OpenAI/Anthropic)
    ↓
Stream response chunks
    ↓
Emit events to frontend
    ↓
Frontend displays streaming response
```

## Security Considerations

### File System Access
- **Principle**: Least privilege
- **Implementation**: Tauri's permission system
- **Restrictions**: Only vault directory accessible by default
- **User confirmation**: Required for actions outside vault

### API Keys
- **Storage**: Encrypted at rest using OS keyring
- **Transmission**: HTTPS only
- **Access**: Never logged, never sent except to chosen AI provider

### IPC Security
- **Validation**: All inputs validated in Rust backend
- **Injection**: Protected against path traversal attacks
- **Errors**: Sanitized before sending to frontend

## Performance Optimization

### Startup Performance
- **Lazy loading**: Load index after UI renders
- **Cache**: Recent files kept in memory
- **Defer**: Non-critical services start after window shown

### Editor Performance
- **Virtual scrolling**: For large files
- **Debouncing**: Save operations debounced (300ms)
- **Incremental parsing**: Only reparse changed sections

### Search Performance
- **Indexing**: Background indexing doesn't block UI
- **Pagination**: Search results paginated
- **Debouncing**: Search queries debounced (150ms)

### Memory Management
- **File limits**: Close files after N tabs open
- **Index size**: Limit indexed file size (1MB per file)
- **AI context**: Truncate context to token limits

## Scalability Considerations

### Large Vaults (10,000+ files)
- **Virtual scrolling**: In file tree
- **Lazy loading**: Folders load on expand
- **Index batching**: Index in chunks of 100 files

### Large Files (1MB+)
- **Streaming**: Load large files in chunks
- **Partial indexing**: Index first/last N characters
- **Warning**: Show warning for files > 5MB

## Error Handling Strategy

### Frontend Errors
- **User-facing**: Toast notifications for transient errors
- **Critical**: Modal dialogs for data loss prevention
- **Logging**: Console errors for debugging

### Backend Errors
- **Result types**: Use Rust's `Result<T, E>` everywhere
- **Graceful degradation**: Fallback behaviors when possible
- **Error reporting**: Structured error messages to frontend

### Data Errors
- **Validation**: Validate before write operations
- **Backups**: Automatic backup before destructive operations
- **Recovery**: Unsaved changes recoverable from temp files

## Technology Decisions Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Desktop Framework | Tauri 2.x | Lightweight, secure, Rust backend |
| Frontend | React 18 + TypeScript | Familiar, large ecosystem, type safety |
| Editor | CodeMirror 6 | Modern, extensible, fast |
| Styling | Tailwind CSS | Utility-first, fast development |
| Backend Language | Rust | Performance, safety, Tauri requirement |
| Database | SQLite | Embedded, fast, SQL, FTS support |
| AI APIs | OpenAI/Anthropic | Industry standard, good docs |
| Build Tool | Vite | Fast HMR, good TypeScript support |
| Package Manager | npm/pnpm | Standard, reliable |

## Deployment Architecture

### Development
```
npm run tauri dev
  ↓
Vite dev server (port 3000)
  ↓
Tauri dev window loads http://localhost:3000
  ↓
Hot module reloading enabled
```

### Production
```
npm run tauri build
  ↓
Vite builds frontend → dist/
  ↓
Tauri bundles app with embedded frontend
  ↓
Platform-specific installer
  - Linux: .deb, .AppImage
  - macOS: .dmg, .app (future)
  - Windows: .msi, .exe (future)
```

## Future Architecture Considerations

### Plugin System (Phase 2)
- **Architecture**: Similar to VSCode extensions
- **API**: Expose subset of commands
- **Isolation**: Plugins run in isolated context
- **Distribution**: Local installation only (security)

### Multi-Vault (Phase 2)
- **Approach**: Multiple database instances
- **UI**: Vault switcher in sidebar
- **State**: Separate state per vault

### Sync (Phase 3+)
- **Git-based**: Optional git integration
- **Conflict resolution**: Manual resolution with UI
- **Cloud agnostic**: Works with any git provider

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial architecture document | Kris |

