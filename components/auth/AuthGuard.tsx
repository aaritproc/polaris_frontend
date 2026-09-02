'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/services/api'
import { LoadingDots } from '@/components/ui/Spinner'

const MOCK_AUTH =
  process.env.NEXT_PUBLIC_FRONTEND_MOCK_AUTH === 'true'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // ---------------------------------------------------------
    // FRONTEND DEVELOPMENT MODE
    // Skip authentication so Dashboard can be developed
    // without Azure/backend authentication.
    // ---------------------------------------------------------
    if (MOCK_AUTH) {
      console.log('[AuthGuard] Mock authentication enabled')

      localStorage.setItem(
        'polaris_mock_user',
        JSON.stringify({
          id: 'dev-user',
          email: 'developer@polaris.local',
          name: 'Polaris Developer',
          role: 'admin_auditor',
        })
      )

      setChecked(true)
      return
    }

    // ---------------------------------------------------------
    // EXISTING REAL AUTHENTICATION — UNCHANGED
    // ---------------------------------------------------------

    if (authApi.isLoggedIn()) {
      setChecked(true)
      return
    }

    if (typeof window === 'undefined') {
      router.replace('/auth/login')
      return
    }

    const currentPath =
      window.location.pathname + window.location.search

    console.log('[AuthGuard] Current path:', currentPath)

    // CRITICAL FIX: use sessionStorage as a latch.
    // The FIRST AuthGuard to fire saves the URL.
    // Any subsequent AuthGuard must NOT overwrite it.
    const alreadySaved =
      sessionStorage.getItem('auth_return_url')

    let loginUrl = '/auth/login'

    if (!currentPath.startsWith('/auth')) {
      if (!alreadySaved) {
        sessionStorage.setItem(
          'auth_return_url',
          currentPath
        )

        console.log(
          '[AuthGuard] Saved return URL:',
          currentPath
        )
      } else {
        console.log(
          '[AuthGuard] Return URL already saved as:',
          alreadySaved,
          '— not overwriting with:',
          currentPath
        )
      }

      const savedPath =
        sessionStorage.getItem('auth_return_url') ??
        currentPath

      loginUrl =
        `/auth/login?return_to=${encodeURIComponent(savedPath)}`
    }

    console.log(
      '[AuthGuard] Redirecting to:',
      loginUrl
    )

    router.replace(loginUrl as any)
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingDots />
      </div>
    )
  }

  return <>{children}</>
}