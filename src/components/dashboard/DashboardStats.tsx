"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { CircularProgress } from "../circular-progress"

type StatsProps = {
  isLoading: boolean
  error: string | null
}

export function DashboardStats({ isLoading, error }: StatsProps) {
  if (error) {
    return (
      <Card className="col-span-full border-destructive bg-destructive/10 transition-standard">
        <CardContent className="card-padding flex items-center gap-md">
          <div className="rounded-full p-2 bg-destructive/20 text-destructive">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Error al cargar los datos</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <button
            className="ml-auto px-3 py-1.5 border border-destructive text-destructive text-sm rounded-md hover:bg-destructive/10 transition-standard"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <>
        <Card className="transition-standard animate-pulse">
          <CardHeader className="card-header">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted/80 rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted/60 rounded"></div>
          </CardContent>
        </Card>
        <Card className="transition-standard animate-pulse">
          <CardHeader className="card-header">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted/60 rounded"></div>
          </CardContent>
        </Card>
        <Card className="transition-standard animate-pulse">
          <CardHeader className="card-header">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          </CardHeader>
          <CardContent className="card-content">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-20 bg-muted/60 rounded"></div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      {/* Total Products */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">Productos Registrados</CardTitle>
          <div className="text-xs text-muted-foreground">
            Comparado con el período anterior
          </div>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">2.200.150</div>
              <div className="flex gap-sm mt-xs">
                <div className="text-sm text-emerald-500 flex items-center">
                  <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span>12.5%</span>
                </div>
                <div className="text-xs text-muted-foreground">este mes</div>
              </div>
            </div>
            <div className="w-20 h-20 flex-shrink-0">
              <CircularProgress value={80} color="var(--primary)" size={80} />
              <div className="text-xs text-center mt-xs">Rendimiento</div>
            </div>
          </div>
          <div className="h-10 mt-sm">
            {/* Gráfico de tendencia */}
            <div className="flex items-end h-full gap-[2px]">
              {[40, 25, 35, 30, 45, 35, 55, 40, 60, 45, 70, 55, 80].map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-sm transition-standard"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Level */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">Nivel de Stock</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">1.941.000</div>
              <div className="text-sm text-rose-500 flex items-center mt-xs">
                <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>8.3% este mes</span>
              </div>
            </div>
            <div className="w-14 h-14 flex-shrink-0">
              <CircularProgress value={75} color="var(--destructive)" size={56} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card className="transition-standard">
        <CardHeader className="card-header">
          <CardTitle className="text-base font-medium">Ganancias</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">12.123$</div>
              <div className="text-sm text-emerald-500 flex items-center mt-xs">
                <svg className="h-4 w-4 mr-xs" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>23.1% este mes</span>
              </div>
            </div>
            <div className="w-14 h-14 flex-shrink-0">
              <CircularProgress value={65} color="var(--chart-1)" size={56} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
