'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Star, Clock, MapPin, Bell, Award, ChevronRight, Calendar, QrCode, Download } from 'lucide-react'
import { getSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'

type VolunteerProfile = {
  id: string; full_name: string; commune: string; status: string;
  tier?: string | null; ai_score?: number | null; ai_assessment?: string | null;
  ai_top_matches?: string | null; assigned_role?: string | null; assigned_dept?: string | null;
  latest_feedback?: string | null; created_at?: string;
}

type Deployment = {
  id: string; role_id: string; location: string; scheduled_date: string;
  shift: string; status: string; roles?: { name: string; dept_name: string }
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; months: number; next: string; nextMonths: number }> = {
  bronze:   { label: 'Bronze',   color: '#D97706', bg: '#FEF3C7', months: 1,  next: 'Silver',   nextMonths: 3 },
  silver:   { label: 'Silver',   color: '#6B7280', bg: '#F3F4F6', months: 3,  next: 'Gold',     nextMonths: 6 },
  gold:     { label: 'Gold',     color: '#B45309', bg: '#FFFBEB', months: 6,  next: 'Platinum', nextMonths: 12 },
  platinum: { label: 'Platinum', color: '#7C3AED', bg: '#F5F3FF', months: 12, next: '',         nextMonths: 12 },
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSession(getSession())
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, deployData] = await Promise.allSettled([
        api.volunteers.me() as Promise<VolunteerProfile>,
        api.deployments.my() as Promise<{ deployments: Deployment[] }>,
      ])
      if (profileData.status === 'fulfilled') setProfile(profileData.value)
      if (deployData.status === 'fulfilled') setDeployments(deployData.value.deployments)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const tier = profile?.tier ? TIER_CONFIG[profile.tier] : null
  const upcoming = deployments.filter(d => d.status === 'scheduled')[0]
  const completedMonths = deployments.filter(d => d.status === 'completed').length
  const totalHours = completedMonths * 8

  const TRAINING_MODULES = [
    { key: 'training_1', done: true },
    { key: 'training_2', done: true },
    { key: 'training_3', done: false },
    { key: 'training_4', done: false },
  ] as const

  if (!session.role) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F9F7' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>Login Required</h2>
        <a href={`/${locale}/login/volunteer`} style={{ color: '#E65C00' }}>Login as Volunteer</a>
      </div>
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

          {/* Welcome bar */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: '#1A2B4A' }}>
            <div className="absolute right-0 top-0 w-64 h-64 rounded-full translate-x-1/4 -translate-y-1/4" style={{ background: '#E65C00', opacity: 0.08 }} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  {profile?.status?.replace('_', ' ') || t('status')}
                </div>
                <h1 className="font-bold text-white text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
                  {t('greeting')}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {profile?.assigned_role || profile?.commune || t('role')}
                </p>
              </div>
              {profile?.created_at && (
                <div className="rounded-xl px-5 py-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('volunteer_since')}</div>
                  <div className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
                    {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tier progress */}
          {tier ? (
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award size={18} style={{ color: tier.color }} />
                  <span className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>
                    🏅 {tier.label} Tier
                  </span>
                </div>
                {tier.next && (
                  <span className="text-xs" style={{ color: '#aaa' }}>
                    Next: {tier.next} ({tier.nextMonths - completedMonths} months away)
                  </span>
                )}
              </div>
              <div className="h-2 rounded-full" style={{ background: '#F0F0EE' }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${Math.min((completedMonths / tier.nextMonths) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc)`
                }} />
              </div>
              {profile?.tier === 'platinum' && (
                <div className="mt-3 px-4 py-2 rounded-xl text-xs" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                  🎉 You've reached Platinum! You are eligible for a government volunteer contract.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award size={18} style={{ color: '#D97706' }} />
                  <span className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('bronze_tier')}</span>
                </div>
                <span className="text-xs" style={{ color: '#aaa' }}>{t('tier_prog')}</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#F0F0EE' }}>
                <div className="h-full rounded-full" style={{ width: '5%', background: 'linear-gradient(90deg, #E65C00, #FF7B2E)' }} />
              </div>
              <p className="text-xs mt-2" style={{ color: '#aaa' }}>Complete 1 deployment month to earn Bronze tier.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { num: completedMonths.toString(), label: t('months'), icon: '📅' },
              { num: totalHours.toString(), label: t('hours'), icon: '⏱️' },
              { num: deployments.length.toString(), label: t('deployments'), icon: '🎯' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #EBEBEB' }}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-black text-3xl tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{stat.num}</div>
                <div className="text-xs" style={{ color: '#aaa' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* AI Assessment card */}
          {profile?.ai_assessment && (
            <div className="rounded-2xl p-5 mb-6" style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.2)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: '#1A56DB' }}>⚡ Your AI Profile Assessment</div>
              <p className="text-sm" style={{ color: '#1A2B4A' }}>{profile.ai_assessment}</p>
              {profile.ai_score && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full" style={{ background: '#D0D8F0' }}>
                    <div className="h-full rounded-full" style={{ width: `${profile.ai_score * 100}%`, background: '#1A56DB' }} />
                  </div>
                  <span className="text-xs font-mono font-semibold" style={{ color: '#1A56DB' }}>
                    Score: {profile.ai_score.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* Upcoming deployment or current assignment */}
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('assignment')}</h2>
                  {(upcoming || profile?.assigned_role) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: '#F0FDF4', color: '#16A34A' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                      {t('active')}
                    </span>
                  )}
                </div>
                {upcoming ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm"><Calendar size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{upcoming.roles?.name || 'Volunteer Role'}</span></div>
                    <div className="flex items-center gap-3 text-sm"><MapPin size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{upcoming.location}</span></div>
                    <div className="flex items-center gap-3 text-sm"><Clock size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{upcoming.scheduled_date} · {upcoming.shift}</span></div>
                    <div className="mt-5 flex gap-3">
                      <button className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-sm font-medium"
                        style={{ background: '#E65C00' }}>
                        <QrCode size={16} /> {t('qr_checkin')}
                      </button>
                      <button className="flex-1 rounded-xl py-3 text-sm font-medium"
                        style={{ border: '1px solid #E2E2DC', color: '#666' }}>
                        {t('view_map')}
                      </button>
                    </div>
                  </div>
                ) : profile?.assigned_role ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm"><Calendar size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{profile.assigned_role}</span></div>
                    <div className="flex items-center gap-3 text-sm"><MapPin size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{profile.assigned_dept || 'Government of Puducherry'}</span></div>
                    <div className="flex items-center gap-3 text-sm"><Clock size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{t('assignment_time')}</span></div>
                    <div className="mt-5 flex gap-3">
                      <button className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-sm font-medium"
                        style={{ background: '#E65C00' }}>
                        <QrCode size={16} /> {t('qr_checkin')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm" style={{ color: '#aaa' }}>
                      {profile?.status === 'registered' ? 'Your application is being reviewed. A nodal officer will assign you a role soon.' :
                       profile?.status === 'pending_review' ? 'AI assessment complete. Waiting for officer review.' :
                       'No active deployment. Check back soon!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Training */}
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('training_progress')}</h2>
                <div className="space-y-3">
                  {TRAINING_MODULES.map((m) => (
                    <div key={m.key} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                        style={{ background: m.done ? '#DCFCE7' : '#F3F4F6', color: m.done ? '#16A34A' : '#ccc' }}>✓</div>
                      <span style={{ color: m.done ? '#444' : '#aaa' }}>{t(m.key)}</span>
                      {!m.done && <button className="ml-auto text-xs" style={{ color: '#E65C00' }}>{t('start')}</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Performance */}
              <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>{t('performance')}</h3>
                {profile?.latest_feedback ? (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                    style={{ background: profile.latest_feedback === 'top_performer' ? '#FEFCE8' : '#F0FDF4' }}>
                    <Star size={18} style={{ color: '#D97706', fill: profile.latest_feedback === 'top_performer' ? '#D97706' : 'none' }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>
                        {profile.latest_feedback.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-xs" style={{ color: '#888' }}>Latest deployment feedback</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#F9F9F7' }}>
                    <Star size={18} style={{ color: '#ccc' }} />
                    <div className="text-sm" style={{ color: '#aaa' }}>No feedback yet</div>
                  </div>
                )}
              </div>

              {/* Certificate */}
              {profile?.tier && (
                <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Certificate</h3>
                  <a href={profile?.id ? api.certificates.downloadUrl(profile.id) : '#'}
                    className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-medium text-white"
                    style={{ background: '#1A2B4A', textDecoration: 'none' }}>
                    <Download size={15} /> Download Certificate
                  </a>
                  <p className="text-xs mt-2" style={{ color: '#aaa' }}>
                    {tier?.label} tier certificate with QR verification
                  </p>
                </div>
              )}

              {/* Quick links */}
              <div className="rounded-2xl p-5" style={{ background: 'rgba(26,43,74,0.03)', border: '1px solid #EBEBEB' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>{t('quick_links')}</h3>
                <div className="space-y-2">
                  {[t('cert_download'), t('training_videos'), t('contact_supervisor'), t('report_issue')].map(label => (
                    <a key={label} href="#" className="flex items-center justify-between text-sm py-1"
                      style={{ color: '#666', textDecoration: 'none' }}>
                      {label} <ChevronRight size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <a href={`/${locale}`} className="text-sm" style={{ color: '#aaa', textDecoration: 'none' }}>← {t('back')}</a>
          </div>
        </div>
      </main>
    </>
  )
}