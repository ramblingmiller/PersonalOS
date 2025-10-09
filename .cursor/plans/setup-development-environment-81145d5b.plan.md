<!-- 81145d5b-ce17-44b3-b219-929d12ef2140 d6e4b59b-1610-47ba-ad88-6b24d4d04d48 -->
# PersonalOS Phase 3 - Navigation & Search Implementation

## Overview

This plan implements Phase 3 of the PersonalOS roadmap, adding powerful navigation and search capabilities including wikilink support, fuzzy file search, content search, and a command palette.

## Phase 2 Status

✅ **Phase 2 Complete** - Markdown editor fully working:

- CodeMirror 6 editor with syntax highlighting
- Save functionality (Ctrl+S)
- Unsaved changes tracking
- Professional menu system
- Working dark mode
- File and folder creation

## Phase 3 Goals

1. Parse and navigate wikilinks `[[Note Name]]`
2. Implement fuzzy file search
3. Add full-text content search
4. Create command palette (Ctrl+P)
5. Add navigation history (back/forward)
6. SQLite indexing for fast search

## Backend Implementation (Rust)

### 1. SQLite Database Setup

**Create `src-tauri/src/services/mod.rs`:**

- Module declarations

**Create `src-tauri/src/services/index_service.rs`:**

- Initialize SQLite database
- Create tables for file indexing
- FTS5 (Full-Text Search) tables for content search

**Database Schema:**

```sql
-- Files table
CREATE TABLE files (
    id INTEGER PRIMARY KEY,
    path TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    modified INTEGER,
    created INTEGER
);

-- Full-text search index
CREATE VIRTUAL TABLE files_fts USING fts5(
    path, title, content,
    content='files',
    content_rowid='id'
);
```

**Add dependency:**

- `rusqlite = { version = "0.31", features = ["bundled"] }`

### 2. Indexing Commands

**Create commands in `src-tauri/src/commands/search.rs`:**

**Command: `init_index`**

- Initialize SQLite database
- Create tables if not exist
- Return database path

**Command: `index_directory`**

- Scan directory recursively for .md files
- Extract frontmatter title if present
- Insert/update files in database
- Update FTS index

**Command: `search_files`**

- Input: query string
- Fuzzy search on file names and titles
- Return ranked results (path, title, score)
- Limit: 50 results

**Command: `search_content`**

- Input: query string
- Full-text search using FTS5
- Return results with context snippets
- Limit: 50 results

**Command: `resolve_wikilink`**

- Input: wikilink text, current directory
- Search for matching file by title or name
- Return full path if found, None otherwise

### 3. Navigation History Commands

**Command: `get_backlinks`**

- Input: file path
- Search all files for links to this file
- Return list of files that link here

### 4. Register All Commands

Update `src-tauri/src/lib.rs` to register search module and commands.

## Frontend Implementation (React + TypeScript)

### 1. Wikilink Support in Editor

**Create `src/utils/wikilink.ts`:**

- Regex: `/\[\[([^\]]+)\]\]/g`
- Parse wikilinks from content
- Extract target and optional alias
- Support `[[Target]]` and `[[Target|Alias]]`

**Extend `src/components/editor/MarkdownEditor.tsx`:**

- Add CodeMirror decoration for wikilinks
- Style wikilinks (blue, underlined, clickable)
- Handle Ctrl+Click on wikilinks
- Resolve and navigate to target file

**Create wikilink extension:**

```typescript
// Custom CodeMirror extension to handle wikilinks
const wikilinkExtension = ViewPlugin.fromClass(class {
  // Detect wikilinks
  // Add decorations
  // Handle click events
});
```

### 2. Search Service

**Create `src/services/searchService.ts`:**

- `initIndex(): Promise<void>` - Initialize database
- `indexDirectory(path: string): Promise<void>` - Index files
- `searchFiles(query: string): Promise<FileMatch[]>` - File search
- `searchContent(query: string): Promise<ContentMatch[]>` - Content search
- `resolveWikilink(link: string, currentDir: string): Promise<string | null>`

**TypeScript types in `src/types/search.ts`:**

```typescript
interface FileMatch {
  path: string;
  title: string | null;
  score: number;
}

interface ContentMatch {
  path: string;
  title: string | null;
  snippet: string;
  matches: number;
}
```

### 3. Command Palette

**Create `src/components/common/CommandPalette.tsx`:**

- Modal overlay (centered, blur background)
- Search input at top
- Results list below (scrollable)
- Keyboard navigation (arrow keys)
- Execute on Enter
- Close on Escape
- Two modes:
  - **Ctrl+P**: File search mode
  - **Ctrl+Shift+P**: Command search mode

**Features:**

- Fuzzy matching using simple algorithm
- Show recent files at top
- Icons for file types and commands
- Highlight matching characters
- Show file paths for disambiguation

