"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_URL } from "@/config/api"
import authService from "@/lib/api/auth-service"
import axios from "axios"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Tipo para los datos de ROI
interface RoiData {
  avgRoi: number;
  topRoiProducts?: {
    _id: string;
    productName: string;
    totalSalidas: number;
    totalValorSalidas: number;
    costoPromedio: number;
    roi: number;
  }[];
}

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RoiPanel() {
  const [loading, setLoading] = useState(true);
  const [roiData, setRoiData] = useState<RoiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de ROI
  useEffect(() => {
    const fetchRoiData = async () => {
      try {
        setLoading(true);

        const token = authService.getToken();
        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        console.log('🔍 [RoiPanel] Obteniendo datos de ROI del endpoint específico...');
        const response = await axios.get(`${API_URL}/inventory/statistics/roi`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📊 [RoiPanel] Datos de ROI recibidos (estructura completa):', JSON.stringify(response.data, null, 2));

        // Comprobar la estructura de los datos recibidos
        if (response.data && response.data.roi) {
          console.log('✅ [RoiPanel] Estructura estándar encontrada, ROI avgRoi =', response.data.roi.avgRoi);
          setRoiData(response.data.roi);
        } else {
          console.warn('⚠️ [RoiPanel] Estructura de datos de ROI inesperada:', response.data);
          // Intentar extraer los datos de ROI de la estructura, si es posible
          if (response.data && typeof response.data === 'object') {
            console.log('🔍 [RoiPanel] Buscando estructura alternativa para ROI...');

            // Buscar directamente el valor avgRoi en la respuesta
            if ('avgRoi' in response.data) {
              console.log('✅ [RoiPanel] Encontrado avgRoi directamente en response.data:', response.data.avgRoi);
              setRoiData(response.data);
              return;
            }

            const possibleRoiData = Object.values(response.data).find(
              value => value && typeof value === 'object' && 'avgRoi' in value
            );

            if (possibleRoiData) {
              console.log('✅ [RoiPanel] Se encontraron datos de ROI en una estructura diferente', possibleRoiData);
              console.log('   [RoiPanel] avgRoi =', (possibleRoiData as any).avgRoi);
              setRoiData(possibleRoiData as RoiData);
            } else {
              // Intenta buscar más profundo en la estructura
              console.log('🔍 [RoiPanel] Buscando más profundo en la estructura de datos...');

              const deepScan = (obj: any, path = ''): any => {
                if (!obj || typeof obj !== 'object') return null;

                if ('avgRoi' in obj) {
                  console.log(`✅ [RoiPanel] avgRoi encontrado en path: ${path}`, obj.avgRoi);
                  return obj;
                }

                for (const key in obj) {
                  if (typeof obj[key] === 'object') {
                    const result = deepScan(obj[key], `${path}.${key}`);
                    if (result) return result;
                  }
                }

                return null;
              };

              const deepResult = deepScan(response.data);

              if (deepResult) {
                console.log('✅ [RoiPanel] Datos de ROI encontrados en escaneo profundo:', deepResult);
                setRoiData(deepResult as RoiData);
              } else {
                throw new Error('No se pudo encontrar datos de ROI en la respuesta');
              }
            }
          } else {
            throw new Error('Formato de respuesta no válido para datos de ROI');
          }
        }
      } catch (error) {
        console.error('❌ [RoiPanel] Error al cargar datos de ROI:', error);
        setError('No se pudieron cargar los datos de ROI');
      } finally {
        setLoading(false);
      }
    };

    fetchRoiData();

    // Actualizar los datos cada 2 minutos
    const intervalId = setInterval(fetchRoiData, 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Preparar datos para el gráfico de barras
  const barChartData = roiData?.topRoiProducts?.map(product => ({
    name: product.productName.length > 15 ? product.productName.substring(0, 15) + '...' : product.productName,
    roi: parseFloat(product.roi.toFixed(1))
  })) || [];

  console.log('📊 [RoiPanel] Datos preparados para gráfico de barras:', barChartData);
  console.log('📊 [RoiPanel] ROI promedio a mostrar:', roiData?.avgRoi);

  // Preparar datos para el gráfico circular
  const pieChartData = roiData?.topRoiProducts?.map(product => ({
    name: product.productName.length > 15 ? product.productName.substring(0, 15) + '...' : product.productName,
    value: product.totalValorSalidas
  })) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análisis de ROI</CardTitle>
        <CardDescription>
          Retorno sobre inversión de productos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">ROI Promedio</h3>
                <div className="text-3xl font-bold">
                  {roiData?.avgRoi ? `${roiData.avgRoi.toFixed(1)}%` : '0%'}
                </div>
                {roiData?.avgRoi === 0 && (
                  <div className="text-amber-600 text-sm mt-1">
                    No hay datos para calcular el ROI
                  </div>
                )}
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 text-sm px-3 py-1">
                Últimos 30 días
              </Badge>
            </div>

            <Tabs defaultValue="barras">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="barras">Barras</TabsTrigger>
                <TabsTrigger value="circular">Ventas</TabsTrigger>
              </TabsList>

              <TabsContent value="barras" className="mt-4">
                <h4 className="text-sm font-medium mb-4">Productos con mejor ROI (%)</h4>
                {barChartData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          interval={0}
                          tick={{fontSize: 12}}
                        />
                        <YAxis unit="%" />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'ROI']}
                          labelStyle={{fontWeight: 'bold'}}
                        />
                        <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
                          {barChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">No hay datos de ROI disponibles</p>
                    <p className="text-gray-500 text-sm mt-1">Para calcular el ROI se necesitan movimientos de salida</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="circular" className="mt-4">
                <h4 className="text-sm font-medium mb-4">Valor de Ventas por Producto</h4>
                {pieChartData.length > 0 ? (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`$${typeof value === 'number' ? value.toFixed(2) : value}`, 'Ventas']}
                          labelStyle={{fontWeight: 'bold'}}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-gray-300 rounded-md">
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">No hay datos de ventas disponibles</p>
                    <p className="text-gray-500 text-sm mt-1">Para ver esta información se necesitan registrar ventas en el sistema</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Productos con Mejor Desempeño</h4>
              <div className="space-y-3">
                {(roiData?.topRoiProducts || []).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Costo: ${product.costoPromedio.toFixed(2)} | Ventas: ${product.totalValorSalidas.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
                      ROI: {product.roi.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Sobre el ROI:</strong> El Retorno sobre Inversión (ROI) mide la rentabilidad de un producto
                comparando los ingresos generados frente al costo de adquisición. Un ROI más alto indica una mayor
                rentabilidad por cada unidad monetaria invertida.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
