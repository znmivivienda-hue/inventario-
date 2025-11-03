import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: number
  name: string
  category: string
  stock: number
  min_stock: number
  max_stock: number
  status: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setProducts([])
        setIsOpen(false)
        return
      }

      setLoading(true)
      const supabase = supabaseBrowser()
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(5)

        if (error) {
          console.error('Error searching products:', error)
          return
        }

        setProducts(data || [])
        setIsOpen(true)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const delayedSearch = setTimeout(searchProducts, 300)
    return () => clearTimeout(delayedSearch)
  }, [query])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'text-green-600 bg-green-100'
      case 'Low Stock': return 'text-yellow-600 bg-yellow-100'
      case 'Out of Stock': return 'text-red-600 bg-red-100'
      case 'Over Stock': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const clearSearch = () => {
    setQuery('')
    setProducts([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Buscar productos..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
        />
        {query && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Buscando...
              </div>
            ) : products.length > 0 ? (
              <div className="py-2">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{product.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-300">
                          <span>Stock: <strong>{product.stock}</strong></span>
                          <span>Min: {product.min_stock}</span>
                          <span>Max: {product.max_stock}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No se encontraron productos
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}