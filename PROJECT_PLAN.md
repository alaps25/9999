# Wires Portfolio - Project Plan & Backlog

## Current Status
- **Last Updated**: 2026-08-08
- **Main Branch**: production-ready with minimal design system
- **Current Branch**: `test/comprehensive-coverage` (Timeline + Security fixes)

---

## Active Initiatives

### 1. GSAP Animation Integration 🎬 (NEXT)
**Priority**: HIGH  
**Estimated**: 4 weeks  
**Owner**: Frontend Animation

- [ ] Install GSAP and dependencies
- [ ] Create animation hooks and utilities
- [ ] Timeline visualization animations (smooth reveals, stagger)
- [ ] Page transition animations
- [ ] Card and button micro-interactions
- [ ] Scroll-triggered animations (ScrollTrigger)
- [ ] Loading state animations
- [ ] Form interaction animations
- [ ] Modal/dialog animations
- [ ] Performance optimization and testing

**Details**: See `GSAP_INTEGRATION_PLAN.md`

---

### 2. Timeline Visualization 📅 (IN PROGRESS)
**Priority**: HIGH  
**Status**: Core complete, needs GSAP enhancement  
**PR**: #37 (feat: add timeline visualization)

- [x] TimelineView component with year grouping
- [x] Click-to-expand year interactions
- [x] Fetch all user projects (fixed)
- [ ] GSAP animations for smooth reveals
- [ ] Performance optimization
- [ ] Mobile responsiveness refinement

---

### 3. Security & Data Integrity ✅ (COMPLETED)
**Status**: Merged to main

- [x] Add ownership verification to deleteProject()
- [x] Add ownership verification to updateProject()
- [x] Wrap deletePage() in Firestore transaction
- [x] Fix updateUsername() race condition
- [x] Add comprehensive test coverage (65+ tests)

---

### 4. Test Coverage & Quality 🧪 (COMPLETED)
**Status**: 212+ tests, comprehensive coverage

- [x] Firebase query tests
- [x] Mutations security tests
- [x] Context integration tests
- [x] Performance tests
- [x] API route handler tests

---

## Backlog (Future Priorities)

### Medium Priority
- [ ] **Enhanced Hover Cards** - Richer preview on hover
- [ ] **Topic-based Clustering** - Alternative view (timeline + tags)
- [ ] **Mobile Optimization** - Fully responsive design
- [ ] **Dark Mode** - Theme switcher
- [ ] **SEO Optimization** - Meta tags, structured data

### Low Priority
- [ ] **Undo/Redo** - Transaction history
- [ ] **Comments/Feedback** - Add feedback system
- [ ] **Advanced Search** - Full-text search

---

## Stack & Design

### Current Tech
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules + SCSS
- **Animation**: CSS → GSAP (upgrading)
- **State**: React Context
- **Database**: Firebase/Firestore
- **Testing**: Jest
- **TypeScript**: Strict mode

### Philosophy
- Minimal, Bauhaus-inspired aesthetic
- Precision typography and spacing
- 60fps animations, <500ms page loads
- WCAG 2.1 AA accessibility

---

## Recent Commits
```
0dd98d4 - Fix timeline to fetch all user projects
a8849d0 - Fix SCSS selector syntax
b8a1ff2 - Add timeline visualization
471550c - Add visualization research document
7dd7779 - Auto-delete empty cards
```

---

## Next Steps
1. **Install GSAP** - `npm install gsap`
2. **Create animation utilities** - Reusable hooks & helpers
3. **Timeline animations** - Smooth reveals and interactions
4. **Page transitions** - Fade/slide between pages
5. **Comprehensive testing** - Test animations on all devices

See `GSAP_INTEGRATION_PLAN.md` for full details.
