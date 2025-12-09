import type { MenuItem, Project, PortfolioData, Slide } from './firebase/types'

/**
 * Mock data for local development and testing
 * This data matches the design reference provided
 */

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    label: 'BUTTER',
    href: '/',
    isActive: true,
  },
  {
    id: '2',
    label: 'EXPERIMENTS',
    href: '/experiments',
  },
  {
    id: '3',
    label: 'PRODUCTS',
    href: '/products',
  },
  {
    id: '4',
    label: 'BREAD',
    href: '/bread',
  },
  {
    id: '5',
    label: 'PERSONIO',
    href: '/personio',
  },
  {
    id: '6',
    label: 'GOOGLE',
    href: '/google',
  },
  {
    id: '7',
    label: 'ZALANDO',
    href: '/zalando',
  },
  {
    id: '8',
    label: 'INTUIT',
    href: '/intuit',
  },
  {
    id: '9',
    label: 'HONEYWELL',
    href: '/honeywell',
  },
  {
    id: '10',
    label: 'ALAP',
    href: '/alap',
  },
]

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Project title',
    description: 'Description',
    tags: ['COMPANY', '2014', 'EXPERIMENT'],
    // Variant 1: Single image (no carousel)
    singleImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    content: {
      showTitle: true,
      showDescription: true,
      showSingleImage: true,
      showPhotoCarousel: false,
      showSlides: false,
      showTextOnly: false,
      showTags: true,
    },
  },
  {
    id: '2',
    title: 'Project title',
    description: 'Description',
    tags: ['COMPANY', '2014', 'EXPERIMENT'],
    // Variant 2: Slides carousel (blocks with text and images)
    slides: [
      {
        id: 'slide-1',
        useCustomContent: true, // Will use SlideContent component
      } as Slide,
      {
        id: 'slide-2',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        title: 'Slide Title',
        description: 'Slide description text',
      } as Slide,
      {
        id: 'slide-3',
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
        title: 'Another Slide',
        description: 'More slide content',
      } as Slide,
    ],
    content: {
      showTitle: true,
      showDescription: true,
      showSlides: true,
      showPhotoCarousel: false,
      showSingleImage: false,
      showTextOnly: false,
      showTags: true,
    },
  },
  {
    id: '3',
    title: 'Case Study: Building Scalable Systems',
    description: 'A deep dive into architectural decisions and how we evolved our system to handle millions of requests per day. This case study covers database scaling, caching strategies, microservices architecture, and real-time data processing. We implemented Redis for caching, migrated to microservices, added message queues for async processing, and optimized database queries. The results were impressive - we achieved 99.9% uptime and reduced response times by 60%.',
    tags: ['COMPANY', '2015', 'ARTICLE'],
    // Variant 3: Text-only (only title and description, no images/slides)
    content: {
      showTitle: true,
      showDescription: true,
      showTextOnly: true,
      showPhotoCarousel: false,
      showSlides: false,
      showSingleImage: false,
      showTags: true,
    },
  },
]

export const mockBio = {
  text: 'Crafting performance tools to help people grow and orgs flourish 👯. Hustling & experimenting in the after-hours 🧪. Obsessed with enabling ideas & people that drive meaningful change. Poke me for good coffee/noodle 🍜 in Berlin!',
}

export const mockPortfolioData: PortfolioData = {
  menuItems: mockMenuItems,
  sections: mockProjects.map((project) => ({
    id: project.id,
    type: 'project' as const,
    project,
  })),
  bio: mockBio,
}

