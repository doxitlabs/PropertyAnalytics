import { api } from './client'

export interface ImportPreviewRequest {
  sourceConnectionString: string
  reservationsTable: string
}

export interface ImportPreviewResult {
  columns: string[]
  totalRows: number
  sampleRows: Record<string, string | null>[]
}

export interface ImportExecuteRequest {
  name: string
  address: string
  type: string
  totalRooms: number
  sourceConnectionString: string
  reservationsTable: string
  checkInColumn: string
  checkOutColumn: string
  revenueColumn: string
  guestNameColumn: string | null
  guestEmailColumn: string | null
  statusColumn: string | null
}

export interface ImportResult {
  propertyId: number
  propertyName: string
  importedBookings: number
}

export const previewImport = (req: ImportPreviewRequest) =>
  api.post<ImportPreviewResult>('/import/preview', req).then((r) => r.data)

export const executeImport = (req: ImportExecuteRequest) =>
  api.post<ImportResult>('/import/execute', req).then((r) => r.data)
