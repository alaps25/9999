/**
 * Feature limits and plan utilities
 */

import type { Plan } from '@/lib/firebase/types'

/**
 * Feature limits for each plan
 */
export interface FeatureLimits {
  maxPages: number
  maxProjectsPerPage: number
  maxStorageGB: number
  passwordProtection: boolean
  customDomain: boolean
  advancedThemes: boolean
  analytics: boolean
  prioritySupport: boolean
  exportPortfolio: boolean
}

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS: Record<Plan, FeatureLimits> = {
  base: {
    maxPages: Infinity, // Unlimited for now
    maxProjectsPerPage: Infinity, // Unlimited for now
    maxStorageGB: 0.1, // 100 MB
    passwordProtection: false,
    customDomain: false,
    advancedThemes: false,
    analytics: false,
    prioritySupport: false,
    exportPortfolio: false,
  },
  mid: {
    maxPages: Infinity, // Unlimited
    maxProjectsPerPage: Infinity, // Unlimited
    maxStorageGB: 2, // 2 GB
    passwordProtection: true,
    customDomain: false,
    advancedThemes: false,
    analytics: false,
    prioritySupport: false,
    exportPortfolio: false,
  },
  pro: {
    maxPages: Infinity, // Unlimited
    maxProjectsPerPage: Infinity, // Unlimited
    maxStorageGB: 20, // 20 GB
    passwordProtection: true,
    customDomain: false, // Can be enabled later
    advancedThemes: false, // Can be enabled later
    analytics: false, // Can be enabled later
    prioritySupport: true,
    exportPortfolio: false, // Can be enabled later
  },
}

/**
 * Plan display names
 */
export const PLAN_NAMES: Record<Plan, string> = {
  base: 'Base',
  mid: 'Mid',
  pro: 'Pro',
}

/**
 * Plan pricing (for display)
 */
export const PLAN_PRICING: Record<Plan, { monthly: string; yearly: string }> = {
  base: {
    monthly: 'Free',
    yearly: 'Free',
  },
  mid: {
    monthly: '$5/month',
    yearly: '$50/year',
  },
  pro: {
    monthly: '$15/month',
    yearly: '$150/year',
  },
}

/**
 * Check if user can access a specific feature
 */
export function canUserAccessFeature(userPlan: Plan, feature: keyof FeatureLimits): boolean {
  const limits = PLAN_LIMITS[userPlan]
  return limits[feature] === true || (typeof limits[feature] === 'number' && limits[feature] > 0)
}

/**
 * Get user plan limits
 */
export function getUserPlanLimits(userPlan: Plan): FeatureLimits {
  return PLAN_LIMITS[userPlan]
}

/**
 * Get storage limit in bytes
 */
export function getStorageLimitBytes(userPlan: Plan): number {
  return PLAN_LIMITS[userPlan].maxStorageGB * 1024 * 1024 * 1024 // Convert GB to bytes
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format GB to human-readable string
 */
export function formatGB(gb: number): string {
  if (gb < 1) {
    // For values less than 1 GB, show exact MB
    // 0.1 GB = 100 MB exactly
    const mb = gb * 1024
    // Round to nearest integer, but for 0.1 GB show exactly 100 MB
    if (Math.abs(mb - 100) < 0.1) {
      return '100 MB'
    }
    return `${Math.round(mb)} MB`
  }
  return `${gb} GB`
}

/**
 * Get plan upgrade path
 */
export function getUpgradePath(currentPlan: Plan): Plan | null {
  switch (currentPlan) {
    case 'base':
      return 'mid'
    case 'mid':
      return 'pro'
    case 'pro':
      return null // Already on highest plan
  }
}

/**
 * Get plan downgrade path
 */
export function getDowngradePath(currentPlan: Plan): Plan | null {
  switch (currentPlan) {
    case 'pro':
      return 'mid'
    case 'mid':
      return 'base'
    case 'base':
      return null // Already on lowest plan
  }
}

