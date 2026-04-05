'use client'

import { useEffect, useState , Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// 4 possible states
type Status = 'loading' | 'success' | 'expired' | 'invalid'

 function VerifyEmailForm() {  //VerifyEmailPage
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // No token in URL at all
    

    // Call our API route
    const verify = async () => {

        if (!token) {
      setStatus('invalid')
      setMessage('No token found in the link.')
      return
    }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage('Your email has been verified successfully!')
          // Auto redirect to login after 3 seconds
          setTimeout(() => router.push('/auth/login?verified=true'), 3000)
        } else {
          // Check what kind of error it is
          if (data.error?.includes('expired')) {
            setStatus('expired')
            setMessage('This link has expired. Please request a new one.')
          } else {
            setStatus('invalid')
            setMessage('This link is invalid. Please register again.')
          }
        }
      } catch (err) {
        setStatus('invalid')
        setMessage('Something went wrong. Please try again.')
      }
    }

    verify()
  }, [token])

  return (
    
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md text-center">

        {/* LOADING */}
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Verifying your email...
            </h1>
            <p className="text-gray-500 text-sm">Please wait a moment</p>
          </>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <p className="text-gray-400 text-xs mb-6">
              Redirecting to login in 3 seconds...
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Go to Login
            </button>
          </>
        )}

        {/* EXPIRED */}
        {status === 'expired' && (
          <>
            <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Link Expired
            </h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => router.push('/auth/register')}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Register Again
            </button>
          </>
        )}

        {/* INVALID */}
        {status === 'invalid' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => router.push('/auth/register')}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Back to Register
            </button>
          </>
        )}

      </div>
   
  )
}

export default function VerifyEmailPage(){
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Suspense fallback={
          <div className="text-sm text-gray-400">Loading...</div>
        }>
           <VerifyEmailForm />
        </Suspense>
      </div>
    )
}