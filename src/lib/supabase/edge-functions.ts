import { supabaseBrowser } from './client'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export async function changeUserPassword(userId: string, newPassword: string) {
  const supabase = supabaseBrowser()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No hay sesión activa')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/change-user-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      newPassword,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error al cambiar la contraseña')
  }

  return data
}

export async function createUser(
  email: string, 
  password: string, 
  display_name: string, 
  role: 'admin' | 'user' | 'viewer'
) {
  const supabase = supabaseBrowser()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('No hay sesión activa')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      display_name,
      role,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error al crear el usuario')
  }

  return data
}