'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Star, Clock, MapPin, Bell, Award, ChevronRight, Calendar, QrCode, Download, PlayCircle, CheckCircle, BookOpen, Compass, Zap } from 'lucide-react'
import { getSession } from '@/lib/store'
import { api, ApiError } from '@/lib/api'

type VolunteerProfile = {
  id: string; full_name: string; commune: string; status: string;
  tier?: string | null; ai_score?: number | null; ai_assessment?: string | null;
  assigned_role?: string | null; assigned_dept?: string | null;
  latest_feedback?: string | null; created_at?: string;
}

type Deployment = {
  id: string; role_id: string; location: string; scheduled_date: string;
  shift: string; status: string; roles?: { name: string; dept_name: string }
}

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; nextMonths: number }> = {
  bronze:   { label: 'Bronze',   color: '#D97706', bg: '#FEF3C7', nextMonths: 3 },
  silver:   { label: 'Silver',   color: '#6B7280', bg: '#F3F4F6', nextMonths: 6 },
  gold:     { label: 'Gold',     color: '#B45309', bg: '#FFFBEB', nextMonths: 12 },
  platinum: { label: 'Platinum', color: '#7C3AED', bg: '#F5F3FF', nextMonths: 12 },
}

// Training modules per department
const TRAINING_BY_DEPT: Record<string, { title: string; videoId: string; duration: string; description: string }[]> = {
  'Health & Sanitation': [
    { title: 'First Aid Basics', videoId: 'dSP5NUBHklg', duration: '8 min', description: 'Learn essential first aid skills for health camps and vaccination drives.' },
    { title: 'Health Camp Organisation', videoId: 'dSP5NUBHklg', duration: '12 min', description: 'How to set up and manage a government health camp efficiently.' },
    { title: 'Blood Donation Drive Guide', videoId: 'dSP5NUBHklg', duration: '6 min', description: 'Volunteer role in organising blood donation camps.' },
  ],
  'Environment & Coastal': [
    { title: 'Beach Cleanup Drive', videoId: '9ZtLzPQFDpg', duration: '10 min', description: 'Best practices for coastal cleanup drives and waste segregation.' },
    { title: 'Waste Segregation Training', videoId: '9ZtLzPQFDpg', duration: '7 min', description: 'Understanding waste categories and proper disposal methods.' },
    { title: 'Mangrove Plantation Guide', videoId: '9ZtLzPQFDpg', duration: '9 min', description: 'How to plant and maintain coastal mangroves.' },
  ],
  'Law & Order / Traffic': [
    { title: 'Traffic Management Basics', videoId: '4OZip0cgOho', duration: '11 min', description: 'Volunteer role in traffic management during civic events.' },
    { title: 'Crowd Control Techniques', videoId: '4OZip0cgOho', duration: '8 min', description: 'Safe and effective crowd management for public events.' },
    { title: 'Emergency Lane Coordination', videoId: '4OZip0cgOho', duration: '6 min', description: 'Keeping emergency lanes clear during festivals and events.' },
  ],
  'Education': [
    { title: 'Teaching Assistant Skills', videoId: 'CDq6pnoBpik', duration: '14 min', description: 'How to support teachers in primary schools and literacy programmes.' },
    { title: 'Digital Literacy Training', videoId: 'CDq6pnoBpik', duration: '10 min', description: 'Teaching basic computer skills to seniors and rural communities.' },
    { title: 'Adult Literacy Facilitation', videoId: 'CDq6pnoBpik', duration: '8 min', description: 'Methods for teaching reading and writing to adults.' },
  ],
  'Tourism & Cultural Events': [
    { title: 'Puducherry Heritage Guide', videoId: '5eBT6OSr1TI', duration: '15 min', description: 'History and culture of Puducherry\'s French Quarter and heritage sites.' },
    { title: 'Event Volunteer Management', videoId: 'dSP5NUBHklg', duration: '9 min', description: 'Coordinating volunteers during cultural events and festivals.' },
    { title: 'Tourist Information Skills', videoId: '5eBT6OSr1TI', duration: '7 min', description: 'How to assist tourists and provide accurate information.' },
  ],
  'Disaster Management': [
    { title: 'Disaster Preparedness Basics', videoId: '4OZip0cgOho', duration: '13 min', description: 'NDMA guidelines for community disaster preparedness.' },
    { title: 'Flood Relief Operations', videoId: '4OZip0cgOho', duration: '10 min', description: 'Volunteer role in flood relief distribution and logistics.' },
    { title: 'Cyclone Safety Protocol', videoId: '4OZip0cgOho', duration: '8 min', description: 'Procedures for cyclone preparedness and community safety.' },
  ],
  'Municipal & Administration': [
    { title: 'Voter Awareness Campaign', videoId: 'CDq6pnoBpik', duration: '7 min', description: 'How to conduct voter awareness drives in your commune.' },
    { title: 'Census Data Collection', videoId: 'CDq6pnoBpik', duration: '9 min', description: 'Accurate door-to-door data collection techniques.' },
    { title: 'Senior Citizen Welfare', videoId: 'dSP5NUBHklg', duration: '11 min', description: 'Supporting elderly citizens through government welfare programmes.' },
  ],
  'Women & Child Welfare': [
    { title: 'Anganwadi Support Training', videoId: 'CDq6pnoBpik', duration: '10 min', description: 'Assisting Anganwadi workers in child nutrition and care programmes.' },
    { title: 'Women SHG Facilitation', videoId: '9ZtLzPQFDpg', duration: '12 min', description: 'How to support and facilitate women self-help groups.' },
    { title: 'Child Safety Awareness', videoId: 'dSP5NUBHklg', duration: '8 min', description: 'Recognising and responding to child safety concerns.' },
  ],
}

