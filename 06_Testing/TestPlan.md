---
title: PersonalOS Test Plan
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, testing, test-plan]
---

# PersonalOS Test Plan

## Test Plan by Phase

### Phase 1: File System - Test Plan

#### Unit Tests
- [ ] `parseDirectory()` returns correct file list
- [ ] `parseDirectory()` handles empty directory
- [ ] `parseDirectory()` handles permission denied
- [ ] `validatePath()` allows valid paths
- [ ] `validatePath()` blocks path traversal

#### Integration Tests
- [ ] Can list directory via Tauri command
- [ ] Can read file via Tauri command
- [ ] File tree component displays files
- [ ] Clicking file opens it in editor

#### Manual Tests
- [ ] Create test vault with 100 files
- [ ] Open PersonalOS and select vault
- [ ] Verify all files show in tree
- [ ] Click several files, verify they open
- [ ] Try to open file outside vault (should fail gracefully)

---

### Phase 2: Editor - Test Plan

#### Unit Tests
- [ ] Editor initializes with content
- [ ] `savereFile()` writes correct content
- [ ] Auto-save triggers after 30s
- [ ] Unsaved changes detected

#### Integration Tests
- [ ] Can type in editor
- [ ] Ctrl+S saves file
- [ ] File reloads after external change
- [ ] Frontmatter highlighted correctly

#### Manual Tests
- [ ] Open file, make changes, save with Ctrl+S
- [ ] Verify file saved to disk
- [ ] Open file in external editor, change it
- [ ] Verify PersonalOS detects change
- [ ] Type continuously for 1 minute (test stability)
- [ ] Open very large file (10MB), verify no lag

---

### Phase 3: Navigation - Test Plan

#### Unit Tests
- [ ] `parseWikilinks()` finds all wikilinks
- [ ] `parseWikilinks()` handles aliases
- [ ] `resolveWikilink()` finds target file
- [ ] `resolveWikilink()` returns null for missing

#### Integration Tests
- [ ] Wikilinks displayed in editor
- [ ] Clicking wikilink opens target
- [ ] Non-existent links shown differently
- [ ] Search returns correct results
- [ ] Search handles special characters

#### Manual Tests
- [ ] Create note with several wikilinks
- [ ] Ctrl+Click each link
- [ ] Verify correct file opens
- [ ] Try link to non-existent file
- [ ] Verify prompt to create file
- [ ] Use command palette (Ctrl+P) to find files
- [ ] Search for content across vault

---

### Phase 4: AI Integration - Test Plan

#### Unit Tests
- [ ] AI message format correct
- [ ] Context builder includes file content
- [ ] API error handled gracefully

#### Integration Tests
- [ ] Can send message to AI
- [ ] Response received and displayed
- [ ] Streaming works
- [ ] File context included

#### Manual Tests
- [ ] Open AI panel
- [ ] Send simple message
- [ ] Verify response appears
- [ ] Send current file to AI
- [ ] Ask question about file
- [ ] Verify AI references file content
- [ ] Test with invalid API key
- [ ] Verify error message helpful
- [ ] Test without internet
- [ ] Verify offline error message

---

## Comprehensive Test Suite

### File Operations Test Suite

| Test Case | Input | Expected Output | Priority |
|-----------|-------|-----------------|----------|
| Read valid file | `/vault/note.md` | File content | P0 |
| Read missing file | `/vault/missing.md` | Error: File not found | P0 |
| Read without permission | `/root/file.md` | Error: Permission denied | P0 |
| Read large file (10MB) | `/vault/large.md` | Content (may take time) | P1 |
| Write valid file | `path + content` | Success, file saved | P0 |
| Write without permission | `/root/file.md` | Error: Permission denied | P0 |
| Path traversal | `/../../../etc/passwd` | Error: Invalid path | P0 |

### Editor Test Suite

| Test Case | Action | Expected Result | Priority |
|-----------|--------|-----------------|----------|
| Type text | Type "Hello World" | Text appears | P0 |
| Undo | Ctrl+Z after typing | Text removed | P1 |
| Redo | Ctrl+Shift+Z after undo | Text restored | P1 |
| Save | Ctrl+S | File saved, indicator cleared | P0 |
| Auto-save | Wait 30s after edit | File saved automatically | P1 |
| Word wrap | Toggle word wrap | Long lines wrap/don't wrap | P2 |
| Line numbers | Toggle line numbers | Numbers show/hide | P2 |

