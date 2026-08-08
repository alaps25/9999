# Timeline: Minimal Architectural Design

## Core Philosophy
**Less is more.** A timeline should feel like precision architecture - no ornament, no color, only structure and meaning.

Think: Dieter Rams, Swiss Grid, Bauhaus restraint.

---

## The Concept

### Visual Language
```
A single infinitely long vertical line.
Years marked at precise intervals.
Nothing else.

Click a year → the line contracts around it
             → projects emerge as points on that contracted axis
             
Click again → returns to full timeline
```

**Aesthetic:** 
- Infinite line = infinite possibilities
- Contraction = focus
- Emergence = revelation

---

## Technical Specification

### Colors
```
Timeline line:    1px, #000000 / #FFFFFF (theme-aware)
Year label:       only visible on hover/focus
Project nodes:    single dot (4px radius) on the line
Text:             sans-serif, gray (#666), no ornament
```

### The Grid
```
Year markers appear at EXACT equal spacing:
- 2020 ━━━━━━━━━━━━ 2021 ━━━━━━━━━━━━ 2022 ━━━━━━━━━━━━ 2023
         ↑ 4 projects        ↑ 6 projects        ↑ 8 projects

On hover, dots get larger and year label appears above:

                    2021
                     ↑
2020 ━━━━━━●━━━━━━●●●●●━━━━━━ 2022
          4px      8px
```

---

## Interaction: The Zoom

### Default State (Far)
```
Timeline stretches full viewport height
Years at viewport edges (oldest → newest, top → bottom)
~5-8 years visible at once
Very thin line (1px)
Project dots invisible (too small)
```

### On Click (Zoom In)
```
Smooth animation (300-400ms):
1. Timeline contracts
2. Focused year moves to center (height: ~30% of viewport)
3. Year label fades in large (72px)
4. Project dots on that year grow to 8px
5. Project cards slide up from below the line
6. Unfocused years fade to 20% opacity
```

### Zoomed State
```
        [Previous Years - 20% opacity]
        
                   2021
                  [  ●  ]  ← 8px dot
                   
         Project A   Project B   Project C   Project D
         [minimal]   [minimal]   [minimal]   [minimal]
         card        card        card        card
         
        [Upcoming Years - 20% opacity]
```

### Click Again (Zoom Out)
```
Reverse animation:
1. Project cards slide down
2. Dots shrink to invisible
3. Year label fades out
4. Timeline expands
5. Full timeline restored
```

---

## Visual Hierarchy

### On Timeline (Always Visible)
```
1. The line itself (primary anchor)
2. Year markers (barely visible, simple text)
3. Nothing else
```

### On Year Click (Revealed)
```
1. Year (large, centered)
2. Project dots (8px, on the line)
3. Project cards (below the line)
4. Nothing else
```

---

## Project Cards (When Zoomed)

### Minimal Card Design
```
┌──────────────────────┐
│ Project Title        │
│ One-line description │
│ 2021 · design · web  │
└──────────────────────┘
```

Grid: 3-4 cards per row
Gap: 16px
Height: Auto (no fixed height)
Border: 1px #999 (light gray)
Background: Transparent
Hover: Border color increases to #000, slight shadow emerges

---

## Responsive Strategy

### Desktop (1024px+)
```
Timeline center of page
Years on left, projects on right (or vice versa)
Full viewport height
Smooth scroll to position
```

### Tablet (768px-1023px)
```
Timeline still centered
Projects in 2-column grid
Full viewport behavior
```

### Mobile (< 768px)
```
Timeline remains vertical
Projects in 1 column
Full viewport
Smooth tap interactions (same as click)
```

---

## The Details That Matter

### Spacing
```
Viewport height = timeline scope
Timeline axis = center ±3% of width
Year label = 64px above dots
Project cards = 32px below line
Card gaps = 16px (no larger)
```

### Typography  
```
Year (zoomed):  72px, weight 400, letter-spacing: 2px
Title:          16px, weight 500
Subtitle:       12px, weight 400, opacity 60%
```

### Animation Curves
```
Zoom in/out:   cubic-bezier(0.4, 0, 0.2, 1)  [smooth deceleration]
Dot grow:      cubic-bezier(0.34, 1.56, 0.64, 1)  [elastic bounce]
Fade:          cubic-bezier(0.25, 0.46, 0.45, 0.94)  [standard]
```

### Timing
```
Zoom animation:  400ms
Dot animation:   200ms (staggered +50ms per dot)
Card appearance: 300ms (after zoom completes)
```

---

## What It Feels Like

**Not:**
- Colorful, playful, decorative
- Skeuomorphic or realistic
- Crowded or busy
- Trendy or fashionable

**Yes:**
- Precise, intentional, structural
- Calm, spacious, meditative
- Pure information without distraction
- Timeless (looks good in 10 years)

---

## Key Constraint

**Every element must justify its existence.**

If you can't explain why it's there, remove it.

---

## Test Questions

- Does the timeline look good in grayscale? ✓
- Does it work on mobile? ✓
- Is there any decoration? ✗
- Is there any color beyond black/white? ✗
- Does every interaction have purpose? ✓
- Can you understand it instantly? ✓

---

## Inspiration References

- Dieter Rams' "10 Principles for Good Design"
- Swiss Style Grid Typography
- Braun Design philosophy (form follows function)
- Minimalist architecture (Tadao Ando, Donald Judd)
- Japanese minimalism (Ma - empty space as element)

**The goal:** A timeline that feels like it was designed by someone who believes every pixel has earned its place.

