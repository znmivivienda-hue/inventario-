import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Edit } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  stock: z.coerce.number().int().min(0),
  min_stock: z.coerce.number().int().positive(),
  max_stock: z.coerce.number().int().positive(),
}).refine((data) => data.max_stock >= data.min_stock, {
  message: "El stock máximo debe ser mayor o igual al mínimo",
  path: ["max_stock"],
})

interface Product {
  id: number
  name: string
  category: string
  stock: number
  min_stock: number
  max_stock: number
  status: string
}

interface EditProductFormProps {
  product: Product
  onProductUpdated: () => void
}

export function EditProductForm({ product, onProductUpdated }: EditProductFormProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const supabase = supabaseBrowser()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      stock: product.stock,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = 
      values.stock > values.max_stock ? 'Over Stock' :
      values.stock > values.min_stock ? 'In Stock' :
      values.stock > 0 ? 'Low Stock' : 'Out of Stock'

    const { error } = await supabase
      .from('products')
      .update({ ...values, status })
      .eq('id', product.id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Éxito",
      description: "Producto actualizado correctamente.",
    })

    setOpen(false)
    onProductUpdated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
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
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Actual</FormLabel>
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
              Actualizar Producto
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}