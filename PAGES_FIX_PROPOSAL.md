# Pages Management System - Refactoring Proposal

## Executive Summary

This proposal outlines a comprehensive refactoring plan to fix the broken page creation, editing, and showcasing system in the Wires portfolio application. The current implementation suffers from routing ambiguity, complex data loading logic, and unclear separation between view and edit modes.

---

## Current Issues Analysis

### 1. **Routing Ambiguity**
- **Problem**: The `/[slug]` route handles both usernames AND page slugs, creating confusion
- **Evidence**: 
  - `app/[slug]/page.tsx` has fallback logic trying to determine if slug is a username or page
  - Complex conditional logic: `if ((!data.sections.length && !data.bio) && data.menuItems.length > 0)`
- **Impact**: Unpredictable behavior, difficult to debug, poor user experience

### 2. **Page Identification Complexity**
- **Problem**: Pages are identified by slugs, but the relationship between MenuItem (page) and Projects uses `pageId`
- **Evidence**:
  - `getPortfolioData()` tries to match slugs to menu items, then filter projects by pageId
  - Edit page has complex matching logic: `item.slug === pageSlug || item.href === \`/${pageSlug}\` || (pageSlug === 'page' && (!item.slug || item.slug === 'page'))`
- **Impact**: Fragile code with multiple fallback mechanisms, potential for bugs

### 3. **Edit/View Mode Separation**
- **Problem**: Separate routes (`/[slug]` vs `/[slug]/edit`) but no clear way to switch between modes
- **Evidence**: 
  - No edit button/toggle in view mode
  - No view/preview button in edit mode
  - Users must manually navigate to `/edit` route
- **Impact**: Poor UX, users may not discover edit functionality

### 4. **Data Loading Inefficiency**
- **Problem**: Complex data fetching with multiple fallbacks and conditional logic
- **Evidence**:
  - `getPortfolioData()` does slug matching, then filters projects
  - Edit page loads data, then tries to find `currentPageId` separately
- **Impact**: Performance issues, race conditions, loading state complexity

### 5. **Navigation Inconsistencies**
- **Problem**: Sidebar uses `href` which may not always match actual routes
- **Evidence**: 
  - MenuItem has both `slug` and `href` (deprecated)
  - Sidebar checks `pathname === item.href` but routes use slugs
- **Impact**: Active state highlighting may not work correctly

### 6. **Page Creation Flow**
- **Problem**: No clear "create page" flow - pages are created via menu items
- **Evidence**: 
  - `handleAddMenuItem()` creates menu item, but relationship to "page" is unclear
  - No dedicated page creation UI
- **Impact**: Confusing for users, unclear mental model

---

## Industry Best Practices Research

### Modern CMS Architecture Patterns

1. **Clear Route Separation**
   - **Pattern**: Separate routes for different contexts (e.g., `/admin/pages`, `/pages/[id]`, `/pages/[id]/edit`)
   - **Examples**: Next.js App Router, Sanity Studio, Contentful
   - **Benefit**: Predictable URLs, better SEO, clearer mental model

2. **Unified Edit/View Mode**
   - **Pattern**: Single route with mode toggle (e.g., `?mode=edit` query param or `/edit` subroute)
   - **Examples**: Notion, Figma, Linear
   - **Benefit**: Seamless switching, better UX, URL reflects state

3. **Page ID-Based Routing**
   - **Pattern**: Use stable IDs for routing, slugs for SEO-friendly URLs
   - **Examples**: WordPress (post ID + slug), Ghost CMS
   - **Benefit**: Stable references, slug changes don't break links

4. **Optimistic Updates**
   - **Pattern**: Update UI immediately, sync with backend asynchronously
   - **Examples**: Linear, Notion, Figma
   - **Benefit**: Perceived performance, better UX

5. **Draft/Published States**
   - **Pattern**: Separate draft and published versions
   - **Examples**: WordPress, Contentful, Sanity
   - **Benefit**: Preview changes before publishing, better content workflow

---

## Proposed Solution Architecture

### 1. **Route Structure Redesign**

#### Current Structure (Broken)
```
/[slug]              → View page (ambiguous: username or page?)
/[slug]/edit         → Edit page
/edit                → Redirect to first page edit
```

#### Proposed Structure (Clean)
```
/[username]          → Public portfolio view (username-based)
/[username]/[slug]   → View specific page (username + page slug)
/[username]/[slug]/edit → Edit specific page
/admin/pages         → Page management dashboard (optional)
```

**Benefits**:
- Clear separation: public routes vs admin routes
- Username-based routing eliminates ambiguity
- Predictable URL structure

