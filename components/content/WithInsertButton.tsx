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
  className?: string
  hasCardAbove?: boolean // If true, suppress top button (let card above show its bottom button)
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
  className,
  hasCardAbove = false,
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

  // Only show top button if there's no card above (to avoid duplicates between cards)
  // When there's a card above, let that card show its bottom button instead
  const showTopButton = hoverPosition === 'top' && !hasCardAbove
  // Bottom button always shows when hovering on bottom edge
  // If there's a card below, it will suppress its top button to avoid duplicates
  const showBottomButton = hoverPosition === 'bottom'

  return (
    <>
      {/* Top insert button - appears above child, pushes child down */}
      {/* Only show if no card above (let card above show its bottom button instead) */}
      <AnimatedInsertButton
        show={showTopButton}
        options={insertOptions}
        placeholder={placeholder}
        onInsert={onInsertAbove}
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
      {/* Only show if no card below (let card below show its top button instead) */}
      <AnimatedInsertButton
        show={showBottomButton}
        options={insertOptions}
        placeholder={placeholder}
        onInsert={onInsertBelow}
        onMouseEnter={() => handleButtonMouseEnter('bottom')}
        onMouseLeave={handleButtonMouseLeave}
      />
    </>
  )
}

