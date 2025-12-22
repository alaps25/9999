/**
 * Share utility functions using the Web Share API
 */

/**
 * Share a URL using the native Web Share API
 * Falls back to copying to clipboard if Web Share API is not available
 */
export async function shareUrl(url: string, title?: string): Promise<void> {
  const shareData: ShareData = {
    title: title || 'Check out this portfolio',
    url: url,
  }

  // Check if Web Share API is available
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
      return
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === 'AbortError') {
        // User cancelled, do nothing
        return
      }
      // Other error, fall through to clipboard fallback
      console.error('Error sharing:', error)
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(url)
    // Show a brief notification (you might want to use a toast library)
    alert('Link copied to clipboard!')
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    // Final fallback: Show the URL in an alert
    alert(`Share this link: ${url}`)
  }
}

/**
 * Get the current page URL
 */
export function getCurrentPageUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
}

/**
 * Get the portfolio URL for a username
 */
export function getPortfolioUrl(username: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/${username}`
}

