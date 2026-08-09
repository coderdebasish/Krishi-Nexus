'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header style={{
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}>
              <Leaf size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Krishi<span style={{ color: '#10b981' }}>Nexus</span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginTop: -2 }}>
                Farm Intelligence
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4 }} className="hidden md:flex">
            {[
              { href: '/', label: 'Dashboard' },
              { href: '/farm', label: 'My Farm' },
              { href: '/crop-doctor', label: 'Crop Doctor' },
              { href: '/advisory', label: 'Advisory' },
              { href: '/markets', label: 'Markets' },
              { href: '/copilot', label: 'Ask Your Farm' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                  color: pathname === href ? '#10b981' : 'var(--text-secondary)',
                  background: pathname === href ? 'var(--accent-green-light)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Controls & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#059669" />}
            </button>

            {/* Status indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              <span className="status-dot dot-green" />
              <span className="hidden md:inline">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
