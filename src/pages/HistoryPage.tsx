import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { supabaseBrowser } from "@/lib/supabase/client"
import { useAuth } from '@/contexts/AuthContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, History, TrendingUp, TrendingDown, Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/MetricCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type HistoryItem = {
    id: number
    product_name: string
    action_type: 'Entrada' | 'Salida'
    quantity: number
    details: any
    date: string
    time: string
    user_name: string
}

const ITEMS_PER_PAGE_OPTIONS = [10, 15, 20, 50, 100]

export default function HistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'Entrada' | 'Salida'>('all')
  const [supabase] = useState(() => supabaseBrowser())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Métricas globales (no paginadas)
  const [todayMovements, setTodayMovements] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const [totalExits, setTotalExits] = useState(0)

  const parseDetails = (details: any) => {
    if (typeof details === 'object' && details !== null) {
      return details
    }
    if (typeof details === 'string') {
      try {
        return JSON.parse(details)
      } catch {
        return { invoice_number: details, destination: details }
      }
    }
    return {}
  }

  // Función para cargar métricas globales
  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Movimientos de hoy
      const { count: todayCount } = await supabase
        .from('movement_history')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
      
      setTodayMovements(todayCount || 0)

      // Total de entradas (con el filtro actual si aplica)
      let entriesQuery = supabase
        .from('movement_history')
        .select('quantity')
        .eq('action_type', 'Entrada')
      
      if (filter === 'Entrada') {
        const { data: entriesData } = await entriesQuery
        const total = entriesData?.reduce((sum, item) => sum + item.quantity, 0) || 0
        setTotalEntries(total)
      } else if (filter === 'all') {
        const { data: entriesData } = await entriesQuery
        const total = entriesData?.reduce((sum, item) => sum + item.quantity, 0) || 0
        setTotalEntries(total)
      } else {
        setTotalEntries(0)
      }

      // Total de salidas (con el filtro actual si aplica)
      let exitsQuery = supabase
        .from('movement_history')
        .select('quantity')
        .eq('action_type', 'Salida')
      
      if (filter === 'Salida') {
        const { data: exitsData } = await exitsQuery
        const total = exitsData?.reduce((sum, item) => sum + item.quantity, 0) || 0
        setTotalExits(total)
      } else if (filter === 'all') {
        const { data: exitsData } = await exitsQuery
        const total = exitsData?.reduce((sum, item) => sum + item.quantity, 0) || 0
        setTotalExits(total)
      } else {
        setTotalExits(0)
      }
    } catch (error) {
      console.error("Error fetching metrics:", error)
    }
  }

  const fetchHistory = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('movement_history')
        .select('*', { count: 'exact' })

      if (filter !== 'all') {
        query = query.eq('action_type', filter)
      }

      query = query.order('id', { ascending: false })

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching history:", error)
        alert(`Error al cargar historial: ${error.message}`)
        setHistory([])
      } else {
        console.log("Datos recibidos:", data) // Para debug
        setHistory(data || [])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      alert("Error inesperado al cargar el historial")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    fetchMetrics()
  }, [currentPage, filter, itemsPerPage])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const refreshHistory = async () => {
    await fetchHistory()
    await fetchMetrics()
  }

  const handleExport = async () => {
    let exportQuery = supabase
      .from('movement_history')
      .select('*')

    if (filter !== 'all') {
      exportQuery = exportQuery.eq('action_type', filter)
    }

    exportQuery = exportQuery.order('id', { ascending: false })

    const { data: allData, error: exportError } = await exportQuery

    if (exportError) {
      console.error("Error fetching data for export:", exportError)
      alert("Error al exportar datos")
      return
    }

    const dataToExport = (allData || []).map(item => {
      const parsedDetails = parseDetails(item.details)
      
      return {
        'Fecha': item.date,
        'Hora': item.time,
        'Usuario': item.user_name || 'N/A',
        'Producto': item.product_name,
        'Acción': item.action_type,
        'Cantidad': item.quantity,
        'Detalles': item.action_type === 'Entrada' 
            ? `Factura: ${parsedDetails.invoice_number || 'N/A'}` 
            : `Destino: ${parsedDetails.destination || 'N/A'}`
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const range = XLSX.utils.decode_range(worksheet['!ref']!)
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) }
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "HistorialMovimientos")

    const fileName = filter === 'all' 
      ? "Reporte_Historial_Completo.xlsx"
      : `Reporte_Historial_${filter}.xlsx`
    
    XLSX.writeFile(workbook, fileName)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center text-3xl font-bold mb-2">
          <History className="h-7 w-7 text-black mr-2" />
          <span className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Historial de Movimientos
          </span>
        </h1>
        <p className="text-muted-foreground">
          Auditoría de todas las entradas y salidas de productos
        </p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Movimientos Hoy"
          value={todayMovements}
          icon={<Activity className="text-blue-500 h-6 w-6" />}
        />
        <MetricCard
          title={filter === 'all' ? 'Total Entradas' : 'Total Entradas (Filtradas)'}
          value={totalEntries}
          icon={<TrendingUp className="text-green-500 h-6 w-6" />}
        />
        <MetricCard
          title={filter === 'all' ? 'Total Salidas' : 'Total Salidas (Filtradas)'}
          value={totalExits}
          icon={<TrendingDown className="text-red-500 h-6 w-6" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>
                {loading ? 'Cargando...' : `Mostrando ${history.length} de ${totalCount} transacciones`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                onClick={() => { setFilter('all'); setCurrentPage(1) }}
                size="sm"
              >
                Todos
              </Button>
              <Button 
                variant={filter === 'Entrada' ? 'default' : 'outline'} 
                onClick={() => { setFilter('Entrada'); setCurrentPage(1) }}
                size="sm"
              >
                Entradas
              </Button>
              <Button 
                variant={filter === 'Salida' ? 'default' : 'outline'} 
                onClick={() => { setFilter('Salida'); setCurrentPage(1) }}
                size="sm"
              >
                Salidas
              </Button>
              <Button onClick={refreshHistory} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm" disabled={loading || history.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 border-b border-gray-300">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Fecha</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Hora</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Usuario</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Producto</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Acción</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-right">Cantidad</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay transacciones registradas
                      {filter !== 'all' && <div className="text-sm mt-2">Intenta cambiar el filtro</div>}
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={`${item.action_type}-${item.id}`} className="border-t hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-800">{item.date}</TableCell>
                      <TableCell className="text-sm text-gray-800">{item.time}</TableCell>
                      <TableCell className="text-sm text-gray-700">{item.user_name || user?.email || 'Sistema'}</TableCell>
                      <TableCell className="font-medium text-sm text-gray-800">{item.product_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            item.action_type === 'Entrada'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {item.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm text-gray-800">{item.quantity}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {(() => {
                          const parsedDetails = parseDetails(item.details)
                          return item.action_type === 'Entrada' 
                            ? `${parsedDetails.invoice_number || 'N/A'}` 
                            : `${parsedDetails.destination || 'N/A'}`
                        })()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalCount > 0 && (
          <CardFooter className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-t bg-white w-full">
              {/* Selector de filas por página */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Filas por página:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[70px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Información de registros */}
              <div className="text-sm text-gray-600">
                Mostrando {totalCount === 0 ? 0 : startItem} - {endItem} de {totalCount}
              </div>

              {/* Controles de navegación */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}