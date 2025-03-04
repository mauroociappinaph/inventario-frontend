import { Metadata } from 'next'
import { RoleRedirect } from '@/components/role-redirect'

export const metadata: Metadata = {
  title: 'Dashboard - InvSystem',
  description: 'Panel de control para administradores',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleRedirect adminOnly>
      <div className="min-h-screen">
        <main className="pt-4">
          {children}
        </main>
      </div>
    </RoleRedirect>
  )
}
