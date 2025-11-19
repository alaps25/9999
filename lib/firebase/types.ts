/**
 * Type definitions for Firebase data structures
 */

export interface MenuItem {
  id: string
  label: string
  href?: string
  isActive?: boolean
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
  company: string
  year: string
  type: string
  title: string
  description: string
  images?: string[]
  slides?: Slide[]
  singleImage?: string // For variant 1: single photo without carousel
  tags?: string[]
  content?: {
    showTitle?: boolean
    showDescription?: boolean
    showPhotoCarousel?: boolean
    showSlides?: boolean
    showSingleImage?: boolean
    showTextOnly?: boolean
    showTags?: boolean
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

