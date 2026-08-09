'use client';
import { useState } from 'react';
import { X, Save, Sprout, MapPin, Droplets, FlaskConical } from 'lucide-react';
import { API } from '@/lib/api';

interface FieldQuickEditModalProps {
  farm: any;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function FieldQuickEditModal({ farm, isOpen, onClose, onSaved }: FieldQuickEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: farm?.name || 'Green Valley Farm',
    location: farm?.location || 'Kolkata, West Bengal',
    crop: farm?.crop || 'Tomato',
    crop_variety: farm?.crop_variety || 'Arka Rakshak',
    growth_stage: farm?.growth_stage || 'Flowering',
    area_acres: farm?.area_acres || 1.0,
    soil_type: farm?.soil_type || 'Alluvial',
    soil_ph: farm?.soil_ph || 6.5,
    nitrogen_level: farm?.nitrogen_level || 140,
    phosphorus_level: farm?.phosphorus_level || 35,
    potassium_level: farm?.potassium_level || 180,
    last_irrigation: farm?.last_irrigation || 'Yesterday',
    latitude: farm?.latitude || 22.57,
    longitude: farm?.longitude || 88.36,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.updateFarm(form);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to update farm details", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--accent-green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#10b981'
            }}>
              <Sprout size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Personal Field Data
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Updates advisory calculations & live AI context
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 6, borderRadius: 8
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Farm Name & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Farm Name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Location</label>
              <input
                className="input-field"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Crop & Variety */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Crop Type</label>
              <select
                className="select-field"
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
              >
                {['Tomato', 'Rice', 'Wheat', 'Potato', 'Maize', 'Cotton'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Growth Stage</label>
              <select
                className="select-field"
                value={form.growth_stage}
                onChange={(e) => setForm({ ...form, growth_stage: e.target.value })}
              >
                {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Field Size & Last Irrigation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Field Size (Acres)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={form.area_acres}
                onChange={(e) => setForm({ ...form, area_acres: parseFloat(e.target.value) || 1.0 })}
                required
              />
            </div>
            <div>
              <label>Last Irrigated</label>
              <select
                className="select-field"
                value={form.last_irrigation}
                onChange={(e) => setForm({ ...form, last_irrigation: e.target.value })}
              >
                {['Today', 'Yesterday', '2 days ago', '3 days ago', '4+ days ago'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Soil & pH */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Soil Type</label>
              <select
                className="select-field"
                value={form.soil_type}
                onChange={(e) => setForm({ ...form, soil_type: e.target.value })}
              >
                {['Alluvial', 'Black Soil', 'Clay', 'Loam', 'Sandy Loam'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Soil pH ({form.soil_ph})</label>
              <input
                type="range"
                min="4.5"
                max="8.5"
                step="0.1"
                style={{ width: '100%', marginTop: 8, accentColor: '#10b981' }}
                value={form.soil_ph}
                onChange={(e) => setForm({ ...form, soil_ph: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {/* Soil N-P-K */}
          <div style={{ background: 'var(--bg-secondary)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
            <label style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FlaskConical size={14} color="#10b981" /> Soil Nutrient Test Values (mg/kg)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 10 }}>Nitrogen (N)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.nitrogen_level}
                  onChange={(e) => setForm({ ...form, nitrogen_level: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label style={{ fontSize: 10 }}>Phosphorus (P)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.phosphorus_level}
                  onChange={(e) => setForm({ ...form, phosphorus_level: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label style={{ fontSize: 10 }}>Potassium (K)</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.potassium_level}
                  onChange={(e) => setForm({ ...form, potassium_level: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} />
              {loading ? 'Saving & Recalculating...' : 'Update Field Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
