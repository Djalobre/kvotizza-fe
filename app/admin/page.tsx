// app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import AdminShell from '@/components/admin/admin-shell'

export default async function AdminPage({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session as any).user?.role !== 'ADMIN') {
    // This is a server component – you can also redirect:
    return <div className="p-6">Forbidden</div>
  }
  return <AdminShell>{children}</AdminShell>
}