### 2. **Page Identification System**

#### Current System (Fragile)
- Pages identified by slugs
- Complex slug-to-pageId mapping
- Multiple fallback mechanisms

#### Proposed System (Robust)
- **Primary Key**: Use `pageId` (Firestore document ID) as the source of truth
- **Slug**: SEO-friendly URL identifier, can be changed without breaking references
- **Route Pattern**: `/[username]/[slug]` where slug is looked up from pageId
- **Data Flow**: 
  1. Load page by slug → get pageId
  2. Load all projects filtered by pageId
  3. Cache pageId for subsequent operations

**Benefits**:
- Stable references (pageId never changes)
- SEO-friendly URLs (slug can change)
- Simpler data loading logic

### 3. **Unified Edit/View Mode**

#### Option A: Query Parameter (Recommended)
```
/[username]/[slug]?mode=edit → Edit mode
/[username]/[slug]           → View mode
```

**Implementation**:
- Single route component
- Mode determined by `searchParams.mode`
- Edit toggle button in view mode
- Preview button in edit mode

**Benefits**:
- Single source of truth
- Easy to share edit links
- URL reflects state

#### Option B: Subroute (Alternative)
```
/[username]/[slug]      → View mode
/[username]/[slug]/edit → Edit mode
```

**Benefits**:
- Clear separation
- Better for SEO (edit routes can be excluded)

### 4. **Data Loading Optimization**

#### Current Flow (Complex)
```
1. Load portfolio data with slug
2. Match slug to menu item
3. Extract pageId
4. Filter projects by pageId
5. Handle fallbacks if not found
```

#### Proposed Flow (Simple)
```
1. Load menu items for user
2. Find menu item by slug → get pageId
3. Load projects filtered by pageId (single query)
4. Load bio if needed
5. Combine into PortfolioData
```

**Optimizations**:
- Single Firestore query for projects (filtered by pageId)
- Cache menu items (rarely change)
- Parallel loading where possible
- Use React Query or SWR for caching

### 5. **Page Management UI**

#### Current State
- Pages created via "Add Page" button in sidebar
- No dedicated page management interface
- Confusing relationship between menu items and pages

#### Proposed State
- **Page List View**: Show all pages with preview, edit, delete actions
- **Page Creation**: Dedicated modal/form for creating new pages
- **Page Settings**: Edit page title, slug, visibility, etc.
- **Page Reordering**: Drag-and-drop to reorder pages

**UI Components**:
- Page management sidebar/drawer
- Page creation modal
- Page settings panel
- Quick actions (duplicate, delete, archive)

### 6. **Navigation System**

#### Current Issues
- Sidebar uses `href` which may not match routes
- Active state based on pathname matching
- No clear indication of edit mode

#### Proposed Solution
- **Unified Navigation**: Use `pageId` internally, generate routes from slugs
- **Active State**: Match by `pageId` instead of pathname
- **Edit Mode Indicator**: Visual indicator when in edit mode
- **Breadcrumbs**: Show current page hierarchy

**Implementation**:
```typescript
// Generate href from slug
const href = `/${username}/${page.slug}`

// Match active state by pageId
const isActive = currentPageId === page.id
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Refactor Route Structure**
   - Update `app/[username]/[slug]/page.tsx` for public view
   - Update `app/[username]/[slug]/edit/page.tsx` for edit mode
   - Remove ambiguous `/[slug]` route

2. **Simplify Data Loading**
   - Refactor `getPortfolioData()` to use pageId-based queries
   - Remove complex fallback logic
   - Add proper error handling

3. **Update Navigation**
   - Fix sidebar to use correct routes
   - Update active state logic
   - Add edit/view mode toggle

### Phase 2: UX Improvements (Week 2)
1. **Edit/View Mode Toggle**
   - Add edit button in view mode
   - Add preview button in edit mode
   - Smooth transitions between modes

2. **Page Management UI**
   - Create page list component
   - Add page creation modal
   - Add page settings panel

3. **Optimistic Updates**
   - Implement optimistic UI updates
   - Add loading states
   - Handle error states gracefully

### Phase 3: Advanced Features (Week 3)
1. **Draft/Published States**
   - Add draft mode for pages
   - Preview functionality
   - Publish workflow

2. **Page Reordering**
   - Drag-and-drop interface
   - Update order in Firestore
   - Persist order changes

3. **Performance Optimization**
   - Implement caching (React Query/SWR)
   - Optimize Firestore queries
   - Add pagination for large portfolios

---

## Technical Specifications

### Data Model Changes

#### Current MenuItem
```typescript
interface MenuItem {
  id: string
  label: string
  slug?: string
  href?: string  // Deprecated
  isActive?: boolean
}
```

#### Proposed Page Model
```typescript
interface Page {
  id: string              // Firestore document ID (pageId)
  userId: string          // Owner user ID
  title: string           // Display title
  slug: string           // URL-friendly identifier (unique per user)
  order: number          // Display order
  isPublished: boolean   // Draft/published state
  createdAt: Timestamp
  updatedAt: Timestamp
  settings?: {
    visibility: 'public' | 'private' | 'password'
    password?: string
  }
}

