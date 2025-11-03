import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MonthlyData } from '@/types/dashboard'

interface LineChartCardProps {
  data: MonthlyData[]
  title: string
  lineColor: string
}

export function LineChartCard({ data, title, lineColor }: LineChartCardProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Tendencia de movimientos en el tiempo
        </p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" opacity={0.5} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              className="dark:stroke-gray-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              className="dark:stroke-gray-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--card-foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke={lineColor}
              strokeWidth={2}
              name="Cantidad"
              dot={{ fill: lineColor, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: lineColor, strokeWidth: 2, fill: 'hsl(var(--background))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}