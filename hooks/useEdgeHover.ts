import { useState, useRef, useCallback, useEffect } from 'react'

export type EdgePosition = 'top' | 'bottom' | null

export interface UseEdgeHoverOptions {
  enabled?: boolean
  edgeSize?: number // Size of hover zone in pixels (default: 12)
  hideDelay?: number // Delay in ms before hiding when not hovering (default: 2000)
}

/**
 * Custom hook for detecting hover near top/bottom edges of an element
 * Returns hover position and ref to attach to the element
 * Includes delay before hiding and support for keeping button visible when hovering over it
 */
export const useEdgeHover = (options: UseEdgeHoverOptions = {}) => {
  const { enabled = true, edgeSize = 12, hideDelay = 400 } = options
  const [hoverPosition, setHoverPosition] = useState<EdgePosition>(null)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isButtonHoveredRef = useRef(false) // Ref to track button hover state for timeout callback

  // Sync ref with state
  useEffect(() => {
    isButtonHoveredRef.current = isButtonHovered
  }, [isButtonHovered])

  // Clear timeout helper
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  // Schedule hide with delay
  const scheduleHide = useCallback(() => {
    clearHideTimeout()
    hideTimeoutRef.current = setTimeout(() => {
      // Only hide if button is not being hovered (check ref for latest value)
      if (!isButtonHoveredRef.current) {
        setHoverPosition(null)
      }
    }, hideDelay)
  }, [hideDelay, clearHideTimeout])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!elementRef.current || !enabled) {
        setHoverPosition(null)
        return
      }

      clearHideTimeout()

      const rect = elementRef.current.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      const elementHeight = rect.height

      // Check if mouse is in top edge zone
      if (mouseY <= edgeSize) {
        setHoverPosition('top')
      }
      // Check if mouse is in bottom edge zone
      else if (mouseY >= elementHeight - edgeSize) {
        setHoverPosition('bottom')
      } else {
        // Not in edge zone, schedule hide
        scheduleHide()
      }
    },
    [enabled, edgeSize, clearHideTimeout, scheduleHide]
  )

  const handleMouseLeave = useCallback(() => {
    // Schedule hide when leaving the element
    scheduleHide()
  }, [scheduleHide])

  // Keep button visible when hovering over it
  const handleButtonMouseEnter = useCallback((position: EdgePosition) => {
    clearHideTimeout()
    setHoverPosition(position)
    setIsButtonHovered(true)
  }, [clearHideTimeout])

  const handleButtonMouseLeave = useCallback(() => {
    setIsButtonHovered(false)
    // Schedule hide when leaving button
    scheduleHide()
  }, [scheduleHide])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout()
    }
  }, [clearHideTimeout])

  return {
    hoverPosition: hoverPosition, // Will be kept visible by handleButtonMouseEnter
    elementRef,
    handleMouseMove,
    handleMouseLeave,
    handleButtonMouseEnter,
    handleButtonMouseLeave,
  }
}

