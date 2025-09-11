// app/signup/page.tsx
'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const j = await r.json().catch(()=> ({}))
      if (!r.ok) throw new Error(j.error || 'Signup failed')
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-green-600">
              We’ve sent a verification link to <b>{email}</b>. Please check your inbox.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <Input placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating…' : 'Create account'}
              </Button>
              <a href="/signin" className="block text-center text-sm underline mt-2">Have an account? Sign in</a>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
