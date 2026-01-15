'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getProjects } from '@/lib/firebase/queries'
import { useSubscription } from './useSubscription'
import { formatBytes } from '@/lib/utils/features'
import { isBlobUrl, getTotalFileSize } from '@/lib/firebase/storage'

interface StorageUsage {
  usedBytes: number
  usedFormatted: string
  limitBytes: number
  limitFormatted: string
  percentage: number
  remainingBytes: number
  remainingFormatted: string
}

/**
 * Hook to calculate user's storage usage
 * Calculates total storage used from all projects' images
 */
export function useStorageUsage(): StorageUsage & { loading: boolean } {
  const { user } = useAuth()
  const { storageLimitBytes, plan } = useSubscription()
  const [usedBytes, setUsedBytes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calculateStorage() {
      if (!user?.uid) {
        setUsedBytes(0)
        setLoading(false)
        return
      }

      try {
        const projects = await getProjects(user.uid)
        
        // Collect all image URLs from all projects
        const allImageUrls: string[] = []

        for (const project of projects) {
          // Collect singleImage URLs
          if (project.singleImage) {
            const images = Array.isArray(project.singleImage) 
              ? project.singleImage 
              : [project.singleImage]
            
            for (const imageUrl of images) {
              if (imageUrl && !isBlobUrl(imageUrl)) {
                allImageUrls.push(imageUrl)
              }
            }
          }

          // Collect slides image URLs
          if (project.slides) {
            for (const slide of project.slides) {
              if (slide.image && !isBlobUrl(slide.image)) {
                allImageUrls.push(slide.image)
              }
            }
          }
        }

        // Fetch actual file sizes from Firebase Storage metadata
        const totalBytes = await getTotalFileSize(allImageUrls)
        setUsedBytes(totalBytes)
      } catch (error) {
        console.error('Error calculating storage:', error)
        setUsedBytes(0)
      } finally {
        setLoading(false)
      }
    }

    calculateStorage()
  }, [user?.uid, plan])

  const percentage = storageLimitBytes > 0 
    ? Math.min((usedBytes / storageLimitBytes) * 100, 100) 
    : 0
  const remainingBytes = Math.max(storageLimitBytes - usedBytes, 0)

  return {
    usedBytes,
    usedFormatted: formatBytes(usedBytes),
    limitBytes: storageLimitBytes,
    limitFormatted: formatBytes(storageLimitBytes),
    percentage: Math.round(percentage),
    remainingBytes,
    remainingFormatted: formatBytes(remainingBytes),
    loading,
  }
}