**Commands list:**

```typescript
const commands = [
  { id: 'file.new', label: 'New File', icon: FilePlus, action: createNewFile },
  { id: 'file.new-folder', label: 'New Folder', icon: FolderPlus, action: createNewFolder },
  { id: 'file.save', label: 'Save File', icon: Save, action: saveFile },
  { id: 'view.toggle-sidebar', label: 'Toggle Sidebar', icon: PanelLeft },
  { id: 'view.toggle-theme', label: 'Toggle Dark Mode', icon: Moon },
  // ... more commands
];
```

### 4. Search UI

**Create `src/components/search/SearchPanel.tsx`:**

- Toggle with Ctrl+Shift+F
- Two tabs: Files / Content
- Search input
- Results list
- Click to open file
- Highlight search terms in results

### 5. Navigation History

**Create `src/stores/navigationStore.ts`:**

```typescript
interface NavigationStore {
  history: string[];  // File paths
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  pushHistory: (path: string) => void;
}
```

**Add to AppLayout:**

- Back/Forward buttons in header (or toolbar)
- Keyboard shortcuts: Alt+Left (back), Alt+Right (forward)
- Disable buttons when at beginning/end of history

### 6. State Management Updates

**Extend `src/stores/fileStore.ts`:**

- Add `recentFiles: string[]` - Track recently opened files
- Add method to update recent files
- Limit to 10 most recent

### 7. Keyboard Shortcuts

**New shortcuts to implement:**

- **Ctrl+P**: Open command palette (file search mode)
- **Ctrl+Shift+P**: Open command palette (command mode)
- **Ctrl+Shift+F**: Open search panel
- **Alt+Left**: Navigate back
- **Alt+Right**: Navigate forward
- **Ctrl+Click**: Follow wikilink

## UI/UX Design

### Command Palette Design

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ > search files or commands...                 │ │
│  ├───────────────────────────────────────────────┤ │
│  │ 📄 README.md                     ~/Projects/  │ │
│  │ 📄 notes.md                      ~/Projects/  │ │
│  │ 📁 New Folder                                 │ │
│  │ 💾 Save File                        Ctrl+S    │ │
│  │ 🌙 Toggle Dark Mode                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Semi-transparent dark overlay
- Centered modal (max-width: 600px)
- Search input with focus
- Results scroll if > 10 items
- Fuzzy match highlighting

### Navigation History UI

Add to menu bar or create toolbar:

