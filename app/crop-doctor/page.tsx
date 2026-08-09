'use client';
import { useState, useRef, useCallback } from 'react';
import { analyzeDisease } from '@/lib/api';
import { Upload, Microscope, AlertTriangle, CheckCircle, Info, Leaf, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Result = {
  detected_crop: string;
  disease: string;
  confidence: number;
  severity: string;
  explanation: string;
  symptoms: string[];
  recommendations: string[];
  model_version: string;
  top_predictions: { disease: string; confidence: number }[];
  is_demo: boolean;
  disclaimer: string;
};

const SEVERITY_COLOR: Record<string, string> = {
  None: 'green', Mild: 'yellow', Moderate: 'orange', Severe: 'red', Critical: 'red',
};

export default function CropDoctorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const [crop, setCrop] = useState('Tomato');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true); setError('');
    try {
      const r = await analyzeDisease(file, crop);
      setResult(r);
    } catch {
      setError('Analysis failed. Ensure the backend is running on port 8000.');
    } finally {
      setAnalyzing(false);
    }
  };

  const sevColor = result ? (SEVERITY_COLOR[result.severity] || 'orange') : 'orange';
  const isHealthy = result?.disease === 'Healthy';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Microscope size={24} color="var(--accent-green)" /> Crop Doctor
        </h1>
        <p className="section-subtitle">Upload a crop leaf image to detect diseases using AI. Results are a decision-support tool — not a medical diagnosis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Upload Panel */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <label>Select Crop</label>
              <select className="select-field" value={crop} onChange={e => setCrop(e.target.value)}>
                {['Tomato', 'Rice', 'Wheat', 'Potato', 'Maize'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Upload zone */}
            <div
              className={`upload-zone ${drag ? 'drag-over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {preview ? (
                <div style={{ position: 'relative' }}>
                  <img src={preview} alt="Leaf preview" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', borderRadius: 8 }} />
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>{file?.name} • Click to change</div>
                </div>
              ) : (
                <div>
                  <Leaf size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Drag & drop a leaf image
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    or click to browse • JPG, PNG, WebP
                  </div>
                  <button className="btn-secondary" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                    <Upload size={14} /> Select Image
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 8, fontSize: 12, color: '#ef5350', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              style={{ width: '100%', marginTop: 14, justifyContent: 'center' }}
            >
              <Microscope size={16} />
              {analyzing ? 'Analyzing...' : 'Analyze Crop Health'}
            </button>

            {analyzing && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <div style={{ width: '100%', height: 3, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #4caf50, #66bb6a, #4caf50)', backgroundSize: '200% 100%', animation: 'skeleton-wave 1.2s ease infinite', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>AI model is processing your image...</div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ padding: '10px 14px', background: 'rgba(66,165,245,0.08)', border: '1px solid rgba(66,165,245,0.2)', borderRadius: 10, display: 'flex', gap: 8 }}>
            <Info size={14} color="#42a5f5" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11, color: '#42a5f5', lineHeight: 1.6 }}>
              This <strong>AI decision-support system</strong> provides rapid diagnostic recommendations based on visual pattern analysis and environmental context.
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="fade-in">
            {/* Disease Header */}
            <div className="card" style={{ marginBottom: 12, borderColor: isHealthy ? 'rgba(76,175,80,0.4)' : 'rgba(255,143,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: isHealthy ? 'rgba(76,175,80,0.15)' : 'rgba(255,143,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isHealthy ? <CheckCircle size={26} color="#4caf50" /> : <AlertTriangle size={26} color="#ff8f00" />}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {result.detected_crop} • Disease Detection
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                    {result.disease}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#4caf50' }}>{result.confidence.toFixed(1)}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Confidence</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: `var(--risk-${sevColor})` }}>{result.severity}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Severity</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Model</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{result.model_version}</div>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Why?</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.explanation}</p>
            </div>

            {/* Symptoms */}
            {result.symptoms.length > 0 && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Visual Symptoms</div>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.symptoms.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--accent-orange)', flexShrink: 0 }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Recommended Actions</div>
                <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.recommendations.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-secondary)', padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                      <span style={{ color: '#4caf50', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Top predictions */}
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>Top Predictions</div>
              {result.top_predictions.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {p.disease}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.confidence}%`, background: i === 0 ? '#4caf50' : 'var(--text-muted)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{p.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/advisory" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              View Full Advisory <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
