import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProperties, createProperty } from '../api/properties'
import type { Property } from '../api/properties'
import Layout from '../components/Layout'
import { Plus, Building2, MapPin, BedDouble, ChevronRight, X } from 'lucide-react'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    type: 'Apartment',
    totalRooms: 1,
    masterConnectionString: 'Server=localhost;Database=PropertyAnalytics_Master;Trusted_Connection=True;TrustServerCertificate=True;',
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const data = await getProperties()
      setProperties(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const p = await createProperty(form)
      setProperties((prev) => [p, ...prev])
      setShowForm(false)
      setForm({ ...form, name: '', address: '' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
            <p className="text-slate-500 text-sm mt-1">{properties.length} properties</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Property
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
            <p className="text-slate-500">No properties yet. Add your first one!</p>
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

      {/* Add Property Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Add New Property</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Sunset Villa"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="123 Main St, City"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>House</option>
                    <option>Hotel</option>
                    <option>Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Rooms</label>
                  <input
                    type="number"
                    min={1}
                    value={form.totalRooms}
                    onChange={(e) => setForm({ ...form, totalRooms: parseInt(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
