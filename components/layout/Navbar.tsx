'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn, LogOut } from 'lucide-react'
import { getSession, clearSession, getLargeText, setLargeText } from '@/lib/store'

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [largeText, setLargeTextState] = useState(false)
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })

  // Restore large text and session on mount
  useEffect(() => {
    const lt = getLargeText()
    setLargeTextState(lt)
    document.documentElement.classList.toggle('large-text', lt)

    const s = getSession()
    setSession(s)

    const onAuth = () => setSession(getSession())
    window.addEventListener('psevai_auth_change', onAuth)
    return () => window.removeEventListener('psevai_auth_change', onAuth)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleLargeText = () => {
    const next = !largeText
    setLargeTextState(next)
    setLargeText(next)
  }

  const handleSignOut = () => {
    clearSession()
    window.location.href = `/${locale}`
  }

  const lp = (path: string) => `/${locale}${path}`

  // Build the same path but for a different locale
  // e.g. /en/register -> /ta/register
  const switchLang = (code: string) => {
    const segments = pathname.split('/')
    segments[1] = code
    return segments.join('/')
  }

  const navLinks = [
    { href: '/#how', label: t('how') },
    { href: '/departments', label: t('departments') },
    { href: '/rewards', label: t('rewards') },
  ]

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'ta', label: 'த' },
    { code: 'fr', label: 'FR' },
  ]

  const dashboardHref = session.role === 'nodal-officer' ? lp('/nodal-officer')
    : session.role === 'admin' ? lp('/admin')
    : lp('/dashboard')

  return (
    <nav style={{ background: scrolled ? 'rgba(255,255,255,0.96)' : 'white', borderBottom: '1px solid #E5E5E0', backdropFilter: scrolled ? 'blur(8px)' : undefined }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <a href={lp('/')} style={{ textDecoration: 'none' }} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
              <span style={{ color: '#E65C00' }}>Pondy</span><span style={{ color: '#1A2B4A' }}>SevAi</span>
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#E65C00' }}>BETA</span>
          </div>
          <span className="text-[11px]" style={{ color: '#aaa' }}>
            {t('initiative_by')} <strong style={{ color: '#E65C00', fontWeight: 500 }}>Decision Minds</strong>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <a key={link.href} href={lp(link.href)} style={{ color: '#444', textDecoration: 'none' }}
              className="text-sm font-medium hover:text-orange-500 transition-colors">{link.label}</a>
          ))}
        </div>

        {/* Right controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language — preserves current path */}
          <div className="flex gap-0.5 p-1 rounded-full" style={{ border: '1px solid #E2E2DC' }}>
            {langs.map(lang => (
              <a key={lang.code} href={switchLang(lang.code)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: locale === lang.code ? '#E65C00' : 'transparent', color: locale === lang.code ? 'white' : '#888', textDecoration: 'none' }}>
                {lang.label}
              </a>
            ))}
          </div>

          {/* A+ toggle */}
          <button onClick={toggleLargeText}
            className="p-2 rounded-lg border text-xs font-bold transition-colors"
            style={{ borderColor: largeText ? '#E65C00' : '#E2E2DC', color: largeText ? '#E65C00' : '#aaa' }}
            aria-label="Toggle large text" aria-pressed={largeText}>A+</button>

          {/* Auth */}
          {session.role ? (
            <div className="flex items-center gap-2">
              <a href={dashboardHref} className="text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
                style={{ color: '#1A2B4A', border: '1px solid #E2E2DC', textDecoration: 'none' }}>
                {t('my_dashboard')}
              </a>
              <button onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
                style={{ color: '#888', border: '1px solid #E2E2DC' }}>
                <LogOut size={14} /> {t('sign_out')}
              </button>
            </div>
          ) : (
            <>
              <a href={lp('/login')} className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
                style={{ color: '#1A2B4A', border: '1px solid #E2E2DC', textDecoration: 'none' }}>
                <LogIn size={14} /> {t('sign_in')}
              </a>
              <a href={lp('/register')} className="text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-all hover:-translate-y-0.5"
                style={{ background: '#E65C00', textDecoration: 'none' }}>{t('cta')}</a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" style={{ color: '#444' }}
          onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-5 py-4 flex flex-col gap-4" style={{ background: 'white', borderTop: '1px solid #F0F0EE' }}>
          {navLinks.map(link => (
            <a key={link.href} href={lp(link.href)} className="text-sm font-medium py-1"
              style={{ color: '#444', textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>{link.label}</a>
          ))}
          <div className="flex gap-2 pt-2">
            {langs.map(lang => (
              <a key={lang.code} href={switchLang(lang.code)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: locale === lang.code ? '#E65C00' : '#F0F0EE', color: locale === lang.code ? 'white' : '#666', textDecoration: 'none' }}>
                {lang.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-1">
            {session.role ? (
              <>
                <a href={dashboardHref} className="text-sm font-medium py-3 text-center rounded-lg"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A', textDecoration: 'none' }}
                  onClick={() => setMobileOpen(false)}>{t('my_dashboard')}</a>
                <button onClick={handleSignOut} className="text-sm font-medium py-3 text-center rounded-lg"
                  style={{ border: '1px solid #E2E2DC', color: '#888' }}>{t('sign_out')}</button>
              </>
            ) : (
              <>
                <a href={lp('/login')} className="text-sm font-medium py-3 text-center rounded-lg"
                  style={{ border: '1px solid #E2E2DC', color: '#1A2B4A', textDecoration: 'none' }}
                  onClick={() => setMobileOpen(false)}>{t('sign_in')}</a>
                <a href={lp('/register')} className="text-white font-medium text-sm rounded-lg py-3 text-center"
                  style={{ background: '#E65C00', textDecoration: 'none' }}
                  onClick={() => setMobileOpen(false)}>{t('cta')}</a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
