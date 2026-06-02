'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import { Search, Download, X, Check, MessageSquare } from 'lucide-react'
import { getSession } from '@/lib/store'

export default function NodalOfficerPage() {
  const locale = useLocale()
  const t = useTranslations('nodal')
  const d = useTranslations('nodal_data')
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })

  // Build applicants from translations so everything is in the right language
  const BASE_APPLICANTS = [
    { id: 1, nameKey: 'a1_name', deptKey: 'a1_dept', roleKey: 'a1_role', aiKey: 'a1_ai', score: 0.87, status: 'Pending', phone: '9876543210', commune: 'Puducherry' },
    { id: 2, nameKey: 'a2_name', deptKey: 'a2_dept', roleKey: 'a2_role', aiKey: 'a2_ai', score: 0.79, status: 'Pending', phone: '9865432109', commune: 'Villianur' },
    { id: 3, nameKey: 'a3_name', deptKey: 'a3_dept', roleKey: 'a3_role', aiKey: 'a3_ai', score: 0.82, status: 'Assigned', phone: '9754321098', commune: 'Ariyankuppam' },
    { id: 4, nameKey: 'a4_name', deptKey: 'a4_dept', roleKey: 'a4_role', aiKey: 'a4_ai', score: 0.71, status: 'Pending', phone: '9643210987', commune: 'Bahour' },
    { id: 5, nameKey: 'a5_name', deptKey: 'a5_dept', roleKey: 'a5_role', aiKey: 'a5_ai', score: 0.74, status: 'Review',   phone: '9532109876', commune: 'Puducherry' },
    { id: 6, nameKey: 'a6_name', deptKey: 'a6_dept', roleKey: 'a6_role', aiKey: 'a6_ai', score: 0.85, status: 'Assigned', phone: '9421098765', commune: 'Villianur' },
  ]

  type ApplicantState = { id: number; status: string; customRole?: string }
  const [statuses, setStatuses] = useState<ApplicantState[]>(
    BASE_APPLICANTS.map(a => ({ id: a.id, status: a.status }))
  )

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCommune, setFilterCommune] = useState('All')
  const [expandedAi, setExpandedAi] = useState<number | null>(null)
  const [showModal, setShowModal] = useState<{ id: number; action: 'assign' | 'reject' } | null>(null)
  const [roleInput, setRoleInput] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => { setSession(getSession()) }, [])

  const getStatus = (id: number) => statuses.find(s => s.id === id)?.status || 'Pending'
  const getCustomRole = (id: number) => statuses.find(s => s.id === id)?.customRole

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAction = (id: number, action: 'assign' | 'reject' | 'review') => {
    if (action === 'assign' || action === 'reject') { setShowModal({ id, action }); return }
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, status: 'Review' } : s))
    showToast(t('toast_review'))
  }

  const confirmModal = () => {
    if (!showModal) return
    if (showModal.action === 'assign') {
      setStatuses(prev => prev.map(s => s.id === showModal.id ? { ...s, status: 'Assigned', customRole: roleInput || undefined } : s))
      showToast(t('toast_assigned'))
    } else {
      setStatuses(prev => prev.map(s => s.id === showModal.id ? { ...s, status: 'Rejected' } : s))
      showToast(t('toast_rejected'))
    }
    setShowModal(null); setRoleInput('')
  }

  if (!session.role) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F9F7' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>{t('access_required')}</h2>
        <a href={`/${locale}/login/nodal-officer`} style={{ color: '#1A56DB' }}>{t('access_link')}</a>
      </div>
    </div>
  )

  const statusKeys = ['All', 'Pending', 'Review', 'Assigned', 'Rejected'] as const
  const statusLabels: Record<string, string> = {
    All: t('all'), Pending: t('pending'), Review: t('review'), Assigned: t('assigned'), Rejected: t('rejected')
  }
  const statusStyles: Record<string, { bg: string; color: string }> = {
    Pending:  { bg: '#FEFCE8', color: '#CA8A04' },
    Assigned: { bg: '#F0FDF4', color: '#16A34A' },
    Review:   { bg: '#EEF2FF', color: '#4338CA' },
    Rejected: { bg: '#FEF2F2', color: '#DC2626' },
  }

  const counts: Record<string, number> = { All: 0, Pending: 0, Assigned: 0, Review: 0, Rejected: 0 }
  statuses.forEach(s => {
    counts.All++
    if (s.status in counts) counts[s.status]++
  })

  const filtered = BASE_APPLICANTS.filter(a => {
    const name = d(`${a.nameKey}` as Parameters<typeof d>[0]) as string
    const dept = d(`${a.deptKey}` as Parameters<typeof d>[0]) as string
    const ms = name.toLowerCase().includes(search.toLowerCase()) ||
               a.commune.toLowerCase().includes(search.toLowerCase()) ||
               dept.toLowerCase().includes(search.toLowerCase())
    const mst = filterStatus === 'All' || getStatus(a.id) === filterStatus
    const mc = filterCommune === 'All' || a.commune === filterCommune
    return ms && mst && mc
  })

  const modalApplicant = showModal ? BASE_APPLICANTS.find(a => a.id === showModal.id) : null

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs mb-1" style={{ color: '#888' }}>{t('portal_label')} · {session.name}</div>
              <h1 className="font-black text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('page_title')}</h1>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ border: '1px solid #E2E2DC', color: '#666', background: 'white' }}>
                <MessageSquare size={15} /> {t('bulk_sms')}
              </button>
              <button className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ border: '1px solid #E2E2DC', color: '#666', background: 'white' }}>
                <Download size={15} /> {t('export_csv')}
              </button>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {statusKeys.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: filterStatus === s ? '#1A2B4A' : 'white', color: filterStatus === s ? 'white' : '#666', border: '1px solid ' + (filterStatus === s ? '#1A2B4A' : '#E2E2DC') }}>
                {statusLabels[s]} <span className="ml-1 text-xs opacity-70">{counts[s]}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl p-4 mb-4 flex flex-wrap gap-3 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            <div className="flex-1 min-w-48 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#aaa' }} />
              <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                placeholder={t('search_placeholder')}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1px solid #E2E2DC', color: '#666' }}
              value={filterCommune} onChange={e => setFilterCommune(e.target.value)}>
              <option value="All">{t('all_communes')}</option>
              {['Puducherry', 'Villianur', 'Bahour', 'Ariyankuppam'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0F0EE', background: '#FAFAF9' }}>
                  {[t('col_applicant'), t('col_commune'), t('col_dept'), t('col_score'), t('col_role'), t('col_status'), t('col_actions')].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const currentStatus = getStatus(a.id)
                  const ss = statusStyles[currentStatus] || { bg: '#F9F9F7', color: '#888' }
                  const name = d(`${a.nameKey}` as Parameters<typeof d>[0]) as string
                  const dept = d(`${a.deptKey}` as Parameters<typeof d>[0]) as string
                  const role = getCustomRole(a.id) || d(`${a.roleKey}` as Parameters<typeof d>[0]) as string
                  const aiText = d(`${a.aiKey}` as Parameters<typeof d>[0]) as string
                  return (
                    <>
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #FAFAF8' }}>
                        <td className="px-5 py-4">
                          <div className="font-medium" style={{ color: '#1A2B4A' }}>{name}</div>
                          <div className="text-xs" style={{ color: '#aaa' }}>+91 {a.phone}</div>
                        </td>
                        <td className="px-5 py-4" style={{ color: '#666' }}>{a.commune}</td>
                        <td className="px-5 py-4" style={{ color: '#666' }}>{dept}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 rounded-full" style={{ background: '#F0F0EE' }}>
                              <div className="h-full rounded-full" style={{ width: `${a.score * 100}%`, background: '#E65C00' }} />
                            </div>
                            <span className="font-mono text-xs font-semibold" style={{ color: '#1A2B4A' }}>{a.score.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[160px]"><span className="text-xs" style={{ color: '#666' }}>{role}</span></td>
                        <td className="px-5 py-4">
                          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: ss.bg, color: ss.color }}>{statusLabels[currentStatus] || currentStatus}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <button onClick={() => setExpandedAi(expandedAi === a.id ? null : a.id)}
                              className="text-xs font-medium text-left" style={{ color: '#1A56DB' }}>
                              {expandedAi === a.id ? t('hide_ai') : t('show_ai')}
                            </button>
                            {(currentStatus === 'Pending' || currentStatus === 'Review') && (
                              <div className="flex gap-2">
                                <button onClick={() => handleAction(a.id, 'assign')}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                                  style={{ background: '#16A34A' }}>
                                  <Check size={11} /> {t('btn_assign')}
                                </button>
                                <button onClick={() => handleAction(a.id, 'reject')}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                                  style={{ background: '#DC2626' }}>
                                  <X size={11} /> {t('btn_reject')}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedAi === a.id && (
                        <tr key={`ai-${a.id}`}>
                          <td colSpan={7} className="px-5 pb-4 pt-0">
                            <div className="rounded-xl px-5 py-4 text-sm leading-relaxed"
                              style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.2)', color: '#1A2B4A' }}>
                              <span className="block text-xs font-semibold mb-2" style={{ color: '#1A56DB' }}>⚡ {t('ai_label')}</span>
                              {aiText}
                              <span className="block text-xs mt-2" style={{ color: '#aaa' }}>
                                {t('ai_meta').replace('{score}', a.score.toFixed(2))}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: '#aaa' }}>{t('no_results')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && modalApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#1A2B4A' }}>
              {showModal.action === 'assign' ? t('modal_assign_title') : t('modal_reject_title')}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#888' }}>
              {(showModal.action === 'assign' ? t('modal_assign_sub') : t('modal_reject_sub'))
                .replace('{name}', d(`${modalApplicant.nameKey}` as Parameters<typeof d>[0]) as string)}
            </p>
            {showModal.action === 'assign' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>{t('modal_role_label')}</label>
                <input className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                  placeholder={d(`${modalApplicant.roleKey}` as Parameters<typeof d>[0]) as string}
                  value={roleInput} onChange={e => setRoleInput(e.target.value)} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid #E2E2DC', color: '#666' }}>{t('modal_cancel')}</button>
              <button onClick={confirmModal} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: showModal.action === 'assign' ? '#16A34A' : '#DC2626' }}>
                {showModal.action === 'assign' ? t('modal_confirm_assign') : t('modal_confirm_reject')}
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
