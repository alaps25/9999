'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
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
          <Dropdown
            options={wrappedOptions}
            placeholder={placeholder}
            variant="low"
            size="md"
            alwaysShowPlaceholder={true}
          />
          {onDelete && (
            <Button
              variant="low"
              size="md"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              DELETE THIS CARD
              {position === 'top' ? (
                <ArrowDown size={16} />
              ) : (
                <ArrowUp size={16} />
              )}
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

