import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    
    // Reiniciar la animación después de la transición
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-full bg-white hover:bg-slate-200 transition-colors shadow-sm overflow-hidden"
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      <div className="relative w-[22px] h-[22px]">
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                rotate: 0, 
                scale: 1,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              exit={{ 
                opacity: 0, 
                rotate: 90, 
                scale: 0.8,
                transition: { duration: 0.2, ease: "easeIn" }
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-[22px] h-[22px] text-black" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                rotate: 0, 
                scale: 1,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              exit={{ 
                opacity: 0, 
                rotate: -90, 
                scale: 0.8,
                transition: { duration: 0.2, ease: "easeIn" }
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-[22px] h-[22px] text-black" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Efecto de onda al hacer clic */}
      {isAnimating && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ 
            scale: 2, 
            opacity: 0,
            transition: { duration: 0.4, ease: "easeOut" }
          }}
          className="absolute inset-0 bg-slate-400 rounded-full"
        />
      )}
    </button>
  )
}