# GSAP Integration Plan for Wires Portfolio

## Overview
GSAP (GreenSock Animation Platform) is a professional-grade JavaScript animation library. We'll use it across the portfolio for smooth, performant animations that feel premium.

## Why GSAP?
- **Performance**: Hardware-accelerated animations (60fps)
- **Control**: Fine-grained timeline control
- **Cross-browser**: Works consistently across all browsers
- **Lightweight**: Tree-shakeable, small bundle impact
- **Timeline Feature**: Sequence multiple animations together
- **Easing**: 40+ easing functions for natural motion

---

## Integration Points

### 1. **Timeline Visualization** (HIGH PRIORITY)
**Current state**: Static timeline with CSS transitions  
**Enhancement**: Smooth reveal animations + interactive zoom

```
- Entry animations: Timeline axis draws on page load
- Year markers: Stagger in with springy easing
- Project cards: Cascade in when year expands
- Interaction: Smooth zoom when clicking year
- Hover effects: Subtle scale/shadow with GSAP
```

**GSAP Methods**:
- `gsap.timeline()` - Sequence animations
- `gsap.to()` - Animate to state
- `gsap.stagger()` - Offset animations
- `Elastic.easeOut` - Springy feel

---

### 2. **Page Transitions**
**Current state**: Instant navigation  
**Enhancement**: Smooth fade/slide transitions between pages

```
- Sidebar navigation click
- Page content fade out (200ms)
- Navigate to new page
- Page content fade in (300ms)
- Hero/title slide in from below
```

**Use in**:
- `app/[username]/[slug]/page.tsx` - Page transitions
- `app/[username]/timeline/page.tsx` - Timeline enter animation
- `app/[username]/[slug]/edit/page.tsx` - Edit mode transitions

---

### 3. **Image Gallery Reveals**
**Current state**: Image cards appear instantly  
**Enhancement**: Images load with reveal animations

```
- Image container slides in from left
- Image fades in with slight zoom
- Stagger if multiple images in card
- On hover: Subtle lift effect
```

**Use in**:
- Project card images
- Portfolio showcase sections
- Image hover effects

---

### 4. **Form Interactions**
**Current state**: Form fields update instantly  
**Enhancement**: Smooth field animations

```
- Input focus: Border color smoothly transitions
- Error states: Shake animation on invalid input
- Success: Checkmark scales in
- Field disabled: Fade to lower opacity
```

**Use in**:
- `app/[username]/[slug]/edit/page.tsx` - Card editing form
- Login form
- Username change dialog

---

### 5. **Modal/Dialog Animations**
**Current state**: Deletion confirmation (system dialog)  
**Enhancement**: Custom modal with entrance/exit animations

```
- Backdrop fade in (200ms)
- Modal scale from center (300ms, Elastic easing)
- Button hover: Scale on interaction
- Close: Reverse animation
```

**Use in**:
- Deletion confirmation dialog (enhance system dialog fallback)
- Edit mode transitions
- Settings modals

---

### 6. **Card Interactions**
**Current state**: Static cards with basic hover  
**Enhancement**: Rich interaction feedback

```
- Hover: 3D tilt effect + shadow depth
- Click: Press animation + ripple effect
- Expand: Smooth height/width changes
- Reorder: Smooth position transitions
```

**Use in**:
- Project cards
- Page cards in sidebar
- Portfolio showcase sections

---

### 7. **Micro-interactions**
**Current state**: Instant state changes  
**Enhancement**: Visible state transitions

```
- Button clicks: Scale feedback (0.95 → 1)
- Toggle switches: Smooth width change + icon rotation
- Counters: Number animation (scroll effect)
- Checkboxes: Scale + checkmark draw animation
```

**Use in**:
- All buttons
- Toggle controls
- Status indicators

---

### 8. **Scroll Animations**
**Current state**: No scroll-triggered animations  
**Enhancement**: Elements animate in as user scrolls

```
- Use GSAPScrollTrigger plugin
- Fade in elements as they enter viewport
- Stagger lists on scroll
- Parallax effects on hero sections
```

**Use in**:
- Portfolio showcase sections
- Project listings
- Timeline entries

---

### 9. **Loading States**
**Current state**: Basic "Loading..." text  
**Enhancement**: Animated loading indicators

```
- Spinning logo/icon animation
- Skeleton loaders with shimmer effect
- Progress bar with smooth width transition
- Fade transitions on load complete
```

**Use in**:
- Timeline page loading
- Project fetch loading
- Image upload progress

---

### 10. **Hero/Splash Animations**
**Current state**: None  
**Enhancement**: Premium entrance animations

```
- Text slides in line by line
- Tagline fades in with delay
- Call-to-action button bounces attention
- Background elements animate subtly
```

**Use in**:
- Homepage hero section
- Portfolio intro pages
- Section headers

---

## Installation

```bash
npm install gsap
```

## Bundle Impact
- **gsap core**: ~25KB (gzipped ~9KB)
- **ScrollTrigger plugin**: +10KB
- **Total with plugins**: ~15-18KB gzipped

---

## Implementation Strategy

### Phase 1: Core Setup (Week 1)
- [ ] Install GSAP
- [ ] Create `lib/animations/gsap-config.ts` with easing presets
- [ ] Create reusable animation hooks: `useGsapTimeline`, `useGsapAnimation`
- [ ] Timeline visualization animations

### Phase 2: Page Transitions (Week 2)
- [ ] Page fade in/out animations
- [ ] Navigation transitions
- [ ] Layout transitions

### Phase 3: Interactive Elements (Week 3)
- [ ] Card hover effects
- [ ] Button interactions
- [ ] Form field animations
- [ ] Modal animations

### Phase 4: Advanced (Week 4+)
- [ ] ScrollTrigger for scroll animations
- [ ] Loading state animations
- [ ] Parallax effects
- [ ] Complex interactions

---

## GSAP Timeline Example Pattern

```typescript
// lib/animations/timeline-animations.ts
import gsap from 'gsap'

export const animateTimelineEntry = (element: HTMLElement) => {
  const tl = gsap.timeline()
  
  tl.to(element, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'cubic.out'
  }, 0)
  
  tl.to(element.querySelector('.yearDot'), {
    scale: 1.2,
    duration: 0.5,
    ease: 'elastic.out'
  }, 0.2)
  
  tl.to(element.querySelector('.projectsContainer'), {
    opacity: 1,
    maxHeight: 2000,
    duration: 0.7,
    ease: 'power2.inOut'
  }, 0.3)
  
  return tl
}

export const sequenceTimelineEntries = (entries: HTMLElement[]) => {
  const tl = gsap.timeline()
  
  entries.forEach((entry, i) => {
    tl.add(animateTimelineEntry(entry), i * 0.15)
  })
  
  return tl
}
```

---

## Easing Functions to Use
- **`power1.inOut`** - Smooth, natural
- **`power2.inOut`** - Slightly emphasized
- **`cubic.out`** - Quick start, smooth end
- **`elastic.out`** - Springy, playful
- **`back.out`** - Overshoot effect
- **`expo.out`** - Fast end for emphasis

---

## Performance Notes
- Use `will-change` CSS for animated elements
- Keep animations under 500ms for UI feel
- Use `pause()` for conditional animations
- Clean up timelines in `useEffect` cleanup
- Avoid animating hundreds of elements simultaneously

---

## Where NOT to Use GSAP
- Simple CSS-only effects (hover states)
- Transitions that are less than 100ms
- Static layout (flex/grid changes without animation)
- SEO/accessibility-critical content
