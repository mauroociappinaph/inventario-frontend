'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Opcionalmente, registrar el error en un servicio de análisis
    console.error('Error en el dashboard de usuario:', error)
  }, [error])

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Ha ocurrido un error</CardTitle>
          </div>
          <CardDescription>
            Hubo un problema al cargar esta sección del dashboard de usuario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            <p className="mb-2">
              Esto puede deberse a un problema temporal de conexión o a una actualización en curso.
            </p>
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive font-mono text-xs overflow-auto">
              {error?.message || 'Error desconocido'}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={reset}
            variant="outline"
            className="w-full gap-2 border-destructive/50 hover:bg-destructive/10"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar nuevamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
