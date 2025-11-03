import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteProductAlertProps {
  productId: number
  productName: string
  onProductDeleted: () => void
}

export function DeleteProductAlert({ productId, productName, onProductDeleted }: DeleteProductAlertProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = supabaseBrowser()

  async function handleDelete() {
    setLoading(true)
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente.",
      })
      onProductDeleted()
    }
    
    setLoading(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el producto "{productName}" de tu inventario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