const DEFAULT_MODULES = [
  { title: 'Volunteer Orientation', videoId: 'dSP5NUBHklg', duration: '10 min', description: 'Introduction to PondySevAi and your role as a civic volunteer.' },
  { title: 'Code of Conduct', videoId: 'dSP5NUBHklg', duration: '6 min', description: 'Expected behaviour, ethics, and responsibilities of a PondySevAi volunteer.' },
  { title: 'Safety & First Aid Basics', videoId: 'CDq6pnoBpik', duration: '8 min', description: 'Basic safety protocols and first aid awareness for all volunteers.' },
  { title: 'Community Engagement', videoId: '9ZtLzPQFDpg', duration: '7 min', description: 'How to engage respectfully and effectively with the Puducherry community.' },
]

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const [session, setSession] = useState<{ role: string | null; name: string }>({ role: null, name: '' })
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'orientation' | 'deployment'>('overview')
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [completedVideos, setCompletedVideos] = useState<string[]>([])
  const [quizState, setQuizState] = useState<Record<string, 'pass' | 'fail' | null>>({})
  const [showQuiz, setShowQuiz] = useState<string | null>(null)

  useEffect(() => {
    setSession(getSession())
    loadData()
    // Load completed videos from localStorage
    const saved = localStorage.getItem('psevai_completed_videos')
    if (saved) setCompletedVideos(JSON.parse(saved))
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, deployData] = await Promise.allSettled([
        api.volunteers.me() as Promise<VolunteerProfile>,
        api.deployments.my() as Promise<{ deployments: Deployment[] }>,
      ])
      if (profileData.status === 'fulfilled') setProfile(profileData.value)
      if (deployData.status === 'fulfilled') setDeployments(deployData.value.deployments)
    } catch { } finally { setLoading(false) }
  }

  const markVideoComplete = (videoId: string) => {
    const updated = [...completedVideos, videoId]
    setCompletedVideos(updated)
    localStorage.setItem('psevai_completed_videos', JSON.stringify(updated))
    setActiveVideo(null)
    setShowQuiz(videoId)
  }

  const handleQuiz = (videoId: string, passed: boolean) => {
    setQuizState(prev => ({ ...prev, [videoId]: passed ? 'pass' : 'fail' }))
    setShowQuiz(null)
  }

  const tier = profile?.tier ? TIER_CONFIG[profile.tier] : null
  const upcoming = deployments.filter(d => d.status === 'scheduled')[0]
  const completedDeployments = deployments.filter(d => d.status === 'completed').length
  const totalHours = completedDeployments * 8

  // Get training modules for this volunteer's department
  const dept = profile?.assigned_dept || ''
  const trainingModules = TRAINING_BY_DEPT[dept] || DEFAULT_MODULES
  const completedCount = trainingModules.filter(m => completedVideos.includes(m.videoId)).length
  const progressPct = Math.round((completedCount / trainingModules.length) * 100)

  const TABS = [
    { key: 'overview', label: 'Overview', icon: Zap },
    { key: 'training', label: 'Training', icon: BookOpen },
    { key: 'orientation', label: 'Orientation', icon: Compass },
    { key: 'deployment', label: 'Deployment', icon: Calendar },
  ]

  if (!session.role) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F9F7' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>Login Required</h2>
        <a href={`/${locale}/login/volunteer`} style={{ color: '#E65C00' }}>Login as Volunteer</a>
      </div>
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" style={{ background: '#F9F9F7' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

          {/* Welcome bar */}
          <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: '#1A2B4A' }}>
            <div className="absolute right-0 top-0 w-64 h-64 rounded-full translate-x-1/4 -translate-y-1/4" style={{ background: '#E65C00', opacity: 0.08 }} />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  {profile?.status?.replace('_', ' ') || 'Active Volunteer'}
                </div>
                <h1 className="font-bold text-white text-2xl" style={{ fontFamily: 'var(--font-sora),sans-serif' }}>
                  Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {profile?.assigned_role || profile?.commune || 'PondySevAi Volunteer'}
                </p>
              </div>
              <div className="flex gap-3">
                {tier && (
                  <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Tier</div>
                    <div className="font-bold text-sm" style={{ color: tier.color }}>🏅 {tier.label}</div>
                  </div>
                )}
                {profile?.created_at && (
                  <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Since</div>
                    <div className="font-bold text-white text-sm">
                      {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#EBEBEB' }}>
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                  style={{
                    background: activeTab === tab.key ? 'white' : 'transparent',
                    color: activeTab === tab.key ? '#1A2B4A' : '#888',
                    boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                  }}>
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { num: completedDeployments.toString(), label: 'Months Served', icon: '📅' },
                  { num: totalHours.toString(), label: 'Hours Contributed', icon: '⏱️' },
                  { num: deployments.length.toString(), label: 'Total Deployments', icon: '🎯' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm text-center" style={{ border: '1px solid #EBEBEB' }}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-black text-3xl tracking-tight mb-0.5" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>{stat.num}</div>
                    <div className="text-xs" style={{ color: '#aaa' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Tier progress */}
              <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award size={18} style={{ color: tier?.color || '#D97706' }} />
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>
                      {tier ? `🏅 ${tier.label} Tier` : 'Earn Your First Tier'}
                    </span>
                  </div>
                  {tier && tier.label !== 'Platinum' && (
                    <span className="text-xs" style={{ color: '#aaa' }}>
                      Next tier in {tier.nextMonths - completedDeployments} months
                    </span>
                  )}
                </div>
                <div className="h-2 rounded-full" style={{ background: '#F0F0EE' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: tier ? `${Math.min((completedDeployments / tier.nextMonths) * 100, 100)}%` : '5%',
                    background: `linear-gradient(90deg, ${tier?.color || '#E65C00'}, ${tier?.color || '#FF7B2E'}cc)`
                  }} />
                </div>
              </div>

              {/* AI Assessment */}
              {profile?.ai_assessment && (
                <div className="rounded-2xl p-5 mb-6" style={{ background: '#EEF2FA', border: '1px solid rgba(26,86,219,0.2)' }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: '#1A56DB' }}>⚡ Your AI Profile Assessment</div>
                  <p className="text-sm" style={{ color: '#1A2B4A' }}>{profile.ai_assessment}</p>
                  {profile.ai_score != null && profile.ai_score > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full" style={{ background: '#D0D8F0' }}>
                        <div className="h-full rounded-full" style={{ width: `${profile.ai_score * 100}%`, background: '#1A56DB' }} />
                      </div>
                      <span className="text-xs font-mono font-semibold" style={{ color: '#1A56DB' }}>Score: {profile.ai_score.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Current assignment */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold" style={{ fontFamily: 'var(--font-sora),sans-serif', color: '#1A2B4A' }}>Current Assignment</h2>
                      {(upcoming || profile?.assigned_role) && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: '#F0FDF4', color: '#16A34A' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                          Active
                        </span>
                      )}
                    </div>
                    {profile?.assigned_role ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm"><Calendar size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{profile.assigned_role}</span></div>
                        <div className="flex items-center gap-3 text-sm"><MapPin size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>{profile.assigned_dept || 'Government of Puducherry'}</span></div>
                        <div className="flex items-center gap-3 text-sm"><Clock size={16} style={{ color: '#aaa' }} /><span style={{ color: '#444' }}>As scheduled by nodal officer</span></div>
                        <div className="mt-4 flex gap-3">
                          <button onClick={() => setActiveTab('deployment')}
                            className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-sm font-medium"
                            style={{ background: '#E65C00' }}>
                            <QrCode size={16} /> QR Check-in
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm py-4" style={{ color: '#aaa' }}>
                        {profile?.status === 'registered' ? 'Your application is being reviewed. A nodal officer will assign you a role soon.' : 'No active assignment yet.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Performance */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Performance</h3>
                    {profile?.latest_feedback ? (
                      <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: '#FEFCE8' }}>
                        <Star size={18} style={{ color: '#D97706', fill: '#D97706' }} />
                        <div>
                          <div className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>
                            {profile.latest_feedback.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs" style={{ color: '#888' }}>Latest feedback</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: '#aaa' }}>No feedback yet. Complete a deployment to earn your first rating.</p>
                    )}
                  </div>

                  {/* Training progress */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer" style={{ border: '1px solid #EBEBEB' }}
                    onClick={() => setActiveTab('training')}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Training Progress</h3>
                    <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#666' }}>
                      <span>{completedCount}/{trainingModules.length} modules</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: '#F0F0EE' }}>
                      <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: '#E65C00' }} />
                    </div>
                    <button className="mt-3 text-xs font-medium" style={{ color: '#E65C00' }}>
                      {completedCount === trainingModules.length ? '✅ All complete!' : 'Continue training →'}
                    </button>
                  </div>

                  {/* Certificate */}
                  {profile?.tier && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                      <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Certificate</h3>
                      <a href={profile?.id ? api.certificates.downloadUrl(profile.id) : '#'}
                        className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-medium text-white"
                        style={{ background: '#1A2B4A', textDecoration: 'none' }}>
                        <Download size={15} /> Download Certificate
                      </a>
                    </div>
                  )}

                  {/* Quick links */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(26,43,74,0.03)', border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A2B4A' }}>Quick Links</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Training Modules', tab: 'training' },
                        { label: 'Orientation & Checklist', tab: 'orientation' },
                        { label: 'My Deployments', tab: 'deployment' },
                      ].map(link => (
                        <button key={link.label} onClick={() => setActiveTab(link.tab as typeof activeTab)}
                          className="flex items-center justify-between text-sm py-1 w-full"
                          style={{ color: '#666' }}>
                          {link.label} <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── TRAINING TAB ── */}
          {activeTab === 'training' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-xl" style={{ color: '#1A2B4A' }}>Training Modules</h2>
                  <p className="text-sm mt-0.5" style={{ color: '#888' }}>
                    {dept ? `Role-specific training for ${dept}` : 'General volunteer orientation training'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: '#E65C00', fontFamily: 'var(--font-sora),sans-serif' }}>{progressPct}%</div>
                  <div className="text-xs" style={{ color: '#aaa' }}>{completedCount}/{trainingModules.length} complete</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full mb-8" style={{ background: '#F0F0EE' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #E65C00, #FF7B2E)' }} />
              </div>

              {/* Video thumbnail card */}
              {activeVideo && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm bg-white" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="relative cursor-pointer group"
                    style={{ paddingBottom: '56.25%', height: 0, background: '#000' }}
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${activeVideo}`, '_blank')}>
                    <img
                      src={`https://img.youtube.com/vi/${activeVideo}/hqdefault.jpg`}
                      alt="Training video thumbnail"
                      className="absolute top-0 left-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                        style={{ background: 'rgba(230,92,0,0.95)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-xs font-medium px-3 py-1.5 rounded-full text-white"
                        style={{ background: 'rgba(0,0,0,0.6)' }}>
                        🎬 Click to watch on YouTube
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <p className="text-sm" style={{ color: '#666' }}>Opens in YouTube — subtitles available via CC button</p>
                    <button onClick={() => markVideoComplete(activeVideo)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: '#16A34A' }}>
                      <CheckCircle size={15} /> Mark as Complete
                    </button>
                  </div>
                </div>
              )}

              {/* Quiz modal */}
              {showQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#1A2B4A' }}>Quick Quiz</h3>
                    <p className="text-sm mb-5" style={{ color: '#888' }}>Did you complete and understand this training module?</p>
                    <div className="flex gap-3">
                      <button onClick={() => handleQuiz(showQuiz, false)}
                        className="flex-1 py-3 rounded-xl text-sm font-medium"
                        style={{ border: '1px solid #E2E2DC', color: '#666' }}>
                        Need to rewatch
                      </button>
                      <button onClick={() => handleQuiz(showQuiz, true)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                        style={{ background: '#16A34A' }}>
                        Yes, completed! ✓
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Module list */}
              <div className="space-y-4">
                {trainingModules.map((module, i) => {
                  const isDone = completedVideos.includes(module.videoId)
                  const isPassed = quizState[module.videoId] === 'pass'
                  const isActive = activeVideo === module.videoId
                  return (
                    <div key={module.videoId + i} className="bg-white rounded-2xl p-5 shadow-sm"
                      style={{ border: `1px solid ${isActive ? '#E65C00' : '#EBEBEB'}` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                          style={{ background: isDone ? '#DCFCE7' : '#FFF1E8', color: isDone ? '#16A34A' : '#E65C00' }}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm" style={{ color: '#1A2B4A' }}>{module.title}</h3>
                            {isPassed && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>✓ Passed</span>}
                          </div>
                          <p className="text-xs mb-3" style={{ color: '#888' }}>{module.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs" style={{ color: '#aaa' }}>⏱ {module.duration}</span>
                            <button
                              onClick={() => setActiveVideo(isActive ? null : module.videoId)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                              style={{ background: isDone ? '#F0FDF4' : '#FFF1E8', color: isDone ? '#16A34A' : '#E65C00' }}>
                              <PlayCircle size={13} />
                              {isActive ? 'Close' : isDone ? 'Rewatch' : 'Watch'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {completedCount === trainingModules.length && (
                <div className="mt-6 rounded-2xl p-5 text-center" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="text-3xl mb-2">🎉</div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: '#16A34A' }}>Training Complete!</h3>
                  <p className="text-sm mb-4" style={{ color: '#166534' }}>You've completed all training modules. You're ready for orientation!</p>
                  <button onClick={() => setActiveTab('orientation')}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: '#16A34A' }}>
                    Proceed to Orientation →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ORIENTATION TAB ── */}
          {activeTab === 'orientation' && (
            <div>
              <h2 className="font-bold text-xl mb-2" style={{ color: '#1A2B4A' }}>Orientation</h2>
              <p className="text-sm mb-6" style={{ color: '#888' }}>Complete your orientation checklist before your first deployment.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Checklist */}
                <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <h3 className="font-semibold mb-4" style={{ color: '#1A2B4A' }}>📋 Orientation Checklist</h3>
                  {[
                    { item: 'Complete all training modules', done: completedCount === trainingModules.length },
                    { item: 'Receive volunteer ID card', done: false },
                    { item: 'Collect safety vest', done: false },
                    { item: 'Attend briefing session', done: false },
                    { item: 'QR code check-in test', done: false },
                    { item: 'Review emergency contacts', done: false },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid #F9F9F7' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: c.done ? '#DCFCE7' : '#F3F4F6', color: c.done ? '#16A34A' : '#ccc' }}>
                        <span className="text-xs">✓</span>
                      </div>
                      <span className="text-sm" style={{ color: c.done ? '#1A2B4A' : '#aaa' }}>{c.item}</span>
                    </div>
                  ))}
                </div>

                {/* Reporting location */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#1A2B4A' }}>📍 Reporting Location</h3>
                    <div className="rounded-xl overflow-hidden mb-3" style={{ height: '180px', background: '#F0F0EE' }}>
                      <iframe
                        src="https://www.openstreetmap.org/export/embed.html?bbox=79.82,11.92,79.86,11.96&layer=mapnik&marker=11.9416,79.8083"
                        width="100%" height="180" style={{ border: 0 }} />
                    </div>
                    <p className="text-xs" style={{ color: '#666' }}>
                      📍 Collectorate Office, Puducherry — Report 30 minutes before your shift
                    </p>
                  </div>

                  {/* Emergency contacts */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#1A2B4A' }}>🚨 Emergency Contacts</h3>
                    {[
                      { role: 'Nodal Officer', number: '0413-2334567' },
                      { role: 'Volunteer Helpdesk', number: '1800-425-1234' },
                      { role: 'Police Control Room', number: '100' },
                      { role: 'Ambulance', number: '108' },
                    ].map(c => (
                      <div key={c.role} className="flex justify-between items-center py-2 text-sm" style={{ borderBottom: '1px solid #F9F9F7' }}>
                        <span style={{ color: '#666' }}>{c.role}</span>
                        <a href={`tel:${c.number}`} className="font-semibold" style={{ color: '#E65C00' }}>{c.number}</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DEPLOYMENT TAB ── */}
          {activeTab === 'deployment' && (
            <div>
              <h2 className="font-bold text-xl mb-6" style={{ color: '#1A2B4A' }}>My Deployments</h2>

              {deployments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm" style={{ color: '#aaa' }}>No deployments yet. Once assigned, your shifts will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deployments.map(d => (
                    <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #EBEBEB' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold" style={{ color: '#1A2B4A' }}>{d.roles?.name || 'Volunteer Role'}</h3>
                          <p className="text-xs mt-0.5" style={{ color: '#888' }}>{d.roles?.dept_name}</p>
                          <div className="flex gap-4 mt-3 text-xs" style={{ color: '#666' }}>
                            <span>📅 {d.scheduled_date}</span>
                            <span>⏰ {d.shift}</span>
                            <span>📍 {d.location}</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: d.status === 'completed' ? '#F0FDF4' : d.status === 'active' ? '#FEF3C7' : '#EEF2FF',
                            color: d.status === 'completed' ? '#16A34A' : d.status === 'active' ? '#D97706' : '#4338CA'
                          }}>
                          {d.status}
                        </span>
                      </div>
                      {d.status === 'scheduled' && (
                        <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                          style={{ background: '#E65C00' }}>
                          <QrCode size={15} /> QR Check-in
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <a href={`/${locale}`} className="text-sm" style={{ color: '#aaa', textDecoration: 'none' }}>← Back to home</a>
          </div>
        </div>
      </main>
    </>
  )
}