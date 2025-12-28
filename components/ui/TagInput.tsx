'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { EditableText } from './EditableText'
import { useAuth } from '@/contexts/AuthContext'
import { getUserTags } from '@/lib/firebase/queries'
import { saveUserTags } from '@/lib/firebase/mutations'
import styles from './TagInput.module.scss'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

/**
 * TagInput component - Inline editable text input for comma-separated tags
 * Uses EditableText style for seamless inline editing
 */
export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  placeholder = 'Add tags (separated by commas)',
  className,
}) => {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userTagPool, setUserTagPool] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [currentValue, setCurrentValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Load user tags from Firestore
  const loadUserTags = React.useCallback(async () => {
    if (!user) return
    try {
      const userTags = await getUserTags(user.uid)
      setUserTagPool(userTags)
    } catch (error) {
      console.error('Error loading user tags:', error)
    }
  }, [user])

  // Load user tags on mount
  useEffect(() => {
    if (user) {
      loadUserTags()
    }
  }, [user, loadUserTags])

  // Convert tags array to comma-separated string for display
  const tagsString = tags.length > 0 ? tags.join(', ') : ''
  const displayValue = tagsString || placeholder

  // Parse comma-separated string to tags array
  const parseTags = React.useCallback((value: string): string[] => {
    if (!value || value === placeholder) return []
    return value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
  }, [placeholder])

  // Save tags to Firestore
  const saveTagsToFirestore = React.useCallback(async (tagsToSave: string[]) => {
    if (!user) return
    
    // Extract unique tags
    const uniqueTags = Array.from(new Set(tagsToSave))
    
    // Merge with existing user tag pool
    const updatedTagPool = Array.from(new Set([...userTagPool, ...uniqueTags]))
    
    try {
      await saveUserTags(user.uid, updatedTagPool)
      setUserTagPool(updatedTagPool)
    } catch (error) {
      console.error('Error saving user tags:', error)
    }
  }, [user, userTagPool])

  // Update suggestions based on input value
  const updateSuggestions = React.useCallback((value: string) => {
    if (!value || value === placeholder || value.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Get the last tag being typed (after the last comma)
    const parts = value.split(',')
    const currentTag = parts[parts.length - 1].trim().toLowerCase()
    
    if (currentTag === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Get existing tags from input (before the last comma)
    const existingTags = parts.slice(0, -1).map(t => t.trim().toLowerCase()).filter(Boolean)
    
    const filtered = userTagPool
      .filter(tag => {
        const tagLower = tag.toLowerCase()
        return tagLower.includes(currentTag) && !existingTags.includes(tagLower)
      })
      .slice(0, 5) // Limit to 5 suggestions
    
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0 && isFocused)
  }, [userTagPool, isFocused, placeholder])

  // Handle value change from EditableText
  const handleChange = (value: string) => {
    setCurrentValue(value)
    
    // Update suggestions based on current input
    updateSuggestions(value)
    
    // Parse and update tags immediately
    const parsedTags = parseTags(value)
    onChange(parsedTags)
  }

  // Handle focus - detect when EditableText is focused
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        setIsFocused(true)
        updateSuggestions(currentValue || tagsString)
      }
    }

    const handleFocusOut = async (e: FocusEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
        setShowSuggestions(false)
        
        // Save tags to Firestore on blur
        const valueToSave = currentValue || tagsString
        if (valueToSave && valueToSave !== placeholder) {
          const parsedTags = parseTags(valueToSave)
          await saveTagsToFirestore(parsedTags)
        }
      }
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [currentValue, tagsString, placeholder, parseTags, saveTagsToFirestore, updateSuggestions])

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: string) => {
    const currentInput = currentValue || tagsString
    const parts = currentInput.split(',')
    const beforeLastComma = parts.slice(0, -1).join(', ')
    const newValue = beforeLastComma ? `${beforeLastComma}, ${suggestion}` : suggestion
    
    setCurrentValue(newValue)
    const parsedTags = parseTags(newValue)
    onChange(parsedTags)
    await saveTagsToFirestore(parsedTags)
    setShowSuggestions(false)
  }

  return (
    <div className={cn(styles.tagInput, className)} ref={containerRef}>
      <div className={styles.tagInputWrapper}>
        <EditableText
          value={displayValue}
          onChange={handleChange}
          variant="body"
          placeholder={placeholder}
          className={styles.tagInputField}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSelectSuggestion(suggestion)}
                type="button"
                onMouseDown={(e) => {
                  // Prevent blur from firing before click
                  e.preventDefault()
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
