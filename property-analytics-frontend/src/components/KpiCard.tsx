import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  trend?: number
  icon: ReactNode
  color?: string
}

export default function KpiCard({ title, value, trend, icon, color = 'bg-violet-100 text-violet-600' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend).toFixed(1)}% vs prev. period
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
