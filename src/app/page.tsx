import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Suspense } from 'react'
import { InventoryChart } from '@/components/inventory-chart'
import { InventoryAlerts } from '@/components/inventory-alerts'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-[#4b3f72]">YOUR WEBSITE</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <Link href="/about" className="text-gray-500 hover:text-gray-700">
            About us
          </Link>
          <Link href="/work" className="text-gray-500 hover:text-gray-700">
            Work
          </Link>
          <Link href="/info" className="text-gray-500 hover:text-gray-700">
            Info
          </Link>
          <Link href="/inventory">
            <Button className="bg-[#6c3ce9] hover:bg-[#5a30c5] text-white rounded-full px-6">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto py-16 px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-5xl font-bold text-[#4b3f72] mb-6">Inventory Management</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Streamline your inventory processes with our powerful management system. Track products, monitor stock
              levels, and optimize your supply chain with ease.
            </p>
            <Link href="/inventory">
              <Button className="bg-[#6c3ce9] hover:bg-[#5a30c5] text-white rounded-full px-8 py-3">Learn More</Button>
            </Link>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-01%20at%2002.16.15-Vvb48Ecs4MqOq38DthlUB7NDE1qp4D.png"
              alt="Inventory Management Illustration"
              fill
              className="object-contain"
            />
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#4b3f72] mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#6c3ce9] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#4b3f72] mb-2">Real-time Tracking</h3>
                <p className="text-gray-600">
                  Monitor your inventory levels in real-time and receive alerts when stock is running low.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#6c3ce9] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#4b3f72] mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Gain insights into your inventory performance with comprehensive analytics and reports.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-[#6c3ce9] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#4b3f72] mb-2">Automated Reordering</h3>
                <p className="text-gray-600">
                  Set up automatic reordering when inventory reaches predefined thresholds.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-6">Panel de Control de Inventario</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal con gráficos */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Análisis de Inventario</h2>
              <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                <Suspense fallback={<div className="p-8 text-center">Cargando gráficos...</div>}>
                  <InventoryChart />
                </Suspense>
              </div>
            </div>

            {/* Columna lateral con alertas */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Alertas del Sistema</h2>
              <Suspense fallback={<div className="p-8 text-center">Cargando alertas...</div>}>
                <InventoryAlerts />
              </Suspense>

              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <ul className="space-y-2">
                    <li className="p-2 hover:bg-muted rounded transition-colors">
                      <a href="/inventory" className="flex items-center text-primary">
                        <span className="ml-2">Ver inventario completo</span>
                      </a>
                    </li>
                    <li className="p-2 hover:bg-muted rounded transition-colors">
                      <a href="/reports" className="flex items-center text-primary">
                        <span className="ml-2">Generar informes</span>
                      </a>
                    </li>
                    <li className="p-2 hover:bg-muted rounded transition-colors">
                      <a href="/settings" className="flex items-center text-primary">
                        <span className="ml-2">Configurar alertas</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#4b3f72] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Your Inventory System. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-purple-200">
                Terms
              </Link>
              <Link href="#" className="hover:text-purple-200">
                Privacy
              </Link>
              <Link href="#" className="hover:text-purple-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

