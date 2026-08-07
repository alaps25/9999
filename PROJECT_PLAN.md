# Wires Project Plan & Roadmap

This document is the source of truth for project priorities, in-progress work, and completed features. Update it as work progresses.

---

## 📊 Current Status

- **Last Updated**: 2026-08-07
- **Main Branch**: Stable
- **Active Development**: Navigation performance optimization

---

## 🚀 In Progress

(none currently)

**Problem**: 
- Page transitions feel slow (1-3 second delays)
- Every page change runs multiple Firebase queries:
  - `getUserIdByUsername()`
  - `getUserSettings()`
  - `getPageIdBySlug()`
  - `getPortfolioDataByPageId()`

**Impact**: High — directly affects UX every time user navigates

**Proposed Solutions** (pick 1-2):
- [ ] Cache menu items and user data at layout level (not per-page)
- [ ] Use React Query or SWR for data fetching with caching
- [ ] Prefetch page data on hover over nav links
- [ ] Keep sidebar mounted during transitions (no "Loading..." for entire page)
- [ ] Leverage Next.js server components for static page parts

**Acceptance Criteria**:
- [ ] Page load time reduced to <500ms for repeat visits
- [ ] No data fetches for unchanged user/menu data
- [ ] Smooth transitions (no loading spinner for quick navigations)

**Tests Needed**:
- [ ] Performance benchmarks before/after
- [ ] Cache invalidation tests
- [ ] Prefetch behavior tests

---

## 🔴 High Priority (Next in Queue)

### 2. Auto-delete Empty Cards on Save
**Priority**: HIGH  
**Estimated Effort**: 1-2 hours  
**Type**: Feature (UX improvement)

**Description**: When user clicks SAVE, automatically delete any cards that have no content.

**Rationale**: Prevents clutter from accidentally added empty cards

**Acceptance Criteria**:
- [ ] Check each card on save for empty content
- [ ] Delete cards with empty title AND empty description AND no media
- [ ] Show brief toast notification when cards are auto-deleted
- [ ] Don't delete cards that have any content (even just a title)
- [ ] User can undo the auto-deletion (if undo/redo is implemented)

**Implementation**:
- Check in the save handler in `app/[username]/[slug]/edit/page.tsx`
- Add logic to filter out empty sections
- Display brief feedback to user

**Tests Needed**:
- [ ] Empty card detection logic
- [ ] Mixed content cards (only delete if truly empty)
- [ ] UI feedback appears

---

## 🟡 Medium Priority

### 3. Undo/Redo Support
**Priority**: MEDIUM  
**Estimated Effort**: 2-3 days  
**Type**: Feature (workflow improvement)

**Description**: Add undo/redo functionality for content editing

**Rationale**: Users may accidentally delete content and need to recover. Complements the deletion confirmation we added.

**Implementation Strategy**:
- Use a state management approach (context + reducer or zustand)
- Maintain history stack of portfolio states
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)

**Tests Needed**:
- [ ] History stack logic
- [ ] Keyboard shortcut binding
- [ ] Memory management (limit history to last N states)

---

### 4. Card Duplication
**Priority**: MEDIUM  
**Estimated Effort**: 2-3 hours  
**Type**: Feature (workflow improvement)

**Description**: Allow duplicating existing cards with one click

**Rationale**: Faster workflow when creating similar content

**Implementation**:
- Add "Duplicate" button next to delete in card controls
- Copy all content except ID (generate new ID)
- Insert copy directly below original

**Tests Needed**:
- [ ] Duplication preserves all content
- [ ] New ID generation works
- [ ] Placement logic (below original)

---

### 5. Bulk Media Upload
**Priority**: MEDIUM  
**Estimated Effort**: 2-3 hours  
**Type**: Feature (UX improvement)

**Description**: Upload multiple images at once to a media carousel

**Rationale**: Streamline adding multiple images

**Implementation**:
- Extend existing media upload to accept multiple files
- Show upload progress for each file
- Add to carousel in order

**Tests Needed**:
- [ ] Multiple file selection
- [ ] Upload progress tracking
- [ ] Error handling per-file

---

## 🟢 Low Priority (Nice to Have)

### 6. Export Portfolio as PDF
**Priority**: LOW  
**Type**: Feature

**Description**: Generate a PDF version of the portfolio

**Rationale**: Useful for sharing offline or printing

---

### 7. Analytics Dashboard
**Priority**: LOW  
**Type**: Feature

**Description**: Track portfolio views and engagement

**Rationale**: Help users understand their audience

---

### 8. Custom Fonts
**Priority**: LOW  
**Type**: Feature

**Description**: Allow users to choose from a font library

**Rationale**: More design customization options

---

## ✅ Completed

- ✅ **Page navigation performance optimization** (PR #32) — Reduced load time by caching user-level data
  - Created PortfolioContext to cache menuItems + bio at user level
  - Only fetch page-specific projects when navigating between pages
  - Eliminated duplicate queries for unchanged data
  - Estimated impact: 60-70% reduction in page transition time
- ✅ **Deletion confirmation dialog** (PR #29) — Prevent accidental card deletions
- ✅ **Documentation fixes** (PR #30) — Remove broken refs, update README
- ✅ **Jest testing infrastructure** (PR #31) — Foundation for unit/integration tests
- ✅ Multiple card types (V/H/Media/Slides/BigText)
- ✅ Drag-and-drop reordering (cards and pages)
- ✅ Rich text editor (TipTap)
- ✅ Mobile optimization
- ✅ Search functionality
- ✅ Move cards between pages
- ✅ Theme customization (light/dark/auto)
- ✅ Authentication (email + Google)
- ✅ Stripe integration
- ✅ Firebase integration

---

## 📝 Notes

**Technical Debt**:
- ESLint conflict in worktree (parent .eslintrc.json collision) — cosmetic, doesn't block work
- Audit vulnerabilities (42 in transitive deps) — pre-existing, not critical

**Testing Strategy**:
- Jest is now set up with 11 passing tests (slug utilities)
- Next: Add Firebase mutation tests, component tests, integration tests
- Goal: >80% coverage for critical paths (auth, mutations, validation)

**Deployment**:
- Ready for Vercel
- All recent features tested locally before merge
- PRs reviewed before merge

---

## 🔄 How to Use This Document

1. **Starting New Work**: Pick from "High Priority" section, move to "In Progress"
2. **During Work**: Update status, checkboxes, and notes in the relevant section
3. **Completing Work**: Move to "Completed" with PR link
4. **Reprioritizing**: Move items between priority levels as needed
5. **Reviewing**: Check this before standup/PRs to ensure nothing is missed
