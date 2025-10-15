---
title: PersonalOS UI/UX Specification
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, design, ui, ux]
---

# PersonalOS UI/UX Specification

## Design Philosophy

**"Calm Productivity"**: An interface that gets out of the way, acting as a trusted assistant rather than a complex machine.

### Core Principles

1. **Minimalist**: Clean, uncluttered interface
2. **Keyboard-First**: All actions accessible via keyboard
3. **Fast**: Instant response, no lag
4. **Contextual**: UI adapts to current task
5. **Distraction-Free**: Focus on content, not chrome

### Inspiration
- **Sublime Text**: Clean, minimal chrome
- **Obsidian**: Wikilink navigation, markdown focus
- **Cursor**: AI integration, command palette
- **NOT**: VSCode's complexity

## Application Layout

###Main Window Structure

```
┌────────────────────────────────────────────────────────────┐
│  Title Bar (optional, OS-dependent)                        │
├──────────┬─────────────────────────────────────────────────┤
│          │  Editor Tabs                                    │
│          ├─────────────────────────────────────────────────┤
│  File    │                                                 │
│  Tree    │  Main Editor Area                               │
│          │  (CodeMirror)                                    │
│  Sidebar │                                                 │
│          │                                                 │
│          │                                                 │
│          │                                                 │
├──────────┼─────────────────────────────────────────────────┤
│          │  Status Bar                                     │
└──────────┴─────────────────────────────────────────────────┘

Optional AI Panel (right sidebar, toggle):
┌────────────────────────────────────────┬──────────────────┐
│  Editor                                │  AI Chat Panel   │
│                                        │                  │
│                                        │                  │
└────────────────────────────────────────┴──────────────────┘
```

### Layout Specifications

**Sidebar (File Tree)**:
- Width: 200-300px (resizable)
- Collapsible: Yes (Ctrl+B to toggle)
- Position: Left (fixed)
- Background: Slightly darker than editor
- Min width: 150px, Max width: 500px

**Editor Area**:
- Width: Flexible (remaining space)
- Tabs: Horizontal, scrollable if many open
- Max visible tabs: 10 (then scroll)

**AI Panel** (optional):
- Width: 300-400px (resizable)
- Collapsible: Yes (Ctrl+Shift+A to toggle)
- Position: Right
- Show/hide: Toggle via command or button

**Status Bar**:
- Height: 24px (fixed)
- Position: Bottom
- Always visible

## Component Specifications

### 1. File Tree Sidebar

**Visual Design**:
```
📁 Projects
  📁 PersonalOS
    📄 README.md
    📄 notes.md
  📁 Novel
    📄 chapter1.md ← (selected, highlighted)
📄 todo.md
```

**Features**:
- **Folder Icons**: 📁 for folders, 📄 for files
- **Indent**: 16px per level
- **Hover**: Subtle background highlight
- **Selected**: Clear background highlight
- **Right-click**: Context menu (New, Rename, Delete)

**Context Menu**:
```
┌─────────────────────┐
│ New File        Ctrl+N   │
│ New Folder             │
│ ───────────────────    │
│ Rename          F2     │
│ Delete          Del    │
│ ───────────────────    │
│ Reveal in File Manager │
│ Copy Path              │
└─────────────────────┘
```

**Interactions**:
- **Single click**: Select file
- **Double click**: Open file in editor
- **Drag**: Reorder/move files (Phase 2)
- **Arrow keys**: Navigate up/down
- **Enter**: Open selected file

### 2. Editor Area

**Tab Bar**:
```
┌──────────────┬──────────────┬──────────────┐
│ README.md ×  │ notes.md ×   │ todo.md • ×  │
└──────────────┴──────────────┴──────────────┘
```

**Tab States**:
- Normal: File name
- Modified: File name + dot (•)
- Active: Highlighted background
- Hover: Subtle highlight
- Close button (×): Appears on hover or always on active tab

**Editor**:
- **Font**: JetBrains Mono or similar monospace
- **Size**: 14px (configurable)
- **Line height**: 1.6
- **Line numbers**: Yes (toggleable)
- **Word wrap**: Yes (toggleable)
- **Cursor**: Block or line (configurable)

**Markdown Syntax**:
```markdown
# Heading 1          ← Larger, bold
## Heading 2         ← Large, bold
**bold text**        ← Bold weight
*italic text*        ← Italic style
[[wikilink]]         ← Blue, underlined, clickable
#tag                 ← Accent color, clickable
- [ ] Task           ← Checkbox visible
```

### 3. Command Palette

**Trigger**: Ctrl+P (file search) or Ctrl+Shift+P (commands)

**Appearance**:
```
┌─────────────────────────────────────────────────┐
│ > Search files or commands...                   │
├─────────────────────────────────────────────────┤
│ 📄 README.md                     /Projects/     │
│ 📄 notes.md                      /Projects/     │
│ 📄 chapter1.md                   /Novel/        │
│ 📄 todo.md                       /              │
│ ──────────────────────────────────────────────  │
│ ⚙️  Open Settings                                │
│ 🎨 Toggle Theme                                  │
│ 🔍 Search in Files                               │
└─────────────────────────────────────────────────┘
```

