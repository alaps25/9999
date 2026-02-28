'use client'

import React, { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { cn } from '@/lib/utils'
import styles from './RichTextDisplay.module.scss'

export interface RichTextDisplayProps {
  content: string
  className?: string
  variant?: 'body' | 'caption'
}

// Allowed HTML tags for rich text content
const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li']
const ALLOWED_ATTR: string[] = []

/**
 * RichTextDisplay component - Safely renders HTML content from TipTap editor
 * 
 * Uses DOMPurify to sanitize content and prevent XSS attacks.
 * Only allows formatting tags (bold, italic, lists) - no scripts or links.
 */
export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  className,
  variant = 'body',
}) => {
  // Memoize sanitization to avoid re-running on every render
  const sanitizedContent = useMemo(() => {
    if (!content) return null
    
    // Check for empty content patterns
    const trimmed = content.trim()
    if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>') {
      return null
    }
    
    // Sanitize HTML to prevent XSS
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    })
  }, [content])

  if (!sanitizedContent) {
    return null
  }

  return (
    <div
      className={cn(styles.richTextDisplay, styles[variant], className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  )
}
