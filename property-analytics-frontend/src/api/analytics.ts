import { api } from './client'

export interface RevenueData {
  date: string
  revenue: number
  expenses: number
  profit: number
}

export interface OccupancyData {
  date: string
  occupancyRate: number
  occupiedRooms: number
  totalRooms: number
}

export interface Alert {
  type: string
  message: string
  severity: string
}

export interface AnalyticsSummary {
  totalRevenue: number
  totalExpenses: number
  profit: number
  occupancyRate: number
  adr: number
  totalBookings: number
  revenueTrend: number
  occupancyTrend: number
  alerts: Alert[]
}

export const getAnalyticsSummary = (
  propertyId: number,
  from?: string,
  to?: string
) =>
  api
    .get<AnalyticsSummary>(`/properties/${propertyId}/analytics/summary`, {
      params: { from, to },
    })
    .then((r) => r.data)
