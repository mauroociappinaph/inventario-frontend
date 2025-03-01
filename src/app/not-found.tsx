import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-md hover:translate-y-[-2px]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
