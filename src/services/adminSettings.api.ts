import api from './api'
import type { SiteSettings } from './site.api'

export const adminSettingsApi = {
  async get(): Promise<SiteSettings> {
    const r = await api.get('/api/v1/admin/settings')
    return r.data.data.settings
  },
  async update(payload: Record<string, any>, logo?: File | null): Promise<SiteSettings> {
    const form = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) form.append(key, String(value))
    })
    if (logo) form.append('logo', logo, logo.name)
    const r = await api.post('/api/v1/admin/settings', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    return r.data.data.settings
  },
}
