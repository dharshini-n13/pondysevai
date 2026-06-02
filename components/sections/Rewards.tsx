'use client'

import { useTranslations } from 'next-intl'

const TIER_KEYS = ['bronze', 'silver', 'gold', 'platinum'] as const
const PERK_KEYS = ['cert', 'cash', 'title_role', 'contract'] as const

const TIERS = {
  bronze:   { gradient: 'linear-gradient(135deg, #92400e, #b45309)', perks: 1 },
  silver:   { gradient: 'linear-gradient(135deg, #64748b, #94a3b8)', perks: 2 },
  gold:     { gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', perks: 3 },
  platinum: { gradient: 'linear-gradient(135deg, #334155, #475569)', perks: 4 },
}

export default function Rewards() {
  const t = useTranslations('rewards')

  return (
    <section id="rewards" className="py-20 px-5 lg:px-8 scroll-mt-[72px]" style={{ background: '#F9F9F7' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#E65C00' }}>{t('tag')}</div>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-12">
          <h2 className="font-black flex-1 leading-tight"
            style={{ fontFamily: 'var(--font-sora),sans-serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '-1px', color: '#1A2B4A' }}>
            {t('title')}
          </h2>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#888' }}>{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIER_KEYS.map((key) => {
            const tier = TIERS[key]
            return (
              <div key={key} className="rounded-2xl overflow-hidden shadow-md">
                <div className="p-6 text-white" style={{ background: tier.gradient }}>
                  <div className="font-black text-2xl mb-0.5" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>{t(`${key}.name`)}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{t(`${key}.duration`)}</div>
                  <div className="mt-4 text-xs font-medium inline-block px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    {t(`${key}.months`)}
                  </div>
                </div>
                <div className="bg-white p-5 space-y-2.5">
                  {PERK_KEYS.map((perk, pi) => {
                    const unlocked = pi < tier.perks
                    return (
                      <div key={perk} className="flex items-center gap-3 text-sm" style={{ color: unlocked ? '#1A2B4A' : '#ccc' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                          style={{ background: unlocked ? '#DCFCE7' : '#F3F4F6', color: unlocked ? '#16A34A' : '#ccc' }}>
                          ✓
                        </div>
                        {t(perk)}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-6 text-xs text-center" style={{ color: '#aaa' }}>
          {t('disclaimer')}
        </p>
      </div>
    </section>
  )
}
