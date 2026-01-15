'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import styles from './Accordion.module.scss'

export interface AccordionItem {
  title: string
  content: React.ReactNode
  defaultOpen?: boolean
}

export interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

/**
 * Accordion component with card styling
 * Supports multiple items, with optional default open state
 */
export const Accordion: React.FC<AccordionProps> = ({ items, className }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(
    new Set(items.map((item, index) => item.defaultOpen ? index : -1).filter(i => i >= 0))
  )

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  return (
    <div className={cn(styles.accordion, className)}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index)
        return (
          <div key={index} className={styles.accordionItem}>
            <button
              id={`accordion-header-${index}`}
              className={styles.accordionHeader}
              onClick={() => toggleItem(index)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
            >
              <h2 className={styles.accordionTitle}>{item.title}</h2>
              <ChevronDown 
                className={cn(styles.chevron, isOpen && styles.chevronOpen)} 
                size={20}
              />
            </button>
            {isOpen && (
              <div 
                id={`accordion-content-${index}`}
                className={styles.accordionContent}
                role="region"
                aria-labelledby={`accordion-header-${index}`}
              >
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

