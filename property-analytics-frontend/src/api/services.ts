import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats').then(r => r.data),
};

export const propertiesApi = {
  getAll: () => api.get('/properties').then(r => r.data),
  getById: (id: number) => api.get(`/properties/${id}`).then(r => r.data),
  create: (data: any) => api.post('/properties', data).then(r => r.data),
  update: (id: number, data: any) => api.put(`/properties/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/properties/${id}`),
};

export const bookingsApi = {
  getAll: () => api.get('/bookings').then(r => r.data),
  getByProperty: (propertyId: number) => api.get(`/bookings/property/${propertyId}`).then(r => r.data),
  create: (data: any) => api.post('/bookings', data).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch(`/bookings/${id}/status`, { status }).then(r => r.data),
  delete: (id: number) => api.delete(`/bookings/${id}`),
};
