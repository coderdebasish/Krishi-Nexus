'use client';
import { useState, useRef, useEffect } from 'react';
import { askCopilot, sendSMS } from '@/lib/api';
import { MessageCircle, Send, Mic, Globe, Phone, Copy, CheckCircle } from 'lucide-react';

const QUICK_QUESTIONS = [
  "Should I irrigate today?",
  "What is wrong with my crop?",
  "What should I do about this disease?",
  "Which mandi is best?",
  "What should I focus on today?",
];

const LANGUAGES = ['English', 'Bengali', 'Hindi'];

type Message = {
  role: 'user' | 'assistant';
  text: string;
  is_demo?: boolean;
  timestamp: Date;
};

type SMSResult = {
  message_text: string;
  status: string;
  note: string;
};

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'নমস্কার! I\'m your Krishi-Nexus Farm Copilot. Ask me anything about your farm — irrigation, diseases, market prices, or what to do today. I have your complete farm context loaded. 🌱',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [phone, setPhone] = useState('');
  const [smsResult, setSmsResult] = useState<SMSResult | null>(null);
  const [smsSending, setSmsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendQuestion(question: string) {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', text: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askCopilot(question, language);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.answer,
        is_demo: res.is_demo,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I could not connect to the backend. Please make sure the Krishi-Nexus server is running.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function startVoice() {
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SR();
    recognition.lang = language === 'Bengali' ? 'bn-IN' : language === 'Hindi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  }

  async function handleSMS() {
    setSmsSending(true);
    try {
      const r = await sendSMS(phone);
      setSmsResult(r);
    } catch {
      setSmsResult({ message_text: '', status: 'ERROR', note: 'Failed to generate SMS.' });
    } finally {
      setSmsSending(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageCircle size={24} color="var(--accent-green)" /> Ask Your Farm
        </h1>
        <p className="section-subtitle">AI-powered farm assistant with your complete farm context — disease, weather, soil, and market data.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }} className="responsive-chat">
        {/* Chat panel */}
        <div>
          {/* Language selector */}
          <div className="card" style={{ marginBottom: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={15} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>RESPONSE LANGUAGE</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {LANGUAGES.map(l => (
                <button key={l} onClick={() => setLanguage(l)} style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: language === l ? 'rgba(76,175,80,0.2)' : 'var(--bg-secondary)',
                  color: language === l ? '#4caf50' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                  {l === 'Bengali' ? 'বাংলা' : l === 'Hindi' ? 'हिंदी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, minHeight: 400, maxHeight: 520, overflowY: 'auto', marginBottom: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: 10, marginBottom: 16, alignItems: 'flex-start',
              }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #4caf50, #2e7d32)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
                    🌱
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '12px 14px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'var(--bg-secondary)',
                  border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontSize: 13, color: m.role === 'user' ? 'white' : 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {m.text}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                      {m.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {m.is_demo && <span className="demo-badge">Demo</span>}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #4caf50, #2e7d32)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🌱</div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '16px 16px 16px 4px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, background: '#4caf50', borderRadius: '50%', animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={startVoice} className="btn-ghost" style={{
              padding: 12, border: '1px solid var(--border)', borderRadius: 10,
              background: listening ? 'rgba(239,83,80,0.1)' : 'var(--bg-card)',
              color: listening ? '#ef5350' : 'var(--text-muted)',
            }} title="Voice input">
              <Mic size={18} />
            </button>
            <input
              className="input-field"
              placeholder="Ask about irrigation, disease, market prices..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendQuestion(input)}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => sendQuestion(input)}
              className="btn-primary"
              disabled={!input.trim() || loading}
              style={{ padding: '0 16px', borderRadius: 10 }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Quick Questions */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Quick Questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendQuestion(q)} style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '9px 12px', cursor: 'pointer', textAlign: 'left', fontSize: 12,
                  color: 'var(--text-secondary)', transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4caf50'; e.currentTarget.style.color = '#4caf50'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Advisory */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={12} /> SMS Advisory
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Send a concise farm advisory SMS. Works on feature phones.
            </div>
            <input
              className="input-field"
              placeholder="+91 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ marginBottom: 8, fontSize: 13 }}
            />
            <button onClick={handleSMS} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled={smsSending}>
              <Phone size={14} /> {smsSending ? 'Generating...' : 'Generate Advisory SMS'}
            </button>

            {smsResult && (
              <div style={{ marginTop: 12, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  SMS PREVIEW
                  <button onClick={() => copyText(smsResult.message_text)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4caf50' : 'var(--text-muted)' }}>
                    {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{smsResult.message_text}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: smsResult.status === 'SENT' ? 'rgba(76,175,80,0.2)' : 'rgba(255,213,79,0.15)',
                    color: smsResult.status === 'SENT' ? '#4caf50' : '#ffd54f',
                  }}>{smsResult.status}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{smsResult.note}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .responsive-chat { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
