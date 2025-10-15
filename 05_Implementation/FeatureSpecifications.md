---
title: PersonalOS Feature Specifications
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, features, specifications]
---

# PersonalOS Feature Specifications

## Overview

Detailed specifications for each major feature of PersonalOS.

## Feature 1: File System Browser

### Description
A sidebar showing the file tree of the selected vault directory.

### User Stories
- As a user, I want to see all files in my vault so I can navigate my notes
- As a user, I want to create new files and folders to organize my content

### Functional Requirements
1. Display hierarchical file tree
2. Show folders (collapsible) and files
3. Support right-click context menu
4. Refresh when files change externally
5. Filter to show only .md files (configurable)

### Technical Implementation
**Backend Commands**:
```rust
#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<FileEntry>, String>

#[tauri::command]
async fn create_file(path: String) -> Result<(), String>

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String>
```

**Frontend Component**:
```typescript
interface FileTreeProps {
  rootPath: string;
  onFileSelect: (path: string) => void;
}
```

### Acceptance Criteria
- [ ] Can see all .md files in vault
- [ ] Can expand/collapse folders
- [ ] Can right-click for context menu
- [ ] Can create new file with Ctrl+N
- [ ] Updates when files change externally

---

## Feature 2: Markdown Editor

### Description
A full-featured markdown editor with syntax highlighting and live editing.

### User Stories
- As a user, I want to edit markdown files with syntax highlighting
- As a user, I want my changes to auto-save so I don't lose work

### Functional Requirements
1. Syntax highlighting for markdown
2. YAML frontmatter support
3. Auto-save every 30 seconds
4. Manual save with Ctrl+S
5. Unsaved changes indicator
6. Line numbers (toggleable)
7. Word wrap (toggleable)

### Technical Implementation
**Backend Commands**:
```rust
#[tauri::command]
async fn read_file(path: String) -> Result<String, String>

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String>
```

**Frontend**:
```typescript
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';

const editor = new EditorView({
  doc: fileContent,
  extensions: [basicSetup, markdown()],
  parent: editorElement,
});
```

### Acceptance Criteria
- [ ] Can edit markdown files
- [ ] Syntax highlighting works
- [ ] Can save with Ctrl+S
- [ ] Auto-saves every 30 seconds
- [ ] Shows dot indicator when unsaved
- [ ] Frontmatter has different styling

---

## Feature 3: Wikilink Navigation

### Description
Parse `[[wikilinks]]` in markdown and make them clickable for navigation.

### User Stories
- As a user, I want to link notes together using `[[Note Name]]`
- As a user, I want to click links to navigate between notes

### Functional Requirements
1. Parse `[[Note Name]]` syntax
2. Make wikilinks clickable (Ctrl+Click)
3. Support aliases: `[[Note|Display Text]]`
4. Highlight non-existent links differently
5. Offer to create note if link target doesn't exist

### Technical Implementation
**Parsing**:
```typescript
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

function parseWikilinks(content: string): Wikilink[] {
  const links: Wikilink[] = [];
  let match;
  
  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    const [full, inner] = match;
    const [target, alias] = inner.split('|');
    links.push({
      target: target.trim(),
      alias: alias?.trim(),
      position: match.index,
    });
  }
  
  return links;
}
```

**Backend**:
```rust
#[tauri::command]
async fn resolve_wikilink(link: String, vault_root: String) -> Result<Option<String>, String> {
    // Search for file matching link
    // Return full path if found, None if not
}
```

### Acceptance Criteria
- [ ] Wikilinks are highlighted
- [ ] Ctrl+Click opens target file
- [ ] Non-existent links shown with different color
- [ ] Prompt to create file if link doesn't exist
- [ ] Aliases work correctly

---

## Feature 4: File & Content Search

### Description
Fast search across file names and content.

### User Stories
- As a user, I want to quickly find files by name
- As a user, I want to search within file contents

### Functional Requirements
1. File name search (fuzzy matching)
2. Full-text content search
3. Real-time results as user types
4. Show context around matches
5. Fast (<1 second for 10,000 files)

### Technical Implementation
**Backend (SQLite)**:
```sql
-- File name search
SELECT path, title FROM files 
WHERE path LIKE '%' || ? || '%' 
OR title LIKE '%' || ? || '%'
LIMIT 50;

-- Content search (FTS)
SELECT path, snippet(files_fts, 2, '<mark>', '</mark>', '...', 32) 
FROM files_fts 
WHERE files_fts MATCH ?
LIMIT 50;
```

