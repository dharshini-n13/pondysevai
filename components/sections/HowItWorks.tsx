'use client'

import { useTranslations } from 'next-intl'

const STEP_KEYS = ['step1', 'step2', 'step3', 'step4'] as const
const STEP_ICONS = ['👤', '🤖', '🎓', '🏅']

export default function HowItWorks() {
  const t = useTranslations('how')

  return (
    <section id="how" className="py-20 px-5 lg:px-8 scroll-mt-[72px]" style={{ background: '#F9F9F7' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#E65C00' }}>{t('tag')}</div>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-12">
          <h2 className="font-black flex-1 leading-tight" style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', letterSpacing: '-1px', color: '#1A2B4A' }}>
            {t('title')}
          </h2>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#888' }}>{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5 rounded-2xl overflow-hidden" style={{ background: '#E2E2DC' }}>
          {STEP_KEYS.map((key, i) => (
            <div key={key} className="p-7 group transition-colors duration-300 hover:bg-[#1A2B4A]" style={{ background: 'white' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1A2B4A')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <div className="text-5xl font-black leading-none mb-4 select-none" style={{ fontFamily: 'var(--font-sora), sans-serif', color: '#FFF1E8' }}>
                0{i + 1}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl" style={{ background: '#FFF1E8' }}>
                {STEP_ICONS[i]}
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--font-sora), sans-serif', color: '#1A2B4A' }}>
                {t(`${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
                {t(`${key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ background: 'rgba(230,92,0,0.05)', border: '1px solid rgba(230,92,0,0.15)', color: '#555' }}>
          <span className="text-lg">⚡</span>
          <span>
            <strong style={{ color: '#1A2B4A' }}>AI-assisted matching</strong> — Claude API generates natural-language assessments for nodal officers. The officer always makes the final placement decision.
          </span>
        </div>
      </div>
    </section>
  )
}
