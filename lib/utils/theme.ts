/**
 * Theme utility functions for accessible color calculation and theme management
 */

/**
 * Calculate relative luminance of a color (WCAG formula)
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Luminance value (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * @param color1 First color in hex format
 * @param color2 Second color in hex format
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 1
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100
  
  let r, g, b
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * Adjust color lightness to meet contrast requirement
 * Preserves hue and saturation, only adjusts lightness
 * @param color Hex color to adjust
 * @param backgroundColor Background color to contrast against
 * @param minContrast Minimum contrast ratio required (default 4.5 for WCAG AA)
 * @param mode 'lighten' or 'darken'
 * @returns Adjusted hex color
 */
function adjustColorForContrast(
  color: string,
  backgroundColor: string,
  minContrast: number = 4.5,
  mode: 'lighten' | 'darken'
): string {
  const rgb = hexToRgb(color)
  const bgRgb = hexToRgb(backgroundColor)
  
  if (!rgb || !bgRgb) return color
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  // Binary search for optimal lightness
  // Always allow full range: 0-100, but prefer staying close to original if possible
  let minL = 0
  let maxL = 100
  let bestColor = color
  let iterations = 0
  const maxIterations = 30
  
  while (iterations < maxIterations && Math.abs(maxL - minL) > 0.1) {
    const testL = (minL + maxL) / 2
    const testRgb = hslToRgb(hsl.h, hsl.s, testL)
    const testHex = rgbToHex(testRgb.r, testRgb.g, testRgb.b)
    const contrast = getContrastRatio(testHex, backgroundColor)
    
    if (contrast >= minContrast) {
      bestColor = testHex
      // Found a valid color, try to get closer to original while maintaining contrast
      if (mode === 'darken') {
        // When darkening, try lighter values (but still dark enough for contrast)
        maxL = testL
      } else {
        // When lightening, try darker values (but still light enough for contrast)
        minL = testL
      }
    } else {
      // Not enough contrast, need to adjust more
      if (mode === 'darken') {
        minL = testL // Need darker (lower lightness)
      } else {
        maxL = testL // Need lighter (higher lightness)
      }
    }
    
    iterations++
  }
  
  // Verify final color meets contrast requirement
  const finalContrast = getContrastRatio(bestColor, backgroundColor)
  if (finalContrast < minContrast) {
    // Fallback: use extreme values if binary search didn't converge
    const fallbackL = mode === 'darken' ? 10 : 90
    const fallbackRgb = hslToRgb(hsl.h, hsl.s, fallbackL)
    bestColor = rgbToHex(fallbackRgb.r, fallbackRgb.g, fallbackRgb.b)
  }
  
  return bestColor
}

/**
 * Calculate accessible text color for a given background and accent color
 * @param accentColor User's chosen accent color
 * @param backgroundColor Background color (white for light mode, dark for dark mode)
 * @param minContrast Minimum contrast ratio (default 4.5 for WCAG AA)
 * @returns Accessible text color
 */
