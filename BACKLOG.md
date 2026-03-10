# Backlog

Future features and improvements for Wires portfolio builder.

## High Priority

### Optimize Page Navigation Performance
- **Description**: Page transitions feel slow because each navigation triggers multiple Firebase queries
- **Problem**: Every page change runs `getUserIdByUsername()`, `getUserSettings()`, `getPageIdBySlug()`, `getPortfolioDataByPageId()` - causing 1-3 second delays
- **Potential Solutions**:
  - [ ] Cache menu items and user data at the layout level (not per-page)
  - [ ] Use React Query or SWR for data fetching with caching
  - [ ] Prefetch page data when hovering over nav links
  - [ ] Keep sidebar mounted during page transitions (don't show "Loading..." for entire page)
  - [ ] Consider server components for static parts of the page

### Auto-delete Empty Cards on Save
- **Description**: When user clicks SAVE, automatically delete any cards that have no content (no title, no description, no media)
- **Rationale**: Prevents clutter from accidentally added empty cards
- **Acceptance Criteria**:
  - [ ] Check each card on save for empty content
  - [ ] Delete cards with empty title AND empty description AND no media
  - [ ] Show brief notification when cards are auto-deleted
  - [ ] Don't delete cards that have any content (even just a title)

## Medium Priority

### Undo/Redo Support
- **Description**: Add undo/redo functionality for content editing
- **Rationale**: Users may accidentally delete content and need to recover

### Card Duplication
- **Description**: Allow duplicating existing cards
- **Rationale**: Faster workflow when creating similar content

### Bulk Media Upload
- **Description**: Upload multiple images at once to a media carousel
- **Rationale**: Streamline adding multiple images

## Low Priority

### Export Portfolio as PDF
- **Description**: Generate a PDF version of the portfolio
- **Rationale**: Useful for sharing offline or printing

### Analytics Dashboard
- **Description**: Track portfolio views and engagement
- **Rationale**: Help users understand their audience

### Custom Fonts
- **Description**: Allow users to choose from a font library
- **Rationale**: More design customization options

---

## Completed

_Move items here when completed_