**Features**:
- **Fuzzy matching**: "pso" finds "PersonalOS"
- **Recent files**: Show at top
- **Commands**: Prefixed with icon
- **Keyboard navigation**: Arrow keys + Enter
- **Close**: Esc or click outside

### 4. AI Chat Panel

**Layout**:
```
┌─────────────────────────────────┐
│  🤖 AI Assistant                 │
├─────────────────────────────────┤
│  💬 Chat                         │
│                                  │
│  You:                            │
│  Summarize this file             │
│                                  │
│  AI:                             │
│  This file discusses...          │
│  [response text]                 │
│                                  │
│                                  │
│                                  │
├─────────────────────────────────┤
│  [Type message...          Send]│
└─────────────────────────────────┘
```

**Features**:
- **Message bubbles**: User on right, AI on left
- **Streaming**: AI responses stream in
- **Context indicator**: Show which files are in context
- **Code blocks**: Syntax highlighted
- **Copy buttons**: On code blocks and responses
- **New conversation**: Button to clear history

### 5. Status Bar

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│ 📄 notes.md │ Ln 42, Col 12 │ Markdown │ UTF-8 │ 🌙 Dark │
└──────────────────────────────────────────────────────────┘
```

**Information Displayed**:
- **Current file**: Name of active file
- **Cursor position**: Line and column
- **File type**: Language/format
- **Encoding**: UTF-8, etc.
- **Theme**: Current theme (clickable to change)
- **Sync status**: If indexing (Phase 2)

## Interaction Design

### Keyboard Shortcuts

#### File Operations
- `Ctrl+N`: New file
- `Ctrl+O`: Open file (command palette)
- `Ctrl+S`: Save file
- `Ctrl+Shift+S`: Save as
- `Ctrl+W`: Close current tab
- `Ctrl+Shift+W`: Close all tabs
- `Ctrl+Tab`: Next tab
- `Ctrl+Shift+Tab`: Previous tab

#### Editor Operations
- `Ctrl+F`: Find in file
- `Ctrl+H`: Find and replace
- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z`: Redo
- `Ctrl+/`: Toggle comment
- `Ctrl+D`: Duplicate line

#### Navigation
- `Ctrl+P`: Quick file open
- `Ctrl+Shift+P`: Command palette
- `Ctrl+G`: Go to line
- `Ctrl+Click`: Follow wikilink
- `Alt+←`: Back in navigation history
- `Alt+→`: Forward in navigation history

#### View Controls
- `Ctrl+B`: Toggle sidebar
- `Ctrl+Shift+A`: Toggle AI panel
- `Ctrl+=`: Zoom in
- `Ctrl+-`: Zoom out
- `Ctrl+0`: Reset zoom
- `F11`: Toggle fullscreen

#### AI Operations
- `Ctrl+L`: Focus AI chat input
- `Ctrl+Shift+L`: Send current file to AI
- `Ctrl+Enter`: Send message (in AI chat)

### Mouse Interactions

#### File Tree
- **Click**: Select file
- **Double-click**: Open file
- **Right-click**: Context menu
- **Drag**: Move/reorder (Phase 2)

#### Editor
- **Click**: Place cursor
- **Double-click**: Select word
- **Triple-click**: Select line
- **Ctrl+Click**: Follow link
- **Right-click**: Context menu

#### Tabs
- **Click**: Switch to tab
- **Middle-click**: Close tab
- **Drag**: Reorder tabs (Phase 2)

## Visual Design System

### Color Palette

**Dark Theme** (Default):
```
Background:     #1e1e1e   (Main editor)
Sidebar BG:     #181818   (Darker)
Surface:        #252525   (Panels, menus)
Border:         #333333   (Subtle borders)
Text:           #d4d4d4   (Main text)
Text Dim:       #888888   (Comments, etc.)
Accent:         #569cd6   (Links, keywords)
Success:        #4ec9b0   (Success states)
Warning:        #ce9178   (Warnings)
Error:          #f44747   (Errors)
```

**Light Theme** (Optional):
```
Background:     #ffffff
Sidebar BG:     #f5f5f5
Surface:        #fafafa
Border:         #e0e0e0
Text:           #1e1e1e
Text Dim:       #6e6e6e
Accent:         #0078d4
Success:        #16825d
Warning:        #b5200d
Error:          #e81123
```

### Typography

**System Fonts**:
- **UI**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Editor**: "JetBrains Mono", "Fira Code", Consolas, monospace

**Font Sizes**:
- **Editor**: 14px (base, configurable 10-20px)
- **UI Text**: 13px
- **Small Text**: 11px (status bar, labels)
- **Headings**: 16px (H1 in UI)

