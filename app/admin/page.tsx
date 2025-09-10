// app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session as any).user?.role !== 'ADMIN') {
    // This is a server component – you can also redirect:
    return <div className="p-6">Forbidden</div>
  }
  return <div className="p-6">Welcome, admin.</div>
}
