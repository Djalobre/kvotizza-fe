'use client'

import SidebarNav from './sidebar-nav'
import Topbar from './topbar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <SidebarNav />
      <main className="flex-1 flex flex-col">
        <Topbar />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
