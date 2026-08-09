'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAdvisory } from '@/lib/api';
import { Droplets, Leaf, Beaker, Activity, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

type Advisory = {
  irrigation: Record<string, unknown>;
  fertilizer: Record<string, unknown>;
  disease_risk: Record<string, unknown>;
  farm_health: Record<string, unknown>;
  priority_actions: Record<string, string>[];
  generated_at: string;
  weather_summary: string;
  disease_detected: string;
};

function AdvisoryCard({
  icon, title, status, statusColor, children, defaultOpen = false
}: {
  icon: React.ReactNode; title: string; status: string; statusColor: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${statusColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize: 12, color: statusColor, fontWeight: 600, marginTop: 2 }}>{status}</div>
          </div>
          {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </button>
      {open && <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>{children}</div>}
    </div>
  );
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#4caf50' : score >= 60 ? '#ffd54f' : score >= 40 ? '#ff8f00' : '#ef5350';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: `drop-shadow(0 0 5px ${color}60)` }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        fontSize={size * 0.24} fontWeight="700" fill={color} fontFamily="Inter, sans-serif">{score}</text>
    </svg>
  );
}

export default function AdvisoryPage() {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const a = await getAdvisory();
      setAdvisory(a);
    } catch {
      setError('Failed to load advisory. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 16 }} />)}
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <AlertTriangle size={40} color="var(--accent-orange)" style={{ margin: '0 auto 16px' }} />
      <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</div>
      <button onClick={load} className="btn-primary"><RefreshCw size={14} /> Retry</button>
    </div>
  );

  const irr = advisory?.irrigation as Record<string, unknown>;
  const fert = advisory?.fertilizer as Record<string, unknown>;
  const dr = advisory?.disease_risk as Record<string, unknown>;
  const fh = advisory?.farm_health as Record<string, unknown>;
  const breakdown = (fh?.breakdown as Record<string, unknown>[]) || [];

  const irrColor = irr?.status === 'DELAY' ? '#ffd54f' : irr?.status === 'REQUIRED' ? '#ef5350' : '#4caf50';
  const drColor = dr?.risk_level === 'LOW' ? '#4caf50' : dr?.risk_level === 'MODERATE' ? '#ffd54f' : '#ef5350';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={24} color="var(--accent-green)" /> Farm Advisory
            </h1>
            <p className="section-subtitle">
              Generated at {advisory?.generated_at ? new Date(advisory.generated_at).toLocaleTimeString('en-IN') : '-'}
              {' · '}{advisory?.weather_summary}
            </p>
          </div>
          <button onClick={load} className="btn-ghost"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* Farm Health Overview */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <ScoreRing score={Number(fh?.overall_score || 72)} size={90} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            Overall Farm Health — Grade {String(fh?.grade || 'B')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
            {String(fh?.explanation || '')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {breakdown.map((b, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: Number(b.score) >= 70 ? '#4caf50' : Number(b.score) >= 50 ? '#ffd54f' : '#ef5350' }}>{String(b.score)}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 2 }}>{String(b.component).split(' ')[0]}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{String(b.weight)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Irrigation Advisory */}
      <AdvisoryCard
        icon={<Droplets size={18} color={irrColor} />}
        title="Irrigation Advisory"
        status={`${String(irr?.status || 'DELAY').replace('_', ' ')} — ${String(irr?.recommended_timing || '')}`}
        statusColor={irrColor}
        defaultOpen={true}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: '12px 14px', background: `${irrColor}10`, border: `1px solid ${irrColor}30`, borderRadius: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{String(irr?.reason || '')}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Recommended Timing: {String(irr?.recommended_timing || '')}</div>
            {irr?.estimated_water_liters && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Estimated Water Need: ~{Number(irr.estimated_water_liters).toLocaleString('en-IN')} litres (prototype estimate)
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>CONTRIBUTING FACTORS</div>
            {((irr?.factors as string[]) || []).map((f, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <span style={{ color: irrColor }}>•</span> {f}
              </div>
            ))}
          </div>
        </div>
      </AdvisoryCard>

      {/* Disease Risk */}
      <AdvisoryCard
        icon={<Leaf size={18} color={drColor} />}
        title="Disease Risk Assessment"
        status={`Risk Level: ${String(dr?.risk_level || 'MODERATE')} (${Number(dr?.risk_score || 55)}/100)`}
        statusColor={drColor}
        defaultOpen={true}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: '12px 14px', background: `${drColor}10`, border: `1px solid ${drColor}30`, borderRadius: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{String(dr?.reason || '')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>CONTRIBUTING FACTORS</div>
            {((dr?.contributing_factors as string[]) || []).map((f, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <span style={{ color: drColor }}>•</span> {f}
              </div>
            ))}
          </div>
        </div>
      </AdvisoryCard>

      {/* Fertilizer */}
      <AdvisoryCard
        icon={<Beaker size={18} color="#42a5f5" />}
        title="Fertilizer & Nutrient Advisory"
        status={String(fert?.recommendation || '').substring(0, 70) + '...'}
        statusColor="#42a5f5"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {(['nitrogen_status', 'phosphorus_status', 'potassium_status'] as const).map((key, i) => {
            const label = ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'][i];
            const val = String(fert?.[key] || 'Optimal');
            const c = val === 'Optimal' ? '#4caf50' : val === 'Deficient' ? '#ef5350' : '#ffd54f';
            return (
              <div key={key} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {((fert?.details as string[]) || []).map((d, i) => (
            <div key={i} style={{ marginBottom: 6 }}>{d}</div>
          ))}
        </div>
      </AdvisoryCard>
    </div>
  );
}
