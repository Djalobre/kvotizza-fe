// app/signin/signin-inner.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignInInner() {
  const searchParams = useSearchParams()
  const verify = searchParams.get('verify')
  const verifyError = searchParams.get('error')
  const reset = searchParams.get('reset')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const res = await signIn('credentials', {
  email,
  password,
  redirect: false,
  callbackUrl: '/',
})

if (res?.error === 'EmailNotVerified') {
  setError('Potvrdite email pre prijave. Proverite inbox ili Spam.')
} else if (res?.error) {
  setError('Pogrešan email ili lozinka.')
} else if (res?.ok) {
  window.location.href = res.url || '/'
}
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const res = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/' })
    if (res?.error) setError('Invalid email or password')
    else if (res?.ok) window.location.href = res.url || '/'
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Sign In</CardTitle></CardHeader>
        <CardContent>
          {verify === 'ok' && <p className="text-sm text-green-600 mb-2">✅ Email verified! You can sign in now.</p>}
          {verifyError === 'VerifyFailed' && <p className="text-sm text-red-600 mb-2">❌ Verification link is invalid or expired.</p>}
          {reset === 'ok' && <p className="text-sm text-green-600 mb-2">✅ Password reset successfully. Please sign in.</p>}

          <form onSubmit={onSubmit} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign In'}</Button>
            <div className="flex justify-between text-sm mt-2">
              <a href="/signup" className="underline">Create account</a>
              <a href="/forgot-password" className="underline">Forgot password?</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
