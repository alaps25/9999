'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SquareArrowUp, SquareArrowDown } from 'lucide-react'
import { Dropdown } from './Dropdown'
import { Button } from './Button'
import type { DropdownOption } from './Dropdown'
import styles from './AnimatedInsertButton.module.scss'

export interface AnimatedInsertButtonProps {
  show: boolean
  options: DropdownOption[]
  placeholder?: string
  onInsert?: (cardType?: string) => void // Accept optional cardType parameter
  onDelete?: () => void // Optional delete callback
  onMove?: (targetPageId: string) => void // Optional move callback
  moveOptions?: DropdownOption[] // Pages to move card to
  position?: 'top' | 'bottom' // Position to determine arrow direction
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

/**
 * AnimatedInsertButton - Animated insert button with two-stage animation
 * First creates space (height animation), then button scales in
 */
export const AnimatedInsertButton: React.FC<AnimatedInsertButtonProps> = ({
  show,
  options,
  placeholder = 'Add',
  onInsert,
  onDelete,
  onMove,
  moveOptions = [],
  position = 'top',
  onMouseEnter,
  onMouseLeave,
}) => {
  // Wrap options to call onInsert with card type when selected
  const wrappedOptions = options.map(option => ({
    ...option,
    onClick: () => {
      // Call the original onClick if it exists (for backward compatibility)
      if (option.onClick) {
        option.onClick()
      }
      // Call onInsert with the card type
      if (onInsert) {
        onInsert(option.value)
      }
    },
  }))

  // Wrap move options to call onMove with target page ID
  const wrappedMoveOptions = moveOptions.map(option => ({
    ...option,
    onClick: () => {
      if (onMove) {
        onMove(option.value)
      }
    },
  }))

  // Determine which arrow icon to use based on position
  const AddIcon = position === 'bottom' ? SquareArrowDown : SquareArrowUp
  const DeleteIcon = position === 'bottom' ? SquareArrowUp : SquareArrowDown

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ 
            duration: 0.25, 
            ease: [0.16, 1, 0.3, 1], // Smooth cubic-bezier easing
            opacity: { duration: 0.2 } // Slightly faster opacity for smoother feel
          }}
          className={styles.container}
          style={{ overflow: 'visible' }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Add Card dropdown with directional icon */}
          <Dropdown
            options={wrappedOptions}
            placeholder={placeholder}
            variant="medium"
            size="md"
            alwaysShowPlaceholder={true}
            leftIcon={<AddIcon size={16} />}
          />
          
          {/* Spacer to push Move+Delete to the right */}
          <div className={styles.spacer} />
          
          {/* Move dropdown - only show if move options are provided */}
          {onMove && wrappedMoveOptions.length > 0 && (
            <Dropdown
              options={wrappedMoveOptions}
              placeholder="Move"
              variant="medium"
              size="md"
              alwaysShowPlaceholder={true}
              leftIcon={<DeleteIcon size={16} />}
            />
          )}
          
          {/* Delete button with directional icon */}
          {onDelete && (
            <Button
              variant="medium"
              size="md"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <DeleteIcon size={16} />
              DELETE
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

