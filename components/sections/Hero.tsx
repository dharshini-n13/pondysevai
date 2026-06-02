'use client'

import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Hero() {
  const t = useTranslations('hero')
  const ts = useTranslations('stats')
  const locale = useLocale()
  const lp = (p: string) => `/${locale}${p}`
  const [count, setCount] = useState(0)

  useEffect(() => {
    const target = 1247
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev + step >= target) { clearInterval(timer); return target }
        return prev + step
      })
    }, 30)
    return () => clearInterval(timer)
  }, [])

  const titleLines = t('title').split('\n')

  return (
    <section className="min-h-screen pt-[72px] flex flex-col justify-center relative overflow-hidden" style={{ background: '#1A2B4A' }}>
      {/* Background decorations */}
      <div className="absolute right-[-180px] top-[-120px] w-[700px] h-[700px] rounded-full" style={{ background: '#E65C00', opacity: 0.08 }} />
      <div className="absolute left-[-100px] bottom-[-200px] w-[500px] h-[500px] rounded-full" style={{ background: '#E65C00', opacity: 0.05 }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-16 w-full">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 border text-xs font-medium tracking-wide px-4 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(230,92,0,0.15)', borderColor: 'rgba(230,92,0,0.3)', color: '#FF7B2E' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#FF7B2E' }} />
          {t('pill')}
        </div>

        {/* Title */}
        <h1 className="font-black leading-[1.04] text-white mb-6 max-w-4xl"
          style={{ fontFamily: 'var(--font-sora), sans-serif', fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', letterSpacing: '-2px' }}>
          {titleLines.map((line, i) => (
            <span key={i}>
              {i === 1 ? <span style={{ color: '#E65C00' }}>{line}</span> : line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className="text-lg font-light leading-relaxed max-w-xl mb-10" style={{ color: 'rgba(255,255,255,0.62)' }}>
          {t('subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 items-center mb-16">
          <a href={lp('/register')}
            className="inline-flex items-center gap-2 text-white font-medium rounded-xl px-7 py-4 text-base transition-all hover:-translate-y-0.5"
            style={{ background: '#E65C00', boxShadow: '0 8px 24px rgba(230,92,0,0.3)' }}>
            {t('cta1')} <ArrowRight size={18} />
          </a>
          <a href="#how"
            className="inline-flex items-center gap-2 font-normal rounded-xl px-6 py-4 text-base transition-all"
            style={{ color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' }}>
            {t('cta2')}
          </a>
        </div>

        {/* AI badge */}
        <div className="inline-flex items-center gap-2 text-xs rounded-lg px-3 py-2"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          ✦ Profile matching powered by Anthropic Claude API · Claude Impact Lab
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 mt-auto" style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { num: '4', label: ts('communes') },
              { num: '12+', label: ts('departments') },
              { num: count.toLocaleString('en-IN'), label: ts('volunteers'), live: true },
              { num: '5 min', label: ts('register') },
              { num: 'Claude AI', label: ts('powered') },
            ].map((stat, i) => (
              <div key={i} className="px-6 py-5 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="font-bold text-xl text-white leading-none mb-1" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  {stat.num}
                  {stat.live && (
                    <span className="inline-flex items-center gap-1 ml-2 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full align-middle"
                      style={{ background: 'rgba(230,92,0,0.2)', border: '1px solid rgba(230,92,0,0.3)', color: '#FF7B2E' }}>
                      <span className="w-1 h-1 rounded-full inline-block animate-pulse" style={{ background: '#FF7B2E' }} />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
