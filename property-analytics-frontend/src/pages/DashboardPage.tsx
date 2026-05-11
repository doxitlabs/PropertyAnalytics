import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Building2, Clock, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { dashboardApi } from '../api/services';

interface Stats {
  avgPricePerSqm: number;
  activeListings: number;
  avgDaysOnMarket: number;
  totalTransactions: number;
  avgPricePerSqmChange: number;
  activeListingsChange: number;
  daysOnMarketChange: number;
  transactionsChangeYoY: number;
  priceTrend: { month: string; avgPrice: number }[];
  byCategory: { category: string; count: number }[];
  topCities: { city: string; avgPrice: number; count: number }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Stan': '#3b82f6',
  'Kuća': '#6366f1',
  'Zemlja': '#10b981',
  'Poslovni': '#f59e0b',
  'Garaža': '#8b5cf6',
};

function KpiCard({ label, value, change, changeLabel, icon: Icon, positive }: {
  label: string; value: string; change: number; changeLabel: string;
  icon: any; positive: boolean;
}) {
  const isUp = change >= 0;
  const good = positive ? isUp : !isUp;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
      padding: '20px 24px', flex: 1, minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: '#0f172a',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={15} color="#3b82f6" />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: good ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(change)}% {changeLabel}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#3b82f6', borderRadius: 8, padding: '8px 14px', fontSize: 12 }}>
        <div style={{ color: '#bfdbfe', marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#fff', fontWeight: 700 }}>{Number(payload[0].value).toLocaleString('hr-HR')} €/m²</div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: '#475569', fontSize: 14 }}>Učitavanje...</div>
    </div>
  );

  if (!stats) return null;

  const maxCount = Math.max(...stats.byCategory.map(c => c.count));
  const maxCityPrice = Math.max(...stats.topCities.map(c => c.avgPrice));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            IZVJEŠĆE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>Dashboard</h1>
        </div>
        <div style={{ fontSize: 12, color: '#475569' }}>Izvješće · Svibanj 2026</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Prosj. cijena / m²" value={`${stats.avgPricePerSqm.toLocaleString('hr-HR')} €`}
          change={stats.avgPricePerSqmChange} changeLabel="vs prošli mj." icon={BarChart3} positive={true} />
        <KpiCard label="Aktivni oglasi" value={stats.activeListings.toString()}
          change={stats.activeListingsChange} changeLabel="vs prošli mj." icon={Building2} positive={true} />
        <KpiCard label="Dana na tržištu" value={`${stats.avgDaysOnMarket} dana`}
          change={Math.abs(stats.daysOnMarketChange)} changeLabel="brže od avg" icon={Clock} positive={false} />
        <KpiCard label="Ukupno transakcija" value={stats.totalTransactions.toString()}
          change={stats.transactionsChangeYoY} changeLabel="YoY" icon={TrendingUp} positive={true} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {/* Price trend */}
        <div style={{
          flex: 2, background: '#1e293b', border: '1px solid #334155',
          borderRadius: 12, padding: '20px 24px'
        }}>
          <div style={{ marginBottom: 4, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Kretanje cijena nekretnina</div>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 20 }}>Prosječna cijena po m² — posljednjih 12 mjeseci</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.priceTrend}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false}
                domain={['auto', 'auto']} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgPrice" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#priceGrad)" dot={false} activeDot={{ r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* By category */}
        <div style={{
          flex: 1, background: '#1e293b', border: '1px solid #334155',
          borderRadius: 12, padding: '20px 24px'
        }}>
          <div style={{ marginBottom: 20, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Oglasi po kategoriji</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.byCategory.map(cat => {
              const color = CATEGORY_COLORS[cat.category] || '#6366f1';
              const pct = (cat.count / maxCount) * 100;
              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: '#94a3b8' }}>{cat.category}</span>
                    <span style={{ color: '#64748b' }}>{cat.count}</span>
                  </div>
                  <div style={{ height: 6, background: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top cities */}
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 24px'
      }}>
        <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Top lokacije</div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {stats.topCities.map(city => {
            const pct = (city.avgPrice / maxCityPrice) * 100;
            return (
              <div key={city.city} style={{ flex: 1, minWidth: 140 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#94a3b8' }}>{city.city}</span>
                  <span style={{ color: '#64748b' }}>{Math.round(city.avgPrice).toLocaleString('hr-HR')} €</span>
                </div>
                <div style={{ height: 6, background: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#3b82f6', borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
