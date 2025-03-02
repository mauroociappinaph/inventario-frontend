'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis o en la consola
    console.error('Error en la página de productos:', error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-[50vh] px-4 py-12">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle className="text-xl">Ha ocurrido un error</CardTitle>
          </div>
          <CardDescription>
            No se pudo cargar la página de productos. Por favor, intente nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground mb-4">
            {error.message || 'Se ha producido un error inesperado al cargar la información de productos.'}
          </div>
          <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2 italic">
            Si el problema persiste, comuníquese con el administrador del sistema.
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => reset()}
            className="w-full flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar nuevamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
