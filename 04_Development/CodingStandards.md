---
title: PersonalOS Coding Standards
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, coding-standards, development]
---

# PersonalOS Coding Standards

## General Principles

1. **Clarity over cleverness**: Write code that's easy to understand
2. **Consistency**: Follow established patterns
3. **Type safety**: Leverage TypeScript and Rust's type systems
4. **DRY**: Don't repeat yourself, but don't over-abstract
5. **Testing**: Write tests for critical functionality

## TypeScript/React Standards

### File Naming

```
PascalCase.tsx    - React components
camelCase.ts      - Utilities, services, hooks
camelCase.test.ts - Test files
```

### Component Structure

```typescript
import React from 'react';
import { SomeType } from './types';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  // Hooks at top
  const [state, setState] = React.useState(false);
  
  // Event handlers
  const handleClick = () => {
    setState(true);
    onAction?.();
  };
  
  // Render
  return (
    <div className="container">
      <h1>{title}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

### Naming Conventions

```typescript
// Components: PascalCase
function FileTree() {}

// Functions: camelCase
function parseMarkdown() {}

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024;

// Types/Interfaces: PascalCase
interface User {}
type FileData = {};

// Booleans: is/has prefix
const isLoading = true;
const hasError = false;
```

### Type Definitions

```typescript
// ✅ DO: Define explicit types
interface FileData {
  path: string;
  content: string;
  modified: Date;
}

function processFile(data: FileData): void {
  // ...
}

// ❌ DON'T: Use any
function processFile(data: any): any {
  // BAD
}

// ✅ DO: Use unknown for truly unknown data
function parse(data: unknown): FileData {
  if (isFileData(data)) {
    return data;
  }
  throw new Error('Invalid data');
}
```

### Error Handling

```typescript
// ✅ DO: Handle errors explicitly
try {
  const data = await loadFile(path);
  processData(data);
} catch (error) {
  console.error('Failed to load file:', error);
  showError('Could not load file');
}

// ✅ DO: Create custom error types
class FileNotFoundError extends Error {
  constructor(path: string) {
    super(`File not found: ${path}`);
    this.name = 'FileNotFoundError';
  }
}
```

### Async/Await

```typescript
// ✅ DO: Use async/await
async function loadFile(path: string): Promise<string> {
  const content = await fs.readFile(path);
  return content;
}

// ❌ DON'T: Use callbacks
function loadFile(path: string, callback: (err, data) => void) {
  // Avoid
}

// ❌ DON'T: Use .then() chains (prefer async/await)
function loadFile(path: string) {
  return fs.readFile(path)
    .then(data => process(data))
    .then(result => save(result));
}
```

## Rust Standards

### File Organization

```
src/
  main.rs           - Entry point
  lib.rs            - Library root
  commands/         - Tauri commands
    file.rs
    search.rs
  services/         - Business logic
    file_service.rs
    index_service.rs
  models/           - Data structures
    file.rs
```

### Naming Conventions

```rust
// Functions: snake_case
fn read_file() {}

// Structs: PascalCase
struct FileData {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE: usize = 1024;

// Lifetimes: single lowercase letter
fn process<'a>(data: &'a str) -> &'a str {}
```

### Error Handling

```rust
// ✅ DO: Use Result for operations that can fail
fn read_file(path: &Path) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}

// ✅ DO: Create custom error types
#[derive(Debug)]
enum AppError {
    FileNotFound(String),
    PermissionDenied,
    InvalidData(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::FileNotFound(path) => write!(f, "File not found: {}", path),
            AppError::PermissionDenied => write!(f, "Permission denied"),
            AppError::InvalidData(msg) => write!(f, "Invalid data: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

// ✅ DO: Use ? operator for error propagation
fn process_file(path: &Path) -> Result<String, AppError> {
    let content = read_file(path)?;
    let parsed = parse_content(&content)?;
    Ok(parsed)
}

// ❌ DON'T: Use unwrap() in production code
let data = read_file(path).unwrap();  // BAD

// ✅ DO: Handle errors or use expect() with context
let data = read_file(path)
    .expect("Config file must exist");  // BETTER
```

### Documentation

```rust
/// Reads a file from the filesystem.
///
/// # Arguments
///
/// * `path` - The path to the file to read
///
/// # Returns
///
/// Returns the file contents as a `String` on success
///
/// # Errors
///
/// Returns an error if the file doesn't exist or can't be read
///
/// # Examples
///
/// ```
/// let content = read_file(Path::new("file.txt"))?;
/// ```
pub fn read_file(path: &Path) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}
```

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process, dependencies, etc.

### Examples

```
feat(editor): add wikilink navigation

Implement Ctrl+Click on wikilinks to navigate to target file.
Falls back to creating file if it doesn't exist.

Closes #123

---

fix(search): handle special characters in queries

Escape special SQL characters to prevent errors when searching
for content containing wildcards.

---

docs: update setup instructions

Add troubleshooting section for common Tauri installation issues.
```

## Code Review Checklist

### Before Committing

- [ ] Code follows style guidelines
- [ ] No commented-out code
- [ ] No console.log statements (use proper logging)
- [ ] No hardcoded values (use constants/config)
- [ ] Types are explicit (no `any`)
- [ ] Error handling is present
- [ ] Tests pass
- [ ] No linter warnings
- [ ] Documentation updated if needed

### TypeScript Specific

- [ ] No `any` types
- [ ] All functions have return types
- [ ] Props interfaces defined
- [ ] Hooks follow rules of hooks
- [ ] No inline styles (use Tailwind)

### Rust Specific

- [ ] No `unwrap()` in production code
- [ ] All public items documented
- [ ] No clippy warnings
- [ ] Proper error types used
- [ ] Memory safety considered

## Testing Standards

### Test File Structure

```typescript
// Component.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles clicks', () => {
    const handleClick = vi.fn();
    render(<Component onAction={handleClick} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Rust Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_file() {
        let result = read_file(Path::new("test.txt"));
        assert!(result.is_ok());
    }

    #[test]
    fn test_file_not_found() {
        let result = read_file(Path::new("nonexistent.txt"));
        assert!(result.is_err());
    }
}
```

## Performance Guidelines

### Frontend

```typescript
// ✅ DO: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ DO: Debounce user input
const debouncedSearch = useDebouncedCallback(
  (query: string) => performSearch(query),
  300
);

// ✅ DO: Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Backend

```rust
// ✅ DO: Use appropriate data structures
use std::collections::HashMap;  // For lookups
use Vec;  // For ordered data

// ✅ DO: Avoid cloning when possible
fn process(data: &str) -> String {  // Borrow instead of clone
    data.to_uppercase()
}

// ✅ DO: Use iterators instead of loops
let result: Vec<_> = items
    .iter()
    .filter(|x| x.is_valid())
    .map(|x| x.process())
    .collect();
```

## Security Guidelines

```typescript
// ✅ DO: Validate all user input
function sanitizePath(path: string): string {
  if (path.includes('..')) {
    throw new Error('Invalid path');
  }
  return path;
}

// ✅ DO: Use parameterized queries
db.execute("SELECT * FROM files WHERE path = ?", [path]);

// ❌ DON'T: Concatenate SQL
db.execute(`SELECT * FROM files WHERE path = '${path}'`);  // BAD

// ✅ DO: Sanitize HTML
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial coding standards | Kris |

