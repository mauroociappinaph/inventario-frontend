"use client"

import { useEffect, useRef } from "react"

interface DataPoint {
  month: string
  entradas: number
  salidas: number
}

const sampleData: DataPoint[] = [
  { month: "Ene", entradas: 60, salidas: 40 },
  { month: "Feb", entradas: 75, salidas: 50 },
  { month: "Mar", entradas: 90, salidas: 65 },
  { month: "Abr", entradas: 85, salidas: 70 },
  { month: "May", entradas: 100, salidas: 80 },
  { month: "Jun", entradas: 120, salidas: 95 },
  { month: "Jul", entradas: 110, salidas: 85 },
]

export function InventoryChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1

    // Ajuste para pantallas de alta resolución
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Colores y configuración
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#3b82f6'
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--destructive') || '#ef4444'
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground') || '#374151'
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border') || '#e5e7eb'

    // Limpiar el canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Configuración del gráfico
    const paddingLeft = 60
    const paddingRight = 30
    const paddingTop = 30
    const paddingBottom = 60
    const chartWidth = rect.width - paddingLeft - paddingRight
    const chartHeight = rect.height - paddingTop - paddingBottom

    // Calcular el máximo valor para la escala
    const maxValue = Math.max(
      ...sampleData.map(d => Math.max(d.entradas, d.salidas))
    ) * 1.1 // Añadir 10% para espacio

    // Líneas de la cuadrícula y etiquetas Y
    ctx.font = '12px sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'right'

    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + chartHeight - (i / gridLines) * chartHeight
      const value = Math.round((i / gridLines) * maxValue)

      ctx.fillText(value.toString(), paddingLeft - 10, y + 4)

      ctx.beginPath()
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      ctx.moveTo(paddingLeft, y)
      ctx.lineTo(paddingLeft + chartWidth, y)
      ctx.stroke()
    }

    // Dibujar barras y etiquetas X
    const barWidth = chartWidth / sampleData.length / 2.5
    const barGap = barWidth / 2

    ctx.textAlign = 'center'

    sampleData.forEach((data, i) => {
      const x = paddingLeft + (i + 0.5) * (chartWidth / sampleData.length)

      // Etiqueta del mes
      ctx.fillText(data.month, x, rect.height - paddingBottom / 2)

      // Barra de entradas
      const barHeight1 = (data.entradas / maxValue) * chartHeight
      const barX1 = x - barWidth - barGap / 2
      const barY1 = paddingTop + chartHeight - barHeight1

      ctx.fillStyle = primaryColor
      ctx.beginPath()
      ctx.roundRect(barX1, barY1, barWidth, barHeight1, [4, 4, 0, 0])
      ctx.fill()

      // Barra de salidas
      const barHeight2 = (data.salidas / maxValue) * chartHeight
      const barX2 = x + barGap / 2
      const barY2 = paddingTop + chartHeight - barHeight2

      ctx.fillStyle = secondaryColor
      ctx.beginPath()
      ctx.roundRect(barX2, barY2, barWidth, barHeight2, [4, 4, 0, 0])
      ctx.fill()
    })

    // Leyenda
    const legendX = paddingLeft
    const legendY = paddingTop / 2

    // Entrada
    ctx.fillStyle = primaryColor
    ctx.beginPath()
    ctx.roundRect(legendX, legendY - 8, 16, 16, 2)
    ctx.fill()

    ctx.fillStyle = textColor
    ctx.textAlign = 'left'
    ctx.fillText('Entradas', legendX + 24, legendY + 4)

    // Salida
    ctx.fillStyle = secondaryColor
    ctx.beginPath()
    ctx.roundRect(legendX + 120, legendY - 8, 16, 16, 2)
    ctx.fill()

    ctx.fillStyle = textColor
    ctx.textAlign = 'left'
    ctx.fillText('Salidas', legendX + 144, legendY + 4)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-label="Gráfico de movimiento de inventario"
    />
  )
}

