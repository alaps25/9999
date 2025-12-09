'use client'

import React from 'react'
import { ProjectCard } from './ProjectCard'
import { WithInsertButton } from './WithInsertButton'
import type { Project } from '@/lib/firebase/types'
import type { DropdownOption } from '@/components/ui/Dropdown'

export interface CardWithInsertButtonProps {
  project?: Project
  variant?: 'project' | 'bio'
  bioText?: string
  className?: string
  isEditable?: boolean
  noPadding?: boolean
  onFieldChange?: (field: keyof Project, value: string | string[]) => void
  onBioChange?: (value: string) => void
  onAddSlide?: () => void
  onSlideDescriptionChange?: (slideId: string, description: string) => void
  onMediaChange?: (files: File[]) => void
  onMediaDelete?: (index?: number) => void
  onSlideImageChange?: (slideId: string, files: File[]) => void
  onSlideImageDelete?: (slideId: string) => void
  onSlideDelete?: (slideId: string) => void
  onInsertAbove?: (cardType?: string) => void // Accept optional cardType parameter
  onInsertBelow?: (cardType?: string) => void // Accept optional cardType parameter
  onDelete?: () => void // Callback for delete button
  insertOptions?: DropdownOption[]
  hasCardAbove?: boolean
  hasCardBelow?: boolean
  uploadingStates?: Record<number | string, boolean> // Loading states for images/slides
}

/**
 * CardWithInsertButton - Wraps ProjectCard with insert button functionality
 * Uses the generic WithInsertButton wrapper for hover detection and animation
 */
export const CardWithInsertButton: React.FC<CardWithInsertButtonProps> = ({
  project,
  variant = 'project',
  bioText,
  className,
  isEditable = false,
  noPadding = false,
  onFieldChange,
  onBioChange,
  onAddSlide,
  onSlideDescriptionChange,
  onMediaChange,
  onMediaDelete,
  onSlideImageChange,
  onSlideImageDelete,
  onSlideDelete,
  onInsertAbove,
  onInsertBelow,
  onDelete,
  insertOptions = [],
  hasCardAbove = false,
  hasCardBelow = false,
  uploadingStates,
}) => {
  return (
    <WithInsertButton
      enabled={isEditable}
      insertOptions={insertOptions}
      placeholder="Add"
      onInsertAbove={onInsertAbove}
      onInsertBelow={onInsertBelow}
      onDelete={onDelete}
      hasCardAbove={hasCardAbove}
      hasCardBelow={hasCardBelow}
    >
      <ProjectCard
        project={project}
        variant={variant}
        bioText={bioText}
        className={className}
        isEditable={isEditable}
        noPadding={noPadding}
        onFieldChange={onFieldChange}
        onBioChange={onBioChange}
        onAddSlide={onAddSlide}
                onSlideDescriptionChange={onSlideDescriptionChange}
                onMediaChange={onMediaChange}
        onMediaDelete={onMediaDelete}
        onSlideImageChange={onSlideImageChange}
        onSlideImageDelete={onSlideImageDelete}
        onSlideDelete={onSlideDelete}
        uploadingStates={uploadingStates}
      />
    </WithInsertButton>
  )
}

