'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
 * TagInput component - Displays tags as pills with inline input for adding more
 */
export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  placeholder = 'Add tag...',
  className,
}) => {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userTagPool, setUserTagPool] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Save tags to Firestore (case-insensitive deduplication)
  const saveTagsToFirestore = React.useCallback(async (tagsToSave: string[]) => {
    if (!user) return
    
    // Merge tags case-insensitively, keeping the first occurrence's casing
    const seen = new Map<string, string>()
    for (const tag of [...userTagPool, ...tagsToSave]) {
      const lower = tag.toLowerCase()
      if (!seen.has(lower)) {
        seen.set(lower, tag)
      }
    }
    const updatedTagPool = Array.from(seen.values())
    
    try {
      await saveUserTags(user.uid, updatedTagPool)
      setUserTagPool(updatedTagPool)
    } catch (error) {
      console.error('Error saving user tags:', error)
    }
  }, [user, userTagPool])

  // Add a new tag (case-insensitive duplicate check)
  const addTag = React.useCallback((tagValue: string) => {
    const trimmed = tagValue.trim()
    const existsAlready = tags.some(t => t.toLowerCase() === trimmed.toLowerCase())
    if (trimmed && !existsAlready) {
      const newTags = [...tags, trimmed]
      onChange(newTags)
      saveTagsToFirestore(newTags)
      return newTags
    }
    return tags
  }, [tags, onChange, saveTagsToFirestore])

  // Remove a tag by index
  const removeTag = React.useCallback((indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove)
    onChange(newTags)
  }, [tags, onChange])

  // Update suggestions based on input value
  const updateSuggestions = React.useCallback((value: string) => {
    if (!value || value.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const currentTag = value.trim().toLowerCase()
    const existingTagsLower = tags.map(t => t.toLowerCase())
    
    const filtered = userTagPool
      .filter(tag => {
        const tagLower = tag.toLowerCase()
        return tagLower.includes(currentTag) && !existingTagsLower.includes(tagLower)
      })
      .slice(0, 5)
    
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }, [userTagPool, tags])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Check for comma to add tag
    if (value.includes(',')) {
      const parts = value.split(',')
      parts.forEach((part, index) => {
        if (index < parts.length - 1 && part.trim()) {
          addTag(part.trim())
        }
      })
      setInputValue(parts[parts.length - 1])
    } else {
      setInputValue(value)
    }
    
    updateSuggestions(value.replace(',', ''))
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
      setInputValue('')
      setShowSuggestions(false)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    addTag(suggestion)
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow click to register
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        // Add any pending input as tag
        if (inputValue.trim()) {
          addTag(inputValue.trim())
          setInputValue('')
        }
      }
    }, 150)
  }

  return (
    <div className={cn(styles.tagInput, className)} ref={containerRef}>
      {/* Existing tags as pills */}
      {tags.map((tag, index) => (
        <span key={index} className={styles.tag}>
          {tag}
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => removeTag(index)}
            aria-label={`Remove ${tag}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
      
      {/* Input for adding new tags */}
      <div className={styles.tagInputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => updateSuggestions(inputValue)}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          className={styles.textInput}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSelectSuggestion(suggestion)}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
