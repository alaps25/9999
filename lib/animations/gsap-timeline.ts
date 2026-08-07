import gsap from 'gsap'

/**
 * Timeline Animation Example - GSAP Core Feature
 * GSAP's Timeline is the most powerful feature - it lets you sequence multiple
 * animations together with precise timing control
 */

// Example: Animate timeline entries with stagger
export const createTimelineEntryAnimation = (element: HTMLElement) => {
  const tl = gsap.timeline()

  // Sequence multiple animations in one timeline
  tl.from(element, {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'cubic.out'
  })
    .from(
      element.querySelector('.yearDot'),
      {
        scale: 0,
        duration: 0.4,
        ease: 'elastic.out'
      },
      0.2 // Start at 0.2s into the timeline
    )
    .from(
      element.querySelector('.yearLabel'),
      {
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: 'power2.out'
      },
      0.25
    )

  return tl
}

// Sequence multiple timeline entries with stagger
export const createTimelineSequence = (entries: HTMLElement[]) => {
  const masterTl = gsap.timeline()

  entries.forEach((entry, index) => {
    const entryTl = createTimelineEntryAnimation(entry)
    masterTl.add(entryTl, index * 0.2) // Stagger by 0.2s
  })

  return masterTl
}

// Page transition animation
export const createPageTransition = () => {
  const tl = gsap.timeline()

  // Fade out current content
  tl.to('.page-content', {
    opacity: 0,
    duration: 0.3,
    ease: 'power1.inOut'
  })

  // New page fade in (happens during fade out)
  tl.to('.page-content', {
    opacity: 1,
    duration: 0.4,
    ease: 'power1.inOut'
  })

  return tl
}

// Card hover animation
export const createCardHoverAnimation = (card: HTMLElement) => {
  const tl = gsap.timeline()

  tl.to(card, {
    y: -8,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    duration: 0.3,
    ease: 'power2.out'
  })

  return tl
}

// Button click feedback
export const createButtonClickFeedback = (button: HTMLElement) => {
  const tl = gsap.timeline()

  tl.to(button, {
    scale: 0.95,
    duration: 0.1,
    ease: 'power2.out'
  }).to(button, {
    scale: 1,
    duration: 0.2,
    ease: 'elastic.out'
  })

  return tl
}

// Loading spinner animation
export const createSpinnerAnimation = (element: HTMLElement) => {
  const tl = gsap.timeline({ repeat: -1 })

  tl.to(element, {
    rotation: 360,
    duration: 2,
    ease: 'none'
  })

  return tl
}

// Staggered list reveal
export const createListReveal = (items: HTMLElement[]) => {
  const tl = gsap.timeline()

  tl.from(items, {
    opacity: 0,
    x: -20,
    duration: 0.4,
    ease: 'cubic.out',
    stagger: 0.1 // 0.1s delay between each item
  })

  return tl
}

// Shake animation (error feedback)
export const createShakeAnimation = (element: HTMLElement) => {
  const tl = gsap.timeline()

  tl.to(element, {
    x: -5,
    duration: 0.1,
    ease: 'power1.inOut'
  })
    .to(element, {
      x: 5,
      duration: 0.1,
      ease: 'power1.inOut'
    })
    .to(element, {
      x: -3,
      duration: 0.1,
      ease: 'power1.inOut'
    })
    .to(element, {
      x: 0,
      duration: 0.1,
      ease: 'power1.inOut'
    })

  return tl
}

// Expand/collapse animation for timeline year
export const createYearExpandAnimation = (container: HTMLElement, isExpanding: boolean) => {
  const tl = gsap.timeline()

  if (isExpanding) {
    tl.to(container, {
      maxHeight: 2000,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    })
  } else {
    tl.to(container, {
      maxHeight: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    })
  }

  return tl
}

// Complex timeline: Full page enter animation
export const createPageEnterAnimation = () => {
  const tl = gsap.timeline()

  // Background fade
  tl.to('body', {
    backgroundColor: 'white',
    duration: 0.5
  })

  // Header slides in from top
  tl.from('header', {
    y: -50,
    opacity: 0,
    duration: 0.6,
    ease: 'cubic.out'
  }, 0)

  // Content fades in
  tl.from('.main-content', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'cubic.out'
  }, 0.2)

  // Title scales in
  tl.from('h1', {
    scale: 0.8,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out'
  }, 0.4)

  return tl
}

/**
 * GSAP Timeline Syntax Cheat Sheet:
 *
 * tl.to(element, {properties}, position)
 *   - Animates FROM current state TO specified properties
 *   - position: absolute time (0.5) or relative (+=0.3, -=0.2, "<", ">")
 *
 * tl.from(element, {properties}, position)
 *   - Animates FROM specified properties TO current state
 *   - Opposite of to()
 *
 * tl.fromTo(element, {fromProps}, {toProps}, position)
 *   - Complete control: FROM this TO that
 *
 * Timing:
 *   0 = start at beginning
 *   0.5 = start at 0.5s into timeline
 *   "<" = start at same time as previous
 *   ">=" = start when previous ends
 *   "+=0.2" = start 0.2s after previous ends
 *
 * Stagger: {stagger: 0.1} = 0.1s delay between each item
 * Repeat: {repeat: -1} = infinite loop
 * Yoyo: {yoyo: true} = reverse animation
 */
