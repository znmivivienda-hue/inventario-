import { useState, useEffect } from 'react'
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Pencil } from 'lucide-react'

type UserData = {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'user' | 'viewer'
  is_active: boolean
}

type EditUserModalProps = {
  isOpen: boolean
  user: UserData
  onClose: () => void
  onSuccess: () => void
}

export function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
  const { toast } = useToast()
  const [supabase] = useState(() => supabaseBrowser())
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: user.display_name,
    role: user.role
  })

  useEffect(() => {
    setFormData({
      display_name: user.display_name,
      role: user.role
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Actualizar solo el rol en user_roles (esto SÍ funciona desde el cliente)
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', user.id)

      if (roleError) throw roleError

      // Para actualizar el display_name, necesitamos usar una función RPC
      // Primero verificamos si existe la función
      const { error: metadataError } = await supabase.rpc('update_user_metadata', {
        target_user_id: user.id,
        new_display_name: formData.display_name
      })

      // Si la función no existe, solo actualizamos el rol
      if (metadataError && metadataError.code !== 'PGRST202') {
        console.warn('No se pudo actualizar el nombre:', metadataError)
        toast({
          title: "Rol actualizado",
          description: `El rol de ${user.email} ha sido actualizado. El nombre no se pudo cambiar (requiere configuración adicional).`,
        })
      } else {
        toast({
          title: "Usuario actualizado",
          description: `Los datos de ${user.email} han sido actualizados correctamente`,
        })
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Usuario
          </DialogTitle>
          <DialogDescription>
            Modifica los datos de {user.email}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-display_name">Nombre para mostrar</Label>
            <Input
              id="edit-display_name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              required
            />
            <p className="text-xs text-yellow-600">
              ⚠️ Nota: El cambio de nombre requiere configuración adicional en Supabase. Por ahora solo se actualizará el rol.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Rol *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'user' | 'viewer') => 
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}