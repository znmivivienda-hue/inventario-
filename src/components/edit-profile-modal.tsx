import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

interface EditProfileModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

const formSchema = z.object({
  full_name: z.string().min(3, "El nombre es muy corto.").max(50, "El nombre es muy largo."),
  email: z.string().email("Email inválido.").optional(),
  phone: z.string().optional(),
})

export function EditProfileModal({ user, isOpen, onClose }: EditProfileModalProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.user_metadata?.full_name || '',
      email: user.email || '',
      phone: user.phone || user.user_metadata?.phone || '',
    },
  })
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const supabase = supabaseBrowser()
    
    const initialFullName = user.user_metadata?.full_name || ''
    const initialEmail = user.email || ''
    const initialPhone = user.phone || user.user_metadata?.phone || ''

    const hasFullNameChanged = data.full_name !== initialFullName
    const hasEmailChanged = data.email && data.email !== initialEmail
    const hasPhoneChanged = data.phone !== initialPhone

    if (!hasFullNameChanged && !hasEmailChanged && !hasPhoneChanged) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios para guardar.",
      })
      return
    }

    
    const updates: { email?: string; phone?: string; data?: { full_name?: string; phone?: string } } = {}

    if (hasEmailChanged) {
      updates.email = data.email
      
    }
    if (hasFullNameChanged) {
      if (!updates.data) updates.data = {}
      updates.data.full_name = data.full_name
    }
    if (hasPhoneChanged) {
      updates.phone = data.phone
      if (!updates.data) updates.data = {}
      updates.data.phone = data.phone
    }

    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
      console.error('Error al actualizar el perfil:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Éxito",
      description: "Perfil actualizado exitosamente.",
    })
    
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Tu nombre completo" 
                      autoComplete="name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="tu@email.com" 
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Ej: 88887777" 
                      autoComplete="tel"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}