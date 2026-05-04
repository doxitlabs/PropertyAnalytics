import { api } from './client'

export interface AuthResponse {
  token: string
  email: string
  role: string
  id: number
}

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data)

export const register = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { email, password }).then((r) => r.data)
