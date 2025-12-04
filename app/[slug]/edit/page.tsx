'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { CardWithInsertButton } from '@/components/content/CardWithInsertButton'
import { EditableText } from '@/components/ui/EditableText'
import { Dropdown } from '@/components/ui/Dropdown'
import { getPortfolioData } from '@/lib/firebase/queries'
import {
  updateBio,
  updateMenuItem,
  addMenuItem,
  updateProject,
  addProject,
  updateProjectSlides,
} from '@/lib/firebase/mutations'
import type { PortfolioData, Project, MenuItem, Slide } from '@/lib/firebase/types'
import styles from '../../page.module.scss'

interface EditPageProps {
  params: {
    slug: string
  }
}

export default function EditPage({ params }: EditPageProps) {
  const pathname = usePathname()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)

  // Extract page slug from params (e.g., "page")
  const pageSlug = params.slug

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPortfolioData(pageSlug)
        setPortfolioData(data)
        
        // Find the current page ID by matching slug
        // Also check href as fallback for backward compatibility
        const pageMenuItem = data.menuItems.find(item => 
          item.slug === pageSlug || 
          item.href === `/${pageSlug}` ||
          (pageSlug === 'page' && (!item.slug || item.slug === 'page'))
        )
        
        // Fallback: if no exact match, use first menu item (for "page" slug, this should be the first one)
        const foundPageId = pageMenuItem?.id || (data.menuItems.length > 0 ? data.menuItems[0].id : null)
        
        if (!foundPageId) {
          console.error('Page not found for slug:', pageSlug, 'Available menu items:', data.menuItems)
        } else {
          setCurrentPageId(foundPageId)
        }
      } catch (error) {
        console.error('Error loading page data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [pageSlug])

  if (loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Update bio text - saves to Firebase on blur
  const handleBioChange = async (newText: string) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      return {
        ...currentData,
        bio: { text: newText },
      }
    })

    try {
      await updateBio(newText)
    } catch (error) {
      console.error('Failed to save bio:', error)
    }
  }

  // Update menu item - saves to Firebase on blur
  const handleMenuItemChange = async (id: string, newLabel: string) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      return {
        ...currentData,
        menuItems: currentData.menuItems.map((item) =>
          item.id === id ? { ...item, label: newLabel } : item
        ),
      }
    })

    try {
      await updateMenuItem(id, { label: newLabel })
    } catch (error) {
      console.error('Failed to save menu item:', error)
    }
  }

  // Add new menu item - saves to Firebase immediately
  const handleAddMenuItem = async () => {
    const newItem: Omit<MenuItem, 'id'> = {
      label: 'PAGE',
      isActive: false,
      // href will be set after creation using the menu item ID
    }
    
    try {
      const itemId = await addMenuItem(newItem)
      // Reload menu items to get the slug that was generated
      const updatedData = await getPortfolioData(pageSlug)
      const createdItem = updatedData.menuItems.find(item => item.id === itemId)
      const menuItem: MenuItem = createdItem || { 
        ...newItem, 
        id: itemId, 
        slug: generateSlug(newItem.label),
        href: `/${generateSlug(newItem.label)}`,
      }
      
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        return {
          ...currentData,
          menuItems: [...currentData.menuItems, menuItem],
        }
      })
    } catch (error) {
      console.error('Failed to add menu item:', error)
      // Fallback: add with temporary ID
      const tempItem: MenuItem = { ...newItem, id: `menu-${Date.now()}` }
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        return {
          ...currentData,
          menuItems: [...currentData.menuItems, tempItem],
        }
      })
    }
  }

  // Helper to create project data based on card type
  const createProjectDataByType = (
    type: 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text'
  ): Omit<Project, 'id'> => {
    // Always require pageId - use currentPageId from state or find it from portfolioData
    let pageId = currentPageId
    
    // Fallback: try to find pageId from portfolioData if currentPageId is not set
    if (!pageId && portfolioData) {
      const pageMenuItem = portfolioData.menuItems.find(item => item.slug === pageSlug)
      pageId = pageMenuItem?.id || null
    }
    
    if (!pageId) {
      console.error('Cannot create project: currentPageId is not set', {
        pageSlug,
        currentPageId,
        menuItems: portfolioData?.menuItems,
      })
      throw new Error('Page ID is required to create a project. Please wait for the page to load.')
    }
    
    const baseProject = {
      pageId: pageId, // Associate with current page
    }
    
    switch (type) {
      case 'v-card':
        return {
          ...baseProject,
          company: 'COMPANY',
          year: new Date().getFullYear().toString(),
          type: 'PROJECT',
          title: 'New Project',
          description: 'Project description',
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showMetadata: true,
            layout: 'vertical',
          },
          singleImage: '',
        }
      
      case 'h-card':
        return {
          ...baseProject,
          company: 'COMPANY',
          year: new Date().getFullYear().toString(),
          type: 'PROJECT',
          title: 'New Project',
          description: 'Project description',
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showMetadata: true,
            layout: 'horizontal',
          },
          singleImage: '',
        }
      
      case 'media':
        return {
          ...baseProject,
          company: '',
          year: '',
          type: '',
          title: '',
          description: '',
          content: {
            showTitle: false,
            showDescription: false,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showMetadata: false,
            layout: 'vertical',
          },
          singleImage: '',
        }
      
      case 'slides':
        return {
          ...baseProject,
          company: 'COMPANY',
          year: new Date().getFullYear().toString(),
          type: 'PROJECT',
          title: 'New Project',
          description: 'Project description',
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: true,
            showSingleImage: false,
            showMetadata: true,
            layout: 'vertical',
          },
          slides: [
            {
              id: `slide-${Date.now()}`,
              title: '',
              description: 'Slide description',
              image: '',
            },
          ],
        }
      
      case 'big-text':
        return {
          ...baseProject,
          company: '',
          year: '',
          type: '',
          title: '',
          description: 'Enter your text here...',
          content: {
            showTitle: false,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: false,
            showMetadata: false,
            layout: 'vertical',
          },
        }
      
      default:
        return {
          ...baseProject,
          company: 'COMPANY',
          year: new Date().getFullYear().toString(),
          type: 'PROJECT',
          title: 'New Project',
          description: 'Project description',
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showMetadata: true,
            layout: 'vertical',
          },
          singleImage: '',
        }
    }
  }

  // Handler for inserting card above a specific section
  const handleInsertAbove = async (
    insertBeforeIndex: number,
    cardType: 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text' = 'v-card'
  ) => {
    const newProjectData = createProjectDataByType(cardType)
    
    try {
      const projectId = await addProject(newProjectData)
      const newProject: Project = { ...newProjectData, id: projectId }
      
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        
        const newSections = [...currentData.sections]
        newSections.splice(insertBeforeIndex, 0, {
          id: projectId,
          type: 'project' as const,
          project: newProject,
        })
        
        return {
          ...currentData,
          sections: newSections,
        }
      })
    } catch (error) {
      console.error('Failed to insert project above:', error)
      const tempProject: Project = { ...newProjectData, id: `project-${Date.now()}` }
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        
        const newSections = [...currentData.sections]
        newSections.splice(insertBeforeIndex, 0, {
          id: tempProject.id,
          type: 'project' as const,
          project: tempProject,
        })
        
        return {
          ...currentData,
          sections: newSections,
        }
      })
    }
  }

  // Handler for inserting card below a specific section
  const handleInsertBelow = async (
    insertAfterIndex: number,
    cardType: 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text' = 'v-card'
  ) => {
    const newProjectData = createProjectDataByType(cardType)
    
    try {
      const projectId = await addProject(newProjectData)
      const newProject: Project = { ...newProjectData, id: projectId }
      
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        
        const newSections = [...currentData.sections]
        const insertIndex = insertAfterIndex === -1 ? 0 : insertAfterIndex + 1
        newSections.splice(insertIndex, 0, {
          id: projectId,
          type: 'project' as const,
          project: newProject,
        })
        
        return {
          ...currentData,
          sections: newSections,
        }
      })
    } catch (error) {
      console.error('Failed to insert project below:', error)
      const tempProject: Project = { ...newProjectData, id: `project-${Date.now()}` }
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        
        const newSections = [...currentData.sections]
        const insertIndex = insertAfterIndex === -1 ? 0 : insertAfterIndex + 1
        newSections.splice(insertIndex, 0, {
          id: tempProject.id,
          type: 'project' as const,
          project: tempProject,
        })
        
        return {
          ...currentData,
          sections: newSections,
        }
      })
    }
  }

  // Handle media file selection
  const handleMediaChange = async (projectId: string, files: File[]) => {
    const newLocalUrls = files.map(file => URL.createObjectURL(file))
    
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          const existingImages = section.project.singleImage
          const existingArray = Array.isArray(existingImages) 
            ? existingImages 
            : (existingImages ? [existingImages] : [])
          
          const allImages = [...existingArray, ...newLocalUrls]
          const singleImage = allImages.length === 1 ? allImages[0] : allImages
          
          return {
            ...section,
            project: {
              ...section.project,
              singleImage: singleImage,
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })
    
    try {
      const section = portfolioData.sections.find(
        s => s.type === 'project' && s.project?.id === projectId
      )
      if (section?.type === 'project' && section.project) {
        const existingImages = section.project.singleImage
        const existingArray = Array.isArray(existingImages) 
          ? existingImages 
          : (existingImages ? [existingImages] : [])
        const allImages = [...existingArray, ...newLocalUrls]
        const singleImage = allImages.length === 1 ? allImages[0] : allImages
        await updateProject(projectId, { singleImage: singleImage })
      }
    } catch (error) {
      console.error('Failed to save media:', error)
    }
  }

  // Handle media deletion
  const handleMediaDelete = async (projectId: string, indexToDelete?: number) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = currentData.sections.map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          const currentSingleImage = section.project.singleImage
          let imageArray: string[] = []
          
          if (Array.isArray(currentSingleImage)) {
            imageArray = currentSingleImage
          } else if (typeof currentSingleImage === 'string' && currentSingleImage) {
            imageArray = [currentSingleImage]
          }
          
          if (indexToDelete !== undefined && imageArray.length > 0) {
            imageArray = imageArray.filter((_, index) => index !== indexToDelete)
          } else {
            imageArray = []
          }
          
          const updatedSingleImage = imageArray.length === 1 ? imageArray[0] : (imageArray.length > 1 ? imageArray : '')
          
          return {
            ...section,
            project: {
              ...section.project,
              singleImage: updatedSingleImage,
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })
    
    try {
      const section = portfolioData.sections.find(
        s => s.type === 'project' && s.project?.id === projectId
      )
      if (section?.type === 'project' && section.project) {
        const currentSingleImage = section.project.singleImage
        let imageArray: string[] = []
        
        if (Array.isArray(currentSingleImage)) {
          imageArray = currentSingleImage
        } else if (typeof currentSingleImage === 'string' && currentSingleImage) {
          imageArray = [currentSingleImage]
        }
        
        if (indexToDelete !== undefined && imageArray.length > 0) {
          imageArray = imageArray.filter((_, index) => index !== indexToDelete)
        } else {
          imageArray = []
        }
        
        const updatedSingleImage = imageArray.length === 1 ? imageArray[0] : (imageArray.length > 1 ? imageArray : '')
        await updateProject(projectId, { singleImage: updatedSingleImage })
      }
    } catch (error) {
      console.error('Failed to delete media:', error)
    }
  }

  // Update project field
  const handleProjectFieldChange = async (
    projectId: string,
    field: keyof Project,
    value: string
  ) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          return {
            ...section,
            project: {
              ...section.project,
              [field]: value,
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })

    try {
      await updateProject(projectId, { [field]: value })
    } catch (error) {
      console.error('Failed to save project field:', error)
    }
  }

  // Add new slide to project
  const handleAddSlide = async (projectId: string) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      image: '',
      description: 'Slide description',
    }
    
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          const currentSlides = section.project.slides || []
          const updatedSlides = [...currentSlides, newSlide]

          return {
            ...section,
            project: {
              ...section.project,
              slides: updatedSlides,
              content: {
                ...section.project.content,
                showSlides: true,
                showPhotoCarousel: false,
                showSingleImage: false,
                showTextOnly: false,
              },
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })

    try {
      const project = portfolioData.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to save slides:', error)
    }
  }

  // Update slide description
  const handleSlideDescriptionChange = async (
    projectId: string,
    slideId: string,
    description: string
  ) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          return {
            ...section,
            project: {
              ...section.project,
              slides: section.project.slides?.map((slide) =>
                slide.id === slideId ? { ...slide, description } : slide
              ),
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })

    try {
      const project = portfolioData.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to save slide description:', error)
    }
  }

  // Handle slide image upload
  const handleSlideImageChange = async (
    projectId: string,
    slideId: string,
    files: File[]
  ) => {
    if (files.length === 0) return

    const imageUrl = URL.createObjectURL(files[0])

    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          return {
            ...section,
            project: {
              ...section.project,
              slides: section.project.slides?.map((slide) =>
                slide.id === slideId ? { ...slide, image: imageUrl } : slide
              ),
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })

    try {
      const project = portfolioData.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to save slide image:', error)
    }
  }

  // Handle slide image deletion
  const handleSlideImageDelete = async (
    projectId: string,
    slideId: string
  ) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          return {
            ...section,
            project: {
              ...section.project,
              slides: section.project.slides?.map((slide) =>
                slide.id === slideId ? { ...slide, image: undefined } : slide
              ),
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })

    try {
      const project = portfolioData.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to delete slide image:', error)
    }
  }

  // Handle slide deletion
  const handleSlideDelete = async (
    projectId: string,
    slideId: string
  ) => {
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          const updatedSlides = section.project.slides?.filter(
            (slide) => slide.id !== slideId
          ) || []
          
          return {
            ...section,
            project: {
              ...section.project,
              slides: updatedSlides,
            },
          }
        }
        return section
      })
      return {
        ...currentData,
        sections: updatedSections,
      }
    })

    try {
      const project = portfolioData.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to delete slide:', error)
    }
  }

  // Check if there's any content
  const hasContent = !!(portfolioData.bio?.text || portfolioData.sections.length > 0)
  
  // Common insert options
  const insertOptions = [
    { 
      label: 'V Card', 
      value: 'v-card'
    },
    { 
      label: 'H Card', 
      value: 'h-card'
    },
    { 
      label: 'Media', 
      value: 'media'
    },
    { 
      label: 'Slides', 
      value: 'slides'
    },
    { 
      label: 'Big text', 
      value: 'big-text'
    },
  ]

  // Handler for default add button
  const handleDefaultAdd = async (cardType?: string) => {
    const type = (cardType as 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text') || 'v-card'
    await handleInsertBelow(-1, type)
  }

  return (
    <div className={styles.page}>
      <Sidebar 
        menuItems={portfolioData.menuItems.map((item) => ({
          ...item,
          label: (
            <EditableText
              value={item.label}
              onChange={(newLabel) => handleMenuItemChange(item.id, newLabel)}
              variant="body"
            />
          ),
        }))}
        onAddItem={handleAddMenuItem}
      />
      <MainContent>
        {/* Projects Section */}
        <div className={styles.projectsSection}>
          {/* Show default add button when there's no content */}
          {!hasContent && (
            <div className={styles.addProjectButton}>
              <Dropdown
                options={insertOptions}
                placeholder="Add"
                variant="low"
                size="md"
                alwaysShowPlaceholder={true}
                onSelect={(value) => handleDefaultAdd(value)}
              />
            </div>
          )}

          {/* Bio Section as ProjectCard variant */}
          {portfolioData.bio && (
            <CardWithInsertButton
              variant="bio"
              bioText={portfolioData.bio.text}
              isEditable
              onBioChange={handleBioChange}
              hasCardAbove={false}
              insertOptions={insertOptions}
              onInsertAbove={(cardType) => {
                const type = (cardType as 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text') || 'v-card'
                handleInsertAbove(0, type)
              }}
              onInsertBelow={(cardType) => {
                const type = (cardType as 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text') || 'v-card'
                handleInsertBelow(-1, type)
              }}
            />
          )}
          
          {portfolioData.sections.map((section, index) => {
            if (section.type === 'project' && section.project) {
              const isBigText = !section.project.content?.showTitle && 
                                section.project.content?.showDescription && 
                                !section.project.content?.showSingleImage && 
                                !section.project.content?.showSlides && 
                                !section.project.content?.showPhotoCarousel &&
                                !section.project.content?.showMetadata
              
              const isMediaCard = !section.project.content?.showTitle && 
                                  !section.project.content?.showDescription && 
                                  section.project.content?.showSingleImage && 
                                  !section.project.content?.showSlides && 
                                  !section.project.content?.showPhotoCarousel &&
                                  !section.project.content?.showMetadata
              
              return (
                <CardWithInsertButton
                  key={section.id}
                  project={section.project}
                  variant={isBigText ? 'bio' : 'project'}
                  bioText={isBigText ? section.project.description : undefined}
                  noPadding={isMediaCard}
                  isEditable
                  onFieldChange={(field, value) =>
                    handleProjectFieldChange(section.project!.id, field, value)
                  }
                  onBioChange={isBigText ? (value) => handleProjectFieldChange(section.project!.id, 'description', value) : undefined}
                  onAddSlide={() => handleAddSlide(section.project!.id)}
                  onSlideDescriptionChange={(slideId, description) =>
                    handleSlideDescriptionChange(section.project!.id, slideId, description)
                  }
                  onMediaChange={(files) => handleMediaChange(section.project!.id, files)}
                  onMediaDelete={(indexToDelete) => handleMediaDelete(section.project!.id, indexToDelete)}
                  onSlideImageChange={(slideId, files) =>
                    handleSlideImageChange(section.project!.id, slideId, files)
                  }
                  onSlideImageDelete={(slideId) =>
                    handleSlideImageDelete(section.project!.id, slideId)
                  }
                  onSlideDelete={(slideId) =>
                    handleSlideDelete(section.project!.id, slideId)
                  }
                  insertOptions={insertOptions}
                  onInsertAbove={(cardType) => {
                    const type = (cardType as 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text') || 'v-card'
                    handleInsertAbove(index, type)
                  }}
                  onInsertBelow={(cardType) => {
                    const type = (cardType as 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text') || 'v-card'
                    handleInsertBelow(index, type)
                  }}
                  hasCardAbove={index > 0 || !!portfolioData.bio?.text}
                />
              )
            }
            return null
          })}
          {/* Bottom add button - only show when content exists */}
          {hasContent && (
            <div className={styles.addProjectButton}>
              <Dropdown
                options={insertOptions}
                placeholder="Add"
                variant="low"
                size="md"
                alwaysShowPlaceholder={true}
                onSelect={(value) => handleInsertBelow(portfolioData.sections.length - 1, value as 'v-card' | 'h-card' | 'media' | 'slides' | 'big-text' || 'v-card')}
              />
            </div>
          )}
        </div>
      </MainContent>
    </div>
  )
}

