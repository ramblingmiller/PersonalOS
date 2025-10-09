---
title: PersonalOS Project Charter
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, charter, foundation]
---

# PersonalOS Project Charter

## Executive Summary

**PersonalOS** is a desktop application that brings AI-powered coding assistance (Cursor-style) into a knowledge management environment (Obsidian-style). It's designed as "VSCode/Cursor WITH Obsidian capabilities" rather than the reverse.

**Key Decision**: We are using **Tauri** as the application framework. This is final.

## Project Vision

### The Problem
I spend my day switching between:
- **Cursor/VSCode**: For AI assistance, code editing, project work
- **Obsidian**: For notes, knowledge management, planning

This context switching is inefficient and breaks flow state.

### The Solution
A single unified application that provides:
- ✅ Full local file system access (like VSCode)
- ✅ AI-powered assistance (like Cursor)
- ✅ Markdown vault management (like Obsidian)
- ✅ Native desktop performance
- ✅ Privacy-focused, local-first architecture

### The Philosophy

**"VSCode/Cursor WITH Obsidian capabilities"**

This means:
- Primary use case: AI-assisted knowledge work and coding
- Secondary benefit: Obsidian's linking and organization
- **Not**: Obsidian with AI bolted on
- **Not**: A web app pretending to be desktop
- **Not**: An Electron app that will break

## Lessons Learned from Previous Attempts

### What Didn't Work

#### ❌ Electron Approach
- **Problem**: Environment kept breaking
- **Lesson**: Electron's complexity and frequent breaking changes cause friction
- **Decision**: Never use Electron for this project

#### ❌ Web App with File System Access API
- **Problem**: Security restrictions, permission issues
- **Lesson**: Browser sandboxing prevents the file access we need
- **Decision**: Must be a true desktop application

#### ❌ Obsidian Plugin
- **Problem**: Too constrained by plugin API
- **Lesson**: Can't achieve the VSCode-like experience within Obsidian
- **Decision**: Build standalone, not a plugin

#### ❌ Mixed Technology Project
- **Problem**: Started with Tauri, added Neutralino, then Electron
- **Lesson**: Technology chaos leads to unmaintainable code
- **Decision**: Pick ONE technology and stick with it

### What We're Doing Differently

1. **Documentation First**: No code until architecture is clear
2. **Single Technology**: Tauri only, no alternatives
3. **Clear Scope**: Write down what this is and isn't
4. **Verification Steps**: Prove each layer works before moving on

## Core Objectives

### Must-Have Objectives (MVP)
1. **Stable Development Environment**
   - Can build and run without environment issues
   - Development setup survives system updates
   - Can return to project after weeks without setup hell

2. **Full File System Access**
   - Open any file anywhere on the system
   - Create, edit, delete files and folders
   - No browser security restrictions
   - No sandboxing limitations

3. **Markdown Editing**
   - Syntax highlighting
   - Live preview (optional)
   - Wikilink navigation `[[Note Name]]`
   - YAML frontmatter parsing
   - Tag support `#tag`

4. **File Organization**
   - File tree sidebar
   - Search functionality
   - Quick file switching (command palette)
   - Recent files

5. **Basic AI Integration**
   - Chat interface
   - Context awareness of current file
   - File analysis capabilities
   - Bring Your Own Key (BYOK) model

### Nice-to-Have Objectives (Post-MVP)
- Dataview-like queries
- Task management
- Daily notes automation
- Template system
- Backlinks panel
- Graph view
- Multi-vault support
- Plugin system

### Explicitly NOT Objectives
- ❌ Web application
- ❌ Mobile apps
- ❌ Cloud sync
- ❌ Collaborative editing
- ❌ Email integration
- ❌ Calendar integration (initially)
- ❌ Being feature-complete with Obsidian
- ❌ Being feature-complete with VSCode

## Scope Boundaries

