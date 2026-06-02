'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import { ChevronRight, Lock } from 'lucide-react'
import { COMMUNES } from '@/lib/utils'

const STEPS = ['step1', 'step2', 'step3', 'step4'] as const

type FormData = {
  fullName: string; dob: string; phone: string; email: string; commune: string; address: string; gender: string
  languages: string[]; qualifications: string[]; availability: string[]; mobilityImpairment: boolean; experience: string
  departments: string[]; motivation: string; roleType: string
  decl1: boolean; decl2: boolean; decl3: boolean; decl4: boolean
}
const EMPTY: FormData = {
  fullName: '', dob: '', phone: '', email: '', commune: '', address: '', gender: '',
  languages: [], qualifications: [], availability: [], mobilityImpairment: false, experience: '',
  departments: [], motivation: '', roleType: '',
  decl1: false, decl2: false, decl3: false, decl4: false,
}

export default function RegisterPage() {
  const t = useTranslations('register')
  const locale = useLocale()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [refNum] = useState(() => 'PSA-' + Math.random().toString(36).substring(2, 8).toUpperCase())
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>(EMPTY)

  // All option arrays built from translations
  const GENDER_OPTS = [
    { val: 'prefer', label: t('gender_prefer') },
    { val: 'female', label: t('gender_female') },
    { val: 'male',   label: t('gender_male') },
    { val: 'other',  label: t('gender_other') },
  ]
  const LANG_OPTS = [
    { val: 'tamil',     label: t('lang_tamil') },
    { val: 'english',   label: t('lang_english') },
    { val: 'french',    label: t('lang_french') },
    { val: 'telugu',    label: t('lang_telugu') },
    { val: 'malayalam', label: t('lang_malayalam') },
  ]
  const QUAL_OPTS = [
    { val: 'qual_10th',      label: t('qual_10th') },
    { val: 'qual_12th',      label: t('qual_12th') },
    { val: 'qual_diploma',   label: t('qual_diploma') },
    { val: 'qual_bachelors', label: t('qual_bachelors') },
    { val: 'qual_masters',   label: t('qual_masters') },
    { val: 'qual_nss',       label: t('qual_nss') },
    { val: 'qual_firstaid',  label: t('qual_firstaid') },
    { val: 'qual_driving',   label: t('qual_driving') },
  ]
  const AVAIL_OPTS = [
    { val: 'avail_weekday_morning', label: t('avail_weekday_morning') },
    { val: 'avail_weekday_evening', label: t('avail_weekday_evening') },
    { val: 'avail_weekends',        label: t('avail_weekends') },
    { val: 'avail_holidays',        label: t('avail_holidays') },
    { val: 'avail_flexible',        label: t('avail_flexible') },
  ]
  const DEPT_OPTS = [
    { val: 'dept_health',    label: t('dept_health') },
    { val: 'dept_education', label: t('dept_education') },
    { val: 'dept_welfare',   label: t('dept_welfare') },
    { val: 'dept_env',       label: t('dept_env') },
    { val: 'dept_digital',   label: t('dept_digital') },
    { val: 'dept_culture',   label: t('dept_culture') },
    { val: 'dept_law',       label: t('dept_law') },
    { val: 'dept_disaster',  label: t('dept_disaster') },
    { val: 'dept_municipal', label: t('dept_municipal') },
    { val: 'dept_women',     label: t('dept_women') },
  ]
  const ROLE_TYPE_OPTS = [
    { val: 'role_field',    label: t('role_field') },
    { val: 'role_office',   label: t('role_office') },
    { val: 'role_outreach', label: t('role_outreach') },
    { val: 'role_tech',     label: t('role_tech') },
    { val: 'role_any',      label: t('role_any') },
  ]

  const set = (field: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))
  const toggleArr = (field: 'languages' | 'qualifications' | 'availability' | 'departments', val: string) =>
    setForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(val)
        ? (prev[field] as string[]).filter(v => v !== val)
        : [...(prev[field] as string[]), val]
    }))

  const validate = () => {
    if (step === 0 && (!form.fullName || !form.dob || !form.phone || !form.commune)) { setError(t('validation_step1')); return false }
    if (step === 1 && (form.availability.length === 0 || form.languages.length === 0)) { setError(t('validation_step1')); return false }
    if (step === 2 && (form.departments.length === 0 || !form.motivation)) { setError(t('validation_step1')); return false }
    if (step === 3 && (!form.decl1 || !form.decl2 || !form.decl3 || !form.decl4)) { setError(t('confirm_decl')); return false }
    setError(''); return true
  }

  const nextStep = () => { if (validate()) { if (step === 3) setSubmitted(true); else setStep(s => s + 1) } }

  const inp = 'w-full rounded-xl text-sm outline-none px-4 py-3'
  const inpStyle = { border: '1px solid #E2E2DC', color: '#1A2B4A' }
  const lbl = 'block text-sm font-medium mb-1.5'
  const lblStyle = { color: '#1A2B4A' }

  const ChipBtn = ({ label, active, accent, onClick }: { label: string; active: boolean; accent: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm transition-all"
      style={{ border: `1px solid ${active ? accent : '#E2E2DC'}`, background: active ? accent : 'white', color: active ? 'white' : '#666' }}>
      {label}
    </button>
  )

  if (submitted) return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px] flex items-center justify-center px-5" style={{ background: '#F9F9F7' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#F0FDF4' }}>
            <span className="text-2xl text-green-600">✓</span>
          </div>
          <h1 className="font-black text-2xl mb-2" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('success_title')}</h1>
          <p className="text-sm mb-6" style={{ color: '#888' }}>{t('success_sub')}</p>
          <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #EBEBEB' }}>
            <p className="text-xs mb-1" style={{ color: '#aaa' }}>{t('save_ref')}</p>
            <div className="font-black text-3xl tracking-wider" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#E65C00' }}>{refNum}</div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setSubmitted(false); setStep(0); setForm(EMPTY) }}
              className="w-full rounded-xl py-3 text-sm" style={{ border: '1px solid #E2E2DC', color: '#666' }}>
              {t('another')}
            </button>
            <a href={`/${locale}`} className="w-full rounded-xl py-3 text-sm font-medium text-center text-white block"
              style={{ background: '#1A2B4A', textDecoration: 'none' }}>{t('home')}</a>
          </div>
        </div>
      </main>
    </>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full mb-3"
              style={{ background: 'rgba(230,92,0,0.1)', color: '#E65C00' }}>{t('pill')}</div>
            <h1 className="font-black text-3xl tracking-tight" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('title')}</h1>
            <p className="text-sm mt-1" style={{ color: '#888' }}>{t('sub')}</p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className="h-1.5 rounded-full transition-all" style={{ background: i <= step ? '#E65C00' : '#E2E2DC' }} />
                <div className="text-xs mt-1.5 font-medium" style={{ color: i === step ? '#E65C00' : i < step ? '#16A34A' : '#aaa' }}>
                  {i < step ? '✓ ' : ''}{t(s)}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>{error}</div>
              )}

              {/* Step 1 — Personal Info */}
              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('step1')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={lbl} style={lblStyle}>{t('full_name')} <span style={{ color: '#DC2626' }}>*</span></label>
                      <input className={inp} style={inpStyle} placeholder={t('full_name_hint')} value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl} style={lblStyle}>{t('dob')} <span style={{ color: '#DC2626' }}>*</span></label>
                      <input type="date" className={inp} style={inpStyle} value={form.dob} onChange={e => set('dob', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl} style={lblStyle}>{t('phone')} <span style={{ color: '#DC2626' }}>*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#888' }}>+91</span>
                        <input type="tel" inputMode="numeric" maxLength={10}
                          className={inp} style={{ ...inpStyle, paddingLeft: '48px' }}
                          placeholder="9XXXXXXXXX"
                          value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: form.phone.length === 10 ? '#16A34A' : '#ccc' }}>{form.phone.length}/10</span>
                      </div>
                    </div>
                    <div>
                      <label className={lbl} style={lblStyle}>{t('email')}</label>
                      <input type="email" className={inp} style={inpStyle} placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl} style={lblStyle}>{t('commune')} <span style={{ color: '#DC2626' }}>*</span></label>
                      <select className={inp} style={inpStyle} value={form.commune} onChange={e => set('commune', e.target.value)}>
                        <option value="">{t('commune_placeholder')}</option>
                        {COMMUNES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl} style={lblStyle}>{t('gender')}</label>
                      <select className={inp} style={inpStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                        {GENDER_OPTS.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('address')}</label>
                    <textarea className={inp} style={inpStyle} rows={2} placeholder={t('address_hint')} value={form.address} onChange={e => set('address', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 2 — Skills */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('step2')}</h2>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('languages')} <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {LANG_OPTS.map(o => <ChipBtn key={o.val} label={o.label} active={form.languages.includes(o.val)} accent="#E65C00" onClick={() => toggleArr('languages', o.val)} />)}
                    </div>
                  </div>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('qualifications')}</label>
                    <div className="flex flex-wrap gap-2">
                      {QUAL_OPTS.map(o => <ChipBtn key={o.val} label={o.label} active={form.qualifications.includes(o.val)} accent="#1A2B4A" onClick={() => toggleArr('qualifications', o.val)} />)}
                    </div>
                  </div>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('availability')} <span style={{ color: '#DC2626' }}>*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {AVAIL_OPTS.map(o => <ChipBtn key={o.val} label={o.label} active={form.availability.includes(o.val)} accent="#E65C00" onClick={() => toggleArr('availability', o.val)} />)}
                    </div>
                  </div>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('experience')}</label>
                    <textarea className={inp} style={inpStyle} rows={3} placeholder={t('experience_hint')} value={form.experience} onChange={e => set('experience', e.target.value)} />
                  </div>
                  <label className="flex items-start gap-3 rounded-xl p-4 cursor-pointer" style={{ background: '#FFF8F3', border: '1px solid rgba(230,92,0,0.15)' }}>
                    <input type="checkbox" className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ accentColor: '#E65C00' }} checked={form.mobilityImpairment} onChange={e => set('mobilityImpairment', e.target.checked)} />
                    <span>
                      <span className="text-sm font-medium block" style={{ color: '#1A2B4A' }}>{t('mobility')}</span>
                      <span className="text-xs" style={{ color: '#888' }}>{t('mobility_hint')}</span>
                    </span>
                  </label>
                </div>
              )}

              {/* Step 3 — Role Preferences */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="font-semibold text-xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('step3')}</h2>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('departments_label')} <span style={{ color: '#DC2626' }}>*</span></label>
                    <p className="text-xs mb-3" style={{ color: '#aaa' }}>{t('departments_hint')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEPT_OPTS.map(o => (
                        <button key={o.val} type="button" onClick={() => toggleArr('departments', o.val)}
                          className="text-left px-4 py-3 rounded-xl text-sm transition-all"
                          style={{ border: `1px solid ${form.departments.includes(o.val) ? '#E65C00' : '#E2E2DC'}`, background: form.departments.includes(o.val) ? 'rgba(230,92,0,0.08)' : 'white', color: form.departments.includes(o.val) ? '#E65C00' : '#666', fontWeight: form.departments.includes(o.val) ? 500 : 400 }}>
                          {form.departments.includes(o.val) ? '✓ ' : ''}{o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('role_type')}</label>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_TYPE_OPTS.map(o => (
                        <ChipBtn key={o.val} label={o.label} active={form.roleType === o.val} accent="#1A2B4A" onClick={() => set('roleType', o.val)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl} style={lblStyle}>{t('motivation')} <span style={{ color: '#DC2626' }}>*</span></label>
                    <p className="text-xs mb-2" style={{ color: '#aaa' }}>{t('motivation_ai_note')}</p>
                    <textarea className={inp} style={inpStyle} rows={4} placeholder={t('motivation_hint')} value={form.motivation} onChange={e => set('motivation', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 4 — Declaration */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-semibold text-xl" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t('step4')}</h2>
                  <p className="text-sm" style={{ color: '#888' }}>{t('confirm_decl')}</p>
                  {(['decl1', 'decl2', 'decl3', 'decl4'] as const).map(key => (
                    <label key={key} className="flex items-start gap-3 rounded-xl p-4 cursor-pointer" style={{ background: '#FAFAF9', border: '1px solid #EBEBEB' }}>
                      <input type="checkbox" className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ accentColor: '#E65C00' }}
                        checked={form[key]} onChange={e => set(key, e.target.checked)} />
                      <span className="text-sm leading-relaxed" style={{ color: '#555' }}>{t(key)}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex justify-between mt-8 pt-6" style={{ borderTop: '1px solid #F0F0EE' }}>
                {step > 0
                  ? <button onClick={() => setStep(s => s - 1)} className="text-sm font-medium" style={{ color: '#888' }}>← {t('back')}</button>
                  : <div />}
                <button onClick={nextStep}
                  className="inline-flex items-center gap-2 text-white font-medium rounded-xl px-6 py-3 text-sm"
                  style={{ background: '#E65C00' }}>
                  {step < 3 ? <>{[t('next1'), t('next2'), t('next3')][step]} <ChevronRight size={16} /></> : t('submit')}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>{t('app_progress')}</h3>
                <div className="space-y-3">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: i < step ? '#F0FDF4' : i === step ? '#E65C00' : '#F0F0EE', color: i < step ? '#16A34A' : i === step ? 'white' : '#aaa' }}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      <span className="text-sm" style={{ color: i === step ? '#1A2B4A' : i < step ? '#16A34A' : '#aaa', fontWeight: i === step ? 500 : 400 }}>
                        {t(s)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: '#FFF8F3', border: '1px solid rgba(230,92,0,0.15)' }}>
                <div className="text-sm font-medium mb-1" style={{ color: '#1A2B4A' }}>🤖 AI</div>
                <p className="text-xs leading-relaxed" style={{ color: '#888' }}>{t('ai_note')}</p>
              </div>
              <div className="flex items-center gap-2 text-xs px-1" style={{ color: '#aaa' }}>
                <Lock size={12} /> {t('security')}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
