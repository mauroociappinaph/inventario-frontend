import { useInventoryStore } from '@/store/useInventoryStore';
import { useMemo } from 'react';

interface MovementTrend {
  current: number;
  previous: number;
  percentChange: number;
}

interface InventoryTrends {
  totalMovements: MovementTrend;
  entries: MovementTrend;
  exits: MovementTrend;
}

export function useMovementTrends() {
  const { stockMovements } = useInventoryStore();

  const trends = useMemo((): InventoryTrends => {
    if (!Array.isArray(stockMovements)) {
      return {
        totalMovements: { current: 0, previous: 0, percentChange: 0 },
        entries: { current: 0, previous: 0, percentChange: 0 },
        exits: { current: 0, previous: 0, percentChange: 0 }
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Movimientos del último mes
    const currentMovements = stockMovements.filter(m =>
      new Date(m.date) >= thirtyDaysAgo && new Date(m.date) <= now
    );

    // Movimientos del mes anterior
    const previousMovements = stockMovements.filter(m =>
      new Date(m.date) >= sixtyDaysAgo && new Date(m.date) < thirtyDaysAgo
    );

    // Calcular totales actuales
    const currentTotal = currentMovements.length;
    const currentEntries = currentMovements.filter(m => m.type === 'entrada').length;
    const currentExits = currentMovements.filter(m => m.type === 'salida').length;

    // Calcular totales anteriores
    const previousTotal = previousMovements.length;
    const previousEntries = previousMovements.filter(m => m.type === 'entrada').length;
    const previousExits = previousMovements.filter(m => m.type === 'salida').length;

    // Calcular porcentajes de cambio
    const calculatePercentChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalMovements: {
        current: currentTotal,
        previous: previousTotal,
        percentChange: calculatePercentChange(currentTotal, previousTotal)
      },
      entries: {
        current: currentEntries,
        previous: previousEntries,
        percentChange: calculatePercentChange(currentEntries, previousEntries)
      },
      exits: {
        current: currentExits,
        previous: previousExits,
        percentChange: calculatePercentChange(currentExits, previousExits)
      }
    };
  }, [stockMovements]);

  return trends;
}
