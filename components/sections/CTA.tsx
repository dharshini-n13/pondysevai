'use client'

import { useTranslations, useLocale } from 'next-intl'

export default function CTA() {
  const t = useTranslations('cta')
  const locale = useLocale()

  return (
    <section className="py-20 px-5 lg:px-8 relative overflow-hidden" style={{ background: '#1A2B4A' }}>
      <div className="absolute right-0 top-0 w-96 h-96 rounded-full translate-x-1/3 -translate-y-1/3" style={{ background: '#E65C00', opacity: 0.07 }} />
      <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full -translate-x-1/3 translate-y-1/3" style={{ background: '#E65C00', opacity: 0.05 }} />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="font-black text-white leading-tight mb-4"
          style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1.5px' }}>
          {t('title')}
        </h2>
        <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('sub')}</p>
        <a href={`/${locale}/register`}
          className="inline-block text-white font-semibold text-lg rounded-xl px-10 py-5 transition-all hover:-translate-y-1"
          style={{ background: '#E65C00', boxShadow: '0 20px 40px rgba(230,92,0,0.2)' }}>
          {t('btn')}
        </a>
        <div className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          An Initiative by <span style={{ color: '#E65C00', fontWeight: 500 }}>Decision Minds</span> · For the Government of Puducherry
        </div>
      </div>
    </section>
  )
}
