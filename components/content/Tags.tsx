import React from 'react'
import { cn } from '@/lib/utils'
import styles from './Tags.module.scss'

export interface TagsProps {
  tags: string[]
  className?: string
}

/**
 * Tags component - Displays tags in a flexible layout
 */
export const Tags: React.FC<TagsProps> = ({ tags, className }) => {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className={cn(styles.tags, className)}>
      {tags.map((tag, index) => (
        <span key={index} className={styles.tag}>
          {tag}
        </span>
      ))}
    </div>
  )
}