### Search Test Suite

| Test Case | Query | Expected Results | Priority |
|-----------|-------|------------------|----------|
| Exact match | `"test"` | All files containing "test" | P0 |
| Partial match | `"tes"` | Files matching partial | P0 |
| Fuzzy match | `"pso"` | PersonalOS found | P1 |
| Case insensitive | `"TEST"` | Same as "test" | P1 |
| Special chars | `"C++"` | Files with C++ | P1 |
| Empty query | `""` | No results OR all files | P2 |
| Very long query | 1000 chars | Handle gracefully | P2 |

### Wikilink Test Suite

| Test Case | Input | Expected | Priority |
|-----------|-------|----------|----------|
| Basic wikilink | `[[Note]]` | Link to Note.md | P0 |
| With alias | `[[Note\|Display]]` | Show "Display", link to Note | P0 |
| Non-existent | `[[Missing]]` | Different color, prompt to create | P1 |
| With spaces | `[[My Note]]` | Link to "My Note.md" | P0 |
| Nested path | `[[folder/Note]]` | Link to folder/Note.md | P1 |
| Multiple on line | `[[A]] and [[B]]` | Both clickable | P1 |

### AI Test Suite

| Test Case | Action | Expected | Priority |
|-----------|--------|----------|----------|
| Simple question | "What is Markdown?" | Relevant answer | P1 |
| File context | Send file + question | Answer references file | P1 |
| Long conversation | 10+ messages | All messages shown | P2 |
| Streaming | Send message | Response streams in | P1 |
| API error | Invalid key | Friendly error message | P0 |
| Network error | Disconnect internet | Offline error message | P1 |

## Acceptance Testing

### Feature Complete Checklist

#### Phase 1 Complete When:
- [ ] Can browse vault folder structure
- [ ] Can open any .md file
- [ ] File content displays correctly
- [ ] No crashes for 30 minutes of use

#### Phase 2 Complete When:
- [ ] Can edit markdown files
- [ ] Syntax highlighting works
- [ ] Can save with Ctrl+S
- [ ] Auto-save works
- [ ] Unsaved changes tracked
- [ ] No data loss

#### Phase 3 Complete When:
- [ ] Wikilinks are clickable
- [ ] Navigation works
- [ ] Can search files by name
- [ ] Can search file contents
- [ ] Command palette works
- [ ] Search is fast (<1s)

#### Phase 4 Complete When:
- [ ] AI chat panel works
- [ ] Can send messages
- [ ] Responses stream in
- [ ] Can share file context
- [ ] API keys stored securely
- [ ] Errors handled well

#### Phase 5 (Polish) Complete When:
- [ ] All P0 bugs fixed
- [ ] All P1 bugs fixed
- [ ] Can use for full day of real work
- [ ] No crashes
- [ ] Performance acceptable
- [ ] Actually prefer it over Cursor + Obsidian

## User Acceptance Testing (UAT)

### UAT Scenario 1: Daily Note Taking
```
As a user doing normal note-taking work:
1. Open PersonalOS
2. Create new note
3. Write content with several wikilinks
4. Save note
5. Follow a wikilink
6. Edit linked note
7. Search for a concept
8. Find and open result
9. Use AI to summarize a note
10. Close app

Success criteria: All steps complete without issues
```

### UAT Scenario 2: Project Research
```
As a user researching a project:
1. Open PersonalOS
2. Create project folder
3. Create several notes in folder
4. Link notes together
5. Use AI to help brainstorm
6. Search for related notes
7. Organize notes
8. Work for 2+ hours continuously

Success criteria: Productive session, no data loss
```

### UAT Scenario 3: Returning User
```
As a user returning after a week:
1. Open PersonalOS
2. See recent files
3. Continue where I left off
4. All settings preserved
5. AI keys still work
6. No re-setup required

Success criteria: Seamless return to work
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial test plan | Kris |





