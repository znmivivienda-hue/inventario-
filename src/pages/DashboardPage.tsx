import { useEffect, useState } from 'react'
import { TrendingDown, TrendingUp, TriangleAlert, Package, LayoutDashboard, Activity } from "lucide-react"
import { LineChartCard } from "@/components/LineChartCard"
import { TopProductsCard } from "@/components/TopProductsCard"
import { MonthlyData, TopProductData } from "@/types/dashboard"
import { supabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardData {
  lowStockCount: number
  outOfStockCount: number
  totalProducts: number
  totalMovements: number
  monthlyEntries: MonthlyData[]
  monthlyExits: MonthlyData[]
  topEntries: TopProductData[]
  topExits: TopProductData[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = supabaseBrowser()
      
      try {
        const [
          productsRes,
          monthlyEntriesRes,
          monthlyExitsRes,
          topEntriesRes,
          topExitsRes,
          movementsRes
        ] = await Promise.all([
          supabase.from('products').select('stock, min_stock'),
          supabase.rpc('get_monthly_entries'),
          supabase.rpc('get_monthly_exits'),
          supabase.rpc('get_product_entries_summary'),
          supabase.rpc('get_product_exits_summary'),
          supabase.from('movement_history').select('id', { count: 'exact', head: true })
        ])

        const lowStockCount = productsRes.data?.filter(
          (p: { stock: number; min_stock: number; }) => p.stock > 0 && p.stock <= p.min_stock
        ).length ?? 0

        const outOfStockCount = productsRes.data?.filter(
          (p: { stock: number; }) => p.stock === 0
        ).length ?? 0

        setData({
          lowStockCount,
          outOfStockCount,
          totalProducts: productsRes.data?.length ?? 0,
          totalMovements: movementsRes.count ?? 0,
          monthlyEntries: monthlyEntriesRes.data || [],
          monthlyExits: monthlyExitsRes.data || [],
          topEntries: topEntriesRes.data || [],
          topExits: topExitsRes.data || [],
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Error al cargar los datos del dashboard</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { 
    lowStockCount, 
    outOfStockCount,
    totalProducts,
    totalMovements,
    monthlyEntries,
    monthlyExits,
    topEntries,
    topExits
  } = data

  return (
    <div className="flex flex-col gap-6">
      {/* Header con gradiente */}
      <div>
        <h1 className="flex items-center text-3xl font-bold mb-2">
          <LayoutDashboard className="h-7 w-7 text-black mr-2" />
          <span className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
        <p className="text-muted-foreground">
          Un resumen de la actividad y estado de tu inventario
        </p>
      </div>

      {/* Stats Cards - Rediseñadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Productos */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Productos
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En tu inventario
            </p>
          </CardContent>
        </Card>

        {/* Stock Bajo */}
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Bajo
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <TriangleAlert className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        {/* Sin Stock */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sin Stock
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Productos agotados
            </p>
          </CardContent>
        </Card>

        {/* Total Movimientos */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Movimientos
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalMovements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas y salidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600"/>
              </div>
              <div>
                <CardTitle>Top 5 Productos - Entradas</CardTitle>
                <CardDescription>Productos con más ingresos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TopProductsCard 
              title=""
              items={topEntries}
              icon={<TrendingUp className="h-6 w-6 text-green-500"/>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600"/>
              </div>
              <div>
                <CardTitle>Top 5 Productos - Salidas</CardTitle>
                <CardDescription>Productos con más egresos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TopProductsCard 
              title=""
              items={topExits}
              icon={<TrendingDown className="h-6 w-6 text-red-500"/>}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Charts - Rediseñados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              Entradas Mensuales
            </CardTitle>
            <CardDescription>
              Últimos 12 meses de ingresos al inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartCard
              data={monthlyEntries}
              title=""
              lineColor="#2563eb"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Salidas Mensuales
            </CardTitle>
            <CardDescription>
              Últimos 12 meses de egresos del inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartCard
              data={monthlyExits}
              title=""
              lineColor="#dc2626"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}