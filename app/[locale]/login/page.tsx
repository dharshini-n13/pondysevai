'use client'

import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'

export default function LoginIndexPage() {
  const locale = useLocale()
  const t = useTranslations('login')

  const PORTALS = [
    { href: '/login/volunteer', icon: '🙋', titleKey: 'vol_title', descKey: 'vol_desc', accent: '#E65C00', accentLight: '#FFF1E8' },
    { href: '/login/nodal-officer', icon: '🏛️', titleKey: 'nodal_title', descKey: 'nodal_desc', accent: '#1A56DB', accentLight: '#EEF2FA' },
    { href: '/login/admin', icon: '⚙️', titleKey: 'admin_title', descKey: 'admin_desc', accent: '#1A2B4A', accentLight: '#F1F5F9' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F9F7' }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'white', borderBottom: '1px solid #E5E5E0' }}>
        <a href={`/${locale}`} className="inline-flex items-center gap-2 text-sm" style={{ color: '#888', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> {t('back')}
        </a>
        <div className="font-black text-base" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
          <span style={{ color: '#E65C00' }}>Pondy</span><span style={{ color: '#1A2B4A' }}>SevAi</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="font-black text-3xl mb-2" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A', letterSpacing: '-1px' }}>
              {t('choose_portal')}
            </h1>
            <p className="text-sm" style={{ color: '#888' }}>{t('choose_sub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PORTALS.map(p => (
              <a key={p.href} href={`/${locale}${p.href}`}
                className="bg-white rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ border: '1px solid #EBEBEB', textDecoration: 'none' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: p.accentLight }}>{p.icon}</div>
                <h2 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t(p.titleKey as Parameters<typeof t>[0])}</h2>
                <p className="text-xs leading-relaxed mb-5" style={{ color: '#888' }}>{t(p.descKey as Parameters<typeof t>[0])}</p>
                <div className="inline-block text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: p.accent }}>{t('sign_in_btn')}</div>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-xs" style={{ color: '#ccc' }}>
            {t('new_volunteer')} <a href={`/${locale}/register`} style={{ color: '#E65C00', fontWeight: 500 }}>{t('register_link')}</a>
          </p>
        </div>
      </div>
    </div>
  )
}
