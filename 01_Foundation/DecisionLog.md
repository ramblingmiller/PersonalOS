---
title: PersonalOS Decision Log
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, decisions, adr]
---

# PersonalOS Decision Log

## Purpose

This document records all significant technical and design decisions. Each decision follows the Architecture Decision Record (ADR) format.

---

## ADR-001: Use Tauri Instead of Electron

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Need to build a cross-platform desktop application. Previous attempts with Electron resulted in:
- Frequent environment breaking
- Large bundle sizes
- Complex configuration
- Dependency hell

### Decision
Use **Tauri** as the application framework.

### Rationale
1. **Stability**: Rust backend is more stable than Node.js
2. **Size**: ~10MB vs ~100MB for Electron
3. **Security**: Sandboxed by default, explicit permissions
4. **Performance**: Native code vs JavaScript runtime
5. **Development**: Still use web technologies for UI
6. **Community**: Active, growing, good documentation

### Consequences

**Positive**:
- Smaller binary size
- Better performance
- Forced to learn Rust (valuable skill)
- More secure by design
- Better system integration

**Negative**:
- Learning curve for Rust
- Smaller ecosystem than Electron
- Fewer examples/tutorials
- Some npm packages may not work

### Alternatives Considered

1. **Electron** - ❌ Rejected: Previous bad experience, too large, too complex
2. **Neutralino** - ❌ Smaller community, less mature
3. **Native App (C++/Qt)** - ❌ Too much complexity, steep learning curve

---

## ADR-002: No Web Application Version

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Could build as web app with File System Access API instead of desktop app.

### Decision
**NO web application version**. Desktop only.

### Rationale
1. **File Access**: Browser sandboxing prevents full file system access
2. **Performance**: Native apps are faster
3. **Offline**: Must work without internet
4. **Integration**: Need OS-level integrations
5. **Previous Failure**: Already tried web app, hit permission issues

### Consequences

**Positive**:
- Full file system access
- Better performance
- True offline capability
- No browser compatibility issues

**Negative**:
- Larger initial setup
- Platform-specific builds required
- No "try in browser" demo
- Deployment more complex

### Alternatives Considered

1. **Progressive Web App (PWA)** - ❌ File System Access API too limited, security restrictions
2. **Hybrid (Web + Desktop)** - ❌ Doubles maintenance, splits focus

---

## ADR-003: Not an Obsidian Plugin

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Could build as Obsidian plugin to leverage existing infrastructure.

### Decision
Build **standalone application**, not an Obsidian plugin.

### Rationale
1. **Vision**: Want "VSCode WITH Obsidian" not "Obsidian with VSCode"
2. **Limitations**: Plugin API too restrictive
3. **Control**: Need full control over UI/UX
4. **File Access**: Need access beyond vault
5. **AI Integration**: Want deeper integration than plugins allow

### Consequences

**Positive**:
- Full creative control
- No plugin API limitations
- Can access entire file system
- Can integrate AI deeply
- Own the full experience

**Negative**:
- Must rebuild Obsidian features from scratch
- Larger scope
- More development time
- No existing Obsidian user base

### Alternatives Considered

1. **Obsidian Plugin** - ❌ Too limiting, wrong direction
2. **Fork Obsidian** - ❌ Closed source, not possible

---

## ADR-004: React for Frontend

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Need to choose frontend framework for Tauri app. Options: React, Vue, Svelte, Solid, or vanilla JS.

### Decision
Use **React with TypeScript**.

### Rationale
1. **Familiarity**: Already experienced with React
2. **Ecosystem**: Largest component library ecosystem
3. **TypeScript**: Excellent TypeScript support
4. **Hiring**: Easier to find React developers if needed
5. **Resources**: Most tutorials and examples
6. **CodeMirror**: Good React integration

### Consequences

**Positive**:
- Can move fast with known technology
- Large ecosystem of components
- Strong TypeScript support
- Easy to find help/examples

**Negative**:
- Larger bundle than Svelte
- More boilerplate than Vue
- Virtual DOM overhead

### Alternatives Considered

1. **Svelte** - ✅ Smaller bundle, faster; ❌ Less familiar, smaller ecosystem
2. **Vue** - ✅ Good balance; ❌ Less familiar
3. **Solid** - ✅ Very performant; ❌ Much smaller ecosystem
4. **Vanilla JS** - ✅ No framework overhead; ❌ Too much manual work

---

## ADR-005: CodeMirror 6 for Editor

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Need a code/markdown editor component. Options: CodeMirror, Monaco, Ace, or custom.

### Decision
Use **CodeMirror 6**.

### Rationale
1. **Modern**: Complete rewrite, modern architecture
2. **Extensible**: Plugin system for custom features
3. **Performance**: Fast even with large files
4. **Mobile**: Works on touch devices
5. **Obsidian**: Obsidian uses it (familiar to target users)
6. **Markdown**: Excellent markdown support

### Consequences

**Positive**:
- Fast, modern editor
- Highly customizable
- Good documentation
- Active development
- Familiar to Obsidian users

**Negative**:
- Learning curve (different from CM5)
- More complex API than simpler editors

### Alternatives Considered

