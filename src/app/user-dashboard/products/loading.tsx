import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function ProductsLoading() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-60" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle><Skeleton className="h-6 w-40" /></CardTitle>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando productos...</p>
          </div>

          <div className="rounded-md border mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 font-medium">
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="py-3 px-4 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="py-3 px-4 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-4 w-8" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
