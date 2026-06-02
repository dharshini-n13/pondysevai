'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import { getSession } from '@/lib/store'
import { Users, Building2, ClipboardList, TrendingUp, Download, Bell, Shield } from 'lucide-react'

export default function AdminPage() {
  const locale = useLocale()
  const t = useTranslations('admin')
  const ad = useTranslations('admin_data')
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'officers' | 'settings'>('overview')
  useEffect(() => { setSession(getSession()) }, [])

  if (!session.role) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F9F7' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>{t('access_required')}</h2>
        <a href={`/${locale}/login/admin`} className="text-sm font-medium" style={{ color: '#E65C00' }}>{t('access_link')}</a>
      </div>
    </div>
  )

  const STATS = [
    { label: t('stat_volunteers'), value: '1,247', change: t('stat_change_volunteers'), icon: Users, color: '#E65C00' },
    { label: t('stat_deployments'), value: '312', change: t('stat_change_deployments'), icon: ClipboardList, color: '#1A56DB' },
    { label: t('stat_depts'), value: '12', change: t('stat_change_depts'), icon: Building2, color: '#16A34A' },
    { label: t('stat_platinum'), value: '8', change: t('stat_change_platinum'), icon: TrendingUp, color: '#7C3AED' },
  ]

  const TABS = [
    { key: 'overview', label: t('tab_overview') },
    { key: 'departments', label: t('tab_departments') },
    { key: 'officers', label: t('tab_officers') },
    { key: 'settings', label: t('tab_settings') },
  ]

  type AdKey = Parameters<typeof ad>[0]

  const ACTIVITY = [
    { eventKey: 'act1_event' as AdKey, detailKey: 'act1_detail' as AdKey, timeKey: 'time_2min' as AdKey, type: 'register' },
    { eventKey: 'act2_event' as AdKey, detailKey: 'act2_detail' as AdKey, timeKey: 'time_15min' as AdKey, type: 'assign' },
    { eventKey: 'act3_event' as AdKey, detailKey: 'act3_detail' as AdKey, timeKey: 'time_1h' as AdKey, type: 'login' },
    { eventKey: 'act4_event' as AdKey, detailKey: 'act4_detail' as AdKey, timeKey: 'time_2h' as AdKey, type: 'role' },
    { eventKey: 'act5_event' as AdKey, detailKey: 'act5_detail' as AdKey, timeKey: 'time_3h' as AdKey, type: 'cert' },
    { eventKey: 'act6_event' as AdKey, detailKey: 'act6_detail' as AdKey, timeKey: 'time_5h' as AdKey, type: 'tier' },
  ]
  const TYPE_COLORS: Record<string, string> = { register: '#E65C00', assign: '#1A56DB', login: '#888', role: '#16A34A', cert: '#7C3AED', tier: '#D97706' }

  const QUICK_ACTIONS = [
    { labelKey: 'qa1' as AdKey, icon: '👤' }, { labelKey: 'qa2' as AdKey, icon: '📋' },
    { labelKey: 'qa3' as AdKey, icon: '📥' }, { labelKey: 'qa4' as AdKey, icon: '📱' },
    { labelKey: 'qa5' as AdKey, icon: '🏅' }, { labelKey: 'qa6' as AdKey, icon: '⚙️' },
  ]

  const DEPTS = [
    { nameKey: 'dept_health' as AdKey, officerKey: 'officer_ramesh' as AdKey, volunteers: 234, open: 6 },
    { nameKey: 'dept_education' as AdKey, officerKey: 'officer_kavitha' as AdKey, volunteers: 189, open: 5 },
    { nameKey: 'dept_environment' as AdKey, officerKey: 'officer_arjun' as AdKey, volunteers: 156, open: 5 },
    { nameKey: 'dept_law' as AdKey, officerKey: 'officer_murugan' as AdKey, volunteers: 143, open: 5 },
    { nameKey: 'dept_tourism' as AdKey, officerKey: 'officer_francois' as AdKey, volunteers: 98, open: 6 },
    { nameKey: 'dept_disaster' as AdKey, officerKey: 'officer_suresh' as AdKey, volunteers: 87, open: 3 },
  ]

  const SETTINGS = [
    { icon: '🌐', titleKey: 's1_title' as AdKey, descKey: 's1_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '🤖', titleKey: 's2_title' as AdKey, descKey: 's2_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '📱', titleKey: 's3_title' as AdKey, descKey: 's3_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '🏅', titleKey: 's4_title' as AdKey, descKey: 's4_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '📄', titleKey: 's5_title' as AdKey, descKey: 's5_desc' as AdKey, actionKey: 's_upload' as AdKey },
    { icon: '🔒', titleKey: 's6_title' as AdKey, descKey: 's6_desc' as AdKey, actionKey: 's_manage' as AdKey },
  ]

  const COMMUNES = [
    { name: 'Puducherry', pct: 52, count: 648 },
    { name: 'Villianur', pct: 22, count: 274 },
    { name: 'Ariyankuppam', pct: 15, count: 187 },
    { name: 'Bahour', pct: 11, count: 138 },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} style={{ color: '#1A2B4A' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#888' }}>{t('label')}</span>
              </div>
              <h1 className="font-black text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('page_title')}</h1>
              <p className="text-sm mt-0.5" style={{ color: '#888' }}>{t('signed_in_as')} {session.name}</p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ border: '1px solid #E2E2DC', color: '#666', background: 'white' }}>
                <Download size={15} /> {t('export')}
              </button>
              <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl text-white"
                style={{ background: '#1A2B4A' }}>
                <Bell size={15} /> {t('announce')}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: '#EBEBEB' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: activeTab === tab.key ? 'white' : 'transparent', color: activeTab === tab.key ? '#1A2B4A' : '#888', boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {STATS.map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color + '15' }}>
                        <Icon size={16} style={{ color: s.color }} />
                      </div>
                      <div className="font-black text-2xl mb-0.5" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{s.value}</div>
                      <div className="text-xs font-medium mb-1" style={{ color: '#1A2B4A' }}>{s.label}</div>
                      <div className="text-xs" style={{ color: '#aaa' }}>{s.change}</div>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('activity_title')}</h2>
                  <div className="space-y-4">
                    {ACTIVITY.map((a, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: TYPE_COLORS[a.type] }} />
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: '#1A2B4A' }}>{ad(a.eventKey)}</div>
                          <div className="text-xs" style={{ color: '#888' }}>{ad(a.detailKey)}</div>
                        </div>
                        <div className="text-xs flex-shrink-0" style={{ color: '#ccc' }}>{ad(a.timeKey)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Quick actions */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('actions_title')}</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {QUICK_ACTIONS.map(a => (
                        <button key={a.labelKey} className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
                          style={{ border: '1px solid #F0F0EE', color: '#1A2B4A', background: '#FAFAF9' }}>
                          <span>{a.icon}</span> {ad(a.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commune breakdown */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>{t('commune_title')}</h3>
                    {COMMUNES.map(c => (
                      <div key={c.name} className="mb-3">
                        <div className="flex justify-between text-xs mb-1" style={{ color: '#666' }}>
                          <span>{c.name}</span>
                          <span>{c.count} {ad('commune_volunteers' as AdKey)}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#F0F0EE' }}>
                          <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: '#E65C00' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'departments' && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF9' }}>
                    {[t('col_dept'), t('col_officer'), t('col_volunteers'), t('col_open'), t('col_actions')].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPTS.map(d2 => (
                    <tr key={d2.nameKey} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #FAFAF8' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: '#1A2B4A' }}>{ad(d2.nameKey)}</td>
                      <td className="px-6 py-4" style={{ color: '#666' }}>{ad(d2.officerKey)}</td>
                      <td className="px-6 py-4 font-semibold" style={{ color: '#1A2B4A' }}>{d2.volunteers}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: '#FFF1E8', color: '#E65C00' }}>{d2.open} {t('open_suffix')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-xs font-medium" style={{ color: '#1A56DB' }}>{t('manage')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'officers' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center" style={{ border: '1px solid #EBEBEB' }}>
              <div className="text-4xl mb-4">🏛️</div>
              <h2 className="font-bold text-lg mb-2" style={{ color: '#1A2B4A' }}>{t('officers_title')}</h2>
              <p className="text-sm mb-6" style={{ color: '#888' }}>{t('officers_desc')}</p>
              <button className="text-white text-sm font-medium px-6 py-3 rounded-xl" style={{ background: '#1A2B4A' }}>{t('officers_btn')}</button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SETTINGS.map(s => (
                <div key={s.titleKey} className="bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="text-2xl">{s.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: '#1A2B4A' }}>{ad(s.titleKey)}</h3>
                    <p className="text-xs mb-3" style={{ color: '#888' }}>{ad(s.descKey)}</p>
                    <button className="text-xs font-semibold" style={{ color: '#E65C00' }}>{ad(s.actionKey)} →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
