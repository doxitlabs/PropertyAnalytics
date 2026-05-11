import { useEffect, useState } from 'react';
import { Plus, Building2, MapPin, Eye, Trash2, X } from 'lucide-react';
import { propertiesApi } from '../api/services';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: number; name: string; address: string; city: string; category: string;
  pricePerSqm: number; areaSqm: number; totalPrice: number; daysOnMarket: number;
  isActive: boolean; listedAt: string; bookingsCount: number;
}

const CATEGORIES = ['Stan', 'Kuća', 'Zemlja', 'Poslovni', 'Garaža'];
const CITIES = ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Zaprešić', 'Sisak', 'Varaždin'];
const CAT_COLORS: Record<string, string> = {
  'Stan': '#3b82f6', 'Kuća': '#6366f1', 'Zemlja': '#10b981', 'Poslovni': '#f59e0b', 'Garaža': '#8b5cf6'
};
const emptyForm = {
  name: '', address: '', city: 'Zagreb', category: 'Stan',
  pricePerSqm: '', areaSqm: '', totalPrice: '', daysOnMarket: '0', description: ''
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () => propertiesApi.getAll().then(setProperties).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: value };
      if ((name === 'pricePerSqm' || name === 'areaSqm') && updated.pricePerSqm && updated.areaSqm) {
        updated.totalPrice = String(Math.round(Number(updated.pricePerSqm) * Number(updated.areaSqm)));
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await propertiesApi.create({
        ...form,
        pricePerSqm: Number(form.pricePerSqm),
        areaSqm: Number(form.areaSqm),
        totalPrice: Number(form.totalPrice),
        daysOnMarket: Number(form.daysOnMarket),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Obrisati nekretninu?')) return;
    await propertiesApi.delete(id);
    load();
  };

  const inp = {
    width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none'
  };
  const lbl = { fontSize: 12, color: '#64748b', marginBottom: 6, display: 'block' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>UPRAVLJANJE</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Nekretnine</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: '#3b82f6', color: '#fff', borderRadius: 8, border: 'none',
          fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={15} /> Dodaj nekretninu
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Ukupno', value: properties.length },
          { label: 'Aktivni', value: properties.filter(p => p.isActive).length },
          { label: 'Prodano', value: properties.filter(p => !p.isActive).length },
        ].map(s => (
          <div key={s.label} style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
            padding: '14px 20px', display: 'flex', gap: 10, alignItems: 'center'
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{s.value}</span>
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
                {['Nekretnina', 'Lokacija', 'Kategorija', 'Cijena/m²', 'Površina', 'Ukup. cijena', 'Dana', 'Status', 'Razgledi', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < properties.length - 1 ? '1px solid #1e3a5f' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{p.name}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {p.city}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                      background: `${CAT_COLORS[p.category] || '#6366f1'}22`,
                      color: CAT_COLORS[p.category] || '#6366f1'
                    }}>{p.category}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>
                    {p.pricePerSqm.toLocaleString('hr-HR')} €
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>{p.areaSqm} m²</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#f1f5f9' }}>
                    {p.totalPrice.toLocaleString('hr-HR')} €
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#94a3b8' }}>{p.daysOnMarket}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                      background: p.isActive ? '#10b98122' : '#f59e0b22',
                      color: p.isActive ? '#10b981' : '#f59e0b'
                    }}>{p.isActive ? 'Aktivan' : 'Prodano'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>{p.bookingsCount}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`/properties/${p.id}`)} style={{
                        padding: '6px 10px', background: '#1e3a5f', border: 'none', borderRadius: 6,
                        color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12
                      }}>
                        <Eye size={13} /> Detalji
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{
                        padding: '6px', background: '#2d1b1b', border: 'none', borderRadius: 6,
                        color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center'
                      }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }}>
          <div style={{
            background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Nova nekretnina</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Naziv</label>
                  <input name="name" value={form.name} onChange={handleChange} required style={inp} placeholder="npr. Stan Trešnjevka" />
                </div>
                <div>
                  <label style={lbl}>Adresa</label>
                  <input name="address" value={form.address} onChange={handleChange} style={inp} placeholder="Ulica i broj" />
                </div>
                <div>
                  <label style={lbl}>Grad</label>
                  <select name="city" value={form.city} onChange={handleChange} style={inp}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Kategorija</label>
                  <select name="category" value={form.category} onChange={handleChange} style={inp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Površina (m²)</label>
                  <input name="areaSqm" type="number" value={form.areaSqm} onChange={handleChange} required style={inp} placeholder="65" />
                </div>
                <div>
                  <label style={lbl}>Cijena / m²</label>
                  <input name="pricePerSqm" type="number" value={form.pricePerSqm} onChange={handleChange} required style={inp} placeholder="3200" />
                </div>
                <div>
                  <label style={lbl}>Ukupna cijena (€)</label>
                  <input name="totalPrice" type="number" value={form.totalPrice} onChange={handleChange} required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Dana na tržištu</label>
                  <input name="daysOnMarket" type="number" value={form.daysOnMarket} onChange={handleChange} style={inp} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Opis (opcionalno)</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    style={{ ...inp, minHeight: 80, resize: 'vertical' } as any} />
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
                }}>{saving ? 'Sprema...' : 'Dodaj nekretninu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
