import { api } from './client'

export interface Property {
  id: number
  name: string
  address: string
  type: string
  totalRooms: number
  createdAt: string
  isActive: boolean
}

export interface CreatePropertyDto {
  name: string
  address: string
  type: string
  totalRooms: number
  masterConnectionString: string
}

export const getProperties = () =>
  api.get<Property[]>('/properties').then((r) => r.data)

export const getProperty = (id: number) =>
  api.get<Property>(`/properties/${id}`).then((r) => r.data)

export const createProperty = (dto: CreatePropertyDto) =>
  api.post<Property>('/properties', dto).then((r) => r.data)

export const updateProperty = (id: number, dto: Partial<CreatePropertyDto>) =>
  api.put<Property>(`/properties/${id}`, dto).then((r) => r.data)

export const deleteProperty = (id: number) =>
  api.delete(`/properties/${id}`)
