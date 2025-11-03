import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  category: z.string().min(2, { message: "La categoría es requerida." }),
  stock: z.coerce.number().int().min(0),
  min_stock: z.coerce.number().int().positive(),
  max_stock: z.coerce.number().int().positive(),
}).refine((data) => data.max_stock >= data.min_stock, {
  message: "El stock máximo debe ser mayor o igual al mínimo",
  path: ["max_stock"],
})

interface CreateProductModalProps {
  onProductCreated: () => void
}

export function CreateProductModal({ onProductCreated }: CreateProductModalProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const supabase = supabaseBrowser()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      stock: 0,
      min_stock: 1,
      max_stock: 100,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = 
      values.stock > values.max_stock ? 'Over Stock' :
      values.stock > values.min_stock ? 'In Stock' :
      values.stock > 0 ? 'Low Stock' : 'Out of Stock'

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({ ...values, status })
      .select()
      .single()

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el producto.",
        variant: "destructive",
      })
      return
    }

    // Save to movement history if initial stock > 0
    if (values.stock > 0 && newProduct) {
      const now = new Date()
      const { error: historyError } = await supabase
        .from('movement_history')
        .insert({
          product_name: newProduct.name,
          action_type: 'Entrada',
          quantity: values.stock,
          details: {
            invoice_number: 'Creación de producto'
          },
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().split(' ')[0],
          user_name: user?.email || 'Sistema'
        })

      if (historyError) {
        console.error("Error al registrar en historial:", historyError)
      } else {
        console.log("Historial guardado correctamente para creación de producto:", {
          product_name: newProduct.name,
          action_type: 'Entrada',
          quantity: values.stock,
          user_name: user?.email || 'Sistema'
        })
      }
    }

    toast({
      title: "Éxito",
      description: "Producto creado correctamente.",
    })

    form.reset()
    setOpen(false)
    onProductCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Producto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Inicial</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Máximo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Crear Producto
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}