'use client'

import { useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Rewards from '@/components/sections/Rewards'

const RANKS = ['🥇','🥈','🥉']

type LbKey = `v${1|2|3|4|5|6|7|8}_${'name'|'dept'|'tier'}`

const LEADERBOARD_IDS = [1,2,3,4,5,6,7,8] as const

// Tier badge colours — keyed by English tier name for lookup
const TIER_COLORS: Record<string, { bg: string; color: string }> = {
  // English
  Platinum: { bg: '#F1F5F9', color: '#475569' },
  Gold:     { bg: '#FEFCE8', color: '#CA8A04' },
  Silver:   { bg: '#F8FAFC', color: '#64748B' },
  Bronze:   { bg: '#FFF7ED', color: '#B45309' },
  // Tamil
  'பிளாட்டினம்': { bg: '#F1F5F9', color: '#475569' },
  'தங்கம்':      { bg: '#FEFCE8', color: '#CA8A04' },
  'வெள்ளி':      { bg: '#F8FAFC', color: '#64748B' },
  'வெண்கலம்':    { bg: '#FFF7ED', color: '#B45309' },
  // French
  Platine: { bg: '#F1F5F9', color: '#475569' },
  Or:      { bg: '#FEFCE8', color: '#CA8A04' },
  Argent:  { bg: '#F8FAFC', color: '#64748B' },
}

export default function RewardsPage() {
  const t = useTranslations('rewards')
  const lb = useTranslations('lb')

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="px-5 lg:px-8 py-16 relative overflow-hidden" style={{ background: '#1A2B4A' }}>
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full translate-x-1/3 -translate-y-1/3" style={{ background: '#E65C00', opacity: 0.06 }} />
          <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="font-black text-white mb-3"
              style={{ fontFamily: 'var(--font-sora),sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-1px' }}>
              {t('title')}
            </h1>
            <p className="text-base max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('sub')}</p>
          </div>
        </div>

        <Rewards />

        {/* Leaderboard */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">🏆</span>
            <h2 className="font-bold text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>
              {t('leaderboard_title')}
            </h2>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF9' }}>
                  {[t('col_rank'), t('col_volunteer'), t('col_commune'), t('col_department'), t('col_months'), t('col_tier')].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD_IDS.map((n, i) => {
                  const name = lb(`v${n}_name` as LbKey)
                  const dept = lb(`v${n}_dept` as LbKey)
                  const tier = lb(`v${n}_tier` as LbKey)
                  const months = [11, 8, 7, 5, 3, 3, 2, 1][i]
                  const commune = ['Puducherry','Villianur','Ariyankuppam','Bahour','Puducherry','Villianur','Puducherry','Ariyankuppam'][i]
                  const ts = TIER_COLORS[tier] || TIER_COLORS['Bronze']
                  return (
                    <tr key={n} className="hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: '1px solid #FAFAF8', background: i < 3 ? 'rgba(230,92,0,0.02)' : undefined }}>
                      <td className="px-6 py-4 font-bold text-lg" style={{ color: '#ddd', fontFamily: 'var(--font-sora),sans-serif' }}>
                        {i < 3 ? RANKS[i] : `#${n}`}
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: '#1A2B4A' }}>{name}</td>
                      <td className="px-6 py-4" style={{ color: '#666' }}>{commune}</td>
                      <td className="px-6 py-4" style={{ color: '#666' }}>{dept}</td>
                      <td className="px-6 py-4 font-semibold" style={{ color: '#1A2B4A' }}>{months}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: ts.bg, color: ts.color }}>{tier}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-center" style={{ color: '#ccc' }}>* {t('leaderboard_note')}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
