# Timeline Design V2 - Architecture & UX

## Design Vision (Your Sketch)
```
                    BOY
                ARCHITECTURE
            MUSEUM OF WAR, SA
             |
    [2010] MAXPRO  ← Blue highlight on hover
             |      Other projects fade (opacity 0.2)
       FADE BACKGROUND
```

### Key Insights from Your Design
1. **Blue highlight box** - Year is emphasized with bright blue container
2. **Surrounding fade** - Other timeline items dim to ~20% opacity
3. **Clean vertical line** - Dotted line connects all years
4. **Project name below** - Clear typography hierarchy
5. **No animation noise** - Minimalist, focused interaction

---

## Product Architecture & Navigation

### Where Timeline Fits
```
User Portfolio (/:username)
├── Sidebar Navigation
│   ├── Home / About
│   ├── Projects (All Pages)
│   ├── Timeline ← NEW VIEW
│   ├── Gallery / Collections
│   └── Settings
└── Main Content
    ├── Home Page
    ├── Project Pages
    ├── Timeline Page ← Shows chronological view
    └── Edit Mode
```

### Navigation Flow
```
User clicks "Timeline" in sidebar
    ↓
Navigate to /:username/timeline
    ↓
Page loads with smooth GSAP entrance
    ↓
Timeline entries fade/slide in with stagger
    ↓
Hover over year → Blue highlight, others fade
    ↓
Click year → Expand projects for that year
    ↓
Click project → Navigate to /:username/project-slug
```

### Return Navigation
- Clicking back/sidebar returns to previous page
- Timeline state doesn't persist (fresh on each visit)
- Projects open in same tab or new tab (user choice)

---

## GSAP Hover Effect Ideas (Non-Boring)

### Option 1: "Spotlight Focus" (Your Design Base)
```
On Hover:
├─ Hovered item: Blue box scales 1.0 → 1.05
├─ Blue glow: Soft shadow expands
├─ Other items: Fade from 1.0 → 0.15 opacity
├─ Timeline line: Highlight segment glows
└─ Project name: Scale slightly 1 → 1.08

On Leave:
└─ Everything reverses smoothly
```

**GSAP Code:**
```typescript
const spotlight = (yearElement: HTMLElement) => {
  const tl = gsap.timeline()
  
  tl.to(yearElement, {
    scale: 1.05,
    boxShadow: '0 0 30px rgba(0, 102, 255, 0.6)',
    duration: 0.3,
    ease: 'power2.out'
  }, 0)
  
  tl.to('.yearMarker:not(:hover)', {
    opacity: 0.15,
    filter: 'blur(0.5px)',
    duration: 0.25
  }, 0)
  
  tl.to(yearElement.querySelector('.yearLabel'), {
    scale: 1.1,
    duration: 0.3
  }, 0)
  
  return tl
}
```

---

### Option 2: "Magnetic Pull" (Premium Feel)
```
On Hover:
├─ Year box slides up slightly (-8px)
├─ Year number glows in blue
├─ Connected line segment brightens
├─ Surrounding text shifts opacity + blur
├─ Subtle 3D tilt effect
└─ Shadow deepens

Effect: Feels like year "lifts" from timeline
```

**GSAP Code:**
```typescript
const magneticPull = (yearElement: HTMLElement) => {
  const tl = gsap.timeline()
  
  // Lift effect
  tl.to(yearElement, {
    y: -12,
    duration: 0.4,
    ease: 'elastic.out(1, 0.5)'
  }, 0)
  
  // Glow
  tl.to(yearElement, {
    boxShadow: '0 8px 32px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3)',
    duration: 0.3
  }, 0)
  
  // Fade others
  tl.to('.timeline__item', {
    opacity: (i, target) => target === yearElement ? 1 : 0.2,
    duration: 0.3
  }, 0)
  
  // Tilt effect (optional 3D)
  tl.to(yearElement, {
    rotationY: 2,
    transformOrigin: '50% 50% 0',
    duration: 0.3
  }, 0)
  
  return tl
}
```

---

### Option 3: "Ink Bloom" (Artistic)
```
On Hover:
├─ Year text glows/bleeds with blue
├─ Colored halo expands outward
├─ Other text fades with slight blur
├─ Timeline line pulses at hover point
└─ Effect: Looks like ink dropped on paper

Feels: Artistic, premium, unique
```

**GSAP Code:**
```typescript
const inkBloom = (yearElement: HTMLElement) => {
  const tl = gsap.timeline()
  
  // Create virtual halo
  const halo = document.createElement('div')
  halo.className = 'timeline__halo'
  yearElement.appendChild(halo)
  
  // Halo expands
  tl.from(halo, {
    scale: 0,
    opacity: 0.8,
    duration: 0.6,
    ease: 'cubic.out'
  }, 0)
  
  tl.to(halo, {
    opacity: 0,
    duration: 0.3
  }, 0.3)
  
  // Text glow
  tl.to(yearElement.querySelector('.yearNumber'), {
    textShadow: '0 0 20px rgba(0, 102, 255, 0.8), 0 0 10px rgba(0, 102, 255, 0.5)',
    duration: 0.4
  }, 0)
  
  // Fade others
  tl.to('.timeline__item', {
    opacity: (i, target) => target === yearElement ? 1 : 0.18,
    filter: 'blur(1px)',
    duration: 0.4
  }, 0)
  
  return tl
}
```

---

