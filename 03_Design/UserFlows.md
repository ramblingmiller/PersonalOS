---
title: PersonalOS User Flows
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, design, user-flows, ux]
---

# PersonalOS User Flows

## Overview

This document outlines the key user journeys through PersonalOS, showing how users accomplish their goals.

## Flow 1: First-Time User Setup

```
Start
  ↓
Launch PersonalOS
  ↓
[Empty State Screen]
"Welcome to PersonalOS"
  ↓
Click "Select Vault Folder"
  ↓
[OS File Picker Opens]
  ↓
User selects folder
  ↓
App indexes folder
[Progress indicator]
  ↓
[Main UI loads]
- File tree populated
- Welcome note opens in editor
  ↓
Success: User can start working
```

## Flow 2: Creating a New Note

```
User is in main interface
  ↓
Press Ctrl+N
OR Right-click in file tree → "New File"
  ↓
[New file dialog]
  ↓
Enter filename
  ↓
Press Enter
  ↓
New file created
  ↓
File opens in new tab
  ↓
Cursor in editor
  ↓
User starts typing
  ↓
[Auto-save after 30s or Ctrl+S]
  ↓
Success: Note created and saved
```

## Flow 3: Finding and Opening a File

### Via Quick Open (Ctrl+P)

```
Press Ctrl+P
  ↓
[Command palette opens]
  ↓
Type search query (e.g., "todo")
  ↓
[Results filter in real-time]
  ↓
Arrow keys to select
  ↓
Press Enter
  ↓
File opens in new tab
  ↓
Success: User viewing desired file
```

### Via File Tree

```
Look at file tree
  ↓
See desired file
  ↓
Click file
  ↓
File highlighted in tree
  ↓
Double-click OR press Enter
  ↓
File opens in new tab
  ↓
Success: User viewing desired file
```

## Flow 4: Following a Wikilink

```
User reading a note
  ↓
See wikilink [[Other Note]]
  ↓
Ctrl+Click on wikilink
OR Click wikilink
  ↓
Target file opens in current tab
OR new tab (if configured)
  ↓
Previous file added to back history
  ↓
Success: User navigated to linked note

To go back:
  ↓
Press Alt+← (back button)
  ↓
Returns to previous note
```

## Flow 5: Searching Note Contents

```
Press Ctrl+Shift+F
OR Click search icon
  ↓
[Search panel opens]
  ↓
Type search query
  ↓
[Results appear as user types]
- Matches highlighted
- Context shown
  ↓
Click result
  ↓
File opens at matching line
  ↓
Match highlighted in editor
  ↓
Success: User found content
```

## Flow 6: Using AI Assistant

### Starting a Conversation

```
Press Ctrl+Shift+A
OR Click AI icon
  ↓
[AI panel opens on right]
  ↓
Type message in input
  ↓
Press Enter OR click Send
  ↓
Message appears in chat
  ↓
[AI thinking indicator]
  ↓
Response streams in
  ↓
User reads response
  ↓
Success: AI conversation started
```

### Sending Current File to AI

```
User has file open
  ↓
Press Ctrl+Shift+L
OR Click "Send to AI" in menu
  ↓
[AI panel opens if closed]
  ↓
Current file added to context
[Context indicator shows file name]
  ↓
Type question about file
  ↓
AI responds with file context
  ↓
Success: AI analyzed file
```

### Applying AI Suggestion

```
AI suggests code/text change
  ↓
[Suggestion shown in chat]
  ↓
Click "Apply" button
  ↓
[Confirmation dialog]
"Apply this change to [file]?"
  ↓
Click "Apply"
  ↓
Editor updates with change
  ↓
[Undo available Ctrl+Z]
  ↓
Success: Change applied
```

## Flow 7: Organizing Files

### Creating a Folder

```
Right-click in file tree
  ↓
Select "New Folder"
  ↓
[Inline input appears]
  ↓
Type folder name
  ↓
Press Enter
  ↓
Folder created and expanded
  ↓
Success: New folder ready
```

### Moving a File (Phase 2)

```
Click and hold file in tree
  ↓
[Drag feedback appears]
  ↓
Drag to target folder
  ↓
[Drop target highlighted]
  ↓
Release mouse
  ↓
[Confirmation]
"Move file to folder?"
  ↓
Click "Yes"
  ↓
File moved
  ↓
Tree updates
  ↓
Success: File reorganized
```

## Flow 8: Handling Errors

### File Cannot Be Opened

