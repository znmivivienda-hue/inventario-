interface StatusBadgeProps {
  status: 'En Stock' | 'Stock Bajo' | 'Sin Stock' | 'Sobre Stock'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'En Stock':
        return 'bg-green-100 text-green-800'
      case 'Stock Bajo':
        return 'bg-yellow-100 text-yellow-800'
      case 'Sin Stock':
        return 'bg-red-100 text-red-800'
      case 'Sobre Stock':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusStyles()}`}>
      {status}
    </span>
  )
}