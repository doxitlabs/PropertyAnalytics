import { useEffect, useState } from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { bookingsApi } from '../api/services';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: number; propertyId: number; propertyName: string;
  clientName: string; clientEmail: string; clientPhone: string;
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => bookingsApi.getAll().then(setBookings).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: string) => {
    await bookingsApi.updateStatus(id, status);
    load();
  };

  const countByStatus = (s: string) => bookings.filter(b => b.status === s).length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>PREGLED</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Svi razgledi</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Ukupno', value: bookings.length, color: '#f1f5f9' },
          { label: 'Na čekanju', value: countByStatus('Pending'), color: '#f59e0b' },
          { label: 'Potvrđeni', value: countByStatus('Confirmed'), color: '#3b82f6' },
          { label: 'Završeni', value: countByStatus('Completed'), color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
            padding: '14px 20px', display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#475569', textAlign: 'center', padding: 40 }}>Učitavanje...</div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Klijent', 'Nekretnina', 'Email', 'Telefon', 'Datum razgleda', 'Status', 'Napomene'].map(h => (
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
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => navigate(`/properties/${b.propertyId}`)} style={{
                        background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0
                      }}>
                        <Building2 size={12} /> {b.propertyName}
                      </button>
                    </td>
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
                        {Object.keys(STATUS_HR).map(s => <option key={s} value={s}>{STATUS_HR[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>{b.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
