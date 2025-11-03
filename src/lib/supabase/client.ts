import { createBrowserClient } from '@supabase/ssr'

// Este cliente se usa en TODOS los Componentes de Cliente
export const supabaseBrowser = () => {
    return createBrowserClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
    )
}