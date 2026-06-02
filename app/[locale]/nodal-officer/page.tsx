'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import { Search, Download, X, Check, MessageSquare } from 'lucide-react'
import { getSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'

type Applicant = {
  id: string; full_name: string; phone: string; commune: string;
  status: string; ai_score: number | null; ai_assessment: string | null;
  assigned_role: string | null; assigned_dept: string | null;
  departments?: string[]
}

// Fallback mock data when API not yet populated
const MOCK: Applicant[] = [
  { id: '1', full_name: 'Kavitha S.', phone: '9876543210', commune: 'Puducherry', status: 'pending_review', ai_score: 0.87, ai_assessment: 'Strong Tamil communication and NSS experience. Closely matches health camp and vaccination roles.', assigned_role: 'Health Camp Registration Aide', assigned_dept: 'Health & Medical' },
  { id: '2', full_name: 'Rajan M.', phone: '9865432109', commune: 'Villianur', status: 'pending_review', ai_score: 0.79, ai_assessment: "Bachelor's degree in Education, fluent in Tamil and English. Recommended for primary school support roles.", assigned_role: 'Teaching Assistant (Primary)', assigned_dept: 'Education' },
]

export default function NodalOfficerPage() {
  const locale = useLocale()
  const t = useTranslations('nodal')
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCommune, setFilterCommune] = useState('All')
  const [expandedAi, setExpandedAi] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<{ id: string; action: 'assign' | 'reject' } | null>(null)
  const [roleInput, setRoleInput] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    setSession(getSession())
    loadApplicants()
  }, [])

  const loadApplicants = async () => {
    setLoading(true)
    try {
      const result = await api.nodalOfficer.applicants() as { applicants: Applicant[] }
      setApplicants(result.applicants.length > 0 ? result.applicants : MOCK)
    } catch {
      setApplicants(MOCK)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAssign = async (id: string, role: string, dept: string) => {
    try {
      await api.nodalOfficer.assign(id, role, dept)
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'assigned', assigned_role: role } : a))
      showToast(t('toast_assigned'))
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message)
    }
    setShowModal(null); setRoleInput('')
  }

  const handleReject = async (id: string) => {
    try {
      await api.nodalOfficer.reject(id)
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
      showToast(t('toast_rejected'))
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message)
    }
    setShowModal(null)
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

  const statusLabels: Record<string, string> = {
    All: t('all'), pending_review: t('pending'), registered: t('pending'),
    assigned: t('assigned'), rejected: t('rejected'), review: t('review')
  }
  const statusStyles: Record<string, { bg: string; color: string }> = {
    pending_review: { bg: '#FEFCE8', color: '#CA8A04' },
    registered:     { bg: '#FEFCE8', color: '#CA8A04' },
    assigned:       { bg: '#F0FDF4', color: '#16A34A' },
    review:         { bg: '#EEF2FF', color: '#4338CA' },
    rejected:       { bg: '#FEF2F2', color: '#DC2626' },
  }

  const counts = { All: applicants.length, pending_review: 0, assigned: 0, review: 0, rejected: 0 }
  applicants.forEach(a => { if (a.status in counts) counts[a.status as keyof typeof counts]++ })

  const filtered = applicants.filter(a => {
    const ms = a.full_name.toLowerCase().includes(search.toLowerCase()) || a.commune.toLowerCase().includes(search.toLowerCase())
    const mst = filterStatus === 'All' || a.status === filterStatus
    const mc = filterCommune === 'All' || a.commune === filterCommune
    return ms && mst && mc
  })

  const modalApplicant = showModal ? applicants.find(a => a.id === showModal.id) : null

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
              <a href={api.nodalOfficer.exportCsvUrl()}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ border: '1px solid #E2E2DC', color: '#666', background: 'white', textDecoration: 'none' }}>
                <Download size={15} /> {t('export_csv')}
              </a>
            </div>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {(['All', 'pending_review', 'review', 'assigned', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: filterStatus === s ? '#1A2B4A' : 'white', color: filterStatus === s ? 'white' : '#666', border: '1px solid ' + (filterStatus === s ? '#1A2B4A' : '#E2E2DC') }}>
                {statusLabels[s] || s} <span className="ml-1 text-xs opacity-70">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>

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

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            {loading ? (
              <div className="py-16 text-center" style={{ color: '#aaa' }}>Loading applicants...</div>
            ) : (
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
                    const ss = statusStyles[a.status] || { bg: '#F9F9F7', color: '#888' }
                    return (
                      <>
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #FAFAF8' }}>
                          <td className="px-5 py-4">
                            <div className="font-medium" style={{ color: '#1A2B4A' }}>{a.full_name}</div>
                            <div className="text-xs" style={{ color: '#aaa' }}>+91 {a.phone}</div>
                          </td>
                          <td className="px-5 py-4" style={{ color: '#666' }}>{a.commune}</td>
                          <td className="px-5 py-4" style={{ color: '#666' }}>{a.assigned_dept || (a.departments?.[0]) || '—'}</td>
                          <td className="px-5 py-4">
                            {a.ai_score != null ? (
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 rounded-full" style={{ background: '#F0F0EE' }}>
                                  <div className="h-full rounded-full" style={{ width: `${a.ai_score * 100}%`, background: '#E65C00' }} />
                                </div>
                                <span className="font-mono text-xs font-semibold" style={{ color: '#1A2B4A' }}>{a.ai_score.toFixed(2)}</span>
                              </div>
                            ) : <span style={{ color: '#ccc' }}>—</span>}
                          </td>
                          <td className="px-5 py-4 max-w-[160px]"><span className="text-xs" style={{ color: '#666' }}>{a.assigned_role || '—'}</span></td>
                          <td className="px-5 py-4">
                            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: ss.bg, color: ss.color }}>{statusLabels[a.status] || a.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              {a.ai_assessment && (
                                <button onClick={() => setExpandedAi(expandedAi === a.id ? null : a.id)}
                                  className="text-xs font-medium text-left" style={{ color: '#1A56DB' }}>
                                  {expandedAi === a.id ? t('hide_ai') : t('show_ai')}
                                </button>
                              )}
                              {(a.status === 'pending_review' || a.status === 'registered' || a.status === 'review') && (
                                <div className="flex gap-2">
                                  <button onClick={() => setShowModal({ id: a.id, action: 'assign' })}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                                    style={{ background: '#16A34A' }}>
                                    <Check size={11} /> {t('btn_assign')}
                                  </button>
                                  <button onClick={() => setShowModal({ id: a.id, action: 'reject' })}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                                    style={{ background: '#DC2626' }}>
                                    <X size={11} /> {t('btn_reject')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedAi === a.id && a.ai_assessment && (
                          <tr key={`ai-${a.id}`}>
                            <td colSpan={7} className="px-5 pb-4 pt-0">
                              <div className="rounded-xl px-5 py-4 text-sm leading-relaxed"
                                style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.2)', color: '#1A2B4A' }}>
                                <span className="block text-xs font-semibold mb-2" style={{ color: '#1A56DB' }}>⚡ {t('ai_label')}</span>
                                {a.ai_assessment}
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
            )}
          </div>
        </div>
      </main>

      {showModal && modalApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#1A2B4A' }}>
              {showModal.action === 'assign' ? t('modal_assign_title') : t('modal_reject_title')}
            </h2>
            <p className="text-sm mb-4" style={{ color: '#888' }}>
              {(showModal.action === 'assign' ? t('modal_assign_sub') : t('modal_reject_sub')).replace('{name}', modalApplicant.full_name)}
            </p>
            {showModal.action === 'assign' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>{t('modal_role_label')}</label>
                <input className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                  placeholder={modalApplicant.assigned_role || 'Enter role'}
                  value={roleInput} onChange={e => setRoleInput(e.target.value)} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid #E2E2DC', color: '#666' }}>{t('modal_cancel')}</button>
              <button onClick={() => {
                if (showModal.action === 'assign') {
                  handleAssign(showModal.id, roleInput || modalApplicant.assigned_role || 'Volunteer', modalApplicant.assigned_dept || 'General')
                } else {
                  handleReject(showModal.id)
                }
              }} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
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
