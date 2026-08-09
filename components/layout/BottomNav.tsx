'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, Microscope, BarChart3, ShoppingCart, MessageCircle } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/farm', label: 'Farm', icon: Sprout },
  { href: '/crop-doctor', label: 'Doctor', icon: Microscope },
  { href: '/markets', label: 'Markets', icon: ShoppingCart },
  { href: '/copilot', label: 'Ask', icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(10,15,10,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
    }} className="md:hidden">
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                textDecoration: 'none', padding: '6px 14px', borderRadius: 10,
                background: active ? 'rgba(76,175,80,0.12)' : 'transparent',
                transition: 'all 0.15s ease',
                minWidth: 56,
              }}
            >
              <Icon
                size={20}
                color={active ? '#4caf50' : '#4a7a4a'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.3px',
                color: active ? '#4caf50' : '#4a7a4a',
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
