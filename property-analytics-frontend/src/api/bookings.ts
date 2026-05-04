import { api } from './client'

export interface Booking {
  id: number
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  revenue: number
  status: string
  source: string
  nights: number
  dailyRate: number
  createdAt: string
}

export interface CreateBookingDto {
  guestName: string
  guestEmail: string
  checkIn: string
  checkOut: string
  revenue: number
  status: string
  source: string
  notes: string
}

export const getBookings = (propertyId: number, from?: string, to?: string) =>
  api
    .get<Booking[]>(`/properties/${propertyId}/bookings`, { params: { from, to } })
    .then((r) => r.data)

export const createBooking = (propertyId: number, dto: CreateBookingDto) =>
  api.post<Booking>(`/properties/${propertyId}/bookings`, dto).then((r) => r.data)

export const deleteBooking = (propertyId: number, id: number) =>
  api.delete(`/properties/${propertyId}/bookings/${id}`)
