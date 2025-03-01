import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Sistema de Gestión de Inventario",
  description: "Panel de control para gestionar el inventario de tu empresa",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