- **◀ Back** button (grayed when can't go back)
- **▶ Forward** button (grayed when can't go forward)
- Show tooltip with previous/next file name

### Wikilink Styling

In editor:

- Color: Blue (#3b82f6)
- Underline: Dashed
- Cursor: Pointer on hover
- Ctrl+Hover: Show file preview tooltip (optional)
- Non-existent: Red color

## Implementation Order

### Step 1: SQLite Setup (45 min)

1. Add rusqlite dependency
2. Create index_service module
3. Initialize database
4. Create tables and FTS index
5. Test database creation

### Step 2: Backend Search Commands (60 min)

1. Implement search_files command
2. Implement search_content command
3. Implement resolve_wikilink command
4. Implement index_directory command
5. Register all commands

### Step 3: Frontend Search Service (20 min)

1. Create search types
2. Create searchService
3. Wrap Tauri commands
4. Add error handling

### Step 4: Command Palette (90 min)

1. Create CommandPalette component
2. Implement fuzzy matching
3. Add keyboard navigation
4. Wire up file search
5. Wire up command search
6. Add Ctrl+P keyboard shortcut
7. Style and polish

### Step 5: Wikilink Support (60 min)

1. Create wikilink utilities
2. Add CodeMirror wikilink extension
3. Style wikilinks
4. Handle Ctrl+Click navigation
5. Resolve wikilink to file path
6. Navigate to target file

### Step 6: Navigation History (30 min)

1. Create navigationStore
2. Track file navigation
3. Implement back/forward
4. Add UI buttons
5. Add keyboard shortcuts

### Step 7: Search Panel (45 min)

1. Create SearchPanel component
2. Add tabs for files/content
3. Display results
4. Handle result clicks
5. Add Ctrl+Shift+F shortcut

### Step 8: Integration & Testing (60 min)

1. Index files on app startup
2. Test all search functionality
3. Test wikilink navigation
4. Test command palette
5. Test navigation history
6. Fix bugs and polish

### Step 9: Documentation (15 min)

1. Update ImplementationLog.md
2. Commit changes
3. Push to GitHub

**Total Estimated Time**: 6-7 hours

## Success Criteria

- ✅ Wikilinks are clickable and navigate correctly
- ✅ Command palette opens with Ctrl+P
- ✅ File search is fast and accurate
- ✅ Content search finds text in files
- ✅ Fuzzy matching works ("pso" → "PersonalOS")
- ✅ Navigation history allows back/forward
- ✅ All features work together seamlessly
- ✅ Search performance < 1 second for 1000+ files

## Files to Create/Modify

### Backend (Rust)

- `src-tauri/Cargo.toml` - Add rusqlite dependency
- `src-tauri/src/services/mod.rs` - NEW: Module declarations
- `src-tauri/src/services/index_service.rs` - NEW: SQLite database management
- `src-tauri/src/commands/mod.rs` - Add search module
- `src-tauri/src/commands/search.rs` - NEW: Search commands
- `src-tauri/src/models/mod.rs` - Add search models
- `src-tauri/src/models/search.rs` - NEW: Search result models
- `src-tauri/src/lib.rs` - Register search commands

### Frontend (TypeScript/React)

- `src/types/search.ts` - NEW: Search TypeScript types
- `src/services/searchService.ts` - NEW: Search service layer
- `src/stores/navigationStore.ts` - NEW: Navigation history state
- `src/utils/wikilink.ts` - NEW: Wikilink parsing utilities
- `src/utils/fuzzy.ts` - NEW: Fuzzy matching algorithm
- `src/components/common/CommandPalette.tsx` - NEW: Command palette
- `src/components/search/SearchPanel.tsx` - NEW: Search UI
- `src/components/editor/MarkdownEditor.tsx` - EXTEND: Wikilink support
- `src/components/layout/AppLayout.tsx` - ADD: Navigation buttons, shortcuts
- `src/stores/fileStore.ts` - EXTEND: Recent files tracking
- `src/App.tsx` - ADD: Initialize index on startup

### Documentation

- `05_Implementation/ImplementationLog.md` - Log Phase 3 progress

## Technical Details

### Fuzzy Matching Algorithm

Simple but effective approach:

```typescript
function fuzzyMatch(query: string, target: string): number {
  query = query.toLowerCase();
  target = target.toLowerCase();
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      score += (target.length - i);  // Earlier matches score higher
      queryIndex++;
    }
  }
  
  return queryIndex === query.length ? score : 0;
}
```

### Wikilink Resolution Strategy

1. Check if file exists with exact name match
2. Check frontmatter title matches
3. Fuzzy search if no exact match
4. Prompt to create if no match found

### Performance Optimization

- Index files asynchronously on startup
- Debounce search input (300ms)
- Limit results to 50 items
- Use SQLite FTS5 for fast content search
- Cache recent search results

## Security Considerations

1. **SQL Injection**: Use parameterized queries
2. **Path Validation**: Validate resolved wikilink paths
3. **Index Size**: Limit indexed content per file
4. **Database Location**: Store in app data directory

## Testing Checklist

- [ ] SQLite database initializes correctly
- [ ] Files are indexed on startup
- [ ] File search finds files by name
- [ ] File search supports fuzzy matching
- [ ] Content search finds text in files
- [ ] Search results show context snippets
- [ ] Wikilinks are highlighted in editor
- [ ] Ctrl+Click on wikilink navigates
- [ ] Non-existent wikilinks show differently
- [ ] Command palette opens with Ctrl+P
- [ ] Command palette filters as you type
- [ ] Keyboard navigation works in palette
- [ ] Recent files show at top of palette
- [ ] Back button navigates to previous file
- [ ] Forward button navigates to next file
- [ ] Navigation history tracks correctly
- [ ] All shortcuts work (Ctrl+P, Alt+Left/Right)
- [ ] Performance is acceptable

## Next Phase Preview

After Phase 3, Phase 4 will add:

- AI chat panel integration
- OpenAI and Anthropic API support
- Streaming responses
- Context sharing with AI
- Secure API key storage

Phase 3 transforms PersonalOS into a true knowledge management system with powerful navigation and discovery!

### To-dos

- [ ] Add rusqlite dependency and create database schema
- [ ] Create index_service for SQLite database management
- [ ] Implement search commands (search_files, search_content, resolve_wikilink)
- [ ] Register search commands and initialize database
- [ ] Create TypeScript types for search results
- [ ] Create search service layer wrapping Tauri commands
- [ ] Implement fuzzy matching algorithm
- [ ] Create wikilink parsing utilities
- [ ] Add wikilink highlighting and navigation to CodeMirror
- [ ] Create CommandPalette component with file and command search
- [ ] Create navigation history store with back/forward
- [ ] Add back/forward buttons and keyboard shortcuts
- [ ] Create SearchPanel component for content search
- [ ] Initialize indexing on startup and wire up all search features
- [ ] Test all navigation and search features
- [ ] Update ImplementationLog.md with Phase 3 completion