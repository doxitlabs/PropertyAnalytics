import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import * as signalR from '@microsoft/signalr'
import { getProperty } from '../api/properties'
import { getAnalyticsSummary } from '../api/analytics'
import type { AnalyticsSummary } from '../api/analytics'
import { getBookings, createBooking, deleteBooking } from '../api/bookings'
import type { Booking, CreateBookingDto } from '../api/bookings'
import { getExpenses, createExpense, deleteExpense } from '../api/expenses'
import type { Expense, CreateExpenseDto } from '../api/expenses'
import Layout from '../components/Layout'
import KpiCard from '../components/KpiCard'
import { DollarSign, Percent, TrendingUp, CalendarDays, Plus, Trash2, X, AlertTriangle, Info } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500'

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function ModalActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
        Cancel
      </button>
      <button type="submit"
        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
        {submitLabel}
      </button>
    </div>
  )
}

function buildMonthlyRevenue(bookings: Booking[]) {
  const map: Record<string, { month: string; revenue: number }> = {}
  for (const b of bookings) {
    const m = new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (!map[m]) map[m] = { month: m, revenue: 0 }
    map[m].revenue += b.revenue
  }
  return Object.values(map)
}

function buildMonthlyNights(bookings: Booking[]) {
  const map: Record<string, { month: string; nights: number }> = {}
  for (const b of bookings) {
    const m = new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (!map[m]) map[m] = { month: m, nights: 0 }
    map[m].nights += b.nights
  }
  return Object.values(map)
}

