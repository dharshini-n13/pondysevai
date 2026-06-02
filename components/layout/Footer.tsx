'use client'

import { useLocale } from 'next-intl'

export default function Footer() {
  const locale = useLocale()
  const lp = (path: string) => `/${locale}${path}`

  return (
    <footer style={{ background: '#1A2B4A', color: 'white' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-black text-xl tracking-tight mb-1" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              <span style={{ color: '#E65C00' }}>Pondy</span>SevAi
            </div>
            <p className="text-xs font-medium mb-3" style={{ color: '#E65C00' }}>An Initiative by Decision Minds</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              A civic volunteering platform connecting Puducherry citizens with government departments.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Powered by Anthropic Claude API
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Platform</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/register', label: 'Register' },
                { href: '/departments', label: 'Departments' },
                { href: '/#how', label: 'How It Works' },
                { href: '/rewards', label: 'Leaderboard' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={lp(link.href)} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Government */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Government</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/nodal-officer', label: 'Nodal Officer Login' },
                { href: '/nodal-officer', label: 'Post a Role' },
                { href: '/nodal-officer', label: 'Download Reports' },
              ].map((link, i) => (
                <li key={i}>
                  <a href={lp(link.href)} className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Info</h3>
            <ul className="space-y-2.5">
              {['About the Project', 'Privacy Policy', 'Contact'].map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
          <p>© 2025 PondySevai. Government of Puducherry Initiative.</p>
          <p>Built with Claude Code · An Initiative by <span style={{ color: '#E65C00' }}>Decision Minds</span></p>
        </div>
      </div>
    </footer>
  )
}
