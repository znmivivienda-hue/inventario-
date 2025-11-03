import { Facebook, Instagram, Phone } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full py-3 text-xs flex flex-col items-center justify-center gap-2 select-none bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300 mt-auto">
      {/* Fila principal con logo y copyright */}
      <div className="flex items-center gap-2">
        {/* Logo KJAX */}
        <span className="inline-flex items-center">
          <svg className="h-5 w-5" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path 
              d="M20 20v60h15V56l15 24h18L48 50l20-30H50L35 42V20H20Z" 
              fill="#00B4E6" 
            />
          </svg>
          {/* Punto verde animado */}
          <span className="relative -ml-1 -mt-3 inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#19C37D] opacity-60 animate-ping"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#19C37D] shadow-[0_0_6px_1px_rgba(25,195,125,.6)]"></span>
          </span>
        </span>

        {/* Texto de copyright */}
        <span className="inline-flex items-center gap-1 font-medium">
          <span className="opacity-80">© {currentYear}</span>
          <span className="font-semibold tracking-tight">
            Derechos reservados por KJAX Systems
          </span>
        </span>
      </div>

      {/* Fila de contacto y redes sociales */}
      <div className="flex items-center gap-4 text-[11px] opacity-70 hover:opacity-100 transition-opacity">
        {/* Contacto */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Contáctanos:</span>
          <a 
            href="tel:70268044" 
            className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Llamar al 70268044"
          >
            <Phone className="h-3 w-3" />
            <span>70268044</span>
          </a>
        </div>

        {/* Separador */}
        <span className="text-gray-400">•</span>

        {/* Redes sociales */}
        <div className="flex items-center gap-2">
          <a 
            href="https://www.facebook.com/profile.php?id=61578174399123" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transition-transform"
            aria-label="Facebook"
          >
            <Facebook className="h-3.5 w-3.5" />
          </a>
          <a 
            href="https://www.instagram.com/kjaxsystems/?igsh=NW10ZjVmbjhjcDht" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors hover:scale-110 transition-transform"
            aria-label="Instagram"
          >
            <Instagram className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}