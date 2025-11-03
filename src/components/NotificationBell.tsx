import { useState, useEffect } from 'react'
import { Bell, Package, AlertTriangle, CheckCircle } from 'lucide-react'

import { supabaseBrowser } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'over_stock'
  title: string
  message: string
  productName: string
  productId: number
  timestamp: Date
  read: boolean
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const cleanOldNotifications = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    setNotifications(prev => {
      const filtered = prev.filter(notification => 
        notification.timestamp > oneDayAgo
      )
      // Update unread count after filtering
      const unreadFiltered = filtered.filter(n => !n.read)
      setUnreadCount(unreadFiltered.length)
      return filtered
    })
  }

  const checkProductStatuses = async () => {
    const supabase = supabaseBrowser()
    
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      const newNotifications: Notification[] = []

      products?.forEach((product) => {
        const { id, name, stock, min_stock, max_stock } = product

        if (stock === 0) {
          newNotifications.push({
            id: `out_stock_${id}_${Date.now()}`,
            type: 'out_of_stock',
            title: 'Producto agotado',
            message: `${name} está sin stock`,
            productName: name,
            productId: id,
            timestamp: new Date(),
            read: false
          })
        } else if (stock <= min_stock) {
          newNotifications.push({
            id: `low_stock_${id}_${Date.now()}`,
            type: 'low_stock',
            title: 'Stock bajo',
            message: `${name} tiene poco stock (${stock} unidades)`,
            productName: name,
            productId: id,
            timestamp: new Date(),
            read: false
          })
        } else if (stock > max_stock) {
          newNotifications.push({
            id: `over_stock_${id}_${Date.now()}`,
            type: 'over_stock',
            title: 'Exceso de stock',
            message: `${name} tiene stock excesivo (${stock} unidades)`,
            productName: name,
            productId: id,
            timestamp: new Date(),
            read: false
          })
        }
      })

      // Clear old notifications and add new ones
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error checking product statuses:', error)
    }
  }

  useEffect(() => {
    // Initial check
    checkProductStatuses()
    
    // Auto-update every 2 hours (7200000 ms)
    const updateInterval = setInterval(() => {
      checkProductStatuses()
    }, 2 * 60 * 60 * 1000)
    
    // Clean old notifications daily (24 hours)
    const cleanupInterval = setInterval(() => {
      cleanOldNotifications()
    }, 24 * 60 * 60 * 1000)
    
    return () => {
      clearInterval(updateInterval)
      clearInterval(cleanupInterval)
    }
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  //const removeNotification = (notificationId: string) => {
    //const notification = notifications.find(n => n.id === notificationId)
    //setNotifications(prev => prev.filter(n => n.id !== notificationId))
    //if (notification && !notification.read) {
     // setUnreadCount(prev => Math.max(0, prev - 1))
    //}
 // }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return (
          <div className="flex-shrink-0 mt-0.5 p-1.5 bg-red-100 rounded-full">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
        )
      case 'low_stock':
        return (
          <div className="flex-shrink-0 mt-0.5 p-1.5 bg-yellow-100 rounded-full">
            <Package className="h-4 w-4 text-yellow-500" />
          </div>
        )
      case 'over_stock':
        return (
          <div className="flex-shrink-0 mt-0.5 p-1.5 bg-blue-100 rounded-full">
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 mt-0.5 p-1.5 bg-slate-100 rounded-full">
            <Bell className="h-4 w-4 text-slate-500" />
          </div>
        )
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white hover:bg-slate-200 transition-colors shadow-sm"
        aria-label="Notificaciones"
      >
        <Bell className="w-[22px] h-[22px] text-black" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-lg border border-slate-200 z-50 max-h-96 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-700">Notificaciones</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-b-0 ${
                        !notification.read ? 'bg-sky-50/70' : ''
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono con fondo */}
                        {getNotificationIcon(notification.type)}
                        
                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs whitespace-normal ${!notification.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {/* Punto indicador de no leído */}
                        {!notification.read && (
                          <div className="flex-shrink-0 self-start mt-1">
                            <span className="w-2 h-2 bg-sky-500 rounded-full block"></span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No hay notificaciones nuevas.
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50/30">
                <button 
                  onClick={checkProductStatuses}
                  className="w-full text-sm text-sky-600 hover:underline font-medium"
                >
                  Actualizar notificaciones
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}