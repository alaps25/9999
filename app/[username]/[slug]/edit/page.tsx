'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { CardWithInsertButton } from '@/components/content/CardWithInsertButton'
import { EditableText } from '@/components/ui/EditableText'
import { Dropdown } from '@/components/ui/Dropdown'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getPageIdBySlug, getPortfolioDataByPageId, getMenuItems } from '@/lib/firebase/queries'
import {
  updateBio,
  updateMenuItem,
  addMenuItem,
  updateProject,
  addProject,
  updateProjectSlides,
  deleteProject,
} from '@/lib/firebase/mutations'
import { uploadFiles, deleteFile, isBlobUrl } from '@/lib/firebase/storage'
import type { PortfolioData, Project, MenuItem, Slide } from '@/lib/firebase/types'
import { generateSlug } from '@/lib/utils/slug'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import styles from '../../../page.module.scss'

interface EditPageProps {
  params: {
    username: string
    slug: string
  }
}

function EditPageContent({ params }: EditPageProps) {
  const router = useRouter()
  const { user, userData } = useAuth()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)
  // Track uploading state per project: { projectId: { [imageIndex]: boolean } }
  const [uploadingStates, setUploadingStates] = useState<Record<string, Record<number, boolean>>>({})
  // Handle page name change from top input - updates immediately in UI, saves on blur
  const [pageNameInput, setPageNameInput] = useState('')

  // Extract page slug and username from params
  const pageSlug = params.slug
  const username = params.username

  useEffect(() => {
    async function loadData() {
      if (!user || !userData) {
        setLoading(false)
        return
      }

      // Verify username matches current user
      if (userData.username !== username) {
        console.error('Username mismatch')
        setLoading(false)
        return
      }

      try {
        // Get pageId from slug (optimized)
        const pageId = await getPageIdBySlug(pageSlug, user.uid)
        
        if (!pageId) {
          console.error('Page not found for slug:', pageSlug)
          setLoading(false)
          return
        }

        setCurrentPageId(pageId)

        // Load portfolio data using pageId (optimized query)
        const data = await getPortfolioDataByPageId(pageId, user.uid)
        setPortfolioData(data)
      } catch (error) {
        console.error('Error loading page data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [pageSlug, username, user, userData])

  // Sync pageNameInput with current page name when portfolioData or currentPageId changes
  useEffect(() => {
    if (portfolioData && currentPageId) {
      const currentMenuItem = portfolioData.menuItems.find(
        item => item.id === currentPageId
      )
      if (currentMenuItem) {
        setPageNameInput(currentMenuItem.label)
      }
    }
  }, [portfolioData, currentPageId])

  if (loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Update bio text - saves to Firebase on blur
  const handleBioChange = async (newText: string) => {
    if (!user) {
      console.warn('⚠️ Cannot save bio: user not authenticated')
      return
    }
    console.log('📝 handleBioChange called:', newText)
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      return {
        ...currentData,
        bio: { text: newText },
      }
    })

    try {
      console.log('💾 Saving bio to Firebase...')
      await updateBio(newText, user.uid)
      console.log('✅ Bio saved successfully')
    } catch (error) {
      console.error('❌ Failed to save bio:', error)
    }
  }

  // Update menu item - saves to Firebase on blur
  const handleMenuItemChange = async (id: string, newLabel: string) => {
    if (!user) {
      console.warn('⚠️ Cannot save menu item: user not authenticated')
      return
    }
    console.log('📝 handleMenuItemChange called:', { id, newLabel })
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
      console.log('💾 Saving menu item to Firebase...')
      await updateMenuItem(id, { label: newLabel }, user.uid)
      console.log('✅ Menu item saved successfully')
    } catch (error) {
      console.error('❌ Failed to save menu item:', error)
    }
  }

  const handlePageNameInputChange = (newLabel: string) => {
    setPageNameInput(newLabel)
  }

  const handlePageNameBlur = async () => {
    if (!currentPageId || !user || !portfolioData) {
      console.warn('⚠️ Cannot save page name: missing data', { currentPageId, user: !!user, portfolioData: !!portfolioData })
      return
    }
    
    // Find the menu item for the current page
    const currentMenuItem = portfolioData.menuItems.find(
      item => item.id === currentPageId
    )
    
    console.log('📝 handlePageNameBlur called:', { 
      currentPageId, 
      pageNameInput, 
      currentMenuItemLabel: currentMenuItem?.label,
      hasMenuItem: !!currentMenuItem 
    })
    
    // Only save if the value actually changed
    if (currentMenuItem && currentMenuItem.label !== pageNameInput) {
      console.log('💾 Page name changed, saving...')
      await handleMenuItemChange(currentMenuItem.id, pageNameInput)
    } else {
      console.log('ℹ️ Page name unchanged, skipping save')
    }
  }

  // Add new menu item - saves to Firebase immediately
  const handleAddMenuItem = async () => {
    if (!user || !userData) return
    const newItem: Omit<MenuItem, 'id'> = {
      label: 'PAGE',
      isActive: false,
    }
    
    try {
      const itemId = await addMenuItem(newItem, user.uid)
      // Reload menu items to get the slug that was generated
      const menuItems = await getMenuItems(user.uid)
      const createdItem = menuItems.find(item => item.id === itemId)
      const menuItem: MenuItem = createdItem || { 
        ...newItem, 
        id: itemId, 
        slug: generateSlug(newItem.label),
      }
      
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        return {
          ...currentData,
          menuItems: [...currentData.menuItems, menuItem],
        }
      })

      // Navigate to the new page's edit route
      const newSlug = menuItem.slug || generateSlug(newItem.label)
      router.push(`/${username}/${newSlug}/edit`)
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

  const handleViewClick = async () => {
    // Before navigating, ensure all pending changes are saved
    // Blur any active input fields to trigger their save handlers
    const activeElement = document.activeElement as HTMLElement
    
    // If there's an active input/textarea/contentEditable, blur it to trigger save
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    )) {
      activeElement.blur()
      
      // Wait a bit for the blur handler to complete (save operations are async)
      // This gives time for the save handlers to fire
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Also ensure page name input is saved if it has unsaved changes
    if (currentPageId && portfolioData) {
      const currentMenuItem = portfolioData.menuItems.find(
        item => item.id === currentPageId
      )
      if (currentMenuItem && currentMenuItem.label !== pageNameInput) {
        await handleMenuItemChange(currentMenuItem.id, pageNameInput)
      }
    }
    
    // Small delay to ensure all async saves complete
    await new Promise(resolve => setTimeout(resolve, 200))
    
    router.push(`/${username}/${pageSlug}`)
  }

  const handleShareClick = async () => {
    const portfolioUrl = getPortfolioUrl(username)
    await shareUrl(portfolioUrl, `Check out ${username}'s portfolio`)
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
      userId: user?.uid, // Associate with current user
    }
    
    switch (type) {
      case 'v-card':
        return {
          ...baseProject,
          title: 'Title',
          description: 'Description',
          tags: ['Tag', 'Tag'], // Two placeholder tags
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showTags: true,
            layout: 'vertical',
          },
          singleImage: '',
        }
      
      case 'h-card':
        return {
          ...baseProject,
          title: 'Title',
          description: 'Description',
          tags: ['Tag', 'Tag'], // Two placeholder tags
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showTags: true,
            layout: 'horizontal',
          },
          singleImage: '',
        }
      
      case 'media':
        return {
          ...baseProject,
          title: '',
          description: '',
          tags: [],
          content: {
            showTitle: false,
            showDescription: false,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showTags: false,
            layout: 'vertical',
          },
          singleImage: '',
        }
      
      case 'slides':
        return {
          ...baseProject,
          title: 'Title',
          description: 'Description',
          tags: ['Tag', 'Tag'], // Two placeholder tags
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: true,
            showSingleImage: false,
            showTags: true,
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
          title: '',
          description: 'Big text here...',
          tags: [],
          content: {
            showTitle: false,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: false,
            showTags: false,
            layout: 'vertical',
          },
        }
      
      default:
        return {
          ...baseProject,
          title: 'Title',
          description: 'Description',
          tags: ['Tag', 'Tag'], // Two placeholder tags
          content: {
            showTitle: true,
            showDescription: true,
            showTextOnly: false,
            showPhotoCarousel: false,
            showSlides: false,
            showSingleImage: true,
            showTags: true,
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
    if (!user) return
    const newProjectData = createProjectDataByType(cardType)
    
    try {
      const projectId = await addProject(newProjectData, user.uid)
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
    if (!user) return
    const newProjectData = createProjectDataByType(cardType)
    
    try {
      const projectId = await addProject(newProjectData, user.uid)
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

  // Handler for deleting a card/project
  const handleDeleteCard = async (projectId: string) => {
    if (!user) return
    
    // Delete associated images from Firebase Storage
    const section = portfolioData?.sections.find(
      s => s.type === 'project' && s.project?.id === projectId
    )
    
    if (section?.type === 'project' && section.project) {
      // Delete single image
      if (section.project.singleImage) {
        const imageArray = Array.isArray(section.project.singleImage)
          ? section.project.singleImage
          : [section.project.singleImage]
        
        for (const imageUrl of imageArray) {
          if (imageUrl && !isBlobUrl(imageUrl)) {
            try {
              await deleteFile(imageUrl)
            } catch (error) {
              console.error('Failed to delete image:', error)
            }
          }
        }
      }
      
      // Delete slide images
      if (section.project.slides) {
        for (const slide of section.project.slides) {
          if (slide.image && !isBlobUrl(slide.image)) {
            try {
              await deleteFile(slide.image)
            } catch (error) {
              console.error('Failed to delete slide image:', error)
            }
          }
        }
      }
    }
    
    // Remove from local state
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      return {
        ...currentData,
        sections: currentData.sections.filter(
          s => !(s.type === 'project' && s.project?.id === projectId)
        ),
      }
    })
    
    // Delete from Firestore
    try {
      await deleteProject(projectId, user.uid)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  // Handle media file selection - uploads to Firebase Storage
  const handleMediaChange = async (projectId: string, files: File[]) => {
    if (!user) return
    
    // Get current images to determine starting index for loading states
    const section = portfolioData?.sections.find(
      s => s.type === 'project' && s.project?.id === projectId
    )
    const existingImages = section?.type === 'project' ? section.project?.singleImage : undefined
    const existingArray = Array.isArray(existingImages) 
      ? existingImages 
      : (existingImages ? [existingImages] : [])
    const startIndex = existingArray.length
    
    // Set loading states for new images
    setUploadingStates((prev) => {
      const projectStates = prev[projectId] || {}
      const newStates: Record<number, boolean> = {}
      files.forEach((_, index) => {
        newStates[startIndex + index] = true
      })
      return {
        ...prev,
        [projectId]: { ...projectStates, ...newStates },
      }
    })
    
    // Create temporary blob URLs for immediate preview
    const tempBlobUrls = files.map(file => URL.createObjectURL(file))
    
    // Update local state immediately with blob URLs for preview
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          const existingImages = section.project.singleImage
          const existingArray = Array.isArray(existingImages) 
            ? existingImages 
            : (existingImages ? [existingImages] : [])
          
          const allImages = [...existingArray, ...tempBlobUrls]
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
      // Upload files to Firebase Storage
      const storageUrls = await uploadFiles(files, `projects/${projectId}/images`, user.uid)
      
      // Update state with Firebase Storage URLs
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        const updatedSections = (currentData.sections || []).map((section) => {
          if (section.type === 'project' && section.project?.id === projectId) {
            const currentImages = section.project.singleImage
            const currentArray = Array.isArray(currentImages) 
              ? currentImages 
              : (currentImages ? [currentImages] : [])
            
            // Replace blob URLs with Firebase Storage URLs
            const updatedArray = currentArray.map((url, index) => {
              if (index >= startIndex && index < startIndex + storageUrls.length) {
                return storageUrls[index - startIndex]
              }
              return url
            })
            
            const singleImage = updatedArray.length === 1 ? updatedArray[0] : updatedArray
            
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
      
      // Save to Firestore - use the value we calculated in the state update above
      // The state update already replaced blob URLs with storage URLs, so we can use that
      // But since state updates are async, we'll calculate it directly:
      // Original existing images + new storage URLs (replacing blob URLs we added)
      const originalSection = portfolioData?.sections.find(
        s => s.type === 'project' && s.project?.id === projectId
      )
      if (originalSection?.type === 'project' && originalSection.project) {
        // Get original images (before blob URLs were added)
        const originalImages = originalSection.project.singleImage
        const originalArray = Array.isArray(originalImages) 
          ? originalImages 
          : (originalImages ? [originalImages] : [])
        
        // Final array = original images + new storage URLs
        const finalArray = [...originalArray, ...storageUrls]
        const singleImageToSave = finalArray.length === 1 ? finalArray[0] : finalArray
        
        console.log('Saving to Firestore:', { 
          projectId, 
          singleImageToSave, 
          storageUrls, 
          startIndex,
          originalArrayLength: originalArray.length,
          finalArrayLength: finalArray.length
        })
        await updateProject(projectId, { singleImage: singleImageToSave }, user.uid)
        console.log('Saved to Firestore successfully')
      }
      
      // Clear loading states
      setUploadingStates((prev) => {
        const projectStates = prev[projectId] || {}
        const clearedStates: Record<number, boolean> = {}
        files.forEach((_, index) => {
          clearedStates[startIndex + index] = false
        })
        return {
          ...prev,
          [projectId]: { ...projectStates, ...clearedStates },
        }
      })
      
      // Clean up blob URLs
      tempBlobUrls.forEach(url => URL.revokeObjectURL(url))
    } catch (error) {
      console.error('Failed to upload media:', error)
      
      // Clear loading states on error
      setUploadingStates((prev) => {
        const projectStates = prev[projectId] || {}
        const clearedStates: Record<number, boolean> = {}
        files.forEach((_, index) => {
          clearedStates[startIndex + index] = false
        })
        return {
          ...prev,
          [projectId]: { ...projectStates, ...clearedStates },
        }
      })
      
      // Remove failed uploads from state
      setPortfolioData((currentData) => {
        if (!currentData) return currentData
        const updatedSections = (currentData.sections || []).map((section) => {
          if (section.type === 'project' && section.project?.id === projectId) {
            const currentImages = section.project.singleImage
            const currentArray = Array.isArray(currentImages) 
              ? currentImages 
              : (currentImages ? [currentImages] : [])
            
            // Remove blob URLs that failed to upload
            const filteredArray = currentArray.filter(url => !isBlobUrl(url) || !tempBlobUrls.includes(url))
            const singleImage = filteredArray.length === 1 ? filteredArray[0] : filteredArray
            
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
    }
  }

  // Handle media deletion - also deletes from Firebase Storage
  const handleMediaDelete = async (projectId: string, indexToDelete?: number) => {
    if (!user) return
    
    // Get the image URL(s) to delete
    const section = portfolioData?.sections.find(
      s => s.type === 'project' && s.project?.id === projectId
    )
    if (!section || section.type !== 'project' || !section.project) return
    
    const currentSingleImage = section.project.singleImage
    let imageArray: string[] = []
    
    if (Array.isArray(currentSingleImage)) {
      imageArray = currentSingleImage
    } else if (typeof currentSingleImage === 'string' && currentSingleImage) {
      imageArray = [currentSingleImage]
    }
    
    // Determine which URLs to delete
    const urlsToDelete = indexToDelete !== undefined 
      ? [imageArray[indexToDelete]].filter(Boolean)
      : imageArray
    
    // Delete from Firebase Storage (only Firebase Storage URLs, not blob URLs)
    try {
      await Promise.all(
        urlsToDelete
          .filter(url => !isBlobUrl(url))
          .map(url => deleteFile(url))
      )
    } catch (error) {
      console.error('Failed to delete files from Storage:', error)
      // Continue with state update even if Storage deletion fails
    }
    
    // Update local state
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
    
    // Save to Firestore
    try {
      const updatedSection = portfolioData?.sections.find(
        s => s.type === 'project' && s.project?.id === projectId
      )
      if (updatedSection?.type === 'project' && updatedSection.project) {
        const currentSingleImage = updatedSection.project.singleImage
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
        await updateProject(projectId, { singleImage: updatedSingleImage }, user.uid)
      }
    } catch (error) {
      console.error('Failed to delete media:', error)
    }
  }

  // Update project field - supports both string and string[] (for tags)
  const handleProjectFieldChange = async (
    projectId: string,
    field: keyof Project,
    value: string | string[]
  ) => {
    if (!user) {
      console.warn('⚠️ Cannot save project field: user not authenticated')
      return
    }
    console.log('📝 handleProjectFieldChange called:', { projectId, field, value })
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
      console.log('💾 Saving project field to Firebase...')
      await updateProject(projectId, { [field]: value }, user.uid)
      console.log('✅ Project field saved successfully')
    } catch (error) {
      console.error('❌ Failed to save project field:', error)
    }
  }

  // Add new slide to project
  const handleAddSlide = async (projectId: string) => {
    if (!user) return
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
        await updateProjectSlides(projectId, project.slides || [], user.uid)
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
    if (!user) return
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
        await updateProjectSlides(projectId, project.slides || [], user.uid)
      }
    } catch (error) {
      console.error('Failed to save slide description:', error)
    }
  }

  // Handle slide image upload - uploads to Firebase Storage
  const handleSlideImageChange = async (
    projectId: string,
    slideId: string,
    files: File[]
  ) => {
    if (!user || files.length === 0) return

    // Set loading state for this slide
    setUploadingStates((prev) => {
      const projectStates = prev[projectId] || {}
      return {
        ...prev,
        [projectId]: { ...projectStates, [`slide-${slideId}`]: true },
      }
    })

    // Create temporary blob URL for immediate preview
    const tempBlobUrl = URL.createObjectURL(files[0])

    // Update local state immediately with blob URL
    setPortfolioData((currentData) => {
      if (!currentData) return currentData
      const updatedSections = (currentData.sections || []).map((section) => {
        if (section.type === 'project' && section.project?.id === projectId) {
          return {
            ...section,
            project: {
              ...section.project,
              slides: section.project.slides?.map((slide) =>
                slide.id === slideId ? { ...slide, image: tempBlobUrl } : slide
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
      // Upload to Firebase Storage
      const storageUrls = await uploadFiles(files, `projects/${projectId}/slides/${slideId}`, user.uid)
      const imageUrl = storageUrls[0] // Slides only support single image

      // Update state with Firebase Storage URL
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

      // Save to Firestore
      const project = portfolioData?.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        const updatedSlides = project.slides?.map((slide) =>
          slide.id === slideId ? { ...slide, image: imageUrl } : slide
        )
        await updateProjectSlides(projectId, updatedSlides || [], user.uid)
      }

      // Clear loading state
      setUploadingStates((prev) => {
        const projectStates = prev[projectId] || {}
        return {
          ...prev,
          [projectId]: { ...projectStates, [`slide-${slideId}`]: false },
        }
      })

      // Clean up blob URL
      URL.revokeObjectURL(tempBlobUrl)
    } catch (error) {
      console.error('Failed to upload slide image:', error)
      
      // Clear loading state on error
      setUploadingStates((prev) => {
        const projectStates = prev[projectId] || {}
        return {
          ...prev,
          [projectId]: { ...projectStates, [`slide-${slideId}`]: false },
        }
      })
      
      // Remove failed upload from state
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
    }
  }

  // Handle slide image deletion - also deletes from Firebase Storage
  const handleSlideImageDelete = async (
    projectId: string,
    slideId: string
  ) => {
    if (!user) return
    
    // Get the image URL to delete
    const section = portfolioData?.sections.find(
      s => s.type === 'project' && s.project?.id === projectId
    )
    const slide = section?.type === 'project' && section.project
      ? section.project.slides?.find(s => s.id === slideId)
      : undefined
    
    const imageUrl = slide?.image
    
    // Delete from Firebase Storage if it's a Firebase Storage URL
    if (imageUrl && !isBlobUrl(imageUrl)) {
      try {
        await deleteFile(imageUrl)
      } catch (error) {
        console.error('Failed to delete file from Storage:', error)
        // Continue with state update even if Storage deletion fails
      }
    }
    
    // Update local state
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

    // Save to Firestore
    try {
      const project = portfolioData?.sections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [], user.uid)
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
    if (!user) return
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
        await updateProjectSlides(projectId, project.slides || [], user.uid)
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

  // Generate hrefs for menu items using username
  // Ensure only one item is active - use the first matching item by slug
  let foundActive = false
  const menuItemsWithHrefs = portfolioData.menuItems.map((item) => {
    const matchesSlug = item.slug === pageSlug
    const shouldBeActive = matchesSlug && !foundActive
    if (shouldBeActive) {
      foundActive = true
    }
    return {
      ...item,
      href: `/${username}/${item.slug || 'page'}`,
      isActive: shouldBeActive,
      label: (
        <EditableText
          value={item.label}
          onChange={(newLabel) => handleMenuItemChange(item.id, newLabel)}
          variant="body"
        />
      ),
    }
  })

  // Secondary menu items (SHARE and SETTINGS)
  const secondaryMenuItems = [
    { id: 'share', label: 'SHARE', onClick: handleShareClick },
    { id: 'settings', label: 'SETTINGS', href: '/settings' },
  ]

  return (
    <div className={styles.page}>
      <Sidebar 
        menuItems={menuItemsWithHrefs}
        secondaryMenuItems={secondaryMenuItems}
        onAddItem={handleAddMenuItem}
      />
      <MainContent>
        {/* Page Name and View Button Row - Only visible to page owner */}
        {userData?.username === username && (
          <div className={styles.pageHeaderRow}>
          <Input
            type="text"
            placeholder="untitled"
            value={pageNameInput}
            onChange={(e) => handlePageNameInputChange(e.target.value)}
            onBlur={handlePageNameBlur}
            inputSize="md"
            style={{ flex: 1 }}
          />
          <Button
            variant="medium"
            size="md"
            onClick={handleViewClick}
          >
            <Eye size={16} />
            VIEW
          </Button>
        </div>
        )}
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
          <AnimatePresence mode="popLayout">
            {portfolioData.bio && (
              <motion.div
                key="bio"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for smooth easing
                  opacity: { duration: 0.3 }
                }}
              >
                <CardWithInsertButton
                  variant="bio"
                  bioText={portfolioData.bio.text}
                  isEditable
                  onBioChange={handleBioChange}
                  hasCardAbove={false}
                  hasCardBelow={portfolioData.sections.length > 0}
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
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="popLayout">
            {portfolioData.sections.map((section, index) => {
            if (section.type === 'project' && section.project) {
              const isBigText = !section.project.content?.showTitle && 
                                section.project.content?.showDescription && 
                                !section.project.content?.showSingleImage && 
                                !section.project.content?.showSlides && 
                                !section.project.content?.showPhotoCarousel &&
                                !section.project.content?.showTags
              
              const isMediaCard = !section.project.content?.showTitle && 
                                  !section.project.content?.showDescription && 
                                  section.project.content?.showSingleImage && 
                                  !section.project.content?.showSlides && 
                                  !section.project.content?.showPhotoCarousel &&
                                  !section.project.content?.showTags
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for smooth easing
                    opacity: { duration: 0.3 }
                  }}
                >
                  <CardWithInsertButton
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
                    hasCardBelow={index < portfolioData.sections.length - 1}
                    uploadingStates={uploadingStates[section.project.id] || {}}
                    onDelete={() => handleDeleteCard(section.project!.id)}
                  />
                </motion.div>
              )
            }
            return null
            })}
          </AnimatePresence>
        </div>
      </MainContent>
    </div>
  )
}

export default function EditPage({ params }: EditPageProps) {
  return (
    <ProtectedRoute>
      <EditPageContent params={params} />
    </ProtectedRoute>
  )
}

