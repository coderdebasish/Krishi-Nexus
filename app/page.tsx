'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getFarm, getWeather, getAdvisory } from '@/lib/api';
import {
  Leaf, Droplets, Thermometer, Wind, CloudRain,
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  ChevronRight, RefreshCw, Microscope, ShoppingCart,
  MessageCircle, Sprout, Activity
} from 'lucide-react';

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#4caf50' : score >= 60 ? '#ffd54f' : score >= 40 ? '#ff8f00' : '#ef5350';

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
        fontSize={size * 0.22} fontWeight="700" fill={color} fontFamily="Inter, sans-serif">
        {score}
      </text>
    </svg>
  );
}

function RiskBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{score}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: Record<string, string> }) {
  const colorMap: Record<string, { dot: string; border: string; bg: string }> = {
    red: { dot: 'dot-red', border: 'rgba(239,83,80,0.3)', bg: 'rgba(239,83,80,0.05)' },
    orange: { dot: 'dot-orange', border: 'rgba(255,143,0,0.3)', bg: 'rgba(255,143,0,0.05)' },
    yellow: { dot: 'dot-yellow', border: 'rgba(255,213,79,0.3)', bg: 'rgba(255,213,79,0.05)' },
    green: { dot: 'dot-green', border: 'rgba(76,175,80,0.3)', bg: 'rgba(76,175,80,0.05)' },
  };
  const c = colorMap[action.color] || colorMap.green;
  return (
    <div className="card-sm" style={{ borderColor: c.border, background: c.bg, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span className={`status-dot ${c.dot}`} style={{ marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>{action.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{action.description}</div>
        {action.timing && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} /> {action.timing}
          </div>
        )}
      </div>
      <span style={{ fontSize: 18 }}>{action.icon}</span>
    </div>
  );
}

export default function Dashboard() {
  const [farm, setFarm] = useState<Record<string, unknown> | null>(null);
  const [weather, setWeather] = useState<Record<string, unknown> | null>(null);
  const [advisory, setAdvisory] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, w, a] = await Promise.all([getFarm(), getWeather(), getAdvisory()]);
      setFarm(f); setWeather(w); setAdvisory(a);
    } catch {
      setError('Backend offline. Make sure the Krishi-Nexus backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fh = advisory?.farm_health as Record<string, unknown> | undefined;
  const dr = advisory?.disease_risk as Record<string, unknown> | undefined;
  const irr = advisory?.irrigation as Record<string, unknown> | undefined;
  const actions = (advisory?.priority_actions as Record<string, string>[]) || [];

  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'grid', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <AlertTriangle size={48} color="var(--accent-orange)" style={{ margin: '0 auto 16px' }} />
      <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>Backend Connection Failed</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{error}</div>
      <button onClick={load} className="btn-primary"><RefreshCw size={14} /> Retry</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Leaf size={24} color="var(--accent-green)" />
              {String(farm?.name || 'Your Farm')}
            </h1>
            <p className="section-subtitle">
              {String(farm?.crop || 'Tomato')} • {String(farm?.growth_stage || 'Flowering')} Stage •{' '}
              {String(farm?.area_acres || 1)} acre • {String(farm?.location || 'Kolkata')}
            </p>
          </div>
          <button onClick={load} className="btn-ghost">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {weather?.is_demo && (
          <div className="demo-badge" style={{ marginTop: 10 }}>
            🔶 Demo Data — Add API keys in backend/.env for live data
          </div>
        )}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16 }}>

        {/* Farm Health Score */}
        <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <ScoreRing score={Number(fh?.overall_score || 72)} size={96} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
              Farm Health Score
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
              Grade {String(fh?.grade || 'B')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {String(fh?.explanation || 'Farm is in good health.')}
            </div>
            <Link href="/advisory" className="btn-ghost" style={{ marginTop: 8, padding: '4px 0', fontSize: 12 }}>
              View breakdown <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Weather */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Current Weather
            </div>
            {weather?.is_demo && <span className="demo-badge">Demo</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Thermometer size={18} color="var(--accent-orange)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{Number(weather?.temperature || 31).toFixed(1)}°C</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Temperature</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Droplets size={18} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{Number(weather?.humidity || 78)}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Humidity</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudRain size={18} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{Number(weather?.rain_probability || 62)}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rain Chance</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wind size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{Number(weather?.wind_speed || 12).toFixed(0)} km/h</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Wind Speed</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            {String(weather?.weather_description || 'Partly cloudy with risk of evening showers')}
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>
            Farm Risk Indicators
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <RiskBar label="Crop Health" score={Number(fh?.crop_health || 65)} color="#4caf50" />
            <RiskBar label="Water Stress" score={100 - Number(fh?.water_status || 80)} color="#42a5f5" />
            <RiskBar label="Disease Risk" score={Number(dr?.risk_score || 55)} color={
              Number(dr?.risk_score || 55) >= 75 ? '#ef5350' : Number(dr?.risk_score || 55) >= 50 ? '#ff8f00' : '#ffd54f'
            } />
            <RiskBar label="Weather Risk" score={100 - Number(fh?.weather_risk || 75)} color="#ff8f00" />
          </div>
          <div style={{ marginTop: 14 }}>
            <span className={`risk-badge risk-${(String(dr?.risk_level || 'MODERATE')).toLowerCase()}`}>
              Disease Risk: {String(dr?.risk_level || 'MODERATE')}
            </span>
          </div>
        </div>
      </div>

      {/* Irrigation status */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: irr?.status === 'DELAY' ? 'rgba(255,213,79,0.15)' : irr?.status === 'REQUIRED' ? 'rgba(239,83,80,0.15)' : 'rgba(76,175,80,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Droplets size={22} color={irr?.status === 'DELAY' ? '#ffd54f' : irr?.status === 'REQUIRED' ? '#ef5350' : '#4caf50'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              Irrigation: {String(irr?.status || 'DELAY').replace('_', ' ')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              {String(irr?.reason || 'Check weather conditions before irrigating.')}
            </div>
          </div>
          <Link href="/advisory" className="btn-secondary" style={{ fontSize: 12, padding: '8px 16px' }}>
            Full Advisory <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Today's Actions + Quick Nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Priority Actions */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
            Today's Priority Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {actions.length > 0 ? actions.map((a, i) => (
              <ActionCard key={i} action={a} />
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                No actions generated yet. Loading advisory...
              </div>
            )}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
            Quick Access
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { href: '/crop-doctor', icon: Microscope, label: 'Crop Doctor', desc: 'Upload leaf image for disease analysis', color: '#4caf50' },
              { href: '/advisory', icon: Activity, label: 'Farm Advisory', desc: 'Irrigation, fertilizer & health recommendations', color: '#42a5f5' },
              { href: '/markets', icon: ShoppingCart, label: 'Market Intelligence', desc: 'Best mandi prices & net realization', color: '#ffd54f' },
              { href: '/copilot', icon: MessageCircle, label: 'Ask Your Farm', desc: 'AI-powered farm Q&A in your language', color: '#4caf50' },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Soil Summary */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
          Soil Profile
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          {[
            { label: 'Soil Type', value: String(farm?.soil_type || 'Loamy') },
            { label: 'pH', value: String(farm?.soil_ph || '6.7') },
            { label: 'Nitrogen (N)', value: String(farm?.nitrogen_level || 'Medium') },
            { label: 'Phosphorus (P)', value: String(farm?.phosphorus_level || 'High') },
            { label: 'Potassium (K)', value: String(farm?.potassium_level || 'Medium') },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