```
User tries to open file
  ↓
File doesn't exist OR no permission
  ↓
[Error dialog appears]
"Cannot open file.md
 It may have been deleted."
  ↓
Options:
- [Try Again] → Retry operation
- [Remove from tree] → Remove dead link
- [Cancel] → Close dialog
  ↓
User chooses action
  ↓
Appropriate outcome
```

### AI API Error

```
User sends AI message
  ↓
API call fails (invalid key, network, etc.)
  ↓
[Error appears in chat]
"⚠️ API Error: [message]"
  ↓
[Action buttons]
- [Open Settings] → Fix API key
- [Retry] → Try again
  ↓
User takes action
  ↓
Issue resolved OR user informed
```

### Unsaved Changes

```
User has unsaved changes
  ↓
Tries to close tab OR quit app
  ↓
[Confirmation dialog]
"Save changes to file.md?"
  ↓
Options:
- [Save] → Save and continue
- [Don't Save] → Discard and continue
- [Cancel] → Stay in file
  ↓
User chooses
  ↓
Appropriate action taken
```

## Flow 9: Customizing Settings

```
Press Ctrl+,
OR Menu → Settings
  ↓
[Settings panel opens]
  ↓
Navigate to desired section:
- General
- Editor
- AI
- Appearance
  ↓
Change setting
  ↓
[Auto-save OR click Save]
  ↓
Setting takes effect
  ↓
Success: App customized
```

### Configuring AI API Key

```
Open Settings
  ↓
Go to AI section
  ↓
Select Provider (OpenAI, Anthropic, etc.)
  ↓
Click "Configure API Key"
  ↓
[Secure input appears]
  ↓
Paste API key
  ↓
Click "Test Connection"
  ↓
[Testing...]
  ↓
"✅ Connection successful"
OR "❌ Invalid key"
  ↓
Click "Save"
  ↓
Key stored securely in OS keyring
  ↓
Success: AI ready to use
```

## Flow 10: Recovering from Crash

```
App crashes unexpectedly
  ↓
User relaunches app
  ↓
[Recovery dialog]
"PersonalOS didn't close properly.
 Would you like to recover your session?"
  ↓
Options:
- [Recover] → Restore open files
- [Start Fresh] → Clean start
  ↓
User chooses "Recover"
  ↓
App restores:
- Open files
- Cursor positions
- Unsaved changes
  ↓
[Status message]
"Session recovered"
  ↓
Success: User back to work
```

## Decision Points

### When to Show AI Panel

```
User triggers AI:
├─ First time?
│  ├─ Yes → Show setup guide
│  └─ No → Continue
├─ API key configured?
│  ├─ Yes → Open panel
│  └─ No → Prompt to configure
└─ Panel already open?
   ├─ Yes → Focus input
   └─ No → Open and focus
```

### When to Auto-Save

```
User edits file:
├─ 30 seconds since last edit?
│  └─ Yes → Auto-save
├─ User switches to another file?
│  └─ Yes → Auto-save current
├─ User quits app?
│  └─ Yes → Save all OR prompt
└─ Otherwise → Wait
```

### When to Index Files

```
App starts:
├─ Index exists?
│  ├─ Yes → Check if outdated
│  │  ├─ Outdated → Rebuild index
│  │  └─ Current → Use existing
│  └─ No → Build new index
└─ While running:
   └─ File change detected → Update index
```

## Edge Cases

### Dead Wikilinks

```
User clicks [[Nonexistent Note]]
  ↓
[Dialog]
"'Nonexistent Note' doesn't exist.
 Would you like to create it?"
  ↓
Options:
- [Create] → Create new file
- [Cancel] → Do nothing
  ↓
If Create:
  ↓
  New file created with that name
  ↓
  Opens in editor
```

### Large Vaults (10,000+ files)

```
User selects large vault
  ↓
[Warning dialog]
"This vault has 15,000 files.
 Indexing may take a few minutes."
  ↓
[Continue] OR [Cancel]
  ↓
If Continue:
  ↓
  [Progress bar]
  "Indexing: 42%"
  ↓
  App usable during indexing
  ↓
  [Complete]
  "Index complete"
```

### Binary Files

```
User tries to open .pdf, .jpg, etc.
  ↓
[Info dialog]
"This file type cannot be edited.
 Open in default application?"
  ↓
[Open Externally] OR [Cancel]
  ↓
If Open:
  ↓
  OS default app opens file
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial user flows | Kris |



