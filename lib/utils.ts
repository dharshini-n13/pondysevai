import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DEPARTMENTS = [
  { id: 'health',      icon: '🏥' },
  { id: 'education',   icon: '📚' },
  { id: 'welfare',     icon: '🤝' },
  { id: 'environment', icon: '🌿' },
  { id: 'digital',     icon: '💻' },
  { id: 'culture',     icon: '🎭' },
]

export const DEPT_COLORS = [
  { bg: '#FEF2F2', border: '#FECACA', badge: '#DC2626' },
  { bg: '#EFF6FF', border: '#BFDBFE', badge: '#2563EB' },
  { bg: '#F5F3FF', border: '#DDD6FE', badge: '#7C3AED' },
  { bg: '#F0FDF4', border: '#BBF7D0', badge: '#16A34A' },
  { bg: '#EEF2FF', border: '#C7D2FE', badge: '#4338CA' },
  { bg: '#FFF7ED', border: '#FED7AA', badge: '#EA580C' },
]

export const COMMUNES = ['Puducherry', 'Villianur', 'Bahour', 'Ariyankuppam']

// Each role has a stable id used as i18n key
// dept_id groups them, demand is 'low'|'medium'|'high'
export const ALL_ROLES = [
  // Law & Order
  { id: 'r01', dept_id: 'law_order', demand: 'high' },
  { id: 'r02', dept_id: 'law_order', demand: 'medium' },
  { id: 'r03', dept_id: 'law_order', demand: 'medium' },
  { id: 'r04', dept_id: 'law_order', demand: 'high' },
  { id: 'r05', dept_id: 'law_order', demand: 'high' },
  // Education
  { id: 'r06', dept_id: 'education', demand: 'low' },
  { id: 'r07', dept_id: 'education', demand: 'low' },
  { id: 'r08', dept_id: 'education', demand: 'low' },
  { id: 'r09', dept_id: 'education', demand: 'low' },
  // Health
  { id: 'r10', dept_id: 'health_san', demand: 'low' },
  { id: 'r11', dept_id: 'health_san', demand: 'low' },
  { id: 'r12', dept_id: 'health_san', demand: 'low' },
  { id: 'r13', dept_id: 'health_san', demand: 'medium' },
  // Environment
  { id: 'r14', dept_id: 'environment', demand: 'high' },
  { id: 'r15', dept_id: 'environment', demand: 'high' },
  { id: 'r16', dept_id: 'environment', demand: 'medium' },
  // Tourism & Culture
  { id: 'r17', dept_id: 'tourism', demand: 'low' },
  { id: 'r18', dept_id: 'tourism', demand: 'low' },
  { id: 'r19', dept_id: 'tourism', demand: 'medium' },
  { id: 'r20', dept_id: 'tourism', demand: 'medium' },
  // Disaster
  { id: 'r21', dept_id: 'disaster', demand: 'medium' },
  { id: 'r22', dept_id: 'disaster', demand: 'high' },
  // Municipal
  { id: 'r23', dept_id: 'municipal', demand: 'low' },
  { id: 'r24', dept_id: 'municipal', demand: 'medium' },
  { id: 'r25', dept_id: 'municipal', demand: 'low' },
  // Women & Child
  { id: 'r26', dept_id: 'women_child', demand: 'low' },
  { id: 'r27', dept_id: 'women_child', demand: 'low' },
]

export const DEPT_IDS = ['law_order', 'education', 'health_san', 'environment', 'tourism', 'disaster', 'municipal', 'women_child']