export default function PropertyDashboard() {
  const { id } = useParams<{ id: string }>()
  const propertyId = parseInt(id!)

  const [property, setProperty] = useState<{ name: string } | null>(null)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tab, setTab] = useState<'overview' | 'bookings' | 'expenses'>('overview')
  const [loading, setLoading] = useState(true)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const defaultBooking: CreateBookingDto = {
    guestName: '', guestEmail: '', checkIn: '', checkOut: '',
    revenue: 0, status: 'Confirmed', source: 'Direct', notes: ''
  }
  const defaultExpense: CreateExpenseDto = {
    category: 'Maintenance', amount: 0,
    date: new Date().toISOString().split('T')[0], description: ''
  }
  const [bookingForm, setBookingForm] = useState<CreateBookingDto>(defaultBooking)
  const [expenseForm, setExpenseForm] = useState<CreateExpenseDto>(defaultExpense)

  const loadData = useCallback(async () => {
    try {
      const [prop, summ, bk, ex] = await Promise.all([
        getProperty(propertyId),
        getAnalyticsSummary(propertyId),
        getBookings(propertyId),
        getExpenses(propertyId),
      ])
      setProperty(prop)
      setSummary(summ)
      setBookings(bk)
      setExpenses(ex)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadData()

    const hubBase = import.meta.env.VITE_API_URL ?? ''
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${hubBase}/hubs/analytics`, {
        accessTokenFactory: () => localStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build()

    connection.start()
      .then(() => connection.invoke('JoinProperty', propertyId.toString()))
      .catch(() => {})

    connection.on('MetricsUpdate', () => {
      getAnalyticsSummary(propertyId).then(setSummary)
    })

    return () => { connection.stop() }
  }, [propertyId, loadData])

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    const b = await createBooking(propertyId, bookingForm)
    setBookings((prev) => [b, ...prev])
    setShowBookingForm(false)
    setBookingForm(defaultBooking)
    getAnalyticsSummary(propertyId).then(setSummary)
  }

  const handleDeleteBooking = async (bid: number) => {
    await deleteBooking(propertyId, bid)
    setBookings((prev) => prev.filter((b) => b.id !== bid))
    getAnalyticsSummary(propertyId).then(setSummary)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const ex = await createExpense(propertyId, expenseForm)
    setExpenses((prev) => [ex, ...prev])
    setShowExpenseForm(false)
    setExpenseForm(defaultExpense)
    getAnalyticsSummary(propertyId).then(setSummary)
  }

  const handleDeleteExpense = async (eid: number) => {
    await deleteExpense(propertyId, eid)
    setExpenses((prev) => prev.filter((e) => e.id !== eid))
    getAnalyticsSummary(propertyId).then(setSummary)
  }

  if (loading) return <Layout><div className="p-8 text-slate-400">Loading…</div></Layout>

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{property?.name}</h1>
          <p className="text-slate-500 text-sm mt-1">Property Dashboard</p>
        </div>

        {/* Alerts */}
        {summary?.alerts.map((alert, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-3 text-sm font-medium ${
            alert.severity === 'danger'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {alert.severity === 'danger' ? <AlertTriangle size={16} /> : <Info size={16} />}
            {alert.message}
          </div>
        ))}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
          {(['overview', 'bookings', 'expenses'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && summary && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard title="Total Revenue" value={fmt(summary.totalRevenue)} trend={summary.revenueTrend} icon={<DollarSign size={18} />} color="bg-emerald-100 text-emerald-600" />
              <KpiCard title="Net Profit" value={fmt(summary.profit)} icon={<TrendingUp size={18} />} color="bg-violet-100 text-violet-600" />
              <KpiCard title="Occupancy Rate" value={`${summary.occupancyRate}%`} trend={summary.occupancyTrend} icon={<Percent size={18} />} color="bg-blue-100 text-blue-600" />
              <KpiCard title="ADR" value={fmt(summary.adr)} icon={<CalendarDays size={18} />} color="bg-amber-100 text-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={buildMonthlyRevenue(bookings)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: unknown) => fmt(Number(v))} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Nights Booked</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={buildMonthlyNights(bookings)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="nights" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} name="Nights" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <p className="text-slate-500 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-900">{summary.totalBookings}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <p className="text-slate-500 mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">{fmt(summary.totalExpenses)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Bookings ({bookings.length})</h2>
              <button onClick={() => setShowBookingForm(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                <Plus size={14} /> Add Booking
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Guest', 'Check-In', 'Check-Out', 'Nights', 'Revenue', 'Status', 'Source', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{b.guestName}</p>
                        <p className="text-slate-400 text-xs">{b.guestEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600">{b.nights}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">{fmt(b.revenue)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          b.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{b.source}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteBooking(b.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No bookings yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses */}
        {tab === 'expenses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Expenses ({expenses.length})</h2>
              <button onClick={() => setShowExpenseForm(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                <Plus size={14} /> Add Expense
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Category', 'Description', 'Date', 'Amount', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">{ex.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ex.description}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(ex.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold text-red-600">{fmt(ex.amount)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteExpense(ex.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No expenses yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Booking Modal */}
      {showBookingForm && (
        <Modal title="Add Booking" onClose={() => setShowBookingForm(false)}>
          <form onSubmit={handleAddBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Guest Name">
                <input value={bookingForm.guestName} onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })} className={inputCls} required />
              </FormField>
              <FormField label="Guest Email">
                <input type="email" value={bookingForm.guestEmail} onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })} className={inputCls} required />
              </FormField>
              <FormField label="Check-In">
                <input type="date" value={bookingForm.checkIn} onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })} className={inputCls} required />
              </FormField>
              <FormField label="Check-Out">
                <input type="date" value={bookingForm.checkOut} onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })} className={inputCls} required />
              </FormField>
              <FormField label="Revenue (€)">
                <input type="number" step="0.01" value={bookingForm.revenue} onChange={(e) => setBookingForm({ ...bookingForm, revenue: parseFloat(e.target.value) })} className={inputCls} required />
              </FormField>
              <FormField label="Status">
                <select value={bookingForm.status} onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })} className={inputCls}>
                  <option>Confirmed</option><option>Pending</option><option>Cancelled</option><option>Completed</option>
                </select>
              </FormField>
              <FormField label="Source">
                <select value={bookingForm.source} onChange={(e) => setBookingForm({ ...bookingForm, source: e.target.value })} className={inputCls}>
                  <option>Direct</option><option>Airbnb</option><option>Booking.com</option><option>VRBO</option><option>Other</option>
                </select>
              </FormField>
            </div>
            <ModalActions onCancel={() => setShowBookingForm(false)} submitLabel="Add Booking" />
          </form>
        </Modal>
      )}

      {/* Add Expense Modal */}
      {showExpenseForm && (
        <Modal title="Add Expense" onClose={() => setShowExpenseForm(false)}>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category">
                <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className={inputCls}>
                  <option>Maintenance</option><option>Cleaning</option><option>Utilities</option>
                  <option>Insurance</option><option>Marketing</option><option>Taxes</option><option>Other</option>
                </select>
              </FormField>
              <FormField label="Amount (€)">
                <input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })} className={inputCls} required />
              </FormField>
              <FormField label="Date">
                <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className={inputCls} required />
              </FormField>
              <div className="col-span-2">
                <FormField label="Description">
                  <input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className={inputCls} />
                </FormField>
              </div>
            </div>
            <ModalActions onCancel={() => setShowExpenseForm(false)} submitLabel="Add Expense" />
          </form>
        </Modal>
      )}
    </Layout>
  )
}
