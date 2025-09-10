// app/signin/page.tsx
'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string| null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const res = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' })
    // next-auth handles redirect; if using redirect: false, check res?.error
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Sign In</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in…' : 'Sign In'}</Button>
            <a href="/signup" className="block text-center text-sm underline mt-2">Create an account</a>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
