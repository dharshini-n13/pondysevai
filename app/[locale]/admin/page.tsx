'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import { getSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'
import { Users, Building2, ClipboardList, TrendingUp, Download, Bell, Shield, Plus, X, Eye, EyeOff, RefreshCw, Trash2 } from 'lucide-react'

type Stats = {
  total: number
  by_status: Record<string, number>
  by_commune: Record<string, number>
  by_tier: Record<string, number>
}

type StaffMember = {
  id: string; name: string; email: string; role: string; commune: string; created_at: string
}

export default function AdminPage() {
  const locale = useLocale()
  const t = useTranslations('admin')
  const ad = useTranslations('admin_data')
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'officers' | 'settings'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [officerForm, setOfficerForm] = useState({ name: '', email: '', password: '', commune: '', role: 'nodal_officer' })
  const [showPass, setShowPass] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    setSession(getSession())
    loadStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'officers') loadStaff()
  }, [activeTab])

  const loadStats = async () => {
    try {
      const result = await api.nodalOfficer.stats() as Stats
      setStats(result)
    } catch { /* silent */ }
  }

  const loadStaff = async () => {
    setStaffLoading(true)
    try {
      const result = await api.admin.listStaff() as { staff: StaffMember[] }
      setStaffList(result.staff)
    } catch { /* silent */ } finally { setStaffLoading(false) }
  }

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from the system?`)) return
    try {
      await api.admin.deleteStaff(id)
      setStaffList(prev => prev.filter(s => s.id !== id))
      showToast('Staff account removed')
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message)
    }
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!officerForm.name.trim()) { setFormError('Name is required'); return }
    if (!officerForm.email.trim()) { setFormError('Email is required'); return }
    if (!officerForm.password || officerForm.password.length < 6) { setFormError('Password must be at least 6 characters'); return }
    if (!officerForm.commune) { setFormError('Please select a commune'); return }

    setFormLoading(true)
    try {
      await api.admin.createStaff(officerForm)
      setFormSuccess(`"${officerForm.name}" created successfully!`)
      setOfficerForm({ name: '', email: '', password: '', commune: '', role: 'nodal_officer' })
      showToast('Staff account created!')
      loadStaff()
      setTimeout(() => { setShowAddOfficer(false); setFormSuccess('') }, 2000)
    } catch (err) {
      if (err instanceof ApiError) setFormError(err.message)
      else setFormError('Failed to create account. Please try again.')
    } finally { setFormLoading(false) }
  }

  if (!session.role) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F9F7' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>{t('access_required')}</h2>
        <a href={`/${locale}/login/admin`} className="text-sm font-medium" style={{ color: '#E65C00' }}>{t('access_link')}</a>
      </div>
    </div>
  )

  const total = stats?.total ?? 0
  const assigned = stats?.by_status?.['assigned'] ?? 0
  const pending = (stats?.by_status?.['pending_review'] ?? 0) + (stats?.by_status?.['registered'] ?? 0)
  const platinum = stats?.by_tier?.['platinum'] ?? 0

  const STATS = [
    { label: t('stat_volunteers'), value: total.toLocaleString(), change: `${pending} pending review`, icon: Users, color: '#E65C00' },
    { label: t('stat_deployments'), value: assigned.toString(), change: 'Volunteers assigned', icon: ClipboardList, color: '#1A56DB' },
    { label: t('stat_depts'), value: '8', change: 'Active departments', icon: Building2, color: '#16A34A' },
    { label: t('stat_platinum'), value: platinum.toString(), change: 'Platinum tier volunteers', icon: TrendingUp, color: '#7C3AED' },
  ]

  const TABS = [
    { key: 'overview', label: t('tab_overview') },
    { key: 'departments', label: t('tab_departments') },
    { key: 'officers', label: t('tab_officers') },
    { key: 'settings', label: t('tab_settings') },
  ]

  type AdKey = Parameters<typeof ad>[0]

  const DEPTS = [
    { name: 'Health & Sanitation', dept_id: 'health_san', roles: 4 },
    { name: 'Education', dept_id: 'education', roles: 4 },
    { name: 'Environment & Coastal', dept_id: 'environment', roles: 3 },
    { name: 'Law & Order / Traffic', dept_id: 'law_order', roles: 5 },
    { name: 'Tourism & Cultural Events', dept_id: 'tourism', roles: 4 },
    { name: 'Disaster Management', dept_id: 'disaster', roles: 2 },
    { name: 'Municipal & Administration', dept_id: 'municipal', roles: 3 },
    { name: 'Women & Child Welfare', dept_id: 'women_child', roles: 2 },
  ]

  const COMMUNES = Object.entries(stats?.by_commune ?? {}).map(([name, count]) => ({
    name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count)

  const TIER_SUMMARY = [
    { tier: 'bronze', color: '#D97706', count: stats?.by_tier?.['bronze'] ?? 0 },
    { tier: 'silver', color: '#6B7280', count: stats?.by_tier?.['silver'] ?? 0 },
    { tier: 'gold', color: '#B45309', count: stats?.by_tier?.['gold'] ?? 0 },
    { tier: 'platinum', color: '#7C3AED', count: stats?.by_tier?.['platinum'] ?? 0 },
  ]

  const SETTINGS = [
    { icon: '🌐', titleKey: 's1_title' as AdKey, descKey: 's1_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '🤖', titleKey: 's2_title' as AdKey, descKey: 's2_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '📱', titleKey: 's3_title' as AdKey, descKey: 's3_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '🏅', titleKey: 's4_title' as AdKey, descKey: 's4_desc' as AdKey, actionKey: 's_configure' as AdKey },
    { icon: '📄', titleKey: 's5_title' as AdKey, descKey: 's5_desc' as AdKey, actionKey: 's_upload' as AdKey },
    { icon: '🔒', titleKey: 's6_title' as AdKey, descKey: 's6_desc' as AdKey, actionKey: 's_manage' as AdKey },
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
              <button onClick={loadStats}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ border: '1px solid #E2E2DC', color: '#666', background: 'white' }}>
                <RefreshCw size={15} /> Refresh
              </button>
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
                style={{
                  background: activeTab === tab.key ? 'white' : 'transparent',
                  color: activeTab === tab.key ? '#1A2B4A' : '#888',
                  boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>Volunteer Status</h2>
                  {stats ? Object.entries(stats.by_status).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center py-2 text-sm" style={{ borderBottom: '1px solid #F9F9F7', color: '#666' }}>
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="font-semibold" style={{ color: '#1A2B4A' }}>{count}</span>
                    </div>
                  )) : <p className="text-sm" style={{ color: '#aaa' }}>Loading...</p>}
                </div>

                {/* Commune breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('commune_title')}</h2>
                  {COMMUNES.length > 0 ? COMMUNES.map(c => (
                    <div key={c.name} className="mb-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: '#666' }}>
                        <span>{c.name}</span>
                        <span>{c.count} volunteers</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#F0F0EE' }}>
                        <div className="h-full rounded-full" style={{ width: `${c.pct || 2}%`, background: '#E65C00' }} />
                      </div>
                    </div>
                  )) : <p className="text-xs" style={{ color: '#aaa' }}>No data yet.</p>}
                </div>

                {/* Tier breakdown (Phase 3) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>🏅 Reward Tiers</h2>
                  {TIER_SUMMARY.map(t => (
                    <div key={t.tier} className="flex justify-between items-center py-2 text-sm" style={{ borderBottom: '1px solid #F9F9F7' }}>
                      <span className="capitalize font-medium" style={{ color: t.color }}>{t.tier}</span>
                      <span className="font-semibold" style={{ color: '#1A2B4A' }}>{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Departments */}
          {activeTab === 'departments' && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF9' }}>
                    {['Department', 'ID', 'Roles', t('col_actions')].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPTS.map(d => (
                    <tr key={d.dept_id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #FAFAF8' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: '#1A2B4A' }}>{d.name}</td>
                      <td className="px-6 py-4 font-mono text-xs" style={{ color: '#888' }}>{d.dept_id}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: '#FFF1E8', color: '#E65C00' }}>{d.roles} roles</span>
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

          {/* Officers */}
          {activeTab === 'officers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg" style={{ color: '#1A2B4A' }}>Nodal Officers & Staff</h2>
                <button onClick={() => setShowAddOfficer(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
                  style={{ background: '#1A2B4A' }}>
                  <Plus size={15} /> Add Nodal Officer (Phase-2)
                </button>
              </div>

              {staffLoading ? (
                <div className="py-12 text-center" style={{ color: '#aaa' }}>Loading staff...</div>
              ) : staffList.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="text-4xl mb-4">🏛️</div>
                  <p className="text-sm mb-6" style={{ color: '#888' }}>No staff accounts yet. Add a nodal officer to get started.</p>
                  <button onClick={() => setShowAddOfficer(true)}
                    className="text-white text-sm font-medium px-6 py-3 rounded-xl inline-flex items-center gap-2"
                    style={{ background: '#1A2B4A' }}>
                    <Plus size={15} /> Add First Officer
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF9' }}>
                        {['Name', 'Email', 'Role', 'Commune', 'Added', 'Actions'].map(h => (
                          <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50" style={{ borderBottom: '1px solid #FAFAF8' }}>
                          <td className="px-5 py-4 font-medium" style={{ color: '#1A2B4A' }}>{s.name}</td>
                          <td className="px-5 py-4 text-xs" style={{ color: '#666' }}>{s.email}</td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: s.role === 'admin' ? '#EEF2FF' : '#F0FDF4', color: s.role === 'admin' ? '#4338CA' : '#16A34A' }}>
                              {s.role === 'admin' ? 'Admin' : 'Nodal Officer'}
                            </span>
                          </td>
                          <td className="px-5 py-4" style={{ color: '#666' }}>{s.commune}</td>
                          <td className="px-5 py-4 text-xs" style={{ color: '#aaa' }}>
                            {new Date(s.created_at).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleDeleteStaff(s.id, s.name)}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                              style={{ color: '#DC2626', background: '#FEF2F2' }}>
                              <Trash2 size={11} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
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

      {/* Add Officer Modal */}
      {showAddOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAddOfficer(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg" style={{ color: '#1A2B4A' }}>Add Staff Account</h2>
              <button onClick={() => setShowAddOfficer(false)} style={{ color: '#aaa' }}><X size={20} /></button>
            </div>
            <p className="text-sm mb-5" style={{ color: '#888' }}>Create a new nodal officer or admin account. They will be able to log in and manage volunteers.</p>

            {formError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>{formError}</div>
            )}
            {formSuccess && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' }}>✓ {formSuccess}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Role</label>
                <select className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                  value={officerForm.role}
                  onChange={e => setOfficerForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="nodal_officer">Nodal Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Full Name</label>
                <input className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                  placeholder="e.g. Ramesh Kumar"
                  value={officerForm.name}
                  onChange={e => setOfficerForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                  placeholder="officer@puducherry.gov.in"
                  value={officerForm.email}
                  onChange={e => setOfficerForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12"
                    style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                    placeholder="Min. 6 characters"
                    value={officerForm.password}
                    onChange={e => setOfficerForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#aaa' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Assigned Commune</label>
                <select className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: officerForm.commune ? '#1A2B4A' : '#aaa' }}
                  value={officerForm.commune}
                  onChange={e => setOfficerForm(f => ({ ...f, commune: e.target.value }))}>
                  <option value="">Select commune</option>
                  {['Puducherry', 'Villianur', 'Bahour', 'Ariyankuppam'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddOfficer(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid #E2E2DC', color: '#666' }}>Cancel</button>
              <button onClick={handleAddOfficer} disabled={formLoading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#1A2B4A', opacity: formLoading ? 0.7 : 1 }}>
                {formLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium text-white shadow-lg" style={{ background: '#1A2B4A' }}>
          ✓ {toast}
        </div>
      )}
    </>
  )
}