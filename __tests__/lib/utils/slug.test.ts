import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug'

describe('Slug Generation Utilities', () => {
  describe('generateSlug()', () => {
    // Basic conversions
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

    // Extended tests
    it('should keep numbers', () => {
      expect(generateSlug('Project 2024')).toBe('project-2024')
    })

    it('should keep underscores', () => {
      expect(generateSlug('my_project')).toBe('my_project')
    })

    it('should handle single character', () => {
      expect(generateSlug('a')).toBe('a')
    })

    it('should handle numbers only', () => {
      expect(generateSlug('12345')).toBe('12345')
    })

    it('should handle all spaces', () => {
      const result = generateSlug('     ')
      expect(result).toBe('')
    })

    it('should be deterministic', () => {
      const input = 'Test Project 2024'
      const result1 = generateSlug(input)
      const result2 = generateSlug(input)
      expect(result1).toBe(result2)
    })

    it('should handle very long strings', () => {
      const longString = 'A B C '.repeat(50)
      const slug = generateSlug(longString)
      expect(slug).toBeTruthy()
      expect(typeof slug).toBe('string')
    })
  })

  describe('generateUniqueSlug()', () => {
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

    it('should handle case-sensitive collision detection (both converted to lowercase)', () => {
      const existingSlugs = ['page']
      const result = generateUniqueSlug('Page', existingSlugs)
      expect(result).not.toBe('page')
      expect(result).toBe('page-1')
    })

    it('should return string synchronously', () => {
      const result = generateUniqueSlug('test', [])
      expect(typeof result).toBe('string')
      expect(result).toBe('test')
    })
  })

  describe('Security & Safety', () => {
    it('should be URL-safe (no special URL chars)', () => {
      const slug = generateSlug('My Project @ 2024!')
      expect(/^[a-z0-9_-]*$/.test(slug)).toBe(true)
    })

    it('should prevent SQL injection characters', () => {
      const slug = generateSlug("'; DROP TABLE users; --")
      expect(slug).not.toContain("'")
      expect(slug).not.toContain(';')
      expect(slug).not.toContain('--')
    })

    it('should prevent XSS characters', () => {
      const slug = generateSlug('<script>alert("xss")</script>')
      expect(slug).not.toContain('<')
      expect(slug).not.toContain('>')
      expect(slug).not.toContain('"')
    })

    it('should be safe as filename', () => {
      const slug = generateSlug('File: Name?')
      expect(slug).not.toContain(':')
      expect(slug).not.toContain('?')
    })

    it('should not allow path traversal characters', () => {
      const slug = generateSlug('../../../etc/passwd')
      expect(slug).not.toContain('.')
      expect(slug).not.toContain('/')
    })
  })

  describe('Consistency', () => {
    it('should produce same result from different case inputs', () => {
      const slug1 = generateSlug('hello world')
      const slug2 = generateSlug('HELLO WORLD')
      const slug3 = generateSlug('HeLLo WoRLD')
      expect(slug1).toBe(slug2)
      expect(slug2).toBe(slug3)
    })

    it('should handle unicode consistently', () => {
      const result = generateSlug('café')
      expect(typeof result).toBe('string')
      expect(result).toBeTruthy()
    })
  })
})
