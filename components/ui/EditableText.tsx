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
  const [currentText, setCurrentText] = useState(value)
  const contentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update content when value changes externally (but not while editing)
  useEffect(() => {
    if (!isEditing && contentRef.current && contentRef.current.textContent !== value) {
      // If value matches placeholder, show it as placeholder (will be styled differently)
      contentRef.current.textContent = value
      setCurrentText(value)
    }
  }, [value, isEditing, placeholder])

  const handleFocus = () => {
    setIsEditing(true)
    // If value matches placeholder, clear it on focus so user can type immediately
    if (contentRef.current && value === placeholder) {
      contentRef.current.textContent = ''
      setCurrentText('')
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    const finalValue = contentRef.current?.textContent?.trim() || ''
    // If empty after blur, restore placeholder value so it shows as placeholder again
    const valueToSave = finalValue === '' ? placeholder : finalValue
    setCurrentText(valueToSave)
    if (valueToSave !== value) {
      onChange(valueToSave)
    }
    // Update the displayed text to match the saved value
    if (contentRef.current) {
      contentRef.current.textContent = valueToSave
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
        // Show placeholder styling only when current text matches placeholder (not while typing)
        currentText === placeholder && !isEditing && styles.placeholder,
        className
      )}
      data-placeholder={placeholder}
    >
      {value}
    </Component>
  )
}

