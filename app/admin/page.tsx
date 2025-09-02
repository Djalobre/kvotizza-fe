// app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import AdminShell from '@/components/admin/admin-shell'

export const metadata: Metadata = {
  title: 'Kvotizza Admin',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    redirect('/') // or 403
  }
  return <AdminShell>{children}</AdminShell>
}
