'use client';
import { useState, useEffect, useCallback } from 'react';
import { getMarkets } from '@/lib/api';
import { ShoppingCart, RefreshCw, TrendingUp, MapPin, Truck, AlertTriangle } from 'lucide-react';

type Market = {
  market_name: string;
  district: string;
  state: string;
  crop: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_unit: string;
  distance_km: number;
  transport_cost_per_quintal: number;
  gross_value: number;
  net_realization: number;
  rank: number;
  is_recommended: boolean;
};

type MarketData = {
  crop: string;
  quantity_kg: number;
  markets: Market[];
  recommended_market: string;
  recommendation_reason: string;
  is_demo: boolean;
};

const CROPS = ['Tomato', 'Rice', 'Potato', 'Wheat', 'Onion'];
const QUANTITIES = [50, 100, 200, 500, 1000];
const RANK_EMOJI = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function MarketsPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState(100);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const d = await getMarkets(crop, quantity);
      setData(d);
    } catch {
      setError('Failed to load market data.');
    } finally {
      setLoading(false);
    }
  }, [crop, quantity]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShoppingCart size={24} color="var(--accent-green)" /> Market Intelligence
        </h1>
        <p className="section-subtitle">Compare mandi prices and find your best net realization after transport costs.</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label>Crop</label>
          <select className="select-field" value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label>Quantity (kg)</label>
          <select className="select-field" value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
            {QUANTITIES.map(q => <option key={q} value={q}>{q} kg ({q/100} quintal)</option>)}
          </select>
        </div>
        <button onClick={load} className="btn-primary" disabled={loading}>
          <RefreshCw size={14} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {data?.is_demo && (
        <div className="demo-badge" style={{ marginBottom: 16, fontSize: 11 }}>
          📊 Demo Data — Add data.gov.in API key for live mandi prices
        </div>
      )}

      {error ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <AlertTriangle size={32} color="var(--accent-orange)" style={{ margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--text-muted)' }}>{error}</div>
        </div>
      ) : loading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : data ? (
        <>
          {/* Recommendation */}
          {data.recommended_market && (
            <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(76,175,80,0.4)', background: 'rgba(76,175,80,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 28 }}>🏆</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                    Recommended Market
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#4caf50', marginBottom: 6 }}>{data.recommended_market}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.recommendation_reason}</div>
                </div>
              </div>
            </div>
          )}

          {/* Markets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.markets.map((m, i) => (
              <div key={i} className="card" style={{
                borderColor: m.is_recommended ? 'rgba(76,175,80,0.4)' : 'var(--border)',
                position: 'relative', overflow: 'hidden',
              }}>
                {m.is_recommended && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
                    color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 12px',
                    borderBottomLeftRadius: 8, letterSpacing: '0.5px',
                  }}>BEST CHOICE</div>
                )}

                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 24, minWidth: 32 }}>{RANK_EMOJI[i] || `${i+1}`}</div>

                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{m.market_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, marginTop: 3 }}>
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={10} />{m.district}, {m.state}</span>
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Truck size={10} />{m.distance_km} km away</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '8px 20px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>₹{m.modal_price.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Modal Price/q</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#ff8f00' }}>-₹{m.transport_cost_per_quintal.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Transport/q</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#4caf50' }}>₹{m.net_realization.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Net ({quantity}kg)</div>
                    </div>
                  </div>
                </div>

                {/* Price range */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Min: ₹{m.min_price.toLocaleString('en-IN')}/q</span>
                  <span>Max: ₹{m.max_price.toLocaleString('en-IN')}/q</span>
                  <span style={{ marginLeft: 'auto' }}>Gross Value for {quantity}kg: <strong style={{ color: 'var(--text-primary)' }}>₹{m.gross_value.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 11, color: 'var(--text-muted)' }}>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 6 }} />
            Transport cost estimated at ₹2.5/km/quintal. Prices ranked by net realization = (modal price × quantity) − transport cost.
            {data.is_demo ? ' Data is demo/static for West Bengal region.' : ' Live data from data.gov.in.'}
          </div>
        </>
      ) : null}
    </div>
  );
}
