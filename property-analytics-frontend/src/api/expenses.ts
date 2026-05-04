import { api } from './client'

export interface Expense {
  id: number
  category: string
  amount: number
  date: string
  description: string
  createdAt: string
}

export interface CreateExpenseDto {
  category: string
  amount: number
  date: string
  description: string
}

export const getExpenses = (propertyId: number, from?: string, to?: string) =>
  api
    .get<Expense[]>(`/properties/${propertyId}/expenses`, { params: { from, to } })
    .then((r) => r.data)

export const createExpense = (propertyId: number, dto: CreateExpenseDto) =>
  api.post<Expense>(`/properties/${propertyId}/expenses`, dto).then((r) => r.data)

export const deleteExpense = (propertyId: number, id: number) =>
  api.delete(`/properties/${propertyId}/expenses/${id}`)
