import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, Box, AlertTriangle, XCircle } from "lucide-react"
import { supabaseBrowser } from '@/lib/supabase/client'
import { CreateProductModal } from "@/components/CreateProductModal"
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EditProductForm } from '@/components/EditProductForm'
import { DeleteProductAlert } from '@/components/DeleteProductAlert'
import { MetricCard } from '../components/MetricCard'
import { StatusBadge } from '../components/StatusBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type Product = {
  id: number
  name: string
  category: string
  stock: number
  min_stock: number
  max_stock: number
  status: 'En Stock' | 'Stock Bajo' | 'Sin Stock' | 'Sobre Stock'
  created_at: string
}

export default function InventoryPage() {
  const [supabase] = useState(() => supabaseBrowser())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchProducts = async () => {
    setLoading(true)
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
    }

    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    query = query.range(from, to).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error("Error al obtener productos:", error)
      setProducts([])
    } else {
      setProducts(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [supabase, currentPage, searchTerm, itemsPerPage])

  // Métricas calculadas
  const stockBajoCount = useMemo(
    () => products.filter(p => p.status === 'Stock Bajo').length,
    [products]
  )

  const sinStockCount = useMemo(
    () => products.filter(p => p.status === 'Sin Stock').length,
    [products]
  )

  const totalProducts = useMemo(
    () => products.length,
    [products]
  )

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

  // Función para calcular el porcentaje de stock
  const getStockPercentage = (stock: number, min: number, max: number) => {
    if (max <= min) return stock > 0 ? 100 : 0
    return Math.min(100, Math.max(0, ((stock - min) / (max - min)) * 100))
  }

  // Función para obtener el color de la barra
  const getStockBarColor = (stock: number, min: number, max: number) => {
    if (stock === 0) return 'bg-red-300'
    if (stock <= min) return 'bg-red-300'
    if (stock <= min + (max - min) * 0.3) return 'bg-yellow-300'
    if (stock > max) return 'bg-blue-300'
    return 'bg-green-300'
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center text-3xl font-bold mb-2">
          <Box className="h-7 w-7 text-black mr-2" />
          <span className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Inventario
          </span>
        </h1>
        <p className="text-muted-foreground">
          Gestiona el stock de productos terminados e ingredientes
        </p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Stock Bajo"
          value={stockBajoCount}
          icon={<AlertTriangle className="text-yellow-500 h-6 w-6" />}
        />
        <MetricCard
          title="Sin Stock"
          value={sinStockCount}
          icon={<XCircle className="text-red-500 h-6 w-6" />}
        />
        <MetricCard
          title="Total Productos"
          value={totalProducts}
          icon={<Box className="text-blue-500 h-6 w-6" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className='flex-1'>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              Lista de todos los productos en tu inventario.
            </CardDescription>
          </div>
          <div className='flex-1 flex justify-end gap-2'>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nombre o categoría..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                    }}
                />
            </div>
            <CreateProductModal onProductCreated={fetchProducts} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 border-b border-gray-300">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">ID Producto</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Nombre</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Categoría</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Stock</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Estado</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-right">Stock Mín/Máx</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={7}><Skeleton className="h-5 w-full" /></TableCell>
                      </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((item) => {
                    const stockPercentage = getStockPercentage(item.stock, item.min_stock, item.max_stock)
                    const barColor = getStockBarColor(item.stock, item.min_stock, item.max_stock)
                    
                    return (
                      <TableRow key={item.id} className="border-t hover:bg-gray-50">
                        <TableCell className="text-center text-sm text-gray-800">
                          {`PROD-${String(item.id).padStart(3, '0')}`}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-gray-800 text-center">{item.name}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-sm font-medium text-gray-700">{item.stock}</span>
                            <span className="text-xs font-semibold text-gray-600">{`${Math.round(stockPercentage)}%`}</span>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`${barColor} h-full transition-all duration-500`}
                                style={{ width: `${stockPercentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-800">{`${item.min_stock} / ${item.max_stock}`}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                              <EditProductForm product={item} onProductUpdated={fetchProducts} />
                              <DeleteProductAlert productId={item.id} productName={item.name} onProductDeleted={fetchProducts} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
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