'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dropdown } from './Dropdown'
import type { DropdownOption } from './Dropdown'
import styles from './AnimatedInsertButton.module.scss'

export interface AnimatedInsertButtonProps {
  show: boolean
  options: DropdownOption[]
  placeholder?: string
  onInsert?: (cardType?: string) => void // Accept optional cardType parameter
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
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={styles.container}
          style={{ overflow: 'visible' }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className={styles.button}
            style={{ transform: 'none' }}
          >
            <Dropdown
              options={wrappedOptions}
              placeholder={placeholder}
              variant="low"
              size="md"
              alwaysShowPlaceholder={true}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

