import api from './api'
import type { HomepageModule } from './site.api'

export interface HomepageServiceOption {
  id: number
  category_id: number | null
  name: string
  slug: string
  thumbnail: string | null
  base_price: string | number
  is_featured: boolean
  sort_order: number
  category?: {
    id: number
    name: string
  } | null
}

export const homepageModuleApi = {
  async list(): Promise<HomepageModule[]> {
    const response = await api.get('/api/v1/admin/homepage-modules')
    return response.data.data.modules
  },

  async serviceOptions(): Promise<HomepageServiceOption[]> {
    const response = await api.get('/api/v1/admin/homepage-modules/service-options')
    return response.data.data.services
  },

  async create(payload: any) {
    const response = await api.post('/api/v1/admin/homepage-modules', payload)
    return response.data.data.module as HomepageModule
  },

  async update(id: number, payload: any) {
    const response = await api.put(`/api/v1/admin/homepage-modules/${id}`, payload)
    return response.data.data.module as HomepageModule
  },

  async remove(id: number) {
    await api.delete(`/api/v1/admin/homepage-modules/${id}`)
  },

  async reorder(ids: number[]) {
    await api.post('/api/v1/admin/homepage-modules/reorder', { ids })
  },
}
