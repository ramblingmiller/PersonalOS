---
title: PersonalOS Data Model
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, architecture, data-model]
---

# PersonalOS Data Model

## Overview

PersonalOS uses a **hybrid data model**: primary data stored as plain markdown files, with a secondary SQLite index for performance and queries.

## Core Principle: "Everything is a Note"

All data types (notes, tasks, events, etc.) are represented as markdown files with structured metadata.

## File System Data Model

### Markdown File Structure

```markdown
---
title: Example Note
created: 2025-10-08T10:30:00Z
modified: 2025-10-08T15:45:00Z
tags: [example, documentation]
status: active
---

# Example Note

This is a regular markdown note.

## Tasks

- [ ] Incomplete task
- [x] Completed task

## Links

This links to [[Another Note]].

## Metadata

Custom fields can be added:
- due:: 2025-10-15
- priority:: high
```

### File Format Specification

#### YAML Frontmatter
```yaml
---
# Required fields (auto-generated if missing)
title: string          # Display title (defaults to filename)
created: ISO8601       # Creation timestamp
modified: ISO8601      # Last modification timestamp

# Optional standard fields
tags: [string]         # List of tags
aliases: [string]      # Alternative names for this note
status: string         # Custom status field

# User-defined fields (unlimited)
[key]: any            # Any YAML-compatible data
---
```

#### Wikilink Syntax
```markdown
[[Note Name]]                    # Basic wikilink
[[Note Name|Display Text]]       # Wikilink with custom text
[[Folder/Note Name]]             # Path-based wikilink
```

#### Tag Syntax
```markdown
#tag                  # Simple tag
#tag/subtag          # Nested tag
#tag-with-dashes     # Tag with special characters
```

#### Task Syntax
```markdown
- [ ] Task description
- [x] Completed task
- [>] Forwarded task
- [-] Cancelled task

With metadata:
- [ ] Task name due::2025-10-15 priority::high
```

#### Inline Metadata
```markdown
key:: value                      # Simple key-value
[key:: value]                    # Dataview-style inline field
```

## Index Database Schema

### SQLite Tables

#### files
Primary table for all indexed files.

```sql
CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,           -- Relative path from vault root
    title TEXT,                           -- From frontmatter or filename
    content TEXT,                         -- Full file content
    content_hash TEXT,                    -- SHA-256 hash for change detection
    size INTEGER,                         -- File size in bytes
    created_time INTEGER,                 -- Unix timestamp
    modified_time INTEGER,                -- Unix timestamp
    indexed_time INTEGER,                 -- When file was indexed
    UNIQUE(path)
);

CREATE INDEX idx_files_path ON files(path);
CREATE INDEX idx_files_modified ON files(modified_time);
```

#### frontmatter
Stores YAML frontmatter key-value pairs.

```sql
CREATE TABLE frontmatter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT,                           -- JSON-encoded value
    value_type TEXT,                      -- 'string', 'number', 'array', 'object'
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE INDEX idx_frontmatter_file ON frontmatter(file_id);
CREATE INDEX idx_frontmatter_key ON frontmatter(key);
```

#### tags
Stores all tags found in files.

```sql
CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    tag TEXT NOT NULL,                    -- Full tag path (e.g., 'work/project')
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE INDEX idx_tags_file ON tags(file_id);
CREATE INDEX idx_tags_tag ON tags(tag);

-- For tag hierarchy queries
CREATE INDEX idx_tags_prefix ON tags(tag);
```

#### links
Stores wikilinks and markdown links.

```sql
CREATE TABLE links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_file_id INTEGER NOT NULL,
    target_path TEXT NOT NULL,            -- Resolved path (may not exist)
    link_text TEXT,                       -- Display text
    link_type TEXT,                       -- 'wikilink', 'markdown', 'embed'
    line_number INTEGER,                  -- Line in source file
    FOREIGN KEY(source_file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE INDEX idx_links_source ON links(source_file_id);
CREATE INDEX idx_links_target ON links(target_path);
```

