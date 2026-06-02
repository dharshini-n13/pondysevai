'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { setSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'

export type LoginVariant = 'volunteer' | 'nodal-officer' | 'admin'

const CONFIG = {
  volunteer:       { icon: '🙋', accent: '#E65C00', accentLight: '#FFF1E8', useOtp: true,  dashboardHref: '/dashboard',     badge: 'Volunteer Portal' },
  'nodal-officer': { icon: '🏛️', accent: '#1A56DB', accentLight: '#EEF2FA', useOtp: false, dashboardHref: '/nodal-officer', badge: 'Government Portal' },
  admin:           { icon: '⚙️', accent: '#1A2B4A', accentLight: '#F1F5F9', useOtp: false, dashboardHref: '/admin',         badge: 'Admin Portal' },
}

export default function LoginCard({ variant }: { variant: LoginVariant }) {
  const locale = useLocale()
  const t = useTranslations('login')
  const cfg = CONFIG[variant]

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const variantTitleKey = variant === 'volunteer' ? 'vol_title' : variant === 'nodal-officer' ? 'nodal_title' : 'admin_title'
  const variantDescKey  = variant === 'volunteer' ? 'vol_desc'  : variant === 'nodal-officer' ? 'nodal_desc'  : 'admin_desc'

  const handleSendOtp = async () => {
    if (identifier.length !== 10) { setError(t('err_phone')); return }
    setLoading(true); setError('')
    try {
      const result = await api.auth.sendOtp(identifier)
      setOtpSent(true)
      // In dev mode, show the OTP on screen
      if (result.dev_otp) setDevOtp(result.dev_otp)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    setLoading(true)
    try {
      let result: { access_token: string; role: string; name: string }
      if (cfg.useOtp) {
        if (identifier.length !== 10) { setError(t('err_phone')); setLoading(false); return }
        if (!otp || otp.length !== 6) { setError(t('err_otp')); setLoading(false); return }
        result = await api.auth.verifyOtp(identifier, otp)
      } else if (variant === 'nodal-officer') {
        if (!identifier.trim()) { setError(t('err_id')); setLoading(false); return }
        if (!password.trim()) { setError(t('err_password')); setLoading(false); return }
        result = await api.auth.staffLogin(identifier, password)
      } else {
        if (!identifier.trim()) { setError(t('err_id')); setLoading(false); return }
        if (!password.trim()) { setError(t('err_password')); setLoading(false); return }
        result = await api.auth.adminLogin(identifier, password)
      }
      // Save token and session
      if (typeof window !== 'undefined') {
        localStorage.setItem('psevai_token', result.access_token)
      }
      setSession(result.role as 'volunteer' | 'nodal-officer' | 'admin', result.name)
      window.location.href = `/${locale}${cfg.dashboardHref}`
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? t('err_invalid') : err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const PORTALS: { variant: LoginVariant; key: 'vol_title' | 'nodal_title' | 'admin_title' }[] = [
    { variant: 'volunteer', key: 'vol_title' },
    { variant: 'nodal-officer', key: 'nodal_title' },
    { variant: 'admin', key: 'admin_title' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9F9F7' }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'white', borderBottom: '1px solid #E5E5E0' }}>
        <a href={`/${locale}`} className="inline-flex items-center gap-2 text-sm" style={{ color: '#888', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> {t('back')}
        </a>
        <div className="font-black text-base" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
          <span style={{ color: '#E65C00' }}>Pondy</span><span style={{ color: '#1A2B4A' }}>SevAi</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: cfg.accentLight }}>{cfg.icon}</div>
            <div className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3" style={{ background: cfg.accentLight, color: cfg.accent }}>{cfg.badge}</div>
            <h1 className="font-black text-2xl mb-1" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{t(variantTitleKey)}</h1>
            <p className="text-sm" style={{ color: '#888' }}>{t(variantDescKey)}</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
            {error && <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>{error}</div>}
            {devOtp && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' }}>
                Dev OTP: <strong>{devOtp}</strong> (only shown in development mode)
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                  {cfg.useOtp ? t('otp_label').replace('OTP','Phone') || 'Phone' : 'Email'}
                </label>
                {cfg.useOtp ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#888' }}>+91</span>
                    <input type="tel" inputMode="numeric" value={identifier}
                      onChange={e => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9XXXXXXXXX" maxLength={10}
                      className="w-full rounded-xl text-sm outline-none"
                      style={{ border: '1px solid #E2E2DC', padding: '12px 48px 12px 48px', color: '#1A2B4A' }} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: identifier.length === 10 ? '#16A34A' : '#ccc' }}>{identifier.length}/10</span>
                  </div>
                ) : (
                  <input type="email" value={identifier} onChange={e => setIdentifier(e.target.value)}
                    placeholder={variant === 'nodal-officer' ? 'officer@puducherry.gov.in' : 'admin@pondysevai.in'}
                    className="w-full rounded-xl text-sm outline-none"
                    style={{ border: '1px solid #E2E2DC', padding: '12px 16px', color: '#1A2B4A' }} />
                )}
              </div>

              {cfg.useOtp && !otpSent && (
                <button type="button" onClick={handleSendOtp} disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white"
                  style={{ background: cfg.accent, opacity: loading ? 0.7 : 1 }}>
                  {loading ? t('sending_otp') : t('send_otp')}
                </button>
              )}

              {cfg.useOtp && otpSent && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>
                    {t('otp_label')} <span className="font-normal text-xs" style={{ color: '#888' }}>({t('otp_hint').replace('{phone}', identifier)})</span>
                  </label>
                  <input type="tel" inputMode="numeric" maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full rounded-xl text-sm text-center font-mono outline-none"
                    style={{ border: '1px solid #E2E2DC', padding: '12px 16px', color: '#1A2B4A', letterSpacing: '0.5em' }} />
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setDevOtp('') }}
                    className="mt-2 text-xs" style={{ color: '#888' }}>{t('change_number')}</button>
                </div>
              )}

              {!cfg.useOtp && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A2B4A' }}>{t('password_label')}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full rounded-xl text-sm outline-none pr-12"
                      style={{ border: '1px solid #E2E2DC', padding: '12px 16px', color: '#1A2B4A' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: '#aaa' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {(!cfg.useOtp || otpSent) && (
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: cfg.accent, opacity: loading ? 0.7 : 1 }}>
                  {loading ? t('signing_in') : t('sign_in')}
                </button>
              )}
            </form>

            {variant === 'volunteer' && (
              <p className="mt-5 text-center text-xs" style={{ color: '#aaa' }}>
                {t('new_volunteer_q')} <a href={`/${locale}/register`} style={{ color: '#E65C00', fontWeight: 500 }}>{t('register_link')}</a>
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-4 text-xs">
            {PORTALS.map((p, i) => (
              <span key={p.variant} className="flex items-center gap-4">
                <a href={`/${locale}/login/${p.variant}`}
                  style={{ color: variant === p.variant ? cfg.accent : '#aaa', fontWeight: variant === p.variant ? 600 : 400, textDecoration: 'none' }}>
                  {t(p.key)}
                </a>
                {i < PORTALS.length - 1 && <span style={{ color: '#ddd' }}>·</span>}
              </span>
            ))}
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: '#ccc' }}>
            An Initiative by <span style={{ color: '#E65C00' }}>Decision Minds</span> · Government of Puducherry
          </p>
        </div>
      </div>
    </div>
  )
}
