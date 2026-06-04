/**
 * PondySevAi API client — Phase 2 + Phase 3 features
 * Set NEXT_PUBLIC_API_URL in .env.local to your Railway backend URL.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('psevai_token') : null
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(res.status, err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // ─── Auth ───────────────────────────────────
  auth: {
    sendOtp: (phone: string) =>
      request<{ sent: boolean; dev_otp?: string }>('/auth/otp/send', {
        method: 'POST', body: JSON.stringify({ phone }),
      }),
    verifyOtp: (phone: string, otp: string) =>
      request<{ access_token: string; role: string; name: string }>('/auth/otp/verify', {
        method: 'POST', body: JSON.stringify({ phone, otp }),
      }),
    staffLogin: (email: string, password: string) =>
      request<{ access_token: string; role: string; name: string }>('/auth/staff/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),
    adminLogin: (email: string, password: string) =>
      request<{ access_token: string; role: string; name: string }>('/auth/admin/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      }),
  },

  // ─── Volunteers ─────────────────────────────
  volunteers: {
    register: (data: Record<string, unknown>) =>
      request<{ id: string; reference_number: string; status: string }>('/volunteers/register', {
        method: 'POST', body: JSON.stringify(data),
      }),
    me: () => request<Record<string, unknown>>('/volunteers/me'),
    list: (params?: { status?: string; commune?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return request<{ volunteers: unknown[]; total: number }>(`/volunteers/${qs ? `?${qs}` : ''}`)
    },
    update: (id: string, data: Record<string, unknown>) =>
      request<{ updated: boolean }>(`/volunteers/${id}`, {
        method: 'PATCH', body: JSON.stringify(data),
      }),
    reassess: (id: string) =>
      request<{ message: string }>(`/volunteers/${id}/reassess`, { method: 'POST' }),
  },

  // ─── Roles ──────────────────────────────────
  roles: {
    list: (params?: { dept_id?: string; demand?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return request<{ roles: unknown[] }>(`/roles/${qs ? `?${qs}` : ''}`)
    },
    departments: () => request<{ departments: unknown[] }>('/roles/departments'),
  },

  // ─── Deployments ────────────────────────────
  deployments: {
    my: () => request<{ deployments: unknown[] }>('/deployments/my'),
    checkin: (volunteer_id: string, deployment_id: string, action: 'checkin' | 'checkout') =>
      request<{ action: string; timestamp: string }>('/deployments/checkin', {
        method: 'POST', body: JSON.stringify({ volunteer_id, deployment_id, action }),
      }),
    // Phase 3: Feedback submission
    feedback: (volunteer_id: string, category: string, notes?: string, deployment_id?: string) =>
      request<{ feedback: string }>('/deployments/feedback', {
        method: 'POST', body: JSON.stringify({ volunteer_id, deployment_id, category, notes }),
      }),
  },

  // ─── Certificates ───────────────────────────
  certificates: {
    my: () => request<{ certificates: unknown[] }>('/certificates/my'),
    verify: (cert_id: string) =>
      request<{ valid: boolean; volunteer_name: string; tier: string }>(`/certificates/verify/${cert_id}`),
    downloadUrl: (volunteer_id: string) => `${BASE_URL}/certificates/download/${volunteer_id}`,
  },

  // ─── Nodal Officer ──────────────────────────
  nodalOfficer: {
    applicants: (params?: { status?: string; commune?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return request<{ applicants: unknown[] }>(`/nodal-officer/applicants${qs ? `?${qs}` : ''}`)
    },
    assign: (id: string, role: string, dept: string) =>
      request<{ assigned: boolean }>(`/nodal-officer/assign/${id}?role=${encodeURIComponent(role)}&dept=${encodeURIComponent(dept)}`, {
        method: 'POST',
      }),
    reject: (id: string) =>
      request<{ rejected: boolean }>(`/nodal-officer/reject/${id}`, { method: 'POST' }),
    stats: () => request<Record<string, unknown>>('/nodal-officer/stats'),
    exportCsvUrl: (params?: { status?: string; commune?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString()
      return `${BASE_URL}/nodal-officer/export/csv${qs ? `?${qs}` : ''}`
    },
  },

  // ─── Admin (Phase 2) ────────────────────────
  admin: {
    createStaff: (data: { name: string; email: string; password: string; commune: string; role: string }) =>
      request<{ created: boolean; id: string }>('/admin/staff', {
        method: 'POST', body: JSON.stringify(data),
      }),
    listStaff: () =>
      request<{ staff: unknown[] }>('/admin/staff'),
    deleteStaff: (id: string) =>
      request<{ deleted: boolean }>(`/admin/staff/${id}`, { method: 'DELETE' }),
  },
}

export { ApiError }