import { useState } from 'react'
import { changeUserPassword } from '@/lib/supabase/edge-functions'
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
import { useToast } from '@/hooks/use-toast'
import { Key, Copy, Check, RefreshCw } from 'lucide-react'

type UserData = {
  id: string
  email: string
  display_name: string
}

type ChangePasswordModalProps = {
  isOpen: boolean
  user: UserData
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, user, onClose }: ChangePasswordModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setNewPassword(password)
    setShowPassword(true)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newPassword)
      setCopied(true)
      toast({
        title: "Copiado",
        description: "La contraseña ha sido copiada al portapapeles",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la contraseña",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await changeUserPassword(user.id, newPassword)

      toast({
        title: "Contraseña actualizada",
        description: `La contraseña de ${user.email} ha sido actualizada correctamente`,
      })

      // Mostrar la contraseña por unos segundos antes de cerrar
      setTimeout(() => {
        setNewPassword('')
        setShowPassword(false)
        setCopied(false)
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setNewPassword('')
      setShowPassword(false)
      setCopied(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription>
            Genera y establece una nueva contraseña para {user.email}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña *</Label>
            <div className="flex gap-2">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Haz click en 'Generar'"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="font-mono"
                disabled={loading}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={generatePassword}
                disabled={loading}
                title="Generar contraseña aleatoria"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres. Se recomienda usar el generador automático.
            </p>
          </div>

          {newPassword && showPassword && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Contraseña generada:
                  </p>
                  <p className="text-lg font-mono text-blue-700 break-all select-all">
                    {newPassword}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="shrink-0"
                  disabled={loading}
                  title="Copiar contraseña"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-blue-800">
                💡 Copia esta contraseña para compartirla con el usuario de forma segura.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !newPassword}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}