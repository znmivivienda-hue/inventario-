import { useState } from 'react'
import { createUser } from '@/lib/supabase/edge-functions'
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
import { UserPlus } from 'lucide-react'

type CreateUserModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    role: 'user' as 'admin' | 'user' | 'viewer'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createUser(
        formData.email,
        formData.password,
        formData.display_name,
        formData.role
      )

      toast({
        title: "Usuario creado",
        description: `El usuario ${formData.email} ha sido creado correctamente`,
      })

      setFormData({
        email: '',
        password: '',
        display_name: '',
        role: 'user'
      })
      
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
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
            <UserPlus className="h-5 w-5" />
            Crear Nuevo Usuario
          </DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo usuario del sistema
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre para mostrar *</Label>
            <Input
              id="display_name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
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
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}