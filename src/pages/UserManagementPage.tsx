import { useState, useEffect } from 'react'
import { supabaseBrowser } from "@/lib/supabase/client"
import { useIsAdmin } from '@/hooks/useIsAdmin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, Search, Shield, Ban, Check, Pencil, Key } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { CreateUserModal } from '@/components/CreateUserModal'
import { EditUserModal } from '@/components/EditUserModal'
import { ChangePasswordModal } from '@/components/ChangePasswordModal'

type UserData = {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'user' | 'viewer'
  is_active: boolean
  created_at: string
}

export default function UserManagementPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const { toast } = useToast()
  const [supabase] = useState(() => supabaseBrowser())
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [changingPasswordUser, setChangingPasswordUser] = useState<UserData | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Llamar a la función RPC para obtener usuarios
      const { data: authUsers, error: usersError } = await supabase.rpc('get_all_users')
      
      if (usersError) throw usersError

      // Obtener roles de usuarios
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')

      if (rolesError) throw rolesError

      // Combinar datos
      const combinedUsers: UserData[] = authUsers.map((u: any) => {
        const userRole = roles?.find(r => r.user_id === u.id)
        return {
          id: u.id,
          email: u.email || '',
          display_name: u.display_name || u.email?.split('@')[0] || 'Sin nombre',
          role: userRole?.role || 'user',
          is_active: userRole?.is_active ?? true,
          created_at: u.created_at
        }
      })

      setUsers(combinedUsers)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      // Actualizar optimistamente el estado local
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        )
      )

      // Hacer la actualización en la base de datos
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: currentStatus ? "Usuario desactivado" : "Usuario activado",
        description: `El usuario ha sido ${currentStatus ? 'desactivado' : 'activado'} correctamente`,
      })
      
    } catch (error: any) {
      console.error('Error toggling user status:', error)
      
      // Si hay error, revertir el cambio optimista
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, is_active: currentStatus } : u
        )
      )
      
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      })
    }
  }

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center text-3xl font-bold mb-2">
          <Users className="h-7 w-7 text-black mr-2" />
          <span className="bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Gestión de Usuarios
          </span>
        </h1>
        <p className="text-muted-foreground">
          Administra los usuarios que tienen acceso al sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                {loading ? 'Cargando...' : `${filteredUsers.length} usuario(s) registrado(s)`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200 border-b border-gray-300">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Email</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900">Nombre</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Rol</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Estado</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-900 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userData) => (
                    <TableRow key={userData.id} className="border-t hover:bg-gray-50">
                      <TableCell className="text-sm text-gray-800">{userData.email}</TableCell>
                      <TableCell className="text-sm text-gray-800">{userData.display_name}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            userData.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-100'
                              : userData.role === 'user'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                          }
                        >
                          {userData.role === 'admin' ? 'Admin' : userData.role === 'user' ? 'Usuario' : 'Visualizador'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            userData.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-red-100 text-red-800 hover:bg-red-100'
                          }
                        >
                          {userData.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(userData)}
                            title="Editar usuario"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setChangingPasswordUser(userData)}
                            title="Cambiar contraseña"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(userData.id, userData.is_active)}
                            title={userData.is_active ? 'Desactivar' : 'Activar'}
                            className={userData.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {userData.is_active ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />
      
      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={fetchUsers}
        />
      )}

      {changingPasswordUser && (
        <ChangePasswordModal
          isOpen={!!changingPasswordUser}
          user={changingPasswordUser}
          onClose={() => setChangingPasswordUser(null)}
        />
      )}
    </div>
  )
}