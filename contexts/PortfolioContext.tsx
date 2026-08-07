'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getMenuItems, getBio, getProjectsByPageId } from '@/lib/firebase/queries'
import type { PortfolioData, MenuItem } from '@/lib/firebase/types'

interface PortfolioContextType {
  menuItems: MenuItem[] | null
  bio: { text: string } | undefined
  currentPageSections: any[] | null
  loading: boolean
  error: string | null
  loadPageData: (pageId: string, userId: string) => Promise<void>
  refreshUserData: (userId: string) => Promise<void>
  refreshPageData: (pageId: string, userId: string) => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const [bio, setBio] = useState<{ text: string } | undefined>(undefined)
  const [currentPageSections, setCurrentPageSections] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cachedUserId, setCachedUserId] = useState<string | null>(null)

  // Load user-level data once (menuItems + bio)
  const loadUserData = async (userId: string) => {
    // Only fetch if not already cached for this user
    if (cachedUserId === userId && menuItems !== null) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Load menuItems and bio in parallel (user-level, don't change per-page)
      const [items, userBio] = await Promise.all([
        getMenuItems(userId),
        getBio(userId),
      ])

      setMenuItems(items)
      setBio(userBio || undefined)
      setCachedUserId(userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load portfolio'
      setError(message)
      console.error('Error loading user portfolio data:', err)
    }
  }

  // Load page-specific data (only projects for this page)
  const loadPageData = async (pageId: string, userId: string) => {
    try {
      // First ensure user-level data is loaded
      await loadUserData(userId)

      setLoading(true)
      setError(null)

      // Only fetch projects for this specific page
      const projects = await getProjectsByPageId(pageId, userId)

      const sections = projects.map((project) => ({
        id: project.id,
        type: 'project' as const,
        project,
      }))

      setCurrentPageSections(sections)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load page data'
      setError(message)
      console.error('Error loading page data:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = async (userId: string) => {
    setCachedUserId(null) // Clear cache to force reload
    await loadUserData(userId)
  }

  const refreshPageData = async (pageId: string, userId: string) => {
    try {
      setLoading(true)
      const projects = await getProjectsByPageId(pageId, userId)
      const sections = projects.map((project) => ({
        id: project.id,
        type: 'project' as const,
        project,
      }))
      setCurrentPageSections(sections)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh page data'
      setError(message)
      console.error('Error refreshing page data:', err)
    } finally {
      setLoading(false)
    }
  }

  const value: PortfolioContextType = {
    menuItems,
    bio,
    currentPageSections,
    loading,
    error,
    loadPageData,
    refreshUserData,
    refreshPageData,
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolioData() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolioData must be used within PortfolioProvider')
  }
  return context
}
