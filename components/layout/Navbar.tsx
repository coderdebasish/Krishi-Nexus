'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Activity } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header style={{
      background: 'rgba(10,15,10,0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#e8f5e9', letterSpacing: '-0.3px' }}>
                Krishi<span style={{ color: '#4caf50' }}>Nexus</span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginTop: -2 }}>
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
                  padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname === href ? '#4caf50' : 'var(--text-secondary)',
                  background: pathname === href ? 'rgba(76,175,80,0.12)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <span className="status-dot dot-green" />
            <span className="hidden md:inline">System Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