### Option 4: "Liquid Motion" (Smooth & Modern)
```
On Hover:
├─ Blue box morphs shape slightly
├─ Background ripple effect
├─ Other text slides down-fade
├─ Year number rises with easing
└─ Everything feels fluid

Feels: Modern, Apple-like, smooth
```

**GSAP Code:**
```typescript
const liquidMotion = (yearElement: HTMLElement) => {
  const tl = gsap.timeline()
  
  // Ripple background
  const ripple = gsap.to(yearElement, {
    boxShadow: [
      '0 0 0 0 rgba(0, 102, 255, 0.4)',
      '0 0 0 15px rgba(0, 102, 255, 0)'
    ],
    duration: 0.8,
    ease: 'power2.out'
  }, 0)
  
  // Text rise
  tl.to(yearElement.querySelector('.yearNumber'), {
    y: -6,
    duration: 0.5,
    ease: 'back.out(1.7)'
  }, 0)
  
  // Others fade down
  tl.to('.timeline__item:not(:hover)', {
    opacity: 0.12,
    y: 4,
    duration: 0.5,
    ease: 'power2.inOut'
  }, 0)
  
  // Slight scale breathing
  tl.to(yearElement, {
    scale: 1.03,
    duration: 0.5,
    ease: 'sine.inOut'
  }, 0)
  
  return tl
}
```

---

### Option 5: "Selective Focus" (Minimal)
```
On Hover:
├─ ONLY the year number changes:
│  ├─ Scales up 1 → 1.15
│  ├─ Color shift (gray → blue)
│  ├─ Adds subtle shadow
│  └─ No other elements fade
└─ Rest stays normal

Feels: Ultra minimal, architectural
```

**GSAP Code:**
```typescript
const selectiveFocus = (yearElement: HTMLElement) => {
  const tl = gsap.timeline()
  
  tl.to(yearElement.querySelector('.yearNumber'), {
    scale: 1.15,
    color: '#0066ff',
    textShadow: '0 2px 8px rgba(0, 102, 255, 0.3)',
    duration: 0.4,
    ease: 'cubic.out'
  }, 0)
  
  // Subtle line glow
  tl.to(yearElement.querySelector('.yearLine'), {
    stroke: '#0066ff',
    strokeWidth: 3,
    duration: 0.3
  }, 0)
  
  return tl
}
```

---

## My Recommendation for Wires

**Use Option 2: "Magnetic Pull"**

Why:
- ✅ Matches your Bauhaus aesthetic (clean, purposeful)
- ✅ Feels premium and intentional
- ✅ Elastic easing adds subtle delight
- ✅ Not overdone or noisy
- ✅ Works perfectly on mobile
- ✅ Single hover element (no state conflicts)

Hybrid approach:
- **Base**: Spotlight focus (opacity fade)
- **Enhancement**: Magnetic pull (y-axis lift)
- **Feedback**: Glow effect (blue shadow)
- **Exit**: Smooth reverse animation

---

## Implementation Structure

### Component Hierarchy
```
TimelineView/
├── TimelineAxis (vertical dotted line)
├── TimelineEntry[] (repeating)
│   ├── YearMarker (blue box on hover)
│   ├── YearLabel (2010, 2011, etc)
│   ├── YearCount (# of projects)
│   ├── ProjectsContainer (collapse/expand)
│   └── ProjectCard[] (grid)
└── TimelineBackground (fading effect)
```

### State Management
```
interface TimelineState {
  hoveredYear: number | null           // Which year is hovered
  expandedYear: number | null          // Which year is expanded
  selectedProject: string | null       // Which project detail shows
  animationQueue: AnimationCallback[]  // For chained animations
}
```

### GSAP Instance Management
```
useEffect(() => {
  // Create hover animation for each year
  yearElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const tl = magneticPull(el)
      setCurrentTimeline(tl)
    })
    el.addEventListener('mouseleave', () => {
      currentTimeline?.reverse()
    })
  })
}, [yearElements])
```

---

## CSS Structure for New Design

```scss
.timeline {
  position: relative;
  
  &__axis {
    position: absolute;
    left: 12px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: repeating-linear-gradient(
      to bottom,
      currentColor,
      currentColor 4px,
      transparent 4px,
      transparent 8px
    );
    opacity: 0.2;
  }
}

.yearMarker {
  position: relative;
  padding: 16px 24px;
  border: 2px solid currentColor;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: none; // GSAP handles all animation
  
  &:hover {
    // Only baseline hover state, GSAP enhances
    border-color: #0066ff;
  }
}

.yearNumber {
  font-weight: 700;
  font-size: 18px;
  color: currentColor;
  // Will be animated by GSAP
}

.yearLabel {
  font-size: 14px;
  opacity: 0.6;
  // Will fade on hover via GSAP
}
```

---

## Mobile Considerations

On touch devices:
- Hover effects trigger on tap
- Tap again to collapse (toggle)
- No sustained hover state
- Fallback to click-based expand/collapse

```typescript
if (isTouchDevice) {
  element.addEventListener('click', () => {
    // Trigger animation
    magneticPull(element)
  })
} else {
  element.addEventListener('mouseenter', () => {
    magneticPull(element)
  })
}
```

---

## Next Steps

1. **Choose hover effect** (I recommend Option 2)
2. **Update TimelineView component** with new structure
3. **Add GSAP animations** using `useGsapAnimation` hook
4. **Test on desktop & mobile**
5. **Iterate on easing/timing** based on feel
6. **Add click-to-expand** for year projects
7. **Add navigation** to individual projects

Would you like me to build the new component code with your chosen effect?
