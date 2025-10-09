---
title: PersonalOS Testing Strategy
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, testing, qa]
---

# PersonalOS Testing Strategy

## Testing Philosophy

1. **Test what matters**: Focus on critical paths and data safety
2. **Automate where possible**: But manual testing is valuable too
3. **Test early**: Catch bugs before they compound
4. **User perspective**: Test like a user, not just code coverage

## Testing Pyramid

```
       /\
      /E2E\          ← Few, slow, expensive (10%)
     /------\
    /Integration\    ← Some, moderate (30%)
   /------------\
  /   Unit Tests  \  ← Many, fast, cheap (60%)
 /________________\
```

## Testing Levels

### 1. Unit Tests (60% of tests)

**Purpose**: Test individual functions and components in isolation

**Tools**:
- Frontend: Vitest + React Testing Library
- Backend: Rust built-in tests

**What to Test**:
- Pure functions (utilities)
- Data transformations
- Parsing logic
- Validation functions

**Example (Frontend)**:
```typescript
// markdown.test.ts
import { describe, it, expect } from 'vitest';
import { parseWikilinks } from './markdown';

describe('parseWikilinks', () => {
  it('parses basic wikilink', () => {
    const result = parseWikilinks('Hello [[World]]');
    expect(result).toEqual([
      { target: 'World', alias: undefined, position: 6 }
    ]);
  });

  it('parses wikilink with alias', () => {
    const result = parseWikilinks('[[File|Display Text]]');
    expect(result).toEqual([
      { target: 'File', alias: 'Display Text', position: 0 }
    ]);
  });
});
```

**Example (Backend)**:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_path() {
        let root = Path::new("/vault");
        let valid = Path::new("/vault/note.md");
        assert!(validate_path(root, valid).is_ok());
        
        let invalid = Path::new("/vault/../etc/passwd");
        assert!(validate_path(root, invalid).is_err());
    }
}
```

### 2. Integration Tests (30% of tests)

**Purpose**: Test how components work together

**What to Test**:
- API calls between frontend and backend
- Database operations
- File system operations
- State management flows

**Example**:
```typescript
// fileService.test.ts
import { describe, it, expect } from 'vitest';
import { invoke } from '@tauri-apps/api';
import { FileService } from './fileService';

describe('FileService', () => {
  it('reads file through Tauri', async () => {
    const service = new FileService();
    const content = await service.readFile('/test/file.md');
    expect(content).toBeDefined();
    expect(typeof content).toBe('string');
  });

  it('handles missing file', async () => {
    const service = new FileService();
    await expect(
      service.readFile('/nonexistent.md')
    ).rejects.toThrow('File not found');
  });
});
```

### 3. End-to-End Tests (10% of tests)

**Purpose**: Test complete user workflows

**Tools**: Playwright or similar

**What to Test**:
- Critical user journeys
- Feature integration
- Multi-step workflows

**Example**:
```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('wikilink navigation flow', async ({ page }) => {
  // Open app
  await page.goto('/');
  
  // Select a file from tree
  await page.click('text=notes.md');
  
  // Click on wikilink
  await page.click('text=[[Other Note]]');
  
  // Verify navigation
  await expect(page.locator('.editor')).toContainText('Other Note');
});
```

## Testing by Feature

### File System Operations

**Critical Tests**:
- [ ] Read file successfully
- [ ] Write file successfully
- [ ] Handle permission denied
- [ ] Handle file not found
- [ ] Prevent path traversal attacks
- [ ] Handle large files (>10MB)

**Data Safety Tests**:
- [ ] No data loss on save
- [ ] Backup created before overwrite
- [ ] Crash recovery works

### Editor

**Critical Tests**:
- [ ] Can type and edit
- [ ] Syntax highlighting works
- [ ] Save with Ctrl+S
- [ ] Auto-save triggers
- [ ] Unsaved changes detected
- [ ] No data loss on close

### Wikilinks

**Critical Tests**:
- [ ] Parse wikilinks correctly
- [ ] Navigate on click
- [ ] Handle non-existent targets
- [ ] Support aliases
- [ ] Work with spaces in names

### Search

**Critical Tests**:
- [ ] File search returns results
- [ ] Content search returns results
- [ ] Fuzzy matching works
- [ ] Handle special characters
- [ ] Performance (<1s for 10K files)

### AI Integration

**Critical Tests**:
- [ ] Send message successfully
- [ ] Receive response
- [ ] Handle API errors
- [ ] Stream responses
- [ ] Context passed correctly

## Test Data

### Test Vault Structure
```
test-vault/
├── README.md
├── notes/
│   ├── note1.md
│   ├── note2.md
│   └── note3.md
├── projects/
│   └── project.md
└── daily/
    ├── 2025-10-01.md
    └── 2025-10-02.md
