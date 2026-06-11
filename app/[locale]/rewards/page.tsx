'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Rewards from '@/components/sections/Rewards'
import { api } from '@/lib/api'

type LeaderboardEntry = {
  id: string; full_name: string; commune: string; assigned_dept: string | null;
  tier: string | null; completed_months: number; latest_feedback: string | null;
}

const TIER_COLORS: Record<string, { bg: string; color: string }> = {
  platinum: { bg: '#F1F5F9', color: '#475569' },
  gold:     { bg: '#FEFCE8', color: '#CA8A04' },
  silver:   { bg: '#F8FAFC', color: '#64748B' },
  bronze:   { bg: '#FFF7ED', color: '#B45309' },
}

const RANKS = ['🥇', '🥈', '🥉']

export default function RewardsPage() {
  const t = useTranslations('rewards')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCommune, setActiveCommune] = useState('All')

  useEffect(() => { loadLeaderboard() }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const result = await api.rewards.leaderboard() as { leaderboard: LeaderboardEntry[] }
      setLeaderboard(result.leaderboard)
    } catch {
      // fallback to empty
    } finally { setLoading(false) }
  }

  const communes = ['All', 'Puducherry', 'Villianur', 'Bahour', 'Ariyankuppam']
  const filtered = activeCommune === 'All' ? leaderboard : leaderboard.filter(v => v.commune === activeCommune)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        {/* Hero */}
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

        {/* Tier info cards */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">
          <h2 className="font-bold text-xl mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>
            🏅 Reward Tier System
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { tier: 'bronze', label: 'Bronze', months: '1 month', perks: 'Digital certificate, Community recognition', color: '#B45309', bg: '#FFF7ED' },
              { tier: 'silver', label: 'Silver', months: '3 months', perks: 'Silver certificate, Priority deployment selection', color: '#64748B', bg: '#F8FAFC' },
              { tier: 'gold', label: 'Gold', months: '6 months', perks: 'Gold certificate, Letter of recommendation', color: '#CA8A04', bg: '#FEFCE8' },
              { tier: 'platinum', label: 'Platinum', months: '12 months', perks: 'Platinum certificate, Government contract eligibility', color: '#475569', bg: '#F1F5F9' },
            ].map(t => (
              <div key={t.tier} className="rounded-2xl p-5 shadow-sm" style={{ background: t.bg, border: `1px solid ${t.color}20` }}>
                <div className="font-black text-lg mb-1" style={{ color: t.color, fontFamily: 'var(--font-sora),sans-serif' }}>🏅 {t.label}</div>
                <div className="text-xs font-semibold mb-2" style={{ color: t.color }}>{t.months} of service</div>
                <div className="text-xs" style={{ color: '#666' }}>{t.perks}</div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏆</span>
              <h2 className="font-bold text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>
                {t('leaderboard_title')}
              </h2>
            </div>
            <div className="flex gap-2">
              {communes.map(c => (
                <button key={c} onClick={() => setActiveCommune(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ background: activeCommune === c ? '#1A2B4A' : 'white', color: activeCommune === c ? 'white' : '#666', border: '1px solid ' + (activeCommune === c ? '#1A2B4A' : '#E2E2DC') }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            {loading ? (
              <div className="py-12 text-center" style={{ color: '#aaa' }}>Loading leaderboard...</div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center" style={{ color: '#aaa' }}>
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-sm">No volunteers on the leaderboard yet. Be the first!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF9' }}>
                    {[t('col_rank'), t('col_volunteer'), t('col_commune'), t('col_department'), t('col_months'), t('col_tier')].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const tc = TIER_COLORS[v.tier?.toLowerCase() || ''] || TIER_COLORS['bronze']
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors"
                        style={{ borderBottom: '1px solid #FAFAF8', background: i < 3 ? 'rgba(230,92,0,0.02)' : undefined }}>
                        <td className="px-6 py-4 font-bold text-lg" style={{ color: i < 3 ? '#E65C00' : '#ddd', fontFamily: 'var(--font-sora),sans-serif' }}>
                          {i < 3 ? RANKS[i] : `#${i + 1}`}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium" style={{ color: '#1A2B4A' }}>{v.full_name}</div>
                          {v.latest_feedback === 'top_performer' && (
                            <span className="text-xs" style={{ color: '#D97706' }}>⭐ Top Performer</span>
                          )}
                        </td>
                        <td className="px-6 py-4" style={{ color: '#666' }}>{v.commune}</td>
                        <td className="px-6 py-4" style={{ color: '#666' }}>{v.assigned_dept || '—'}</td>
                        <td className="px-6 py-4 font-semibold" style={{ color: '#1A2B4A' }}>{v.completed_months}</td>
                        <td className="px-6 py-4">
                          {v.tier ? (
                            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                              style={{ background: tc.bg, color: tc.color }}>🏅 {v.tier}</span>
                          ) : <span style={{ color: '#ccc' }}>—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          <p className="mt-3 text-xs text-center" style={{ color: '#ccc' }}>* {t('leaderboard_note')}</p>
        </div>
      </main>
      <Footer />
    </>
  )
}