**Font Weights**:
- **Regular**: 400
- **Medium**: 500
- **Bold**: 600

### Spacing

**Base unit**: 8px

- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

**Component spacing**:
- Padding (buttons): 8px 16px
- Padding (panels): 16px
- Margin (between sections): 24px
- Gap (in lists): 4px

### Icons

**Icon Set**: Lucide React (minimal, consistent style)

**Common Icons**:
- 📄 File
- 📁 Folder
- 🔍 Search
- ⚙️ Settings
- 🤖 AI Assistant
- ✅ Checkmark
- ❌ Close
- ➕ Add
- 🗑️ Delete

**Size**: 16px × 16px (standard), 20px × 20px (prominent)

### Animation

**Timing**:
- **Fast**: 100ms (hover states)
- **Normal**: 200ms (transitions)
- **Slow**: 300ms (panel open/close)

**Easing**: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material Design)

**Animated Elements**:
- Hover states: Background color
- Panel open/close: Width transition
- Modal open: Fade in + slight scale
- Toast notifications: Slide in from bottom

**No Animation**:
- Text cursor movement
- Scrolling (browser default)
- File loading (instant)

## Responsive Behavior

### Minimum Window Size
- **Width**: 800px
- **Height**: 600px

### Window Size Adaptations

**< 1000px width**:
- Hide sidebar by default
- Show toggle button for sidebar

**< 1400px width**:
- AI panel opens as overlay, not split pane
- Editor takes full width when AI panel open

**> 1920px width**:
- Optional third panel for backlinks/outline (Phase 2)

## Accessibility

### Keyboard Navigation
- **All features**: Accessible via keyboard
- **Focus indicators**: Clear visual focus ring
- **Tab order**: Logical, left to right, top to bottom

### Screen Readers
- **ARIA labels**: On all interactive elements
- **Alt text**: On all icons and images
- **Live regions**: For dynamic content (AI responses)

### Visual Accessibility
- **Contrast**: WCAG AA compliance (4.5:1 minimum)
- **Font size**: User configurable
- **High contrast mode**: Support (Phase 2)
- **No color-only indicators**: Use icons + color

### Keyboard Shortcuts
- **Customizable**: User can remap (Phase 2)
- **Visible**: Help menu lists all shortcuts
- **Standard**: Follow platform conventions

## Loading States

### Application Startup
```
┌─────────────────────────────────┐
│                                  │
│        PersonalOS                │
│                                  │
│     [Loading animation]          │
│                                  │
└─────────────────────────────────┘
```

### File Loading
- **Fast (<100ms)**: No indicator
- **Slow (>100ms)**: Spinner in tab
- **Very slow (>1s)**: Progress bar

### AI Response
- **Streaming**: Show as it arrives
- **Waiting**: Typing indicator (...)

### Search
- **Instant**: Results as you type
- **Large vault**: Progress indicator

## Error States

### File Errors
```
┌─────────────────────────────────────┐
│ ⚠️  Cannot Open File                 │
│                                      │
│ The file "notes.md" could not be    │
│ opened. It may have been deleted    │
│ or you don't have permission.       │
│                                      │
│          [Try Again]  [Cancel]      │
└─────────────────────────────────────┘
```

### AI Errors
```
AI Panel:
──────────────────
🤖 AI Assistant

You: Summarize this

⚠️ API Error: Invalid API key
Please check your settings.

[Open Settings]
──────────────────
```

### Network Errors
- **Toast notification**: "No internet connection"
- **Retry**: Automatic retry with exponential backoff
- **Fallback**: App still usable offline

## Empty States

### No Vault Selected
```
┌─────────────────────────────────────┐
│                                      │
│          Welcome to PersonalOS       │
│                                      │
│  Get started by selecting a vault   │
│  (a folder where your notes live)   │
│                                      │
│         [Select Vault Folder]       │
│                                      │
└─────────────────────────────────────┘
```

### Empty File Tree
```
Sidebar:
──────────
  No files yet

  [Create First Note]
──────────
```

### No Search Results
```
Search Results:
──────────────────
🔍 No results found for "query"

Try:
- Different keywords
- Check spelling
- Broader search terms
──────────────────
```

## Notifications

### Toast Notifications

**Position**: Bottom right
**Duration**: 3 seconds (auto-dismiss)
**Max visible**: 3 at once

```
┌─────────────────────────────┐
│ ✅ File saved successfully   │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ⚠️ Connection lost          │
└─────────────────────────────┘

┌─────────────────────────────┐
│ ❌ Failed to delete file     │
│    [Retry] [Dismiss]        │
└─────────────────────────────┘
```

**Types**:
- **Success**: Green accent, auto-dismiss
- **Info**: Blue accent, auto-dismiss
- **Warning**: Yellow accent, dismissible
- **Error**: Red accent, manual dismiss + action

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial UI/UX specification | Kris |





