# Prepare Wire Push

Before pushing any branch, run through this checklist to ensure code quality and consistency.

## 1. Code Quality Checks

Run all automated checks and fix any issues:

```bash
npm run type-check    # TypeScript - no type errors
npm run lint          # ESLint - no warnings or errors
npm run build         # Production build - must succeed (clear .next first if issues)
```

Quick one-liner:
```bash
npm run type-check && npm run lint && rm -rf .next && npm run build
```

---

## 2. Design System Compliance

### Use Only DS Components (from `components/ui/`)
| Component | Use For |
|-----------|---------|
| `Button` | All buttons (variants: `high`, `medium`, `low`) |
| `Input` | Text inputs (supports `leftIcon`, `rightIcon`, `fullWidth`) |
| `Dropdown` | Select menus (supports `leftIcon`, `alwaysShowPlaceholder`) |
| `Typography` | Text with semantic variants (`h1`, `h2`, `body`, etc.) |
| `EditableText` | Inline editable text fields |
| `RichTextEditor` | Rich text with TipTap (descriptions) |
| `RichTextDisplay` | Render rich text content (sanitized with DOMPurify) |
| `TagInput` | Tag entry with autocomplete |
| `AddButton` | "+" buttons for adding items |
| `AnimatedInsertButton` | Card insert/delete/move controls |
| `Lightbox` | Full-screen image/video viewer |
| `Accordion` | Collapsible sections |

### Never Do
- ❌ Create new button/input styles - extend existing DS components
- ❌ Use inline styles - use SCSS modules
- ❌ Hardcode colors - use SCSS variables
- ❌ Use other icon libraries - only `lucide-react`

### Styling Rules
```scss
// Always import variables
@import '../../styles/variables';

// Use DS color variables
color: $accent-primary;           // Main accent (black/white based on theme)
background: $accent-secondary;    // Background (opposite of primary)
color: $gray-600;                 // Muted text

// Use DS spacing
padding: $spacing-md;             // 16px
gap: $spacing-lg;                 // 24px

// Responsive breakpoints
@include respond-to(md) {
  // Mobile styles (< 768px)
}

// Border radius from CSS custom property
border-radius: var(--border-radius, 0px);
```

---

## 3. Project-Specific Patterns

### Firebase Data Layer
| File | Purpose |
|------|---------|
| `lib/firebase/queries.ts` | Read operations (get*) |
| `lib/firebase/mutations.ts` | Write operations (add*, update*, delete*) |
| `lib/firebase/types.ts` | TypeScript interfaces |
| `lib/firebase/storage.ts` | File upload/delete |

**Always:**
- Scope queries with `userId` for user data
- Handle errors with try/catch
- Return empty arrays/null on error (don't throw in queries)

### Hooks to Use
```tsx
const { user, userData, loading } = useAuth()     // Authentication
const isMobile = useIsMobile()                     // Responsive logic
```

### Card Types
When working with cards, respect the content config:
```tsx
project.content?.showTitle
project.content?.showDescription
project.content?.showSingleImage
project.content?.showTags
project.content?.layout  // 'vertical' | 'horizontal'
```

### Navigation
- Use `getMenuItemsWithSearch()` for primary menu (includes Search at bottom)
- Use `getSecondaryMenuItems()` for secondary menu (Share, Settings, etc.)
- Menu items have `isActive` state for highlighting

### Animations
- Use Framer Motion for animations (`motion.div`, `AnimatePresence`)
- Use `@dnd-kit` for drag-and-drop (cards, pages)

---

## 4. Code Quality Checklist

### React
- [ ] No `console.log` (only `console.error` for real errors)
- [ ] Hooks follow rules (no conditional hooks)
- [ ] `useMemo`/`useCallback` for expensive operations
- [ ] Loading and error states handled
- [ ] useEffect cleanup where needed

### TypeScript
- [ ] No `any` types (unless truly necessary)
- [ ] Props interfaces defined and exported
- [ ] Types from `lib/firebase/types.ts` used consistently

### Code Cleanliness
- [ ] No commented-out code
- [ ] No debug/test data
- [ ] Meaningful names
- [ ] Single responsibility functions

---

## 5. Git Hygiene

Before committing:
```bash
git status           # Review changed files
git diff             # Review actual changes
```

Commit message format:
```bash
git commit --no-gpg-sign -m "$(cat <<'EOF'
Add/Fix/Update/Remove: Brief description

- Detail 1
- Detail 2
EOF
)"
```

Push:
```bash
git push -u origin HEAD
```

---

## 6. Pre-Push Final Checks

- [ ] Tested the feature manually in browser
- [ ] No browser console errors
- [ ] Works on mobile viewport (check with DevTools)
- [ ] All automated checks pass
- [ ] Commit message is clear and accurate
