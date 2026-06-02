'use client'

import { useTranslations, useLocale } from 'next-intl'

const DEPT_KEYS = ['health', 'education', 'welfare', 'environment', 'digital', 'culture'] as const
const DEPT_ICONS = ['🏥', '📚', '🤝', '🌿', '💻', '🎭']
const DEPT_COLORS = [
  { bg: '#FEF2F2', border: '#FECACA', badge: '#DC2626' },
  { bg: '#EFF6FF', border: '#BFDBFE', badge: '#2563EB' },
  { bg: '#F5F3FF', border: '#DDD6FE', badge: '#7C3AED' },
  { bg: '#F0FDF4', border: '#BBF7D0', badge: '#16A34A' },
  { bg: '#EEF2FF', border: '#C7D2FE', badge: '#4338CA' },
  { bg: '#FFF7ED', border: '#FED7AA', badge: '#EA580C' },
]

export default function Departments() {
  const t = useTranslations('dept')
  const locale = useLocale()

  return (
    <section id="departments" className="py-20 px-5 lg:px-8 scroll-mt-[72px]" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#E65C00' }}>{t('tag')}</div>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-12">
          <h2 className="font-black flex-1 leading-tight" style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', letterSpacing: '-1px', color: '#1A2B4A' }}>
            {t('title')}
          </h2>
          <a href={`/${locale}/departments`} className="inline-flex items-center gap-2 text-sm font-medium transition-all" style={{ color: '#E65C00' }}>
            {t('viewall')} →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPT_KEYS.map((key, i) => {
            const c = DEPT_COLORS[i]
            return (
              <div key={key} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{DEPT_ICONS[i]}</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: c.badge, background: 'rgba(255,255,255,0.7)' }}>
                    {t(`${key}.roles`)}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--font-sora), sans-serif', color: '#1A2B4A' }}>
                  {t(`${key}.name`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  {t(`${key}.desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
