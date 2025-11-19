'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { EditableText } from '@/components/ui/EditableText'
import { AddButton } from '@/components/ui/AddButton'
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
import styles from '../page.module.scss'

export default function EditPage() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getPortfolioData()
      setPortfolioData(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading || !portfolioData) {
    return <div>Loading...</div>
  }

  // Update bio text - saves to Firebase on blur
  const handleBioChange = async (newText: string) => {
    // Update local state immediately
    setPortfolioData({
      ...portfolioData,
      bio: { text: newText },
    })
    
    // Save to Firebase
    try {
      await updateBio(newText)
    } catch (error) {
      console.error('Failed to save bio:', error)
    }
  }

  // Add new menu item - saves to Firebase immediately
  const handleAddMenuItem = async () => {
    const newItem: Omit<MenuItem, 'id'> = {
      label: 'NEW ITEM',
      href: '/new-item',
      isActive: false,
    }
    
    try {
      const itemId = await addMenuItem(newItem)
      const menuItem: MenuItem = { ...newItem, id: itemId }
      
      setPortfolioData({
        ...portfolioData,
        menuItems: [...portfolioData.menuItems, menuItem],
      })
    } catch (error) {
      console.error('Failed to add menu item:', error)
      // Fallback: add with temporary ID
      const tempItem: MenuItem = { ...newItem, id: `menu-${Date.now()}` }
      setPortfolioData({
        ...portfolioData,
        menuItems: [...portfolioData.menuItems, tempItem],
      })
    }
  }

  // Update menu item - saves to Firebase on blur
  const handleMenuItemChange = async (id: string, newLabel: string) => {
    // Update local state immediately
    setPortfolioData({
      ...portfolioData,
      menuItems: portfolioData.menuItems.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item
      ),
    })
    
    // Save to Firebase
    try {
      await updateMenuItem(id, { label: newLabel })
    } catch (error) {
      console.error('Failed to save menu item:', error)
    }
  }

  // Add new project card - saves to Firebase immediately
  const handleAddProject = async () => {
    const newProjectData: Omit<Project, 'id'> = {
      company: 'COMPANY',
      year: new Date().getFullYear().toString(),
      type: 'PROJECT',
      title: 'New Project',
      description: 'Project description',
      content: {
        showTitle: true,
        showDescription: true,
        showTextOnly: true,
        showPhotoCarousel: false,
        showSlides: false,
        showSingleImage: false,
        showMetadata: true,
      },
    }
    
    try {
      const projectId = await addProject(newProjectData)
      const newProject: Project = { ...newProjectData, id: projectId }
      
      setPortfolioData({
        ...portfolioData,
        sections: [
          ...portfolioData.sections,
          {
            id: projectId,
            type: 'project' as const,
            project: newProject,
          },
        ],
      })
    } catch (error) {
      console.error('Failed to add project:', error)
      // Fallback: add with temporary ID
      const tempProject: Project = { ...newProjectData, id: `project-${Date.now()}` }
      setPortfolioData({
        ...portfolioData,
        sections: [
          ...portfolioData.sections,
          {
            id: tempProject.id,
            type: 'project' as const,
            project: tempProject,
          },
        ],
      })
    }
  }

  // Update project field - saves to Firebase on blur
  const handleProjectFieldChange = async (
    projectId: string,
    field: keyof Project,
    value: string
  ) => {
    // Update local state immediately
    setPortfolioData({
      ...portfolioData,
      sections: portfolioData.sections.map((section) => {
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
      }),
    })
    
    // Save to Firebase
    try {
      await updateProject(projectId, { [field]: value })
    } catch (error) {
      console.error('Failed to save project field:', error)
    }
  }

  // Add new slide to project - saves to Firebase immediately
  const handleAddSlide = async (projectId: string) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
      description: 'Slide description',
    }
    
    const updatedSections = portfolioData.sections.map((section) => {
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
    
    // Update local state immediately
    setPortfolioData({
      ...portfolioData,
      sections: updatedSections,
    })
    
    // Save to Firebase
    try {
      const project = updatedSections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to save slides:', error)
    }
  }

  // Update slide description - saves to Firebase on blur
  const handleSlideDescriptionChange = async (
    projectId: string,
    slideId: string,
    description: string
  ) => {
    const updatedSections = portfolioData.sections.map((section) => {
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
    
    // Update local state immediately
    setPortfolioData({
      ...portfolioData,
      sections: updatedSections,
    })
    
    // Save to Firebase
    try {
      const project = updatedSections.find(
        (s) => s.type === 'project' && s.project?.id === projectId
      )?.project
      if (project) {
        await updateProjectSlides(projectId, project.slides || [])
      }
    } catch (error) {
      console.error('Failed to save slide description:', error)
    }
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
        {/* Bio Section */}
        {portfolioData.bio && (
          <div className={styles.bioSection}>
            <EditableText
              value={portfolioData.bio.text}
              onChange={handleBioChange}
              as="div"
              variant="body"
              className="w-full"
            />
          </div>
        )}

        {/* Projects Section */}
        <div className={styles.projectsSection}>
          {portfolioData.sections.map((section) => {
            if (section.type === 'project' && section.project) {
              return (
                <ProjectCard
                  key={section.id}
                  project={section.project}
                  isEditable
                  onFieldChange={(field, value) =>
                    handleProjectFieldChange(section.project!.id, field, value)
                  }
                  onAddSlide={() => handleAddSlide(section.project!.id)}
                  onSlideDescriptionChange={(slideId, description) =>
                    handleSlideDescriptionChange(section.project!.id, slideId, description)
                  }
                />
              )
            }
            return null
          })}
          <div className={styles.addProjectButton}>
            <AddButton onClick={handleAddProject} label="Add Project" size="md" />
          </div>
        </div>
      </MainContent>
    </div>
  )
}

