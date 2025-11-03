import { useState, useEffect } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function useIsAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const supabase = supabaseBrowser()
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(data?.role === 'admin' && data?.is_active === true)
      }
      
      setLoading(false)
    }

    checkAdmin()
  }, [user])

  return { isAdmin, loading }
}