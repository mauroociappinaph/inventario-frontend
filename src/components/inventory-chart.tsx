"use client"

import { useEffect, useRef, useState } from "react"
import { useInventory } from "@/hooks/useInventory"
import { Skeleton } from "./ui/skeleton"

interface DataPoint {
  month: string
  entradas: number
  salidas: number
}

export function InventoryChart() {
  const { movements, isLoading, error } = useInventory();
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  // Procesar datos de movimientos para el gráfico
  useEffect(() => {
    if (movements.length === 0) return;

    // Agrupar movimientos por mes
    const monthlyData = new Map<string, { entradas: number; salidas: number }>();

    // Obtener los últimos 7 meses
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleDateString('es-ES', { month: 'short' });

      monthlyData.set(monthKey, { entradas: 0, salidas: 0 });
    }

    // Procesar movimientos
    movements.forEach(movement => {
      const date = new Date(movement.date);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short' });

      if (monthlyData.has(monthKey)) {
        const currentData = monthlyData.get(monthKey)!;

        if (movement.type === 'entrada') {
          currentData.entradas += movement.quantity;
        } else if (movement.type === 'salida') {
          currentData.salidas += Math.abs(movement.quantity);
        } else if (movement.type === 'ajuste') {
          if (movement.quantity > 0) {
            currentData.entradas += movement.quantity;
          } else {
            currentData.salidas += Math.abs(movement.quantity);
          }
        }

        monthlyData.set(monthKey, currentData);
      }
    });

    // Convertir a array para el gráfico
    const dataArray: DataPoint[] = [];
    monthlyData.forEach((value, key) => {
      dataArray.push({
        month: key,
        entradas: value.entradas,
        salidas: value.salidas
      });
    });

    setChartData(dataArray);
  }, [movements]);

  // Dibujar gráfico
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    // Ajuste para pantallas de alta resolución
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Colores y configuración
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#3b82f6';
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--destructive') || '#ef4444';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground') || '#374151';
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border') || '#e5e7eb';

    // Limpiar el canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Configuración del gráfico
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 60;
    const chartWidth = rect.width - paddingLeft - paddingRight;
    const chartHeight = rect.height - paddingTop - paddingBottom;

    // Calcular el máximo valor para la escala
    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.entradas, d.salidas))
    ) * 1.1 || 100; // Añadir 10% para espacio o usar 100 si no hay datos

    // Líneas de la cuadrícula y etiquetas Y
    ctx.font = '12px sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + chartHeight - (i / gridLines) * chartHeight;
      const value = Math.round((i / gridLines) * maxValue);

      ctx.fillText(value.toString(), paddingLeft - 10, y + 4);

      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + chartWidth, y);
      ctx.stroke();
    }

    // Dibujar barras y etiquetas X
    const barWidth = chartWidth / chartData.length / 2.5;
    const barGap = barWidth / 2;

    ctx.textAlign = 'center';

    chartData.forEach((data, i) => {
      const x = paddingLeft + (i + 0.5) * (chartWidth / chartData.length);

      // Etiqueta del mes
      ctx.fillText(data.month, x, rect.height - paddingBottom / 2);

      // Barra de entradas
      const barHeight1 = (data.entradas / maxValue) * chartHeight;
      const barX1 = x - barWidth - barGap / 2;
      const barY1 = paddingTop + chartHeight - barHeight1;

      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(barX1, barY1, barWidth, barHeight1, [4, 4, 0, 0]);
      ctx.fill();

      // Barra de salidas
      const barHeight2 = (data.salidas / maxValue) * chartHeight;
      const barX2 = x + barGap / 2;
      const barY2 = paddingTop + chartHeight - barHeight2;

      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.roundRect(barX2, barY2, barWidth, barHeight2, [4, 4, 0, 0]);
      ctx.fill();
    });

    // Leyenda
    const legendX = paddingLeft;
    const legendY = paddingTop / 2;

    // Entrada
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY - 8, 16, 16, 2);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText('Entradas', legendX + 24, legendY + 4);

    // Salida
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.roundRect(legendX + 120, legendY - 8, 16, 16, 2);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText('Salidas', legendX + 144, legendY + 4);
  }, [chartData]);

  // Mostrar estado de carga
  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  // Mostrar error
  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-destructive">Error al cargar datos del gráfico</p>
      </div>
    );
  }

  // Mostrar mensaje si no hay datos
  if (movements.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No hay datos de movimientos disponibles</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64"
      aria-label="Gráfico de movimiento de inventario"
    />
  )
}

