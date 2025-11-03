import { User } from '@supabase/supabase-js'
import { UserCircle, LogOut } from 'lucide-react'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface UserMenuProps {
  user: User
  onEditProfile: () => void
}

export function UserMenu({ user, onEditProfile }: UserMenuProps) {
  const [supabase] = useState(() => supabaseBrowser())

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="p-1.5 rounded-full bg-white hover:bg-slate-200 transition-colors shadow-sm"
          aria-label="Menú de usuario"
        >
          <UserCircle className="w-7 h-7 text-black" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-60 p-0 bg-white shadow-lg rounded-xl border border-slate-200/80" align="end">
        <div className="p-3 border-b border-slate-200/80">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {user.user_metadata.display_name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {user.email}
          </p>
        </div>
        
        <div className="p-2">
          <button
            onClick={onEditProfile}
            className="w-full flex items-center gap-2 px-2 py-2 text-left text-slate-700 hover:bg-slate-100/80 text-sm rounded transition-colors"
          >
            <UserCircle className="h-4 w-4 text-slate-500" />
            <span>Perfil</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2 py-2 text-left text-red-600 hover:bg-red-50/80 text-sm rounded-b-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}