export function calculateAccessibleTextColor(
  accentColor: string,
  backgroundColor: string,
  minContrast: number = 4.5
): string {
  const contrast = getContrastRatio(accentColor, backgroundColor)
  
  // If already accessible, return as-is
  if (contrast >= minContrast) {
    return accentColor
  }
  
  // Determine if we need to lighten or darken
  const accentRgb = hexToRgb(accentColor)
  const bgRgb = hexToRgb(backgroundColor)
  
  if (!accentRgb || !bgRgb) {
    console.warn('Invalid color format:', { accentColor, backgroundColor })
    return accentColor
  }
  
  const accentLum = getLuminance(accentRgb.r, accentRgb.g, accentRgb.b)
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
  
  // If accent is lighter than background, darken it
  // If accent is darker than background, lighten it
  const mode = accentLum > bgLum ? 'darken' : 'lighten'
  
  const adjusted = adjustColorForContrast(accentColor, backgroundColor, minContrast, mode)
  const finalContrast = getContrastRatio(adjusted, backgroundColor)
  
  console.log('Color adjustment:', {
    original: accentColor,
    adjusted,
    originalContrast: contrast.toFixed(2),
    finalContrast: finalContrast.toFixed(2),
    mode,
    backgroundColor
  })
  
  return adjusted
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Calculate theme colors based on accent color and theme mode
 */
export function calculateThemeColors(
  accentColor: string,
  theme: 'AUTO' | 'LIGHT' | 'DARK'
): {
  background: string
  textPrimary: string
  textSecondary: string
  actualTheme: 'light' | 'dark'
} {
  // Determine actual theme mode
  const actualTheme = theme === 'AUTO' ? getSystemTheme() : theme.toLowerCase() as 'light' | 'dark'
  
  // Define background colors
  const lightBackground = '#FFFFFF'
  const darkBackground = '#1A1A1A'
  
  const backgroundColor = actualTheme === 'light' ? lightBackground : darkBackground
  
  // Calculate accessible text color from accent
  const textPrimary = calculateAccessibleTextColor(accentColor, backgroundColor)
  
  // Calculate secondary text color (lighter/darker variant)
  // Best practice: Use fixed semantic colors for secondary text to ensure
  // consistent contrast and readability across themes
  // This follows WCAG guidelines and design system best practices
  if (actualTheme === 'dark') {
    // Dark mode: Use desaturated light gray (not pure white) for better readability
    // #CCCCCC provides good contrast against dark backgrounds without eye strain
    const textSecondary = '#CCCCCC'
    
    return {
      background: backgroundColor,
      textPrimary,
      textSecondary,
      actualTheme,
    }
  }
  
  // Light mode: calculate from textPrimary
  const textPrimaryRgb = hexToRgb(textPrimary)
  if (textPrimaryRgb) {
    const hsl = rgbToHsl(textPrimaryRgb.r, textPrimaryRgb.g, textPrimaryRgb.b)
    // Adjust lightness for secondary text (less contrast)
    const secondaryL = Math.max(0, hsl.l - 20) // Darker for light mode
    const secondaryRgb = hslToRgb(hsl.h, hsl.s, secondaryL)
    const textSecondary = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
    
    return {
      background: backgroundColor,
      textPrimary,
      textSecondary,
      actualTheme,
    }
  }
  
  // Fallback
  return {
    background: backgroundColor,
    textPrimary: actualTheme === 'light' ? '#000000' : '#FFFFFF',
    textSecondary: actualTheme === 'light' ? '#666666' : '#CCCCCC',
    actualTheme,
  }
}

/**
 * Apply theme to document
 */
export function applyTheme(
  theme: 'AUTO' | 'LIGHT' | 'DARK',
  accentColor: string
): void {
  const root = document.documentElement
  const colors = calculateThemeColors(accentColor, theme)
  
  // Set data-theme attribute
  root.setAttribute('data-theme', theme === 'AUTO' ? 'auto' : theme.toLowerCase())
  
  // Apply CSS custom properties
  // Use adjusted accessible color for accent-primary (so buttons, borders, etc. are accessible)
  root.style.setProperty('--accent-primary', colors.textPrimary)
  root.style.setProperty('--accent-secondary', colors.background)
  root.style.setProperty('--text-primary', colors.textPrimary)
  root.style.setProperty('--text-secondary', colors.textSecondary)
}

/**
 * Set up system preference listener for AUTO theme mode
 * Returns cleanup function to remove listener
 */
export function setupSystemThemeListener(
  theme: 'AUTO' | 'LIGHT' | 'DARK',
  accentColor: string,
  onThemeChange?: () => void
): () => void {
  if (theme !== 'AUTO' || typeof window === 'undefined') {
    return () => {} // No-op cleanup
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = () => {
    applyTheme('AUTO', accentColor)
    if (onThemeChange) {
      onThemeChange()
    }
  }
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
  
  // Fallback for older browsers
  mediaQuery.addListener(handleChange)
  return () => mediaQuery.removeListener(handleChange)
}

