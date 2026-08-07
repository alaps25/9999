import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug'

describe('Slug Utils', () => {
  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      expect(generateSlug('My Portfolio')).toBe('my-portfolio')
    })

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('About Me')).toBe('about-me')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Hello @World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should trim whitespace', () => {
      expect(generateSlug('  Trimmed  ')).toBe('trimmed')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('should remove special characters but keep hyphens', () => {
      expect(generateSlug('Hello-World')).toBe('hello-world')
    })
  })

  describe('generateUniqueSlug', () => {
    it('should return base slug if no conflicts', () => {
      const existingSlugs = ['page-one', 'page-two']
      expect(generateUniqueSlug('Page Three', existingSlugs)).toBe('page-three')
    })

    it('should add counter suffix if slug exists', () => {
      const existingSlugs = ['about', 'about-1']
      expect(generateUniqueSlug('About', existingSlugs)).toBe('about-2')
    })

    it('should increment counter for multiple conflicts', () => {
      const existingSlugs = ['portfolio', 'portfolio-1', 'portfolio-2']
      expect(generateUniqueSlug('Portfolio', existingSlugs)).toBe('portfolio-3')
    })

    it('should handle empty existing slugs list', () => {
      expect(generateUniqueSlug('My Page', [])).toBe('my-page')
    })
  })
})
