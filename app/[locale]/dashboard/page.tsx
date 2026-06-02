'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Star, Clock, MapPin, Bell, Award, ChevronRight, Calendar, QrCode } from 'lucide-react'
import { getSession } from '@/lib/store'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  useEffect(() => { setSession(getSession()) }, [])

  const TRAINING_MODULES = [
    { key: 'training_1', done: true },
    { key: 'training_2', done: true },
    { key: 'training_3', done: false },
    { key: 'training_4', done: false },
  ] as const

  const NOTIFICATIONS = [
    { msgKey: 'notif_1', timeKey: 'time_2h', unread: true },
    { msgKey: 'notif_2', timeKey: 'time_1d', unread: false },
    { msgKey: 'notif_3', timeKey: 'time_3d', unread: false },
  ] as const

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
                  {t('status')}
                </div>
                <h1 className="font-bold text-white text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>{t('greeting')}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('role')}</p>
              </div>
              <div className="rounded-xl px-5 py-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('volunteer_since')}</div>
                <div className="font-bold text-white text-lg" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>{t('april_2025')}</div>
              </div>
            </div>
          </div>

          {/* Tier progress */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={18} style={{ color: '#D97706' }} />
                <span className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('bronze_tier')}</span>
              </div>
              <span className="text-xs" style={{ color: '#aaa' }}>{t('tier_prog')}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: '#F0F0EE' }}>
              <div className="h-full rounded-full" style={{ width: '33%', background: 'linear-gradient(90deg, #E65C00, #FF7B2E)' }} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { num: '1', label: t('months'), icon: '📅' },
              { num: '24', label: t('hours'), icon: '⏱️' },
              { num: '3', label: t('deployments'), icon: '🎯' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #EBEBEB' }}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-black text-3xl tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{stat.num}</div>
                <div className="text-xs" style={{ color: '#aaa' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* Assignment */}
              <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('assignment')}</h2>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: '#F0FDF4', color: '#16A34A' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    {t('active')}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm"><Calendar size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{t('assignment_event')}</span></div>
                  <div className="flex items-center gap-3 text-sm"><MapPin size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{t('assignment_location')}</span></div>
                  <div className="flex items-center gap-3 text-sm"><Clock size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{t('assignment_time')}</span></div>
                </div>
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
                <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#FEFCE8' }}>
                  <Star size={18} style={{ color: '#D97706', fill: '#D97706' }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>{t('top_performer')}</div>
                    <div className="text-xs" style={{ color: '#888' }}>{t('pongal_event')}</div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={16} style={{ color: '#aaa' }} />
                  <h3 className="font-semibold text-sm" style={{ color: '#1A2B4A' }}>{t('notifications')}</h3>
                </div>
                <div className="space-y-3">
                  {NOTIFICATIONS.map((n, i) => (
                    <div key={i} className="text-xs leading-relaxed" style={{ color: n.unread ? '#1A2B4A' : '#aaa', fontWeight: n.unread ? 500 : 400 }}>
                      {n.unread && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: '#E65C00' }} />}
                      {t(n.msgKey)}
                      <span className="block" style={{ color: '#ccc', marginTop: '2px' }}>{t(n.timeKey)}</span>
                    </div>
                  ))}
                </div>
              </div>

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
