'use client'

import React from 'react'
import { useEdgeHover } from '@/hooks/useEdgeHover'
import { AnimatedInsertButton } from '@/components/ui/AnimatedInsertButton'
import type { DropdownOption } from '@/components/ui/Dropdown'
import styles from './WithInsertButton.module.scss'

export interface WithInsertButtonProps {
  children: React.ReactNode
  enabled?: boolean
  insertOptions: DropdownOption[]
  placeholder?: string
  onInsertAbove?: (cardType?: string) => void // Accept optional cardType parameter
  onInsertBelow?: (cardType?: string) => void // Accept optional cardType parameter
  onDelete?: () => void // Callback for delete button
  className?: string
  hasCardAbove?: boolean // If true, there's a card above this one
  hasCardBelow?: boolean // If true, suppress bottom button for middle cards (show top instead)
}

/**
 * WithInsertButton - Generic wrapper component that adds insert button functionality
 * to any child component. Detects hover on top/bottom edges and shows animated insert button.
 * 
 * Usage:
 * <WithInsertButton insertOptions={options} onInsertAbove={...} onInsertBelow={...}>
 *   <YourComponent />
 * </WithInsertButton>
 */
export const WithInsertButton: React.FC<WithInsertButtonProps> = ({
  children,
  enabled = true,
  insertOptions,
  placeholder = 'Add',
  onInsertAbove,
  onInsertBelow,
  onDelete,
  className,
  hasCardAbove = false,
  hasCardBelow = false,
}) => {
  const {
    hoverPosition,
    elementRef,
    handleMouseMove,
    handleMouseLeave,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
  } = useEdgeHover({
    enabled,
    edgeSize: 12,
    hideDelay: 400, // Reduced from 2000ms to 400ms for faster hide
  })

  // Show buttons based on hover position
  // - Top button: Only shows for first card (hasCardAbove === false)
  // - Bottom button: Shows for all cards when hovering bottom edge
  // - Button container stays visible while hovering on the same edge that triggered it
  const showTopButton = hoverPosition === 'top' && !hasCardAbove
  const showBottomButton = hoverPosition === 'bottom'

  return (
    <>
      {/* Top insert button - appears above child, pushes child down */}
      <AnimatedInsertButton
        show={showTopButton}
        options={insertOptions}
        placeholder={placeholder}
        onInsert={onInsertAbove}
        onDelete={onDelete}
        position="top"
        onMouseEnter={() => handleButtonMouseEnter('top')}
        onMouseLeave={handleButtonMouseLeave}
      />

      {/* Wrapped content */}
      <div
        ref={elementRef}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {/* Bottom insert button - appears below child, pushes next element down */}
      <AnimatedInsertButton
        show={showBottomButton}
        options={insertOptions}
        placeholder={placeholder}
        onInsert={onInsertBelow}
        onDelete={onDelete}
        position="bottom"
        onMouseEnter={() => handleButtonMouseEnter('bottom')}
        onMouseLeave={handleButtonMouseLeave}
      />
    </>
  )
}