interface MenuItem {
  pageId: string          // Reference to Page document
  label: string          // Display label (can differ from page title)
  order: number          // Navigation order
}
```

### API Changes

#### Current `getPortfolioData()`
```typescript
getPortfolioData(pageSlug?: string, userId?: string): Promise<PortfolioData>
```

#### Proposed API
```typescript
// Get page by slug
getPageBySlug(slug: string, userId: string): Promise<Page | null>

// Get all pages for user
getUserPages(userId: string): Promise<Page[]>

// Get portfolio data for a page
getPortfolioData(pageId: string, userId: string): Promise<PortfolioData>

// Create new page
createPage(data: Omit<Page, 'id'>, userId: string): Promise<string>

// Update page
updatePage(pageId: string, updates: Partial<Page>, userId: string): Promise<void>

// Delete page
deletePage(pageId: string, userId: string): Promise<void>
```

### Route Structure

#### File Structure
```
app/
  [username]/
    [slug]/
      page.tsx           # Public view
      edit/
        page.tsx         # Edit mode
    layout.tsx            # Username-based layout
  admin/
    pages/
      page.tsx           # Page management (optional)
```

---

## Migration Strategy

### Step 1: Backward Compatibility
- Keep existing routes working during transition
- Add new routes alongside old ones
- Gradual migration of users

### Step 2: Data Migration
- Migrate existing MenuItems to new Page model
- Generate slugs for existing pages
- Preserve all existing data

### Step 3: Route Migration
- Redirect old routes to new structure
- Update all internal links
- Update external links (if any)

### Step 4: Cleanup
- Remove old route handlers
- Remove deprecated code
- Update documentation

---

## Success Metrics

### Technical Metrics
- **Reduced Complexity**: Fewer lines of code, simpler logic
- **Performance**: Faster page loads, fewer queries
- **Reliability**: Fewer bugs, better error handling

### User Experience Metrics
- **Ease of Use**: Users can create/edit pages without confusion
- **Discoverability**: Edit functionality is easily discoverable
- **Efficiency**: Faster page creation/editing workflow

### Code Quality Metrics
- **Maintainability**: Easier to understand and modify
- **Testability**: Easier to write tests
- **Documentation**: Clear documentation for future developers

---

## Risks and Mitigation

### Risk 1: Breaking Existing Links
- **Mitigation**: Implement redirects from old routes to new routes
- **Fallback**: Keep old routes working during transition period

### Risk 2: Data Loss During Migration
- **Mitigation**: Comprehensive backup before migration
- **Testing**: Test migration on staging environment first

### Risk 3: User Confusion
- **Mitigation**: Clear UI indicators, tooltips, help text
- **Documentation**: User guide for new page management system

### Risk 4: Performance Regression
- **Mitigation**: Performance testing before and after
- **Monitoring**: Monitor query performance in production

---

## Conclusion

This proposal outlines a comprehensive refactoring plan that addresses all identified issues while following industry best practices. The proposed solution provides:

1. **Clear Route Structure**: Eliminates ambiguity, improves SEO
2. **Robust Page Identification**: Stable references, flexible slugs
3. **Better UX**: Seamless edit/view mode switching
4. **Improved Performance**: Optimized queries, caching
5. **Enhanced Maintainability**: Simpler code, better architecture

The implementation can be done incrementally, ensuring minimal disruption to existing users while significantly improving the codebase quality and user experience.

---

## Next Steps

1. **Review & Approval**: Review this proposal with the team
2. **Technical Design**: Create detailed technical specifications
3. **Prototype**: Build a small prototype to validate approach
4. **Implementation**: Execute the implementation plan
5. **Testing**: Comprehensive testing before deployment
6. **Documentation**: Update user and developer documentation

---

## References

- Next.js App Router Documentation
- Firebase Firestore Best Practices
- Modern CMS Architecture Patterns
- UX Best Practices for Content Management Systems

