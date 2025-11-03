interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  bgColor?: string
}

export function MetricCard({ title, value, icon, bgColor = "bg-white" }: MetricCardProps) {
  return (
    <div className={`${bgColor} rounded-lg border border-gray-200 shadow-sm p-6 flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="flex-shrink-0">
        {icon}
      </div>
    </div>
  )
}