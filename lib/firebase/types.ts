/**
 * Type definitions for Firebase data structures
 */

export interface MenuItem {
  id: string
  label: string
  slug?: string // URL-friendly slug based on label (e.g., "PAGE" -> "page")
  href?: string // Deprecated: use slug instead, kept for backward compatibility
  isActive?: boolean
  tags?: string[] // Tags for pages (shared tag pool with projects)
}

export interface Slide {
  id: string
  image?: string
  title?: string
  description?: string
  useCustomContent?: boolean // For custom slide content like blue UI block
}

export interface Project {
  id: string
  title: string
  description: string
  images?: string[]
  slides?: Slide[]
  singleImage?: string | string[] // For variant 1: single photo or multiple photos (carousel)
  tags?: string[] // Tags replace the old company/year/type metadata
  pageId?: string // Associate project with a page (menu item)
  content?: {
    showTitle?: boolean
    showDescription?: boolean
    showPhotoCarousel?: boolean
    showSlides?: boolean
    showSingleImage?: boolean
    showTextOnly?: boolean
    showTags?: boolean
    layout?: 'vertical' | 'horizontal' // V Card (vertical) or H Card (horizontal)
  }
}

export interface ContentSection {
  id: string
  type: 'text' | 'project' | 'image'
  content?: string
  project?: Project
  imageUrl?: string
}

export interface PortfolioData {
  menuItems: MenuItem[]
  sections: ContentSection[]
  bio?: {
    text: string
  }
}

