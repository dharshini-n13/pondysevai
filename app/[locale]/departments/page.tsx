'use client'

import { useTranslations } from 'next-intl'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ALL_ROLES, DEPT_IDS } from '@/lib/utils'

export default function DepartmentsPage() {
  const t = useTranslations('depts_page')
  const r = useTranslations('roles')

  const demandLabel = (d: string) =>
    d === 'low' ? t('demand_low') : d === 'medium' ? t('demand_medium') : t('demand_high')

  const demandStyle = (d: string) =>
    d === 'low'    ? { bg: '#F0FDF4', color: '#16A34A' }
    : d === 'medium' ? { bg: '#FEFCE8', color: '#CA8A04' }
    : { bg: '#FEF2F2', color: '#DC2626' }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        {/* Header */}
        <div className="px-5 lg:px-8 py-16 relative overflow-hidden" style={{ background: '#1A2B4A' }}>
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full translate-x-1/3 -translate-y-1/3" style={{ background: '#E65C00', opacity: 0.06 }} />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(230,92,0,0.15)', border: '1px solid rgba(230,92,0,0.3)', color: '#FF7B2E' }}>
              {t('pill')}
            </div>
            <h1 className="font-black text-white mb-3"
              style={{ fontFamily: 'var(--font-sora),sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-1px' }}>
              {t('title_1')} <span style={{ color: '#E65C00' }}>{t('title_2')}</span> {t('title_3')}
            </h1>
            <p className="text-base max-w-xl" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('subtitle')}</p>
          </div>
        </div>

        {/* Role tables grouped by department */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 space-y-8">
          {DEPT_IDS.map((deptId) => {
            const deptRoles = ALL_ROLES.filter(role => role.dept_id === deptId)
            if (deptRoles.length === 0) return null
            return (
              <div key={deptId} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(26,43,74,0.03)', borderBottom: '1px solid #F0F0EE' }}>
                  <h2 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>
                    {r(`depts.${deptId}`)}
                  </h2>
                  <span className="text-xs" style={{ color: '#aaa' }}>{deptRoles.length} {t('roles_suffix')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F8F8F6' }}>
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{t('col_role')}</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{t('col_qualifications')}</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{t('col_demand')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptRoles.map((role) => {
                        const ds = demandStyle(role.demand)
                        return (
                          <tr key={role.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #FAFAF8' }}>
                            <td className="px-6 py-4 font-medium" style={{ color: '#1A2B4A' }}>{r(`${role.id}.role`)}</td>
                            <td className="px-6 py-4" style={{ color: '#666' }}>{r(`${role.id}.qual`)}</td>
                            <td className="px-6 py-4">
                              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                                style={{ background: ds.bg, color: ds.color }}>
                                {demandLabel(role.demand)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <Footer />
    </>
  )
}
