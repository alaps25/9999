# Theme Implementation Proposal

## Current State
- ✅ Theme dropdown exists in settings (AUTO, LIGHT, DARK)
- ✅ Theme value is saved to Firebase
- ❌ Theme is NOT applied/implemented
- ❌ No dark mode support currently
- ✅ Accent color system works via CSS custom properties

## Proposed Implementation

### 1. Color System Architecture

#### CSS Custom Properties Structure
```css
:root {
  --accent-primary: #000000;        /* User's chosen accent color */
  --accent-secondary: #FFFFFF;      /* Background color (theme-dependent) */
  --text-primary: #000000;          /* Main text color (theme-dependent) */
  --text-secondary: #666666;        /* Secondary text color (theme-dependent) */
  --border-radius: 0px;
  --theme-mode: 'light' | 'dark' | 'auto';  /* Current theme mode */
}
```

#### Theme Color Logic

**Light Mode:**
- Background: `#FFFFFF` (white)
- Text: `--accent-primary` (user's accent color, typically dark)
- Secondary text: Dark gray (`#666666` or darker shade of accent)

**Dark Mode:**
- Background: Dark color (calculated from accent or fixed dark gray)
- Text: Light color (inverse of accent or white/light gray)
- Secondary text: Light gray (`#CCCCCC` or lighter shade)

**AUTO Mode:**
- Follows system `prefers-color-scheme` media query
- Dynamically switches between light/dark based on OS/browser setting

### 2. Implementation Strategy

#### A. Color Calculation Utilities

Create a utility function to:
1. **Determine if accent color is light or dark:**
   ```typescript
   function isLightColor(hex: string): boolean {
     // Convert hex to RGB
     // Calculate luminance
     // Return true if luminance > 0.5
   }
   ```

2. **Calculate theme colors based on accent:**
   ```typescript
   function calculateThemeColors(accentColor: string, theme: 'light' | 'dark'): {
     background: string;
     textPrimary: string;
     textSecondary: string;
   }
   ```

#### B. CSS Custom Properties Updates

**In `globals.css`:**
```css
:root {
  --accent-primary: #000000;
  --accent-secondary: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #666666;
  --border-radius: 0px;
}

[data-theme="light"] {
  --accent-secondary: #FFFFFF;
  --text-primary: var(--accent-primary);
  --text-secondary: #666666;
}

[data-theme="dark"] {
  --accent-secondary: #1A1A1A;  /* Dark background */
  --text-primary: #FFFFFF;       /* Light text */
  --text-secondary: #CCCCCC;    /* Light gray */
}

@media (prefers-color-scheme: dark) {
  [data-theme="auto"] {
    --accent-secondary: #1A1A1A;
    --text-primary: #FFFFFF;
    --text-secondary: #CCCCCC;
  }
}

@media (prefers-color-scheme: light) {
  [data-theme="auto"] {
    --accent-secondary: #FFFFFF;
    --text-primary: var(--accent-primary);
    --text-secondary: #666666;
  }
}
```

#### C. SCSS Variable Updates

**In `styles/_variables.scss`:**
```scss
$accent-primary: var(--accent-primary, #000000);
$accent-secondary: var(--accent-secondary, #FFFFFF);
$text-primary: var(--text-primary, #000000);
$text-secondary: var(--text-secondary, #666666);
```

#### D. JavaScript/TypeScript Implementation

**Theme Application Logic:**
1. **Settings Page:**
   - Apply theme immediately when changed (real-time preview)
   - Save theme preference to Firebase
   - Listen to system preference changes for AUTO mode

2. **AuthContext:**
   - Load theme preference on login
   - Apply theme globally
   - Set up system preference listener for AUTO mode

3. **Theme Utility Functions:**
   ```typescript
   // lib/utils/theme.ts
   export function applyTheme(theme: 'AUTO' | 'LIGHT' | 'DARK', accentColor: string): void {
     const root = document.documentElement;
     
     // Set data-theme attribute
     if (theme === 'AUTO') {
       root.setAttribute('data-theme', 'auto');
       // Listen to system preference changes
     } else {
       root.setAttribute('data-theme', theme.toLowerCase());
     }
     
     // Calculate and apply colors based on accent
     const colors = calculateThemeColors(accentColor, theme === 'AUTO' ? getSystemTheme() : theme.toLowerCase());
     root.style.setProperty('--accent-secondary', colors.background);
     root.style.setProperty('--text-primary', colors.textPrimary);
     root.style.setProperty('--text-secondary', colors.textSecondary);
   }
   
   function getSystemTheme(): 'light' | 'dark' {
     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
   }
   ```

### 3. Component Updates Required

#### Components that need theme support:
1. **Background colors:** All components using `$accent-secondary`
2. **Text colors:** All components using `$accent-primary` for text
3. **Borders/Outlines:** May need adjustment for contrast in dark mode
4. **Placeholders:** Need appropriate contrast in both modes

#### Key Files to Update:
- `app/globals.css` - Add theme CSS custom properties
- `styles/_variables.scss` - Update to use CSS variables
- `app/settings/page.tsx` - Apply theme on change
- `contexts/AuthContext.tsx` - Load theme on login
- `lib/utils/theme.ts` - New utility file for theme logic

### 4. User Experience Considerations

#### Accent Color Interaction:
- **Light accent colors** (e.g., yellow, light blue):
  - Light mode: May need darker text for contrast
  - Dark mode: Accent can remain bright
  
- **Dark accent colors** (e.g., black, dark blue):
  - Light mode: Works well as text color
  - Dark mode: May need lighter variant or white text

#### Smart Color Calculation:
- If accent is very light → use darker variant for text in light mode
- If accent is very dark → use lighter variant for text in dark mode
- Ensure WCAG contrast ratios (minimum 4.5:1 for text)

### 5. Implementation Steps

1. ✅ Create theme utility functions (`lib/utils/theme.ts`)
2. ✅ Update CSS custom properties (`app/globals.css`)
3. ✅ Update SCSS variables (`styles/_variables.scss`)
4. ✅ Apply theme in settings page (real-time preview)
5. ✅ Load theme in AuthContext (on login)
6. ✅ Add system preference listener for AUTO mode
7. ✅ Test with various accent colors
8. ✅ Ensure all components respect theme colors

### 6. Edge Cases to Handle

- **Very light accent colors:** Ensure text remains readable
- **Very dark accent colors:** Ensure backgrounds have enough contrast
- **System preference changes:** AUTO mode should respond immediately
- **Theme persistence:** Theme should persist across sessions
- **Default state:** Handle users who haven't set a theme preference

## Alternative: Simpler Approach

If the accent-color-based calculation is too complex, we can use:

**Fixed Theme Colors:**
- Light mode: White background, accent color for text
- Dark mode: Dark gray background (`#1A1A1A`), white/light text
- Accent color always used for interactive elements (buttons, borders)

This is simpler but less dynamic. The accent color would primarily affect:
- Button backgrounds (high emphasis)
- Borders/outlines
- Interactive states

While background and text colors would be fixed per theme mode.

