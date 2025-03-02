import { Metadata } from 'next'
import { RoleRedirect } from '@/components/role-redirect'

export const metadata: Metadata = {
  title: 'Dashboard de Usuario - InvSystem',
  description: 'Panel de control para usuarios regulares',
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleRedirect adminOnly={false}>
      <div className="min-h-screen">
        <main className="pt-4">
          {children}
        </main>
      </div>
    </RoleRedirect>
  )
}
