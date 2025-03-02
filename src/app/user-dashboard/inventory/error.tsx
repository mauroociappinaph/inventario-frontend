'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, PackageX, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function InventoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error específico de inventario
    console.error('Error en la sección de inventario:', error)
  }, [error])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <PackageX className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Error en el módulo de inventario</CardTitle>
          </div>
          <CardDescription>
            No pudimos cargar la información de inventario en este momento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            <p className="mb-2">
              Este error puede deberse a un problema con la conexión al servidor o al acceder a los datos de inventario.
            </p>
            {error.message && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive font-mono text-xs overflow-auto mb-3">
                {error.message}
              </div>
            )}
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <p>Si el problema persiste, contacte al administrador del sistema.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            onClick={reset}
            variant="outline"
            className="flex-1 gap-2 border-destructive/50 hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button
            asChild
            variant="default"
            className="flex-1 gap-2"
          >
            <Link href="/user-dashboard">
              <Home className="h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