**Commands**:
```rust
#[tauri::command]
async fn search_files(query: String) -> Result<Vec<FileMatch>, String>

#[tauri::command]
async fn search_content(query: String) -> Result<Vec<ContentMatch>, String>
```

### Acceptance Criteria
- [ ] Can search file names
- [ ] Fuzzy matching works (e.g., "pso" finds "PersonalOS")
- [ ] Can search content
- [ ] Results show context
- [ ] Fast (<1s for large vaults)
- [ ] Results update as user types

---

## Feature 5: AI Chat Panel

### Description
Sidebar panel for chatting with AI assistant.

### User Stories
- As a user, I want to ask AI questions about my notes
- As a user, I want AI to have context of my current file

### Functional Requirements
1. Chat interface with message history
2. Send current file as context
3. Streaming responses
4. API key configuration
5. Support multiple providers (OpenAI, Anthropic)

### Technical Implementation
**Backend**:
```rust
#[tauri::command]
async fn ai_chat(
    message: String,
    context: Vec<String>,
    provider: String,
    api_key: String,
) -> Result<String, String> {
    // Call AI API with message and context
    // Return response
}

#[tauri::command]
async fn ai_chat_stream(
    message: String,
    context: Vec<String>,
) -> Result<(), String> {
    // Stream response using events
    // emit("ai-chunk", chunk) for each piece
}
```

**Frontend**:
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
}
```

### Acceptance Criteria
- [ ] Can send messages to AI
- [ ] Responses stream in
- [ ] Can send current file as context
- [ ] API key stored securely
- [ ] Support OpenAI and Anthropic
- [ ] Error handling for API failures

---

## Feature 6: Command Palette

### Description
Quick access to all commands and file search.

### User Stories
- As a user, I want to quickly access any command
- As a user, I want to search files without using the mouse

### Functional Requirements
1. Show on Ctrl+P (files) or Ctrl+Shift+P (commands)
2. Fuzzy matching
3. Recent files at top
4. Keyboard navigation
5. Close on Esc or click outside

### Technical Implementation
**Frontend**:
```typescript
interface Command {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

const commands: Command[] = [
  {
    id: 'file.new',
    label: 'New File',
    icon: <FileIcon />,
    action: () => createNewFile(),
    keywords: ['create', 'new'],
  },
  // ... more commands
];
```

### Acceptance Criteria
- [ ] Opens with Ctrl+P
- [ ] Shows recent files
- [ ] Fuzzy search works
- [ ] Keyboard navigation works
- [ ] Closes on Esc
- [ ] Executes command on Enter

---

## Feature 7: Settings Panel

### Description
UI for configuring application settings.

### User Stories
- As a user, I want to configure my API keys
- As a user, I want to customize the appearance

### Functional Requirements
1. General settings (vault path, theme)
2. Editor settings (font size, line numbers, word wrap)
3. AI settings (provider, API key)
4. Keyboard shortcuts (Phase 2)

### Technical Implementation
**Backend**:
```rust
#[derive(Serialize, Deserialize)]
struct AppConfig {
    vault_path: Option<PathBuf>,
    theme: Theme,
    editor: EditorConfig,
    ai: AIConfig,
}

#[tauri::command]
async fn get_config() -> Result<AppConfig, String>

#[tauri::command]
async fn set_config(config: AppConfig) -> Result<(), String>
```

### Acceptance Criteria
- [ ] Can change vault path
- [ ] Can toggle dark/light theme
- [ ] Can configure editor settings
- [ ] Can set API key
- [ ] Settings persist across restarts

---

## Future Features (Phase 6+)

### Dataview Queries
```markdown
```dataview
TABLE created, status
FROM #project
WHERE status = "active"
SORT created DESC
```
```

### Task Management
- Aggregate all tasks from vault
- Filter by status, due date
- Quick add/complete tasks

### Daily Notes
- Auto-create note for today
- Template support
- Calendar view

### Backlinks Panel
- Show all files linking to current file
- Clickable navigation
- Update in real-time

### Graph View
- Interactive visualization of notes
- Filter by tags
- Navigate from graph

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial feature specifications | Kris |





