import { useEffect } from "react"
import { Phone, Facebook, Instagram, Sparkles } from "lucide-react"
import { useWelcome } from "@/contexts/WelcomeContext"

export default function WelcomeMessage() {
  const { show, nombre, hideWelcome, onNavigate } = useWelcome()

  useEffect(() => {
    if (show && onNavigate) {
      // Navegar después de 3.3 segundos
      const navigateTimeout = setTimeout(() => {
        onNavigate()
      }, 3300)
      
      // Ocultar después de 3.5 segundos
      const hideTimeout = setTimeout(hideWelcome, 3500)
      
      return () => {
        clearTimeout(navigateTimeout)
        clearTimeout(hideTimeout)
      }
    }
  }, [show, onNavigate, hideWelcome])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 backdrop-blur-sm">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card principal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full mx-4 animate-fade-in-up">
        {/* Logo/Icono */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
            <div className="relative bg-white rounded-2xl w-24 h-24 flex items-center justify-center shadow-xl p-2">
              <img 
                src="/logo.jpg" 
                alt="KJAX Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Saludo personalizado */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-500 h-5 w-5 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800">
              ¡Bienvenido, {nombre}!
            </h2>
            <Sparkles className="text-yellow-500 h-5 w-5 animate-pulse" />
          </div>
          <p className="text-sm text-gray-600">
            Has ingresado exitosamente
          </p>
        </div>

        {/* Información de la empresa */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-3">
            KJAX Systems
          </h3>
          <p className="text-center text-sm text-gray-600 mb-4">
            Soluciones profesionales de gestión de inventario
          </p>

          {/* Contacto */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <Phone className="h-4 w-4 text-blue-600" />
              <a 
                href="tel:70268044" 
                className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors"
              >
                70268044
              </a>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="flex items-center justify-center gap-3">
            <a 
              href="https://www.facebook.com/tupagina" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <Facebook className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                Facebook
              </span>
            </a>
            <a 
              href="https://www.instagram.com/tupagina" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <Instagram className="h-5 w-5 text-pink-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                Instagram
              </span>
            </a>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 animate-progress-bar"></div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3">
          Redirigiendo al dashboard...
        </p>
      </div>
    </div>
  )
}