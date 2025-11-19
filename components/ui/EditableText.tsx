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
  const [localValue, setLocalValue] = useState(value)
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleFocus = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (localValue !== value) {
      onChange(localValue)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const newValue = e.currentTarget.textContent || ''
    setLocalValue(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      contentRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setLocalValue(value)
      contentRef.current?.blur()
    }
  }

  // Set initial content on mount
  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== localValue) {
      contentRef.current.textContent = localValue
    }
  }, [localValue])

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
      {localValue}
    </Component>
  )
}

