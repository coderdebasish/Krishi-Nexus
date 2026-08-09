'use client';
import { useState, useEffect } from 'react';
import { getFarm, updateFarm } from '@/lib/api';
import { Save, Sprout, MapPin, Beaker, Droplets, CheckCircle, AlertCircle } from 'lucide-react';

const CROPS = ['Tomato', 'Rice', 'Wheat', 'Potato', 'Onion', 'Cabbage', 'Brinjal', 'Chili', 'Maize', 'Groundnut'];
const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Ripening', 'Harvest'];
const SOIL_TYPES = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Sandy Loam', 'Clay Loam'];
const LEVELS = ['Low', 'Medium', 'High'];

export default function FarmPage() {
  const [farm, setFarm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getFarm().then(f => { setFarm(f); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function set(key: string, val: unknown) {
    setFarm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const updated = await updateFarm(farm);
      setFarm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Backend may be offline.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sprout size={24} color="var(--accent-green)" /> My Farm Profile
        </h1>
        <p className="section-subtitle">Configure your farm details to get personalized advisory recommendations.</p>
      </div>

      <form onSubmit={handleSave}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sprout size={15} /> Farm Information
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label>Farm Name</label>
              <input className="input-field" value={String(farm.name || '')} onChange={e => set('name', e.target.value)} placeholder="Green Valley Farm" />
            </div>
            <div>
              <label>Location</label>
              <input className="input-field" value={String(farm.location || '')} onChange={e => set('location', e.target.value)} placeholder="Kolkata, West Bengal" />
            </div>
            <div>
              <label>Latitude</label>
              <input className="input-field" type="number" step="0.0001" value={String(farm.latitude || '')} onChange={e => set('latitude', parseFloat(e.target.value))} placeholder="22.5726" />
            </div>
            <div>
              <label>Longitude</label>
              <input className="input-field" type="number" step="0.0001" value={String(farm.longitude || '')} onChange={e => set('longitude', parseFloat(e.target.value))} placeholder="88.3639" />
            </div>
            <div>
              <label>Farm Area (acres)</label>
              <input className="input-field" type="number" step="0.1" value={String(farm.area_acres || '')} onChange={e => set('area_acres', parseFloat(e.target.value))} placeholder="1.0" />
            </div>
            <div>
              <label>Farmer Phone (for SMS)</label>
              <input className="input-field" type="tel" value={String(farm.farmer_phone || '')} onChange={e => set('farmer_phone', e.target.value)} placeholder="+91 9876543210" />
            </div>
          </div>
        </div>

        {/* Crop Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sprout size={15} /> Crop Profile
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div>
              <label>Crop</label>
              <select className="select-field" value={String(farm.crop || 'Tomato')} onChange={e => set('crop', e.target.value)}>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Crop Variety</label>
              <input className="input-field" value={String(farm.crop_variety || '')} onChange={e => set('crop_variety', e.target.value)} placeholder="Pusa Ruby" />
            </div>
            <div>
              <label>Growth Stage</label>
              <select className="select-field" value={String(farm.growth_stage || 'Flowering')} onChange={e => set('growth_stage', e.target.value)}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label>Planting Date</label>
              <input className="input-field" type="date" value={String(farm.planting_date || '')} onChange={e => set('planting_date', e.target.value)} />
            </div>
            <div>
              <label>Last Irrigation Date</label>
              <input className="input-field" type="date" value={String(farm.last_irrigation || '')} onChange={e => set('last_irrigation', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Soil Profile */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Beaker size={15} /> Soil Profile (Soil Health Card)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <label>Soil Type</label>
              <select className="select-field" value={String(farm.soil_type || 'Loamy')} onChange={e => set('soil_type', e.target.value)}>
                {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label>Soil pH</label>
              <input className="input-field" type="number" step="0.1" min="4" max="9" value={String(farm.soil_ph || '')} onChange={e => set('soil_ph', parseFloat(e.target.value))} placeholder="6.7" />
            </div>
            <div>
              <label>Nitrogen (N)</label>
              <select className="select-field" value={String(farm.nitrogen_level || 'Medium')} onChange={e => set('nitrogen_level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label>Phosphorus (P)</label>
              <select className="select-field" value={String(farm.phosphorus_level || 'High')} onChange={e => set('phosphorus_level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label>Potassium (K)</label>
              <select className="select-field" value={String(farm.potassium_level || 'Medium')} onChange={e => set('potassium_level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Farm Profile'}
          </button>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4caf50', fontSize: 13 }}>
              <CheckCircle size={15} /> Saved successfully!
            </div>
          )}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef5350', fontSize: 13 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
