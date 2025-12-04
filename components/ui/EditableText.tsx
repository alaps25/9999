'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import styles from './EditableText.module.scss'

export interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label'
}

/**
 * EditableText component - Inline editable text with rich text support
 * Uses contentEditable for seamless inline editing experience
 */
export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  className,
  placeholder = 'Click to edit...',
  as: Component = 'span',
  variant,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update content when value changes externally (but not while editing)
  useEffect(() => {
    if (!isEditing && contentRef.current && contentRef.current.textContent !== value) {
      contentRef.current.textContent = value
    }
  }, [value, isEditing])

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const finalValue = contentRef.current?.textContent || ''
    if (finalValue !== value) {
      onChange(finalValue)
    }
  }

  const handleInput = () => {
    // Content is managed by contentEditable, we just read it on blur
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      contentRef.current?.blur()
    }
    if (e.key === 'Escape') {
      if (contentRef.current) {
        contentRef.current.textContent = value
      }
      contentRef.current?.blur()
    }
  }

  if (!mounted) {
    return (
      <Component
        className={cn(
          styles.editableText,
          variant && styles[variant],
          className
        )}
      >
        {value}
      </Component>
    )
  }

  return (
    <Component
      ref={contentRef as any}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className={cn(
        styles.editableText,
        variant && styles[variant],
        isEditing && styles.editing,
        className
      )}
      data-placeholder={placeholder}
    >
      {value}
    </Component>
  )
}

