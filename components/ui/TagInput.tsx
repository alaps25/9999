'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { EditableText } from './EditableText'
import { Button } from './Button'
import { useAuth } from '@/contexts/AuthContext'
import { getUserTags } from '@/lib/firebase/queries'
import { saveUserTags } from '@/lib/firebase/mutations'
import styles from './TagInput.module.scss'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  maxWidth?: number // Max width before truncation (default: 100px)
}

/**
 * TagInput component - Individual tags with autocomplete suggestions
 * Shows placeholder tags, "Add" button, and autocomplete dropdown while typing
 */
export const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  placeholder = 'Tag',
  className,
  maxWidth = 100,
}) => {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userTagPool, setUserTagPool] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  // Load user tags on mount
  useEffect(() => {
    if (user) {
      loadUserTags()
    }
  }, [user])

  // Load user tags from Firestore
  const loadUserTags = async () => {
    if (!user) return
    try {
      const userTags = await getUserTags(user.uid)
      setUserTagPool(userTags)
    } catch (error) {
      console.error('Error loading user tags:', error)
    }
  }

  // Filter suggestions based on input
  useEffect(() => {
    // Ensure editingValue is a string before calling trim
    if (!editingValue || typeof editingValue !== 'string' || editingValue.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const inputLower = editingValue.toLowerCase()
    const filtered = userTagPool
      .filter(tag => tag.toLowerCase().includes(inputLower) && !tags.includes(tag))
      .slice(0, 5) // Limit to 5 suggestions
    
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }, [editingValue, userTagPool, tags])

  // Handle tag value change (called when EditableText onChange fires on blur)
  const handleTagValueChange = async (index: number, newValue: string) => {
    const trimmedValue = newValue.trim()
    
    if (trimmedValue === '' || trimmedValue === placeholder) {
      // Remove tag if empty or placeholder
      const newTags = tags.filter((_, i) => i !== index)
      onChange(newTags)
      await saveTagsToFirestore(newTags)
    } else {
      // Update tag
      const newTags = [...tags]
      newTags[index] = trimmedValue
      onChange(newTags)
      await saveTagsToFirestore(newTags)
    }
    
    setEditingIndex(null)
    setEditingValue('')
    setShowSuggestions(false)
  }

  // Handle adding a new tag
  const handleAddTag = () => {
    const newTags = [...tags, placeholder]
    onChange(newTags)
    setEditingIndex(newTags.length - 1)
    setEditingValue('')
  }

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: string) => {
    if (editingIndex !== null) {
      const newTags = [...tags]
      newTags[editingIndex] = suggestion
      onChange(newTags)
      await saveTagsToFirestore(newTags)
    }
    setEditingIndex(null)
    setEditingValue('')
    setShowSuggestions(false)
  }

  // Save tags to Firestore
  const saveTagsToFirestore = async (tagsToSave: string[]) => {
    if (!user) return
    
    // Extract unique tags from all tags
    const uniqueTags = Array.from(new Set(tagsToSave.filter(t => t && t !== placeholder)))
    
    // Merge with existing user tag pool
    const updatedTagPool = Array.from(new Set([...userTagPool, ...uniqueTags]))
    
    try {
      await saveUserTags(user.uid, updatedTagPool)
      setUserTagPool(updatedTagPool)
    } catch (error) {
      console.error('Error saving user tags:', error)
    }
  }

  // Handle click on tag to edit
  const handleTagClick = (index: number) => {
    setEditingIndex(index)
    setEditingValue(tags[index] === placeholder ? '' : tags[index])
    setIsTyping(false)
  }

  // Handle input change while editing
  const handleInputChange = (value: string) => {
    setEditingValue(value)
  }


  // Ensure at least 2 placeholder tags are shown
  const displayTags = tags.length >= 2 ? tags : [...tags, ...Array(2 - tags.length).fill(placeholder)]

  return (
    <div className={cn(styles.tagInput, className)} ref={containerRef}>
      {displayTags.map((tag, index) => {
        const isEditing = editingIndex === index
        const isPlaceholder = tag === placeholder
        
        return (
          <React.Fragment key={index}>
            {isEditing ? (
              <div className={styles.tagEditor}>
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => {
                    const value = e.target.value
                    handleInputChange(value)
                    // Update tag immediately for display
                    const newTags = [...tags]
                    newTags[index] = value.trim() || placeholder
                    onChange(newTags)
                  }}
                  onBlur={async () => {
                    setIsTyping(false)
                    await handleTagValueChange(index, editingValue)
                  }}
                  onFocus={() => setIsTyping(true)}
                  className={cn(styles.tagInputField, isPlaceholder && styles.placeholderTag)}
                  placeholder={placeholder}
                  autoFocus
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.map((suggestion, sugIndex) => (
                      <button
                        key={sugIndex}
                        className={styles.suggestionItem}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span
                className={cn(styles.tag, isPlaceholder && styles.placeholderTag)}
                onClick={() => handleTagClick(index)}
              >
                {tag}
              </span>
            )}
            {index < displayTags.length - 1 && <span className={styles.separator}>|</span>}
          </React.Fragment>
        )
      })}
      
      {/* Separator before Add button if there are tags */}
      {displayTags.length > 0 && <span className={styles.separator}>|</span>}
      
      {/* Add button */}
      <Button
        variant="low"
        size="sm"
        onClick={handleAddTag}
        className={styles.addButton}
      >
        Add
      </Button>
    </div>
  )
}

