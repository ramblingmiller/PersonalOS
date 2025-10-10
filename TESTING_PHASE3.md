# Phase 3 Testing Guide

## Test Vault Created

A `test-vault/` directory has been created with sample markdown files containing wikilinks and content for testing.

## Testing Checklist

### 🚀 Getting Started

1. **Launch the app**
   ```bash
   npm run tauri dev
   ```

2. **Open the test vault**
   - Navigate to `/home/kris/Personal_Projects/PersonalOS/test-vault`
   - Open `README.md`

### 🔗 Wikilink Testing

**✅ Test 1: Visual Styling**
- [ ] Open `README.md`
- [ ] Wikilinks like `[[Wikilinks]]` should appear in **blue**
- [ ] They should have a **dashed underline**
- [ ] Cursor should turn to **pointer** on hover

**✅ Test 2: Navigation**
- [ ] Hold **Ctrl** (or Cmd on Mac)
- [ ] Click on `[[Getting Started]]`
- [ ] File should open
- [ ] Check console (Ctrl+Shift+I) for "Navigating to wikilink" log

**✅ Test 3: Aliases**
- [ ] Try clicking `[[Navigation History|History]]` (with custom display text)
- [ ] Should work same as regular wikilinks

**✅ Test 4: Multiple Links**
- [ ] Open `Wikilinks.md`
- [ ] Test clicking each link in the "Examples" section
- [ ] Each should navigate to correct file

### 🔍 Search Testing

**✅ Test 5: Quick File Search (Ctrl+P)**
- [ ] Press **Ctrl+P**
- [ ] Command palette opens
- [ ] Should show current directory files
- [ ] Type "wiki" → Should find `Wikilinks.md`
- [ ] Type "search" → Should find `Search Features.md`
- [ ] Press **Escape** to close

**✅ Test 6: Fuzzy Matching**
- [ ] Press **Ctrl+P**
- [ ] Type "gsmd" → Should find `Getting Started.md`
- [ ] Type "advfeat" → Should find `Advanced Features.md`

**✅ Test 7: Command Search (Ctrl+Shift+P)**
- [ ] Press **Ctrl+Shift+P**
- [ ] Should show command list
- [ ] Type "dark" → Should find "Toggle Dark Mode"
- [ ] Type "new" → Should find "New File" and "New Folder"
- [ ] Navigate with arrow keys
- [ ] Press **Escape** to close

**✅ Test 8: Advanced Search Panel (Ctrl+Shift+F)**
- [ ] Press **Ctrl+Shift+F**
- [ ] Search panel opens with two tabs: Files and Content
- [ ] **Files tab**: Type "project" → Should find `Project Notes.md`
- [ ] **Content tab**: Type "navigation history" → Should find content matches
- [ ] Click a result → Should open that file
- [ ] Context snippets should show matching text

**✅ Test 9: In-Editor Search (Ctrl+F)**
- [ ] Open any file
- [ ] Press **Ctrl+F**
- [ ] Search bar appears at **top of editor**
- [ ] Type a word that exists in the file
- [ ] All matches should highlight
- [ ] Press **Enter** to jump to next match
- [ ] Press **Shift+Enter** to go to previous match

**✅ Test 10: Indexing**
- [ ] Open console (Ctrl+Shift+I)
- [ ] Press **Ctrl+P** for the first time
- [ ] Console should show: "Starting background indexing..."
- [ ] After a moment: "Indexed X markdown files"
- [ ] Subsequent searches should use the index

### 🧭 Navigation History Testing

**✅ Test 11: Back/Forward Buttons**
- [ ] Open `README.md`
- [ ] Ctrl+Click on `[[Getting Started]]`
- [ ] Click the **◀ Back** button in menu bar
- [ ] Should go back to `README.md`
- [ ] Click the **▶ Forward** button
- [ ] Should go forward to `Getting Started.md`

**✅ Test 12: Keyboard Shortcuts**
- [ ] Open several files by clicking wikilinks
- [ ] Press **Alt+Left** → Go back
- [ ] Press **Alt+Right** → Go forward
- [ ] Buttons should gray out when at beginning/end

**✅ Test 13: History Integration**
- [ ] Navigate through multiple files using wikilinks
- [ ] Use back/forward to retrace your steps
- [ ] History should track all navigations