#### tasks
Extracted tasks from markdown checkboxes.

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    status TEXT NOT NULL,                 -- ' ', 'x', '>', '-'
    description TEXT NOT NULL,
    due_date TEXT,                        -- ISO8601 date if found
    priority TEXT,                        -- If specified in inline metadata
    metadata TEXT,                        -- JSON of inline metadata
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_file ON tasks(file_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
```

#### full_text_search
Virtual table for content search.

```sql
CREATE VIRTUAL TABLE files_fts USING fts5(
    path,
    title,
    content,
    content=files,                        -- Backed by files table
    content_rowid=id
);

-- Triggers to keep FTS in sync
CREATE TRIGGER files_ai AFTER INSERT ON files BEGIN
    INSERT INTO files_fts(rowid, path, title, content)
    VALUES (new.id, new.path, new.title, new.content);
END;

CREATE TRIGGER files_ad AFTER DELETE ON files BEGIN
    DELETE FROM files_fts WHERE rowid = old.id;
END;

CREATE TRIGGER files_au AFTER UPDATE ON files BEGIN
    UPDATE files_fts 
    SET path = new.path, title = new.title, content = new.content
    WHERE rowid = new.id;
END;
```

## Data Models (TypeScript/Frontend)

### File Model

```typescript
interface File {
    id: string;                    // Unique identifier
    path: string;                  // Relative path from vault root
    name: string;                  // Filename with extension
    title: string;                 // Display title
    content?: string;              // File content (loaded on demand)
    frontmatter?: Frontmatter;     // Parsed YAML frontmatter
    size: number;                  // Size in bytes
    created: Date;                 // Creation time
    modified: Date;                // Last modified time
    isDirectory: boolean;
}

interface Frontmatter {
    [key: string]: any;            // Dynamic frontmatter fields
    title?: string;
    created?: string;
    modified?: string;
    tags?: string[];
    aliases?: string[];
}
```

### Link Model

```typescript
interface Link {
    source: string;                // Source file path
    target: string;                // Target file path
    displayText?: string;          // Custom display text
    type: 'wikilink' | 'markdown' | 'embed';
    lineNumber: number;
    exists: boolean;               // Does target file exist?
}

interface Backlink {
    sourcePath: string;
    sourceTitle: string;
    context: string;               // Surrounding text
    lineNumber: number;
}
```

### Task Model

```typescript
interface Task {
    id: string;
    filePath: string;
    fileName: string;
    lineNumber: number;
    status: TaskStatus;
    description: string;
    dueDate?: Date;
    priority?: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
}

enum TaskStatus {
    Todo = ' ',
    Done = 'x',
    Forwarded = '>',
    Cancelled = '-'
}
```

### Tag Model

```typescript
interface Tag {
    name: string;                  // Full tag path
    count: number;                 // Number of files with this tag
    files: string[];               // File paths
    children?: Tag[];              // Nested tags (computed)
}

// Example:
// #work/project1 and #work/project2 create:
{
    name: 'work',
    children: [
        { name: 'work/project1', files: [...] },
        { name: 'work/project2', files: [...] }
    ]
}
```

### Search Models

```typescript
interface FileSearchResult {
    path: string;
    title: string;
    score: number;                 // Relevance score
    matchedOn: 'title' | 'path' | 'alias';
}

interface ContentSearchResult {
    path: string;
    title: string;
    matches: ContentMatch[];
}

interface ContentMatch {
    lineNumber: number;
    line: string;                  // Full line with match
    beforeContext: string[];       // Lines before match
    afterContext: string[];        // Lines after match
    matchStart: number;            // Character offset in line
    matchEnd: number;
}
```

## Data Flow and Synchronization

### File Change Detection

```
1. User modifies file externally
     ↓
2. File watcher detects change
     ↓
3. Compute content hash
     ↓
4. Compare with stored hash in database
     ↓
5. If different:
     - Re-parse frontmatter
     - Re-extract links
     - Re-extract tasks
     - Update FTS index
     - Emit 'file-changed' event
```

### Index Rebuilding

```
Trigger conditions:
- First app launch
- Vault path changed
- Index database missing/corrupted
- Manual rebuild requested

Process:
1. Scan vault directory recursively
2. For each .md file:
     - Parse frontmatter
     - Extract tags
     - Extract links
     - Extract tasks
     - Index content in FTS
3. Update files table
4. Emit progress events
```

### Cache Strategy

**In-Memory Cache** (Frontend):
```typescript
interface FileCache {
    files: Map<string, File>;           // Recently accessed files
    maxSize: number;                    // Max files to cache (e.g., 50)
    evictionPolicy: 'lru';              // Least recently used
}
```

**Query Cache** (Frontend):
```typescript
interface QueryCache {
    searches: Map<string, SearchResult[]>;
    ttl: number;                        // Time to live (e.g., 30s)
}
```

## Data Validation Rules

### File Validation

```typescript
interface FileValidation {
    maxSize: number;                    // 10 MB default
    allowedExtensions: string[];        // ['.md', '.markdown']
    encoding: 'utf-8';
    
    validate(file: File): ValidationResult;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
```

### Frontmatter Validation

```yaml
# Reserved keys (managed by system)
title: string              # Auto-generated from filename if missing
created: ISO8601           # Auto-generated on file creation
modified: ISO8601          # Auto-updated on file save

# Standard optional keys (validated if present)
tags: string[]             # Must be array of strings
aliases: string[]          # Must be array of strings
status: string             # Freeform string

# User keys: No validation, stored as-is
```

## Data Migration Strategy

### Schema Versioning

```sql
CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_date INTEGER NOT NULL,
    description TEXT
);

INSERT INTO schema_version VALUES (1, strftime('%s', 'now'), 'Initial schema');
```

### Migration Process

```rust
// Pseudo-code
fn migrate_database(current_version: i32) -> Result<()> {
    let migrations = [
        Migration { version: 1, sql: "..." },
        Migration { version: 2, sql: "..." },
    ];
    
    for migration in migrations {
        if migration.version > current_version {
            execute_migration(migration)?;
        }
    }
    Ok(())
}
```

## Performance Considerations

### Indexing Performance
- **Batch inserts**: Use transactions for bulk operations
- **Lazy indexing**: Index in background, don't block UI
- **Incremental updates**: Only re-index changed files
- **Size limits**: Skip indexing files > 10MB

### Query Performance
- **Prepared statements**: Reuse SQL statements
- **Appropriate indexes**: On frequently queried columns
- **Pagination**: Limit result sets (100 results at a time)
- **Query caching**: Cache frequent queries for 30s

### Memory Management
- **Streaming**: Stream large file contents, don't load entirely
- **Cache eviction**: LRU cache with size limits
- **Lazy loading**: Load file contents on demand only

## Example Queries

### Find all backlinks to a file
```sql
SELECT f.path, f.title, l.line_number, l.link_text
FROM links l
JOIN files f ON l.source_file_id = f.id
WHERE l.target_path = ?
ORDER BY f.path;
```

### Find all files with a specific tag
```sql
SELECT DISTINCT f.path, f.title
FROM files f
JOIN tags t ON f.id = t.file_id
WHERE t.tag = ? OR t.tag LIKE ? || '/%'
ORDER BY f.title;
```

### Full-text search
```sql
SELECT f.path, f.title,
       snippet(files_fts, 2, '<mark>', '</mark>', '...', 32) as snippet
FROM files_fts
JOIN files f ON files_fts.rowid = f.id
WHERE files_fts MATCH ?
ORDER BY rank
LIMIT 50;
```

### Get all incomplete tasks
```sql
SELECT f.path, f.title, t.description, t.due_date, t.line_number
FROM tasks t
JOIN files f ON t.file_id = f.id
WHERE t.status = ' '
ORDER BY 
    CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
    t.due_date;
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial data model document | Kris |



