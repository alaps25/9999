/**
 * Custom React hook for GSAP animations
 * Handles timeline creation, cleanup, and ref management
 */

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface UseGsapAnimationOptions {
  disabled?: boolean
  onComplete?: () => void
  autoPlay?: boolean
}

/**
 * Hook: useGsapAnimation
 * Creates a GSAP timeline and automatically cleans up on unmount
 *
 * @example
 * const ref = useRef(null)
 * const timeline = useGsapAnimation(ref, {
 *   onComplete: () => console.log('Done!')
 * })
 *
 * useEffect(() => {
 *   timeline?.to(ref.current, { opacity: 1 })
 * }, [timeline])
 */
export const useGsapAnimation = (
  ref: React.RefObject<HTMLElement>,
  options: UseGsapAnimationOptions = {}
) => {
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (options.disabled) return

    // Create timeline
    const tl = gsap.timeline({
      onComplete: options.onComplete,
      paused: !options.autoPlay
    })

    timelineRef.current = tl
    setTimeline(tl)

    // Cleanup on unmount
    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [options.disabled, options.onComplete, options.autoPlay])

  return timeline
}

/**
 * Hook: useGsapRef
 * Simple ref management for GSAP animations
 */
export const useGsapRef = <T extends HTMLElement>() => {
  return useRef<T>(null)
}

/**
 * Hook: useGsapTrigger
 * Manually trigger animations based on state change
 *
 * @example
 * const [isExpanded, setIsExpanded] = useState(false)
 * const timeline = useGsapTrigger(ref, isExpanded, (tl, el) => {
 *   tl.to(el, { height: isExpanded ? 'auto' : 0 })
 * })
 */
export const useGsapTrigger = <T extends HTMLElement>(
  ref: React.RefObject<T>,
  trigger: any,
  animationFn: (tl: gsap.core.Timeline, el: T) => void,
  options: UseGsapAnimationOptions = {}
) => {
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!ref.current || options.disabled) return

    const tl = gsap.timeline({
      onComplete: options.onComplete
    })

    animationFn(tl, ref.current)
    setTimeline(tl)

    return () => tl.kill()
  }, [trigger, options.disabled, options.onComplete, animationFn, ref])

  return timeline
}

/**
 * Hook: useGsapStagger
 * Stagger animations across multiple elements
 *
 * @example
 * const items = useRef<HTMLDivElement[]>([])
 * useGsapStagger(items.current, (tl, els) => {
 *   tl.from(els, { opacity: 0, y: 20, stagger: 0.1 })
 * })
 */
export const useGsapStagger = (
  elements: HTMLElement[],
  animationFn: (tl: gsap.core.Timeline, els: HTMLElement[]) => void,
  options: UseGsapAnimationOptions = {}
) => {
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!elements.length || options.disabled) return

    const tl = gsap.timeline({
      onComplete: options.onComplete
    })

    animationFn(tl, elements)
    setTimeline(tl)

    return () => tl.kill()
  }, [elements, options.disabled, options.onComplete, animationFn])

  return timeline
}

/**
 * Utility: createTimelineConfig
 * Common GSAP easing presets
 */
export const GSAP_EASING = {
  smooth: 'cubic.inOut',
  smoothIn: 'cubic.in',
  smoothOut: 'cubic.out',
  snappy: 'power2.out',
  gentle: 'power1.out',
  springy: 'elastic.out',
  bounce: 'back.out',
  tight: 'quart.out'
}

/**
 * Utility: createAnimationDefaults
 * Consistent animation timing across app
 */
export const ANIMATION_DEFAULTS = {
  fast: { duration: 0.3 },
  normal: { duration: 0.5 },
  slow: { duration: 0.8 },
  stagger: { stagger: 0.1 },
  microInteraction: { duration: 0.2 }
}

/**
 * Example: Animate Timeline Entry
 * Shows how to structure GSAP animations in components
 */
export const useTimelineEntryAnimation = (
  ref: React.RefObject<HTMLElement>,
  isVisible: boolean
) => {
  useEffect(() => {
    if (!ref.current) return

    const tl = gsap.timeline()

    if (isVisible) {
      // Animate in
      tl.from(ref.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: GSAP_EASING.smoothOut
      })
      tl.from(
        ref.current.querySelector('.yearDot'),
        {
          scale: 0,
          duration: 0.4,
          ease: GSAP_EASING.springy
        },
        0.1
      )
    } else {
      // Animate out
      tl.to(ref.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: GSAP_EASING.smoothIn
      })
    }

    return () => tl.kill()
  }, [isVisible, ref])
}

/**
 * Example: Stagger List Animation
 * Shows how to animate multiple items with stagger
 */
export const useStaggerListAnimation = (
  items: React.RefObject<HTMLElement[]>,
  shouldAnimate: boolean
) => {
  useEffect(() => {
    if (!items.current?.length || !shouldAnimate) return

    const tl = gsap.timeline()

    tl.from(items.current, {
      opacity: 0,
      x: -20,
      duration: 0.4,
      ease: GSAP_EASING.smoothOut,
      stagger: {
        amount: 0.5 // Total stagger duration
      }
    })

    return () => tl.kill()
  }, [shouldAnimate, items])
}

/**
 * Example: Page Transition Animation
 * For full-page transitions between routes
 */
export const usePageTransitionAnimation = () => {
  const fadeOutElement = (element: HTMLElement) => {
    return gsap.to(element, {
      opacity: 0,
      y: 10,
      duration: 0.4,
      ease: GSAP_EASING.smoothIn
    })
  }

  const fadeInElement = (element: HTMLElement) => {
    gsap.set(element, { opacity: 0, y: 10 })
    return gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: GSAP_EASING.smoothOut
    })
  }

  return { fadeOutElement, fadeInElement }
}

/**
 * Example: Button Feedback Animation
 * Click feedback for interactive elements
 */
export const useButtonClickAnimation = (ref: React.RefObject<HTMLButtonElement>) => {
  const animate = () => {
    if (!ref.current) return

    const tl = gsap.timeline()

    tl.to(ref.current, {
      scale: 0.95,
      duration: 0.1
    }).to(ref.current, {
      scale: 1,
      duration: 0.2,
      ease: GSAP_EASING.springy
    })
  }

  return animate
}
