import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, MapPin, Layers, Calendar, Clock } from 'lucide-react';
import { propertiesApi, bookingsApi } from '../api/services';

interface Property {
  id: number; name: string; address: string; city: string; category: string;
  pricePerSqm: number; areaSqm: number; totalPrice: number; daysOnMarket: number;
  isActive: boolean; description?: string;
}
interface Booking {
  id: number; clientName: string; clientEmail: string; clientPhone: string;
  viewingDate: string; status: string; notes?: string; createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Pending':   { bg: '#f59e0b22', color: '#f59e0b' },
  'Confirmed': { bg: '#3b82f622', color: '#3b82f6' },
  'Completed': { bg: '#10b98122', color: '#10b981' },
  'Cancelled': { bg: '#ef444422', color: '#ef4444' },
};
const STATUS_HR: Record<string, string> = {
  'Pending': 'Na čekanju', 'Confirmed': 'Potvrđen', 'Completed': 'Završen', 'Cancelled': 'Otkazan'
};
const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const emptyForm = { clientName: '', clientEmail: '', clientPhone: '', viewingDate: '', notes: '' };

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadBookings = () => bookingsApi.getByProperty(Number(id)).then(setBookings);

  useEffect(() => {
    Promise.all([
      propertiesApi.getById(Number(id)).then(setProperty),
      bookingsApi.getByProperty(Number(id)).then(setBookings),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bookingsApi.create({ ...form, propertyId: Number(id) });
      setForm(emptyForm);
      setShowForm(false);
      loadBookings();
    } finally { setSaving(false); }
  };

  const handleStatus = async (bookingId: number, status: string) => {
    await bookingsApi.updateStatus(bookingId, status);
    loadBookings();
  };

  const handleDelete = async (bookingId: number) => {
    if (!confirm('Obrisati razgled?')) return;
    await bookingsApi.delete(bookingId);
    loadBookings();
  };

  const inp = {
    width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none'
  };
  const lbl = { fontSize: 12, color: '#64748b', marginBottom: 6, display: 'block' };

  if (loading) return (
    <div style={{ color: '#475569', textAlign: 'center', padding: 60 }}>Učitavanje...</div>
  );
  if (!property) return (
    <div style={{ color: '#ef4444', textAlign: 'center', padding: 60 }}>Nekretnina nije pronađena.</div>
  );

  return (
    <div>
      {/* Back + Header */}
      <button onClick={() => navigate('/properties')} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: '#64748b', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0
      }}>
        <ArrowLeft size={15} /> Natrag na nekretnine
      </button>

      {/* Property card */}
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
        padding: '24px 28px', marginBottom: 28
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{property.name}</h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} /> {property.address}, {property.city}
              </span>
              <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Layers size={13} /> {property.category}
              </span>
              <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {property.daysOnMarket} dana na tržištu
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Cijena / m²</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{property.pricePerSqm.toLocaleString('hr-HR')} €</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Površina</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{property.areaSqm} m²</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b' }}>Ukupno</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>{property.totalPrice.toLocaleString('hr-HR')} €</div>
            </div>
          </div>
        </div>
        {property.description && (
          <div style={{ marginTop: 16, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{property.description}</div>
        )}
      </div>

      {/* Bookings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Razgledi</h2>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{bookings.length} ukupno</div>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
          background: '#3b82f6', color: '#fff', borderRadius: 8, border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={14} /> Dodaj razgled
        </button>
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        {bookings.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#475569', fontSize: 13 }}>
            Nema razgleda. Dodaj prvi razgled.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Klijent', 'Email', 'Telefon', 'Datum razgleda', 'Status', 'Napomene', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#475569', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const sc = STATUS_COLORS[b.status] || { bg: '#33415522', color: '#94a3b8' };
                return (
                  <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{b.clientName}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8' }}>{b.clientEmail}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#94a3b8' }}>{b.clientPhone}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {new Date(b.viewingDate).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select value={b.status} onChange={e => handleStatus(b.id, e.target.value)} style={{
                        padding: '4px 8px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                        background: sc.bg, color: sc.color, cursor: 'pointer', outline: 'none'
                      }}>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_HR[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b', maxWidth: 180 }}>
                      {b.notes || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleDelete(b.id)} style={{
                        padding: '6px', background: '#2d1b1b', border: 'none', borderRadius: 6,
                        color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center'
                      }}>
                        <X size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Booking Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div style={{ background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Novi razgled</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Ime klijenta</label>
                  <input name="clientName" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                    required style={inp} placeholder="Ana Horvat" />
                </div>
                <div>
                  <label style={lbl}>Email</label>
                  <input name="clientEmail" type="email" value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
                    required style={inp} placeholder="ana@example.com" />
                </div>
                <div>
                  <label style={lbl}>Telefon</label>
                  <input name="clientPhone" value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
                    style={inp} placeholder="091 123 4567" />
                </div>
                <div>
                  <label style={lbl}>Datum i vrijeme razgleda</label>
                  <input name="viewingDate" type="datetime-local" value={form.viewingDate}
                    onChange={e => setForm(f => ({ ...f, viewingDate: e.target.value }))}
                    required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Napomene (opcionalno)</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ ...inp, minHeight: 70, resize: 'vertical' } as any} placeholder="Napomene o klijentu..." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  padding: '10px 20px', background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 13
                }}>Odustani</button>
                <button type="submit" disabled={saving} style={{
                  padding: '10px 20px', background: '#3b82f6', border: 'none',
                  borderRadius: 8, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600
                }}>{saving ? 'Sprema...' : 'Dodaj razgled'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
