import { TopProductData } from '@/types/dashboard'

interface TopProductsCardProps {
  title: string
  items: TopProductData[]
  icon: React.ReactNode
}

export function TopProductsCard({ title, items, icon }: TopProductsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h3>
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.slice(0, 5).map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <span className="text-gray-700 dark:text-gray-300 text-sm truncate flex-1 mr-2">
                {item.product_name}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {item.total_quantity}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}