import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PackageSearch, Home, BarChart } from 'lucide-react'

export default function InventoryNotFound() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-primary" />
            <CardTitle>Página de inventario no encontrada</CardTitle>
          </div>
          <CardDescription>
            La sección de inventario que está intentando consultar no existe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            <p>
              Esto puede deberse a un enlace incorrecto o a que la página ha sido movida o eliminada.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="flex-1 gap-2"
          >
            <Link href="/user-dashboard/inventory">
              <PackageSearch className="h-4 w-4" />
              Ir a Inventario
            </Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="flex-1 gap-2"
          >
            <Link href="/user-dashboard">
              <BarChart className="h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