### In Scope
- **Platform**: Linux (primary), macOS, Windows (future)
- **Data**: Local markdown files only
- **Interface**: Desktop application with native feel
- **AI**: API-based (OpenAI, Anthropic, etc.)
- **Extensibility**: Plugin system (Phase 2)

### Out of Scope
- Any web-based deployment
- Mobile platforms
- Cloud storage/sync
- Real-time collaboration
- Self-hosted AI models (Phase 1)

## Success Criteria

### Development Success
- [ ] Can set up development environment in < 30 minutes
- [ ] Can build project without errors on fresh machine
- [ ] Can return after 1 month break and run `npm run tauri dev` successfully
- [ ] Zero environment-related issues for 3 months

### Functional Success
- [ ] Can open and edit files anywhere on system
- [ ] Can navigate between notes using wikilinks
- [ ] Can search entire vault in < 1 second
- [ ] AI assistant can analyze current file
- [ ] Application starts in < 3 seconds

### Usage Success
- [ ] Actually prefer using PersonalOS over Cursor + Obsidian
- [ ] Use it as primary tool for 1 full week
- [ ] No data loss or corruption
- [ ] Complete at least 5 "real work" sessions

## Constraints

### Technical Constraints
- **Must use Tauri** (Rust + Web frontend)
- **Must support Linux** (primary development OS)
- **Local-first only** (no cloud requirements)
- **Privacy-focused** (no telemetry without consent)

### Resource Constraints
- **Solo developer** (no team)
- **Side project** (not full-time)
- **No budget** (use free/open-source where possible)
- **Time**: Realistic expectations, no deadlines

### Design Constraints
- **Minimalist UI** (inspired by Sublime Text)
- **Keyboard-first** (mouse optional for common tasks)
- **Fast and responsive** (no lag, no stuttering)
- **Dark mode required** (light mode optional)

## Risk Management

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Tauri learning curve | Medium | Medium | Start with official examples, thorough docs |
| Rust backend complexity | Medium | High | Keep Rust simple, use examples |
| Feature creep | High | High | Stick to charter, phase releases |
| Development burnout | Medium | High | Small milestones, celebrate wins |
| Technology choice regret | Low | Critical | Extensive research phase (done) |
| Lost motivation | Medium | High | Use the tool while building it |

## Project Timeline (Estimate)

### Phase 0: Foundation (Week 1-2) ⬅️ **WE ARE HERE**
- [ ] Complete all documentation
- [ ] Verify Tauri installation
- [ ] Create project structure
- [ ] Set up version control

### Phase 1: Basic App (Week 3-4)
- [ ] Empty Tauri window opens
- [ ] File tree displays
- [ ] Can open and display text files
- [ ] Basic toolbar/menu

### Phase 2: Markdown Editor (Week 5-6)
- [ ] CodeMirror integration
- [ ] Syntax highlighting
- [ ] YAML frontmatter parsing
- [ ] Save functionality

### Phase 3: Navigation (Week 7-8)
- [ ] Wikilink parsing
- [ ] Link navigation
- [ ] File search
- [ ] Command palette

### Phase 4: AI Integration (Week 9-10)
- [ ] Chat interface
- [ ] API integration
- [ ] Context passing
- [ ] BYOK setup

### Phase 5: Polish (Week 11-12)
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation
- [ ] Start using daily

## Stakeholders & Roles

**Primary Stakeholder**: Me (Kris)
- **Role**: Developer, Designer, User, Decision Maker
- **Needs**: Unified workspace, stable environment, AI assistance
- **Success metric**: Actually use it daily

**Secondary Stakeholder**: Future Users (Potential)
- **Role**: Potential users, community
- **Needs**: TBD based on Phase 5 feedback
- **Success metric**: Not relevant for Phase 1

## Decision Authority

All decisions rest with **me**. This document represents my commitment to:
1. Follow the plan
2. Avoid scope creep
3. Finish what I start
4. Use documentation to stay on track

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial charter, fresh start | Kris |

---

**Status**: Approved for development ✅  
**Next Document**: RequirementsSpecification.md

