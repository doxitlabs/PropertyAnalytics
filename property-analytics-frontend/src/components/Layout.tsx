import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarCheck } from 'lucide-react';

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: '#0f172a', borderRight: '1px solid #1e293b',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', lineHeight: 1.2 }}>Property</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#3b82f6', lineHeight: 1.2 }}>Analytics</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
            { to: '/properties', label: 'Nekretnine', Icon: Building2 },
            { to: '/bookings', label: 'Razgledi', Icon: CalendarCheck },
          ].map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              background: isActive ? '#1e3a5f' : 'transparent',
              color: isActive ? '#3b82f6' : '#94a3b8',
              transition: 'all 0.15s'
            })}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 11, color: '#475569' }}>© 2026 DoxIT Labs</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px', background: '#0f172a' }}>
        <Outlet />
      </main>
    </div>
  );
}