```

### Test Files

**Simple Note** (`note1.md`):
```markdown
---
title: Test Note
tags: [test]
---

# Test Note

This is a test note.

[[note2]] is linked.
```

**With Wikilinks** (`note2.md`):
```markdown
# Note Two

Links to [[note1]] and [[note3]].
Also links to [[nonexistent]].
```

**Large File** (`large.md`):
- 10,000+ lines
- Test scrolling performance
- Test search in large files

## Performance Testing

### Metrics to Track

| Operation | Target | Acceptable | Poor |
|-----------|--------|------------|------|
| App startup | < 2s | < 3s | > 5s |
| Open file | < 100ms | < 200ms | > 500ms |
| Save file | < 50ms | < 100ms | > 200ms |
| Search (1K files) | < 500ms | < 1s | > 2s |
| Search (10K files) | < 1s | < 2s | > 5s |
| AI response start | < 2s | < 5s | > 10s |

### Performance Tests

```typescript
describe('Performance', () => {
  it('opens file quickly', async () => {
    const start = Date.now();
    await fileService.openFile('/test/file.md');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('searches large vault quickly', async () => {
    // Vault with 10,000 files
    const start = Date.now();
    const results = await search.searchFiles('test');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

## Security Testing

### Tests Required

- [ ] Path traversal prevention
- [ ] SQL injection prevention
- [ ] XSS prevention in rendered markdown
- [ ] API key not leaked in logs
- [ ] API key not leaked in errors
- [ ] Symlink attacks prevented

### Security Test Examples

```rust
#[test]
fn test_path_traversal_prevention() {
    let root = Path::new("/vault");
    
    // Attempt to access parent directory
    let malicious = Path::new("/vault/../../../etc/passwd");
    assert!(validate_path(root, malicious).is_err());
    
    // Attempt with encoded characters
    let malicious2 = Path::new("/vault/%2e%2e%2f%2e%2e%2f");
    assert!(validate_path(root, malicious2).is_err());
}
```

## Manual Testing Checklist

### Every Release

- [ ] Install on fresh machine
- [ ] Select vault successfully
- [ ] Create new file
- [ ] Edit and save file
- [ ] Search for file
- [ ] Follow wikilink
- [ ] Chat with AI
- [ ] Configure API key
- [ ] Change theme
- [ ] Close and reopen (state persists)
- [ ] No crashes during 1-hour session

### Edge Cases

- [ ] Very large vault (10,000+ files)
- [ ] Very large file (10MB+)
- [ ] File with special characters
- [ ] Unicode file names
- [ ] Nested folders (20+ levels)
- [ ] Rapid file changes
- [ ] No internet connection (offline)
- [ ] Invalid API key

## Regression Testing

### After Each Change

- [ ] Run unit tests (`npm test`)
- [ ] Run Rust tests (`cargo test`)
- [ ] Manual smoke test (open, edit, save)

### Before Each Release

- [ ] Full test suite passes
- [ ] Manual testing checklist complete
- [ ] Performance benchmarks meet targets
- [ ] Security checklist complete
- [ ] Test on target platforms

## Bug Tracking

### Bug Priority

**P0 - Critical**:
- Data loss
- Crashes
- Security vulnerabilities

**P1 - High**:
- Feature completely broken
- Significant performance degradation

**P2 - Medium**:
- Feature partially broken
- Minor performance issues

**P3 - Low**:
- Cosmetic issues
- Nice-to-have improvements

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Linux/macOS/Windows
- Version: 0.1.0
- Vault size: XXX files

## Screenshots
If applicable
```

## Continuous Integration

### GitHub Actions Workflow (Future)

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.0-dev
      - name: Install Rust
        run: rustup update stable
      - name: Install Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: |
          npm test
          cd src-tauri && cargo test
      - name: Build
        run: npm run tauri build
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial testing strategy | Kris |