### 🎨 Dark Mode Testing

**✅ Test 14: Dark Mode Toggle**
- [ ] Click **View** menu → Toggle Dark Mode
- [ ] Or press **Ctrl+Shift+P** → Type "dark" → Select "Toggle Dark Mode"
- [ ] Wikilinks should be **light blue (#60a5fa)** in dark mode
- [ ] Editor should use dark theme
- [ ] All UI should be dark

**✅ Test 15: Theme Persistence**
- [ ] Toggle dark mode on
- [ ] Close and restart the app
- [ ] Dark mode should still be active

### ⌨️ Keyboard Shortcuts Summary

Test each of these works:

| Shortcut | Expected Behavior |
|----------|-------------------|
| **Ctrl+F** | Open in-editor find |
| **Ctrl+H** | Open find/replace |
| **Ctrl+P** | Quick file search |
| **Ctrl+Shift+P** | Command palette |
| **Ctrl+Shift+F** | Advanced search panel |
| **Ctrl+Click** | Follow wikilink |
| **Alt+Left** | Navigate back |
| **Alt+Right** | Navigate forward |
| **Ctrl+S** | Save file |
| **Ctrl+N** | New file |
| **Ctrl+B** | Toggle sidebar |

### 🐛 Edge Cases to Test

**✅ Test 16: Non-Existent Wikilink**
- [ ] Create a new file
- [ ] Type `[[Nonexistent File]]`
- [ ] Ctrl+Click on it
- [ ] Console should show warning: "Wikilink target not found"
- [ ] No crash or error

**✅ Test 17: Empty Search**
- [ ] Press Ctrl+P
- [ ] Don't type anything
- [ ] Should show current directory files
- [ ] No errors

**✅ Test 18: Special Characters**
- [ ] Create a file with special characters in name
- [ ] Try searching for it
- [ ] Should handle correctly

### 📊 Performance Testing

**✅ Test 19: Large File Handling**
- [ ] Open a large file (if available)
- [ ] Wikilinks should still render quickly
- [ ] Editor should remain responsive

**✅ Test 20: Search Speed**
- [ ] Index the test vault (6 files)
- [ ] Search should return results **instantly**
- [ ] No noticeable lag

## Expected Results

### Console Logs to See

When testing, you should see these console messages:

```
Search database ready at: /path/to/index.db
Starting background indexing...
Indexed 6 markdown files
Searching files for: query
Search results: [...]
Navigating to wikilink: Target
```

### Visual Indicators

- ✅ Wikilinks are **blue with dashed underline**
- ✅ Search panels have **proper dark mode styling**
- ✅ Back/forward buttons **gray out when disabled**
- ✅ Unsaved changes show **red asterisk**
- ✅ Loading states show **spinners**

## Common Issues & Solutions

### Issue: Wikilinks not styling
**Solution**: Refresh the page or restart app

### Issue: Search returns no results
**Solution**: 
- Check console for "Indexed X files" message
- Make sure files are .md format
- Try pressing Ctrl+P twice (first triggers indexing)

### Issue: Ctrl+Click doesn't work
**Solution**: Make sure you're holding Ctrl WHILE clicking

### Issue: Dark mode not working
**Solution**: 
- Check localStorage: `localStorage.getItem('theme')`
- Try toggling twice

## Success Criteria

Phase 3 is successful if:

- ✅ All wikilinks are clickable and styled
- ✅ Ctrl+Click navigation works reliably
- ✅ All three search methods work (Ctrl+F, Ctrl+P, Ctrl+Shift+F)
- ✅ Command palette filters and executes commands
- ✅ Navigation history tracks back/forward
- ✅ Search indexing completes without errors
- ✅ Performance is smooth and responsive
- ✅ Dark mode works correctly
- ✅ No console errors during normal usage

## Reporting Issues

If you find bugs:
1. Note the exact steps to reproduce
2. Check console for error messages (Ctrl+Shift+I)
3. Note which feature/shortcut isn't working
4. Try restarting the app to see if issue persists

## Next Steps After Testing

Once Phase 3 testing is complete:
- Update ImplementationLog.md
- Create a summary of any issues found
- Move to Phase 4 (AI Integration) or fix any issues first

