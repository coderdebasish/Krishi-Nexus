'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getFarm, getWeather, getAdvisory } from '@/lib/api';
import FieldQuickEditModal from '@/components/farm/FieldQuickEditModal';
import {
  Leaf, Droplets, Thermometer, Wind, CloudRain,
  AlertTriangle, Clock, ChevronRight, RefreshCw,
  Microscope, ShoppingCart, MessageCircle, Edit,
  FlaskConical, MapPin, Calendar, Sprout, ShieldAlert
} from 'lucide-react';

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#ea580c' : '#ef4444';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth={7} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        fontSize={size * 0.22} fontWeight="800" fill={color} fontFamily="Plus Jakarta Sans, sans-serif">
        {score}
      </text>
    </svg>
  );
}

function RiskBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{score}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: Record<string, string> }) {
  const colorMap: Record<string, { dot: string; border: string; bg: string }> = {
    red: { dot: 'dot-red', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)' },
    orange: { dot: 'dot-orange', border: 'rgba(234,88,12,0.3)', bg: 'rgba(234,88,12,0.06)' },
    yellow: { dot: 'dot-yellow', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)' },
    green: { dot: 'dot-green', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.06)' },
  };
  const c = colorMap[action.color] || colorMap.green;
  return (
    <div className="card-sm" style={{ borderColor: c.border, background: c.bg, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span className={`status-dot ${c.dot}`} style={{ marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>{action.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{action.description}</div>
        {action.timing && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <Clock size={11} /> {action.timing}
          </div>
        )}
      </div>
      <span style={{ fontSize: 20 }}>{action.icon}</span>
    </div>
  );
}

export default function Dashboard() {
  const [farm, setFarm] = useState<Record<string, any> | null>(null);
  const [weather, setWeather] = useState<Record<string, any> | null>(null);
  const [advisory, setAdvisory] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, w, a] = await Promise.all([getFarm(), getWeather(), getAdvisory()]);
      setFarm(f); setWeather(w); setAdvisory(a);
    } catch {
      setError('Backend connection offline. Make sure Krishi-Nexus backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fh = advisory?.farm_health as Record<string, any> | undefined;
  const dr = advisory?.disease_risk as Record<string, any> | undefined;
  const irr = advisory?.irrigation as Record<string, any> | undefined;
  const fert = advisory?.fertilizer as Record<string, any> | undefined;
  const actions = (advisory?.priority_actions as Record<string, string>[]) || [];

  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'grid', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 130 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <AlertTriangle size={48} color="var(--accent-orange)" style={{ margin: '0 auto 16px' }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Backend Server Disconnected</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>{error}</div>
      <button onClick={load} className="btn-primary"><RefreshCw size={15} /> Reconnect Server</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header Banner */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Sprout size={16} /> Personal Farm Intelligence
            </div>
            <h1 className="section-title" style={{ marginTop: 2 }}>
              {String(farm?.name || 'My Farm')}
            </h1>
            <p className="section-subtitle">
              {String(farm?.crop || 'Tomato')} • {String(farm?.growth_stage || 'Flowering')} Stage •{' '}
              {String(farm?.area_acres || 1)} Acre • <MapPin size={12} style={{ display: 'inline', margin: '0 2px' }} /> {String(farm?.location || 'Kolkata, West Bengal')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-primary"
              style={{ fontSize: 13, padding: '10px 18px' }}
            >
              <Edit size={15} /> Edit Personal Field Data
            </button>

            <button onClick={load} className="btn-secondary" style={{ padding: '10px 14px' }}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Field Quick Intelligence Strip */}
      <div className="card" style={{ marginBottom: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FlaskConical size={16} color="#10b981" /> Soil & Field Health Metrics
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            Last Irrigation: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{String(farm?.last_irrigation || 'Yesterday')}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          <div className="card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Soil Type</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{String(farm?.soil_type || 'Alluvial')}</div>
          </div>
          <div className="card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Soil pH</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981', marginTop: 4 }}>{String(farm?.soil_ph || 6.5)}</div>
          </div>
          <div className="card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Nitrogen (N)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{String(farm?.nitrogen_level || 140)} <span style={{ fontSize: 10 }}>mg/kg</span></div>
          </div>
          <div className="card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Phosphorus (P)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{String(farm?.phosphorus_level || 35)} <span style={{ fontSize: 10 }}>mg/kg</span></div>
          </div>
          <div className="card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Potassium (K)</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>{String(farm?.potassium_level || 180)} <span style={{ fontSize: 10 }}>mg/kg</span></div>
          </div>
        </div>
      </div>

      {/* Main Advisory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginBottom: 20 }}>

        {/* Farm Health Score */}
        <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <ScoreRing score={Number(fh?.overall_score || 72)} size={96} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
              Farm Health Index
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              Grade {String(fh?.grade || 'A')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>
              {String(fh?.explanation || 'Farm is in excellent operational health.')}
            </div>
            <Link href="/advisory" className="btn-ghost" style={{ marginTop: 8, padding: '4px 0', fontSize: 12 }}>
              Full Advisory Breakdown <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Weather Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Live Weather ({String(farm?.location || 'Kolkata')})
            </div>
            {!weather?.is_demo && <span className="risk-badge risk-low">Live API</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Thermometer size={20} color="var(--accent-orange)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{Number(weather?.temperature || 31).toFixed(1)}°C</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Temperature</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Droplets size={20} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{Number(weather?.humidity || 78)}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Humidity</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CloudRain size={20} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{Number(weather?.rain_probability || 62)}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Rain Risk</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wind size={20} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{Number(weather?.wind_speed || 12).toFixed(0)} km/h</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Wind Speed</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {String(weather?.weather_description || 'Partly cloudy with localized rainfall risk')}
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
            Deterministic Risk Meters
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <RiskBar label="Crop Health Score" score={Number(fh?.crop_health || 85)} color="#10b981" />
            <RiskBar label="Water Stress Level" score={100 - Number(fh?.water_status || 80)} color="#0284c7" />
            <RiskBar label="Disease Risk Score" score={Number(dr?.risk_score || 45)} color={
              Number(dr?.risk_score || 45) >= 75 ? '#ef4444' : Number(dr?.risk_score || 45) >= 50 ? '#ea580c' : '#10b981'
            } />
          </div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={`risk-badge risk-${(String(dr?.risk_level || 'LOW')).toLowerCase()}`}>
              Disease Risk: {String(dr?.risk_level || 'LOW')}
            </span>
          </div>
        </div>
      </div>

      {/* Irrigation Recommendation Banner */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            background: irr?.status === 'DELAY' ? 'rgba(245,158,11,0.15)' : irr?.status === 'REQUIRED' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Droplets size={24} color={irr?.status === 'DELAY' ? '#f59e0b' : irr?.status === 'REQUIRED' ? '#ef4444' : '#10b981'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
              Irrigation Recommendation: {String(irr?.status || 'DELAY').replace('_', ' ')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
              {String(irr?.reason || 'Check weather forecast prior to scheduling irrigation.')}
            </div>
          </div>
          <Link href="/advisory" className="btn-secondary" style={{ fontSize: 13, padding: '10px 18px' }}>
            View Full Advisory <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Priority Actions + Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {/* Priority Actions */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
            Today's Priority Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {actions.length > 0 ? actions.map((a, i) => (
              <ActionCard key={i} action={a} />
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Calculating tailored field recommendations...
              </div>
            )}
          </div>
        </div>

        {/* Quick Access */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
            AgriTech Workflows
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { href: '/crop-doctor', icon: Microscope, label: 'Crop Doctor (AI Diagnostics)', desc: 'Upload leaf photo for Instant Pests & Disease AI scan', color: '#10b981' },
              { href: '/advisory', icon: Leaf, label: 'Full Advisory Engine', desc: 'Precision Irrigation, N-P-K Fertilizer & Crop Health', color: '#0284c7' },
              { href: '/markets', icon: ShoppingCart, label: 'Mandi Market Intelligence', desc: 'Real-time daily mandi prices & net-realization calculation', color: '#f59e0b' },
              { href: '/copilot', icon: MessageCircle, label: 'Farmer Copilot (AI Chat)', desc: 'Contextual voice/text chat in Bengali, Hindi & English', color: '#10b981' },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Field Quick Edit Modal */}
      <FieldQuickEditModal
        farm={farm}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
