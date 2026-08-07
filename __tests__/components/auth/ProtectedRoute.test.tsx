import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// Mock the auth context
jest.mock('@/contexts/AuthContext')
jest.mock('next/navigation')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ProtectedRoute', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush, replace: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
  })

  it('should show nothing while loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: true,
      signInWithGoogle: jest.fn(),
      sendMagicLink: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    } as any)

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(container.firstChild?.childNodes.length).toBe(0)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to home when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      sendMagicLink: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    } as any)

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show protected content when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user123' } as any,
      userData: { uid: 'user123', username: 'testuser', email: 'test@example.com' } as any,
      loading: false,
      signInWithGoogle: jest.fn(),
      sendMagicLink: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    } as any)

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should NOT redirect multiple times on re-render', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      sendMagicLink: jest.fn(),
      signOut: jest.fn(),
      deleteAccount: jest.fn(),
    } as any)

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    const firstCallCount = mockPush.mock.calls.length

    // Re-render with same props
    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Should not have called router.push again (would indicate infinite loop)
    expect(mockPush.mock.calls.length).toBe(firstCallCount)
  })
})
