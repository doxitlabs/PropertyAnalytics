import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProperties } from '../api/properties'
import type { Property } from '../api/properties'
import { previewImport, executeImport } from '../api/import'
import type { ImportPreviewResult } from '../api/import'
import Layout from '../components/Layout'
import { Upload, Building2, MapPin, BedDouble, ChevronRight, X, Search, CheckCircle, AlertCircle } from 'lucide-react'

// ── Step types ───────────────────────────────────────────────────────────────

type Step = 'source' | 'mapping' | 'done'

const STEP_LABELS: Record<Step, string> = {
  source:  '1. Source & Property',
  mapping: '2. Column Mapping',
  done:    '3. Done',
}

// ── Initial state ────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  // Property info
  name: '',
  address: '',
  type: 'Villa',
  totalRooms: 1,
  // Source
  sourceConnectionString: '',
  reservationsTable: '',
  // Mapping
  checkInColumn: '',
  checkOutColumn: '',
  revenueColumn: '',
  guestNameColumn: '',
  guestEmailColumn: '',
  statusColumn: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  // wizard state
  const [step, setStep] = useState<Step>('source')
  const [form, setForm] = useState(INITIAL_FORM)
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importResult, setImportResult] = useState<{ propertyId: number; propertyName: string; importedBookings: number } | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setProperties(await getProperties())
    } finally {
      setLoading(false)
    }
  }

  const openImport = () => {
    setStep('source')
    setForm(INITIAL_FORM)
    setPreview(null)
    setPreviewError('')
    setImportError('')
    setImportResult(null)
    setShowImport(true)
  }

  const closeImport = () => setShowImport(false)

  const set = (k: keyof typeof INITIAL_FORM, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  // Step 1 → 2: fetch columns
  const handlePreview = async () => {
    setPreviewError('')
    setPreviewing(true)
    try {
      const result = await previewImport({
        sourceConnectionString: form.sourceConnectionString,
        reservationsTable: form.reservationsTable,
      })
      setPreview(result)
      setStep('mapping')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } }; message?: string })
        ?.response?.data?.error ?? (e as { message?: string })?.message ?? 'Connection failed'
      setPreviewError(msg)
    } finally {
      setPreviewing(false)
    }
  }

  // Step 2 → 3: import
  const handleImport = async () => {
    setImportError('')
    setImporting(true)
    try {
      const result = await executeImport({
        name: form.name,
        address: form.address,
        type: form.type,
        totalRooms: form.totalRooms,
        sourceConnectionString: form.sourceConnectionString,
        reservationsTable: form.reservationsTable,
        checkInColumn: form.checkInColumn,
        checkOutColumn: form.checkOutColumn,
        revenueColumn: form.revenueColumn,
        guestNameColumn: form.guestNameColumn || null,
        guestEmailColumn: form.guestEmailColumn || null,
        statusColumn: form.statusColumn || null,
      })
      setImportResult(result)
      setStep('done')
      await load()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } }; message?: string })
        ?.response?.data?.error ?? (e as { message?: string })?.message ?? 'Import failed'
      setImportError(msg)
    } finally {
      setImporting(false)
    }
  }

  const inputCls =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'

  // ── Column select helper ──────────────────────────────────────────────────
  const ColumnSelect = ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    required?: boolean
  }) => (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {!required && <span className="text-slate-400 text-xs ml-1">(optional)</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">— skip —</option>
        {preview?.columns.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
            <p className="text-slate-500 text-sm mt-1">{properties.length} properties</p>
          </div>
          <button
            onClick={openImport}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Upload size={16} />
            Import Property
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-6 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">No properties yet. Import your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => (
              <Link
                key={p.id}
                to={`/properties/${p.id}`}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-violet-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-violet-100 p-2.5 rounded-xl">
                    <Building2 className="text-violet-600" size={20} />
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-violet-500 transition-colors" size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-1">{p.name}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                  <MapPin size={13} />
                  <span className="truncate">{p.address}</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    <BedDouble size={11} />
                    {p.totalRooms} rooms
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{p.type}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Import Wizard Modal ───────────────────────────────────────────── */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="font-semibold text-slate-900">Import Property</h2>
                <p className="text-xs text-slate-400 mt-0.5">{STEP_LABELS[step]}</p>
              </div>
              <button onClick={closeImport} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex px-6 py-3 gap-2 border-b border-slate-50 shrink-0">
              {(['source', 'mapping', 'done'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${step === s ? 'bg-violet-600 text-white' :
                      ((['source', 'mapping', 'done'] as Step[]).indexOf(step) > i)
                        ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs ${step === s ? 'text-violet-700 font-medium' : 'text-slate-400'}`}>
                    {['Source', 'Mapping', 'Done'][i]}
                  </span>
                  {i < 2 && <div className="w-6 h-px bg-slate-200 mx-1" />}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 flex-1">

              {/* ── Step 1: Source & Property info ── */}
              {step === 'source' && (
                <div className="space-y-5">
                  <div className="bg-violet-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-violet-800 mb-3">Property Info</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Property Name <span className="text-red-500">*</span></label>
                        <input value={form.name} onChange={(e) => set('name', e.target.value)}
                          className={inputCls} placeholder="Villa The Family" required />
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Address <span className="text-red-500">*</span></label>
                        <input value={form.address} onChange={(e) => set('address', e.target.value)}
                          className={inputCls} placeholder="Ivana Rončevića 9, Maslenica" required />
                      </div>
                      <div>
                        <label className={labelCls}>Type</label>
                        <select value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                          <option>Villa</option>
                          <option>Apartment</option>
                          <option>House</option>
                          <option>Hotel</option>
                          <option>Studio</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Total Rooms</label>
                        <input type="number" min={1} value={form.totalRooms}
                          onChange={(e) => set('totalRooms', parseInt(e.target.value) || 1)}
                          className={inputCls} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-slate-700 mb-3">Source Database</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Connection String <span className="text-red-500">*</span></label>
                        <textarea
                          value={form.sourceConnectionString}
                          onChange={(e) => set('sourceConnectionString', e.target.value)}
                          className={`${inputCls} h-20 resize-none font-mono text-xs`}
                          placeholder="Server=DESKTOP-7B0NR97;Database=VillaTheFamily;User Id=VFUser;Password=...;TrustServerCertificate=True;"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Reservations Table Name <span className="text-red-500">*</span></label>
                        <input
                          value={form.reservationsTable}
                          onChange={(e) => set('reservationsTable', e.target.value)}
                          className={inputCls}
                          placeholder="Bookings"
                        />
                      </div>
                    </div>
                  </div>

                  {previewError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="break-all">{previewError}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={closeImport}
                      className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePreview}
                      disabled={previewing || !form.name || !form.address || !form.sourceConnectionString || !form.reservationsTable}
                      className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <Search size={15} />
                      {previewing ? 'Connecting…' : 'Preview Columns'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Column Mapping ── */}
              {step === 'mapping' && preview && (
                <div className="space-y-5">
                  {/* Preview info */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                    <p className="font-medium">✓ Connected to <code className="font-mono">{form.reservationsTable}</code></p>
                    <p className="text-green-600 mt-0.5">{preview.totalRows.toLocaleString()} rows found — map the columns below</p>
                  </div>

                  {/* Sample data preview */}
                  {preview.sampleRows.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Sample data (first 5 rows)</p>
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="text-xs w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              {preview.columns.map((c) => (
                                <th key={c} className="px-3 py-2 text-left font-medium text-slate-600 whitespace-nowrap">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.sampleRows.map((row, i) => (
                              <tr key={i} className="border-t border-slate-100">
                                {preview.columns.map((c) => (
                                  <td key={c} className="px-3 py-1.5 text-slate-500 whitespace-nowrap max-w-[120px] truncate">
                                    {row[c] ?? <span className="text-slate-300">null</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Mapping selects */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-3">Map Columns</p>
                    <div className="grid grid-cols-2 gap-3">
                      <ColumnSelect label="Check-In date" value={form.checkInColumn}
                        onChange={(v) => set('checkInColumn', v)} required />
                      <ColumnSelect label="Check-Out date" value={form.checkOutColumn}
                        onChange={(v) => set('checkOutColumn', v)} required />
                      <ColumnSelect label="Revenue / Price" value={form.revenueColumn}
                        onChange={(v) => set('revenueColumn', v)} required />
                      <ColumnSelect label="Status" value={form.statusColumn}
                        onChange={(v) => set('statusColumn', v)} />
                      <ColumnSelect label="Guest Name" value={form.guestNameColumn}
                        onChange={(v) => set('guestNameColumn', v)} />
                      <ColumnSelect label="Guest Email" value={form.guestEmailColumn}
                        onChange={(v) => set('guestEmailColumn', v)} />
                    </div>
                  </div>

                  {importError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span className="break-all">{importError}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep('source')}
                      className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={importing || !form.checkInColumn || !form.checkOutColumn || !form.revenueColumn}
                      className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <Upload size={15} />
                      {importing ? `Importing ${preview.totalRows.toLocaleString()} rows…` : 'Import Property'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Done ── */}
              {step === 'done' && importResult && (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="text-green-500" size={56} />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">{importResult.propertyName}</p>
                    <p className="text-slate-500 mt-1">Property imported successfully</p>
                  </div>
                  <div className="inline-flex gap-6 bg-slate-50 rounded-xl px-8 py-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-violet-600">{importResult.importedBookings.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Bookings imported</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    <button onClick={closeImport}
                      className="border border-slate-300 text-slate-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                      Close
                    </button>
                    <Link
                      to={`/properties/${importResult.propertyId}`}
                      onClick={closeImport}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                    >
                      Open Dashboard →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
