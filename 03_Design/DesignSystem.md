---
title: PersonalOS Design System
created: 2025-10-08
version: 1.0
status: active
tags: [personalos, design, design-system]
---

# PersonalOS Design System

## Overview

This document defines the reusable design patterns, components, and guidelines for PersonalOS.

## Design Tokens

### Colors

```typescript
// tailwind.config.js
export const colors = {
  // Dark theme (default)
  dark: {
    bg: {
      primary: '#1e1e1e',
      secondary: '#181818',
      tertiary: '#252525',
    },
    text: {
      primary: '#d4d4d4',
      secondary: '#888888',
      tertiary: '#6e6e6e',
    },
    border: {
      default: '#333333',
      subtle: '#2a2a2a',
      emphasis: '#454545',
    },
    accent: {
      primary: '#569cd6',
      success: '#4ec9b0',
      warning: '#ce9178',
      error: '#f44747',
    }
  },
  
  // Light theme (optional)
  light: {
    bg: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#fafafa',
    },
    text: {
      primary: '#1e1e1e',
      secondary: '#6e6e6e',
      tertiary: '#888888',
    },
    border: {
      default: '#e0e0e0',
      subtle: '#f0f0f0',
      emphasis: '#c0c0c0',
    },
    accent: {
      primary: '#0078d4',
      success: '#16825d',
      warning: '#b5200d',
      error: '#e81123',
    }
  }
};
```

### Typography

```typescript
export const typography = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 1.8,
  },
};
```

### Spacing

```typescript
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};
```

### Border Radius

```typescript
export const borderRadius = {
  none: '0',
  sm: '2px',
  default: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
};
```

### Shadows

```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};
```

## Component Library

### Button

```typescript
// Primary button
<button className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary-hover">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 border border-border-default rounded hover:bg-bg-tertiary">
  Secondary Action
</button>

// Ghost button
<button className="px-4 py-2 hover:bg-bg-tertiary rounded">
  Ghost Action
</button>
```

### Input Field

```typescript
<input 
  type="text"
  className="px-3 py-2 bg-bg-tertiary border border-border-default rounded focus:border-accent-primary outline-none"
  placeholder="Enter text..."
/>
```

### File Tree Item

```typescript
<div className="flex items-center px-2 py-1 hover:bg-bg-tertiary cursor-pointer rounded">
  <Icon name="file" className="mr-2 text-text-secondary" />
  <span className="text-text-primary">filename.md</span>
</div>
```

### Tab

```typescript
<div className="flex border-b border-border-default">
  <button className="px-4 py-2 border-b-2 border-accent-primary text-accent-primary">
    Active Tab
  </button>
  <button className="px-4 py-2 text-text-secondary hover:text-text-primary">
    Inactive Tab
  </button>
</div>
```

### Modal

```typescript
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div className="bg-bg-primary rounded-lg shadow-xl max-w-md w-full p-6">
    <h2 className="text-lg font-semibold mb-4">Modal Title</h2>
    <p className="text-text-secondary mb-6">Modal content goes here.</p>
    <div className="flex justify-end gap-2">
      <button className="px-4 py-2 hover:bg-bg-tertiary rounded">Cancel</button>
      <button className="px-4 py-2 bg-accent-primary text-white rounded">Confirm</button>
    </div>
  </div>
</div>
```

### Toast Notification

```typescript
<div className="fixed bottom-4 right-4 bg-bg-tertiary border border-border-default rounded-lg shadow-lg p-4 flex items-center gap-3">
  <Icon name="check-circle" className="text-accent-success" />
  <span className="text-text-primary">Action completed successfully</span>
  <button className="ml-auto text-text-secondary hover:text-text-primary">
    <Icon name="x" />
  </button>
</div>
```

## Layout Patterns

### Two-Column Layout

```typescript
<div className="flex h-screen">
  <aside className="w-64 bg-bg-secondary border-r border-border-default">
    {/* Sidebar content */}
  </aside>
  <main className="flex-1 flex flex-col">
    {/* Main content */}
  </main>
</div>
```

### Three-Column Layout (with AI panel)

```typescript
<div className="flex h-screen">
  <aside className="w-64 bg-bg-secondary border-r border-border-default">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 flex flex-col">
    {/* Editor */}
  </main>
  <aside className="w-80 bg-bg-secondary border-l border-border-default">
    {/* AI Panel */}
  </aside>
</div>
```

## Animation Guidelines

### Transition Timing

```css
.transition-fast {
  transition: all 100ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.transition-normal {
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.transition-slow {
  transition: all 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

### Common Transitions

```typescript
// Hover states
.button {
  @apply transition-fast hover:bg-opacity-90;
}

// Panel open/close
.panel {
  @apply transition-slow;
}

// Fade in
.fade-in {
  animation: fadeIn 200ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Icon Usage

### Icon Library: Lucide React

```typescript
import { File, Folder, Search, Settings, Bot, X } from 'lucide-react';

// Standard size: 16px
<File size={16} />

// Larger for emphasis: 20px
<Bot size={20} />
```

### Icon Guidelines
- Use consistent size within context
- Pair with text labels for clarity
- Use semantic colors (success=green, error=red)
- Don't use color alone to convey meaning

## Responsive Breakpoints

```typescript
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Usage in Tailwind
className="hidden md:block"  // Hidden on mobile, visible on tablet+
className="w-full lg:w-1/2"  // Full width on mobile, half on desktop
```

## Accessibility Guidelines

### Focus States
```css
.focusable {
  @apply focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2;
}
```

### ARIA Labels
```typescript
<button aria-label="Close dialog">
  <X size={16} />
</button>

<input aria-label="Search files" placeholder="Search..." />
```

### Semantic HTML
- Use `<button>` for actions, not `<div onclick>`
- Use `<nav>` for navigation areas
- Use `<main>` for main content
- Use heading hierarchy (`<h1>`, `<h2>`, etc.)

## Dark Mode Implementation

```typescript
// Tailwind CSS with dark mode
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
        },
        // ... other colors
      }
    }
  }
}

// CSS variables
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
}

.dark {
  --color-bg-primary: #1e1e1e;
  --color-bg-secondary: #181818;
}
```

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-08 | Initial design system | Kris |





