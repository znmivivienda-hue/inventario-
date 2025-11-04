import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { LuminaSidebar } from '@/components/lumina-sidebar'
import { SearchBar } from '@/components/SearchBar'
import { NotificationBell } from '@/components/NotificationBell'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { Footer } from '@/components/Footer'
import { UserMenu } from '@/components/UserMenu'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MainLayout() {
  const { user } = useAuth()
  const [isDesktopView, setIsDesktopView] = useState(window.innerWidth >= 768)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768
      setIsDesktopView(isDesktop)
      if (isDesktop) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  if (!user) {
    return null
  }

  return (
    <>
      {/* Modal de perfil */}
      {user && (
        <EditProfileModal 
          user={user} 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />
      )}
      
      <div className="min-h-screen w-full flex bg-gray-50">
        {/* Overlay para mobile cuando sidebar está abierto */}
        {!isDesktopView && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <LuminaSidebar 
          isOpen={isSidebarOpen} 
          user={user}
          onToggle={toggleSidebar}
          isDesktopView={isDesktopView}
        />
        
        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Header moderno */}
          <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 to-blue-800 shadow-sm border-b border-blue-800">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 py-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Botón hamburguesa para móvil */}
                {!isDesktopView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-white hover:bg-blue-700 md:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                )}
                
                <h1 className="text-lg font-semibold text-white truncate">
                  {user.user_metadata.display_name || user.email?.split('@')[0]}
                </h1>
              </div>
              
              <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 max-w-md w-full px-4">
                <SearchBar />
              </div>

              <div className="flex items-center gap-3">
                <NotificationBell />
                
                {user && (
                  <UserMenu 
                    user={user} 
                    onEditProfile={() => setIsProfileModalOpen(true)} 
                  />
                )}
              </div>
            </div>
          </header>

          {/* Contenido Principal con scroll */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <motion.div
              initial={{ opacity: 0.0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="min-h-full px-4 sm:px-6 py-6 sm:py-8"
            >
              <Outlet />
            </motion.div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  )
}