'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import { Search, Download, X, Check, MessageSquare, RefreshCw, Star, ChevronDown } from 'lucide-react'
import { getSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'

type Applicant = {
  id: string; full_name: string; phone: string; commune: string;
  status: string; ai_score: number | null; ai_assessment: string | null;
  ai_top_matches: string | null;
  assigned_role: string | null; assigned_dept: string | null;
  departments?: string[]; tier?: string | null; latest_feedback?: string | null;
}

type TopMatch = { role_id: string; role_name: string; dept: string; score: number; demand: string }

const DEPARTMENTS = [
  'Health & Sanitation', 'Education', 'Environment & Coastal',
  'Law & Order / Traffic', 'Tourism & Cultural Events',
  'Disaster Management', 'Municipal & Administration', 'Women & Child Welfare'
]

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  bronze:   { label: 'Bronze',   color: '#D97706', bg: '#FEF3C7' },
  silver:   { label: 'Silver',   color: '#6B7280', bg: '#F3F4F6' },
  gold:     { label: 'Gold',     color: '#B45309', bg: '#FFFBEB' },
  platinum: { label: 'Platinum', color: '#7C3AED', bg: '#F5F3FF' },
}

export default function NodalOfficerPage() {
  const locale = useLocale()
  const t = useTranslations('nodal')
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCommune, setFilterCommune] = useState('All')
  const [expandedAi, setExpandedAi] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState<Applicant | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<Applicant | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState<Applicant | null>(null)
  const [roleInput, setRoleInput] = useState('')
  const [deptInput, setDeptInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [shiftInput, setShiftInput] = useState('')
  const [feedbackCategory, setFeedbackCategory] = useState('regular')
  const [feedbackNotes, setFeedbackNotes] = useState('')
  const [toast, setToast] = useState('')
  const [reassessing, setReassessing] = useState<string | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})

  useEffect(() => {
    setSession(getSession())
    loadApplicants()
  }, [])

  const loadApplicants = async () => {
    setLoading(true); setError('')
    try {
      const result = await api.nodalOfficer.applicants() as { applicants: Applicant[] }
      setApplicants(result.applicants)
      // Build stats
      const s: Record<string, number> = { All: result.applicants.length }
      result.applicants.forEach(a => {
        const k = a.status === 'registered' ? 'pending_review' : a.status
        s[k] = (s[k] || 0) + 1
      })
      setStats(s)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 || err.status === 403
          ? 'Session expired. Please log in again.'
          : err.message)
      } else {
        setError('Failed to load applicants.')
      }
    } finally { setLoading(false) }
  }

  const handleReassess = async (id: string) => {
    setReassessing(id)
    try {
      await api.volunteers.reassess(id)
      showToast('AI reassessment queued — refreshing in 6 seconds')
      setTimeout(() => loadApplicants(), 6000)
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message)
    } finally { setReassessing(null) }
  }

  const handleAssign = async () => {
    if (!showAssignModal) return
    try {
      await api.nodalOfficer.assign(
        showAssignModal.id,
        roleInput || showAssignModal.assigned_role || 'Volunteer',
        deptInput || showAssignModal.assigned_dept || 'General',
        locationInput,
        dateInput,
        shiftInput,
      )
      setApplicants(prev => prev.map(a => a.id === showAssignModal.id
        ? { ...a, status: 'assigned', assigned_role: roleInput, assigned_dept: deptInput } : a))
      showToast('Volunteer assigned successfully!')
    } catch (err) { if (err instanceof ApiError) showToast(err.message) }
    setShowAssignModal(null)
    setRoleInput(''); setDeptInput(''); setLocationInput(''); setDateInput(''); setShiftInput('')
  }

  const handleReject = async () => {
    if (!showRejectModal) return
    try {
      await api.nodalOfficer.reject(showRejectModal.id)
      setApplicants(prev => prev.map(a => a.id === showRejectModal.id ? { ...a, status: 'rejected' } : a))
      showToast('Application rejected')
    } catch (err) { if (err instanceof ApiError) showToast(err.message) }
    setShowRejectModal(null)
  }

  const handleFeedback = async () => {
    if (!showFeedbackModal) return
    try {
      await api.deployments.feedback(showFeedbackModal.id, feedbackCategory, feedbackNotes)
      setApplicants(prev => prev.map(a => a.id === showFeedbackModal.id
        ? { ...a, latest_feedback: feedbackCategory } : a))
      showToast('Feedback submitted')
    } catch (err) { if (err instanceof ApiError) showToast(err.message) }
    setShowFeedbackModal(null); setFeedbackCategory('regular'); setFeedbackNotes('')
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

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

  const filtered = applicants.filter(a => {
    const ms = a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.commune.toLowerCase().includes(search.toLowerCase()) ||
      (a.phone && a.phone.includes(search))
    const mst = filterStatus === 'All' || a.status === filterStatus ||
      (filterStatus === 'pending_review' && a.status === 'registered')
    const mc = filterCommune === 'All' || a.commune === filterCommune
    return ms && mst && mc
  })

  const parseTopMatches = (raw: string | null): TopMatch[] => {
    try { return raw ? JSON.parse(raw) : [] } catch { return [] }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs mb-1" style={{ color: '#888' }}>{t('portal_label')} · {session.name}</div>
              <h1 className="font-black text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('page_title')}</h1>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={loadApplicants}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl"
                style={{ border: '1px solid #E2E2DC', color: '#666', background: 'white' }}>
                <RefreshCw size={15} /> Refresh
              </button>
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

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error}
              {error.includes('expired') && (
                <a href={`/${locale}/login/nodal-officer`} className="underline ml-2 font-medium">Login again</a>
              )}
            </div>
          )}

          {/* Status tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['All', 'pending_review', 'review', 'assigned', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: filterStatus === s ? '#1A2B4A' : 'white',
                  color: filterStatus === s ? 'white' : '#666',
                  border: '1px solid ' + (filterStatus === s ? '#1A2B4A' : '#E2E2DC')
                }}>
                {statusLabels[s]} <span className="ml-1 text-xs opacity-70">{stats[s] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
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
            {loading ? (
              <div className="py-16 text-center" style={{ color: '#aaa' }}>Loading volunteers...</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center" style={{ color: '#aaa' }}>
                {applicants.length === 0 ? 'No volunteers registered yet.' : t('no_results')}
              </div>
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
                    const topMatches = parseTopMatches(a.ai_top_matches)
                    const tier = a.tier ? TIER_CONFIG[a.tier] : null
                    return (
                      <>
                        <tr key={a.id} style={{ borderBottom: '1px solid #FAFAF8' }}>
                          <td className="px-5 py-4">
                            <div className="font-medium" style={{ color: '#1A2B4A' }}>{a.full_name}</div>
                            <div className="text-xs" style={{ color: '#aaa' }}>+91 {a.phone}</div>
                            {tier && (
                              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                                style={{ background: tier.bg, color: tier.color }}>
                                🏅 {tier.label}
                              </span>
                            )}
                            {a.latest_feedback && (
                              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ml-1"
                                style={{ background: '#FEF3C7', color: '#D97706' }}>
                                ⭐ {a.latest_feedback.replace('_', ' ')}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4" style={{ color: '#666' }}>{a.commune}</td>
                          <td className="px-5 py-4" style={{ color: '#666' }}>{a.assigned_dept || (a.departments?.[0]) || '—'}</td>
                          <td className="px-5 py-4">
                            {a.ai_score != null && a.ai_score > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 rounded-full" style={{ background: '#F0F0EE' }}>
                                  <div className="h-full rounded-full" style={{ width: `${a.ai_score * 100}%`, background: '#E65C00' }} />
                                </div>
                                <span className="font-mono text-xs font-semibold" style={{ color: '#1A2B4A' }}>{a.ai_score.toFixed(2)}</span>
                              </div>
                            ) : (
                              <button onClick={() => handleReassess(a.id)} disabled={reassessing === a.id}
                                className="text-xs flex items-center gap-1" style={{ color: '#E65C00' }}>
                                <RefreshCw size={10} className={reassessing === a.id ? 'animate-spin' : ''} />
                                {reassessing === a.id ? 'Running...' : 'Run AI'}
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-4 max-w-[140px]">
                            <span className="text-xs" style={{ color: '#666' }}>{a.assigned_role || (topMatches[0]?.role_name ?? '—')}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                              style={{ background: ss.bg, color: ss.color }}>
                              {statusLabels[a.status] || a.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              {a.ai_assessment && (
                                <button onClick={() => setExpandedAi(expandedAi === a.id ? null : a.id)}
                                  className="text-xs font-medium text-left flex items-center gap-1" style={{ color: '#1A56DB' }}>
                                  <ChevronDown size={10} className={expandedAi === a.id ? 'rotate-180' : ''} />
                                  {expandedAi === a.id ? t('hide_ai') : t('show_ai')}
                                </button>
                              )}
                              {(a.status === 'pending_review' || a.status === 'registered' || a.status === 'review') && (
                                <div className="flex gap-1.5 flex-wrap">
                                  <button onClick={() => { setShowAssignModal(a); setRoleInput(a.assigned_role || topMatches[0]?.role_name || ''); setDeptInput(a.assigned_dept || topMatches[0]?.dept || '') }}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                                    style={{ background: '#16A34A' }}>
                                    <Check size={11} /> {t('btn_assign')}
                                  </button>
                                  <button onClick={() => setShowRejectModal(a)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                                    style={{ background: '#DC2626' }}>
                                    <X size={11} /> {t('btn_reject')}
                                  </button>
                                </div>
                              )}
                              {a.status === 'assigned' && (
                                <button onClick={() => setShowFeedbackModal(a)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg"
                                  style={{ background: '#FEF3C7', color: '#D97706' }}>
                                  <Star size={11} /> Feedback
                                </button>
                              )}
                              {a.ai_score != null && a.ai_score > 0 && (
                                <button onClick={() => handleReassess(a.id)} disabled={reassessing === a.id}
                                  className="text-xs flex items-center gap-1" style={{ color: '#888' }}>
                                  <RefreshCw size={10} className={reassessing === a.id ? 'animate-spin' : ''} />
                                  Re-assess
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* AI expanded row */}
                        {expandedAi === a.id && (
                          <tr key={`ai-${a.id}`}>
                            <td colSpan={7} className="px-5 pb-4 pt-0">
                              <div className="rounded-xl px-5 py-4 text-sm leading-relaxed"
                                style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.2)', color: '#1A2B4A' }}>
                                <span className="block text-xs font-semibold mb-2" style={{ color: '#1A56DB' }}>⚡ {t('ai_label')}</span>
                                <p className="mb-3">{a.ai_assessment}</p>
                                {topMatches.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {topMatches.slice(0, 3).map(m => (
                                      <span key={m.role_id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                                        style={{ background: 'rgba(26,86,219,0.08)', color: '#1A56DB' }}>
                                        {m.role_name}
                                        <span className="opacity-60">·</span>
                                        <span className="font-mono">{m.score.toFixed(2)}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowAssignModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#1A2B4A' }}>{t('modal_assign_title')}</h2>
            <p className="text-sm mb-5" style={{ color: '#888' }}>Assigning <strong>{showAssignModal.full_name}</strong> to a role.</p>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Role</label>
              <input className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                placeholder="Enter role name"
                value={roleInput} onChange={e => setRoleInput(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Department</label>
              <select className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '1px solid #E2E2DC', color: deptInput ? '#1A2B4A' : '#aaa' }}
                value={deptInput} onChange={e => setDeptInput(e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Deployment Location</label>
              <input className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                placeholder="e.g. Beach Road, Puducherry"
                value={locationInput} onChange={e => setLocationInput(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Date</label>
                <input type="date" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                  value={dateInput} onChange={e => setDateInput(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Shift</label>
                <select className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #E2E2DC', color: shiftInput ? '#1A2B4A' : '#aaa' }}
                  value={shiftInput} onChange={e => setShiftInput(e.target.value)}>
                  <option value="">Select shift</option>
                  <option value="06:00 AM - 10:00 AM">Morning (6–10 AM)</option>
                  <option value="10:00 AM - 02:00 PM">Late Morning (10 AM–2 PM)</option>
                  <option value="02:00 PM - 06:00 PM">Afternoon (2–6 PM)</option>
                  <option value="06:00 PM - 10:00 PM">Evening (6–10 PM)</option>
                  <option value="Full Day 08:00 AM - 06:00 PM">Full Day (8 AM–6 PM)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(null)} className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid #E2E2DC', color: '#666' }}>{t('modal_cancel')}</button>
              <button onClick={handleAssign} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#16A34A' }}>{t('modal_confirm_assign')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowRejectModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#1A2B4A' }}>{t('modal_reject_title')}</h2>
            <p className="text-sm mb-5" style={{ color: '#888' }}>Are you sure you want to reject <strong>{showRejectModal.full_name}</strong>'s application?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid #E2E2DC', color: '#666' }}>{t('modal_cancel')}</button>
              <button onClick={handleReject} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#DC2626' }}>{t('modal_confirm_reject')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal (Phase 3) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowFeedbackModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#1A2B4A' }}>Submit Feedback</h2>
            <p className="text-sm mb-5" style={{ color: '#888' }}>Rate <strong>{showFeedbackModal.full_name}</strong>'s performance.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A2B4A' }}>Performance Category</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'top_performer', label: '⭐ Top Performer', color: '#D97706', bg: '#FEF3C7' },
                  { key: 'performer', label: '✅ Performer', color: '#16A34A', bg: '#F0FDF4' },
                  { key: 'regular', label: '👤 Regular', color: '#6B7280', bg: '#F3F4F6' },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setFeedbackCategory(opt.key)}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-all"
                    style={{
                      background: feedbackCategory === opt.key ? opt.bg : '#F9F9F7',
                      color: feedbackCategory === opt.key ? opt.color : '#aaa',
                      border: `2px solid ${feedbackCategory === opt.key ? opt.color : 'transparent'}`
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>Notes (optional)</label>
              <textarea className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ border: '1px solid #E2E2DC', color: '#1A2B4A' }}
                rows={3} placeholder="Add any specific observations..."
                value={feedbackNotes} onChange={e => setFeedbackNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFeedbackModal(null)} className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid #E2E2DC', color: '#666' }}>Cancel</button>
              <button onClick={handleFeedback} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#1A2B4A' }}>Submit Feedback</button>
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