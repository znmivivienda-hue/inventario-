import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Verificar localStorage primero, luego preferencias del sistema
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme
      if (stored) return stored
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Agregar clase de transición para animaciones suaves
    root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
    
    // Aplicar el tema
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme)
    
    // Aplicar transiciones a elementos específicos
    document.body.style.transition = 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    
    // Agregar transiciones CSS globales
    const style = document.createElement('style')
    style.textContent = `
      * {
        transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                    color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      .theme-transition {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `
    
    if (!document.getElementById('theme-transitions')) {
      style.id = 'theme-transitions'
      document.head.appendChild(style)
    }
    
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}