1. **Monaco Editor** (VSCode's editor) - ✅ Very powerful; ❌ Larger bundle size, overkill for markdown
2. **Ace Editor** - ❌ Older, less maintained
3. **Custom Editor** - ❌ Way too much work

---

## ADR-006: Local-First, No Cloud Sync

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Users might expect cloud sync for multi-device access.

### Decision
**Local-first only**. No built-in cloud sync.

### Rationale
1. **Privacy**: User data stays on user's machine
2. **Simplicity**: Avoid sync conflict complexity
3. **Scope**: Keep MVP focused
4. **Options**: Users can use Syncthing, Dropbox, etc.
5. **Philosophy**: Local-first is core principle

### Consequences

**Positive**:
- Better privacy
- Simpler architecture
- No server costs
- Users control their data

**Negative**:
- No official multi-device support
- Users must set up own sync
- Less convenient than cloud apps

### Alternatives Considered

1. **Built-in Sync** - ❌ Massive scope increase, server costs, sync conflicts
2. **Git-based Sync** - 🤔 Possible future feature, too complex for MVP

---

## ADR-007: Bring Your Own Key (BYOK) for AI

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
AI API calls cost money. Need to decide who pays.

### Decision
**Bring Your Own Key (BYOK)** model. Users provide their own API keys.

### Rationale
1. **Cost**: Avoids variable AI costs
2. **Privacy**: User's data goes to their API account
3. **Flexibility**: Users can choose provider
4. **Control**: Users control costs
5. **Simplicity**: No payment processing needed

### Consequences

**Positive**:
- No AI costs to manage
- User has full privacy control
- No payment system needed
- Users can use preferred provider

**Negative**:
- Barrier to entry (users need API key)
- Can't monetize AI features
- Users must manage costs
- More setup friction

### Alternatives Considered

1. **Subscription with AI Included** - ❌ Complex pricing, variable costs, need payment processing
2. **Pay-per-use** - ❌ Requires backend infrastructure, complex billing
3. **Free Tier with Limits** - ❌ I pay for AI costs

---

## ADR-008: Single Vault Initially

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Obsidian supports multiple vaults. Should we?

### Decision
**Single vault** for MVP. Multi-vault in Phase 2.

### Rationale
1. **Simplicity**: Easier to implement
2. **Use Case**: Most users primarily use one vault
3. **Scope**: Keep MVP focused
4. **Easy Addition**: Can add later without breaking changes

### Consequences

**Positive**:
- Simpler architecture
- Faster MVP development
- Less UI complexity
- Easier to test

**Negative**:
- Power users can't separate work/personal
- Must restart to switch vaults initially

### Alternatives Considered

1. **Multi-vault from start** - ❌ More complex UI, increases scope; ✅ Add in Phase 2

---

## ADR-009: SQLite for Indexing

**Date**: 2025-10-08  
**Status**: Proposed 🤔

### Context
Need to index files for fast search, queries, and backlinks. Options: in-memory, SQLite, or full-text search engine.

### Decision
**Proposed**: Use SQLite for file indexing.

### Rationale
1. **Embedded**: No separate database process
2. **Fast**: Excellent for read-heavy workloads
3. **SQL**: Familiar query language
4. **FTS**: Built-in full-text search
5. **Proven**: Used by many applications

### Consequences

**Positive**:
- Fast search and queries
- Familiar technology
- No additional services
- Good FTS support

**Negative**:
- Must keep index in sync with files
- Rust SQLite bindings learning curve
- Index rebuild if corrupted

### Alternatives Considered

1. **In-Memory Index** - ❌ Lost on restart, must reindex on every launch
2. **Tantivy** (Rust search engine) - ✅ Very fast; ❌ More complex; 🤔 Consider for Phase 2
3. **No Index** (scan files each time) - ❌ Too slow for large vaults

**Status**: To be decided in development phase

---

## ADR-010: Documentation Before Code

**Date**: 2025-10-08  
**Status**: Accepted ✅

### Context
Previous attempts failed partly due to lack of clarity and planning.

### Decision
**Write comprehensive documentation BEFORE writing any application code.**

### Rationale
1. **Clarity**: Forces clear thinking about goals
2. **Scope**: Prevents feature creep
3. **Reference**: Documentation to return to when lost
4. **Decisions**: Record decisions to avoid re-litigating
5. **Learning**: From previous failed attempts

### Consequences

**Positive**:
- Clear vision before coding
- Reference material for entire project
- Decisions recorded for posterity
- Less likely to get lost in weeds

**Negative**:
- Delayed gratification (no code yet)
- Documentation can become outdated
- Risk of over-planning

### Alternatives Considered

1. **Code First, Document Later** - ❌ Already tried, led to chaos
2. **Minimal Documentation** - ❌ Not enough guidance

---

## Template for Future Decisions

```markdown
## ADR-XXX: [Decision Title]
**Date**: YYYY-MM-DD  
**Status**: Proposed | Accepted | Deprecated

### Context
[What situation led to this decision?]

### Decision
[What are we doing?]

### Rationale
[Why this choice?]

### Consequences
**Positive**:
- [Good thing 1]

**Negative**:
- [Trade-off 1]

### Alternatives Considered
1. **Option A** - [Pros/Cons]
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial decisions from planning phase | Kris |

