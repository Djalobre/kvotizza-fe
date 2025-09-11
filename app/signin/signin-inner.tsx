// app/signin/signin-inner.tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    })

    if (res?.error === 'EmailNotVerified') {
      setError('Molimo vas da prvo verifikujete svoj email.')
    } else if (res?.error) {
      setError('Pogrešan email ili lozinka.')
    } else if (res?.ok) {
      window.location.href = res.url || '/'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Prijava</CardTitle>
        </CardHeader>
        <CardContent>
          {/* System messages */}
          {verify === 'ok' && (
            <p className="text-sm text-green-600 mb-2">
              ✅ Email verifikovan! Možete se prijaviti.
            </p>
          )}
          {verifyError === 'VerifyFailed' && (
            <p className="text-sm text-red-600 mb-2">
              ❌ Verifikacioni link je neispravan ili istekao.
            </p>
          )}
          {reset === 'ok' && (
            <p className="text-sm text-green-600 mb-2">
              ✅ Lozinka uspešno resetovana. Možete se prijaviti.
            </p>
          )}

          {/* Sign in form */}
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Prijavljivanje…' : 'Prijava'}
            </Button>

            <div className="flex justify-between text-sm mt-2">
              <a href="/signup" className="underline">
                Registracija
              </a>
              <a href="/forgot-password" className="underline">
                Zaboravljena lozinka?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
