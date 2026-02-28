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
  /** When true, inherits color from parent instead of using variant color. 
   *  Useful when EditableText is used inside buttons or navigation items. */
  inheritColor?: boolean
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
  inheritColor = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentText, setCurrentText] = useState(value)
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update content when value changes externally (but not while editing)
  useEffect(() => {
    if (!isEditing && contentRef.current) {
      const displayValue = value || placeholder
      if (contentRef.current.textContent !== displayValue) {
        contentRef.current.textContent = displayValue
        setCurrentText(value)
      }
    }
  }, [value, isEditing, placeholder])

  const handleFocus = () => {
    setIsEditing(true)
    // If value is empty, clear any placeholder display
    if (contentRef.current && !value) {
      contentRef.current.textContent = ''
      setCurrentText('')
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    const finalValue = contentRef.current?.textContent?.trim() || ''
    // Save whatever user typed (empty string if cleared)
    setCurrentText(finalValue)
    if (finalValue !== value) {
      onChange(finalValue)
    }
    // Update the displayed text
    if (contentRef.current) {
      contentRef.current.textContent = finalValue
    }
  }

  const handleInput = () => {
    // Update currentText to reflect what user is typing
    if (contentRef.current) {
      setCurrentText(contentRef.current.textContent || '')
    }
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
          inheritColor && styles.inheritColor,
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
        inheritColor && styles.inheritColor,
        isEditing && styles.editing,
        // Show placeholder styling when empty (not while editing)
        !currentText && !isEditing && styles.placeholder,
        className
      )}
      data-placeholder={placeholder}
    >
      {value || (!isEditing ? placeholder : '')}
    </Component>
  )
}

