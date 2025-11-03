import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useAuth } from '@/contexts/AuthContext'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Combobox } from "@/components/ui/Combobox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabaseBrowser } from "@/lib/supabase/client"
import { type Product } from "@/pages/InventoryPage"
import { PackagePlus, Package, TrendingUp, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  productId: z.string({
    required_error: "Por favor selecciona un producto.",
  }),
  quantity: z.coerce.number().int().positive({
    message: "La cantidad debe ser un número positivo.",
  }),
  invoice_number: z.string().optional(),
})

interface ProductEntry {
  id: number
  quantity: number
  invoice_number: string | null
  created_at: string
  user_email: string | null
}

export default function EntryPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [supabase] = useState(() => supabaseBrowser())
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productEntries, setProductEntries] = useState<ProductEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })
      
      if (productsError) {
        console.error("Error al cargar productos:", productsError)
      } else if (productsData) {
        setProducts(productsData)
      }
    }
    fetchProducts()
  }, [supabase])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 0,
      invoice_number: "",
    },
  })

  const watchedProductId = form.watch("productId")

  // Fetch product details and entries when product is selected
  useEffect(() => {
    if (watchedProductId) {
      const product = products.find(p => p.id.toString() === watchedProductId)
      setSelectedProduct(product || null)

      // Fetch recent entries for this product
      const fetchProductEntries = async () => {
        setLoadingEntries(true)
        const { data, error } = await supabase
          .from('product_entries')
          .select('*')
          .eq('product_id', parseInt(watchedProductId))
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error("Error fetching product entries:", error)
        } else {
          setProductEntries(data || [])
        }
        setLoadingEntries(false)
      }

      fetchProductEntries()
    } else {
      setSelectedProduct(null)
      setProductEntries([])
    }
  }, [watchedProductId, products, supabase])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedProd = products.find(p => p.id.toString() === values.productId)

    if (!selectedProd) {
      toast({
        title: "Error",
        description: "El producto seleccionado no es válido.",
        variant: "destructive",
      })
      return
    }

    const newStock = selectedProd.stock + values.quantity
    const newStatus = 
        newStock > selectedProd.max_stock ? 'Over Stock' :
        newStock > selectedProd.min_stock ? 'In Stock' :
        newStock > 0 ? 'Low Stock' : 'Out of Stock'

    // 1. Actualizar el stock del producto
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock, status: newStatus })
      .eq('id', selectedProd.id)

    if (updateError) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el stock: ${updateError.message}`,
        variant: "destructive",
      })
      return
    }

    // 2. Registrar la entrada (esto automáticamente aparecerá en movement_history)
    const { error: entryError } = await supabase
      .from('product_entries')
      .insert({
        product_id: selectedProd.id,
        quantity: values.quantity,
        invoice_number: values.invoice_number || null,
        user_id: user?.id
      })

    if (entryError) {
      console.error("Error al registrar la entrada:", entryError)
      toast({
        title: "Error",
        description: `No se pudo registrar la entrada: ${entryError.message}`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Entrada Registrada",
      description: `${values.quantity} unidades de ${selectedProd.name} han sido añadidas al inventario.`,
    })
    
    // Update selected product with new stock
    setSelectedProduct({...selectedProd, stock: newStock, status: newStatus as any})
    
    form.reset({ quantity: 0, invoice_number: "", productId: values.productId })
    
    // Actualizar lista de entradas
    const { data: updatedEntries } = await supabase
      .from('product_entries')
      .select('*')
      .eq('product_id', selectedProd.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (updatedEntries) {
      setProductEntries(updatedEntries)
    }
  }

  const getStockPercentage = (stock: number, min: number, max: number) => {
    if (max <= min) return stock > 0 ? 100 : 0
    return Math.min(100, Math.max(0, ((stock - min) / (max - min)) * 100))
  }

  const getStockBarColor = (stock: number, min: number, max: number) => {
    if (stock === 0) return 'bg-red-500'
    if (stock <= min) return 'bg-red-500'
    if (stock <= min + (max - min) * 0.3) return 'bg-yellow-500'
    if (stock > max) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center text-3xl font-bold mb-2">
          <PackagePlus className="h-7 w-7 text-black mr-2" />
          <span className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Ingreso de Stock
          </span>
        </h1>
        <p className="text-muted-foreground">
          Registra entradas de productos a tu inventario
        </p>
      </div>

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna Izquierda: Formulario (40%) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Registrar Nueva Entrada</CardTitle>
              <CardDescription>
                Selecciona un producto y la cantidad a ingresar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Producto *</FormLabel>
                        <FormControl>
                          <Combobox
                            options={products.map(item => ({ 
                              label: item.name, 
                              value: item.id.toString() 
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecciona un producto..."
                            searchPlaceholder="Buscar producto..."
                            emptyText="No se encontró el producto."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad a Ingresar *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            className="text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="invoice_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Factura (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: F-00123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base"
                    disabled={!selectedProduct}
                  >
                    <PackagePlus className="mr-2 h-5 w-5" />
                    Registrar Entrada
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Información del Producto (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {selectedProduct ? (
            <>
              {/* Card de Información del Producto */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedProduct.name}</CardTitle>
                      <CardDescription className="mt-1">
                        ID: PROD-{String(selectedProduct.id).padStart(3, '0')} • Categoría: {selectedProduct.category}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={
                        selectedProduct.status === 'En Stock'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : selectedProduct.status === 'Stock Bajo'
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          : selectedProduct.status === 'Sobre Stock'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {selectedProduct.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    {/* Stock Actual */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground mb-2">Stock Actual</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">{selectedProduct.stock}</span>
                        <span className="text-sm text-muted-foreground">unidades</span>
                      </div>
                    </div>

                    {/* Rango de Stock */}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-muted-foreground mb-2">Rango</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Mín:</span>
                          <span className="text-lg font-semibold">{selectedProduct.min_stock}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Máx:</span>
                          <span className="text-lg font-semibold">{selectedProduct.max_stock}</span>
                        </div>
                      </div>
                    </div>

                    {/* Indicador Visual */}
                    <div className="flex flex-col justify-center">
                      {selectedProduct.stock <= selectedProduct.min_stock && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="text-sm font-medium">Stock Crítico</span>
                        </div>
                      )}
                      {selectedProduct.stock > selectedProduct.min_stock && selectedProduct.stock <= selectedProduct.min_stock + (selectedProduct.max_stock - selectedProduct.min_stock) * 0.3 && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="text-sm font-medium">Stock Bajo</span>
                        </div>
                      )}
                      {selectedProduct.stock > selectedProduct.min_stock + (selectedProduct.max_stock - selectedProduct.min_stock) * 0.3 && selectedProduct.stock <= selectedProduct.max_stock && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Package className="h-5 w-5" />
                          <span className="text-sm font-medium">Stock Normal</span>
                        </div>
                      )}
                      {selectedProduct.stock > selectedProduct.max_stock && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm font-medium">Sobre Stock</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Nivel de Stock</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {Math.round(getStockPercentage(selectedProduct.stock, selectedProduct.min_stock, selectedProduct.max_stock))}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getStockBarColor(selectedProduct.stock, selectedProduct.min_stock, selectedProduct.max_stock)}`}
                        style={{ 
                          width: `${getStockPercentage(selectedProduct.stock, selectedProduct.min_stock, selectedProduct.max_stock)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Historial de Entradas */}
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Entradas de este Producto</CardTitle>
                  <CardDescription>
                    Historial de las 5 entradas más recientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-xs font-bold uppercase">Cantidad</TableHead>
                        <TableHead className="text-xs font-bold uppercase">N° Factura</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Usuario</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingEntries ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : productEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No hay entradas registradas para este producto
                          </TableCell>
                        </TableRow>
                      ) : (
                        productEntries.map((entry) => (
                          <TableRow key={entry.id} className="hover:bg-gray-50">
                            <TableCell>
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                                +{entry.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{entry.invoice_number || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {entry.user_email || 'Sistema'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(entry.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-[500px]">
                <div className="text-center text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">Selecciona un producto</p>
                  <p className="text-sm mt-2">Elige un producto del formulario para ver su información</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}