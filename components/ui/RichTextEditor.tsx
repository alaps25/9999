'use client'

import React, { useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import styles from './RichTextEditor.module.scss'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  variant?: 'body' | 'caption'
  disabled?: boolean
}

/**
 * RichTextEditor component - TipTap-based rich text editor
 * 
 * Supports formatting via keyboard shortcuts (no toolbar for clean aesthetic):
 * - Cmd/Ctrl+B: Bold
 * - Cmd/Ctrl+I: Italic
 * - Type "- " or "* " at line start: Bullet list
 * - Enter in list: New list item
 * - Enter twice or Backspace on empty item: Exit list
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Description...',
  className,
  variant = 'body',
  disabled = false,
}) => {

  // Normalize empty content for consistent comparison
  const normalizeContent = useCallback((content: string): string => {
    if (!content || content === '<p></p>' || content === '<p><br></p>') {
      return ''
    }
    return content
  }, [])

  const handleBlur = useCallback(({ editor }: { editor: ReturnType<typeof useEditor> }) => {
    if (!editor) return
    const html = editor.getHTML()
    const cleanHtml = normalizeContent(html)
    const normalizedValue = normalizeContent(value)
    
    if (cleanHtml !== normalizedValue) {
      onChange(cleanHtml)
    }
  }, [normalizeContent, onChange, value])

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
        strike: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: styles.isEmpty,
      }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(styles.editor, styles[variant], className),
      },
    },
    onBlur: handleBlur,
  })

  // Sync external value changes (when not focused)
  useEffect(() => {
    if (!editor || editor.isFocused) return
    
    const currentContent = normalizeContent(editor.getHTML())
    const newContent = normalizeContent(value)
    
    if (currentContent !== newContent) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor, normalizeContent])

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={cn(styles.richTextEditor, disabled && styles.disabled)}>
      <EditorContent editor={editor} />
    </div>
  )
}
