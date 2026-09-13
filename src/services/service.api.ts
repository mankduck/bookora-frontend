import api from '@/services/api'

export interface ServiceVariant {
  id: number
  service_id: number
  name: string
  code: string | null
  description: string | null
  thumbnail: string | null
  price: string | number
  sale_price: string | number | null
  duration_minutes: number
  deposit_type: 'none' | 'fixed' | 'percent'
  deposit_value: string | number
  status: 'active' | 'inactive'
  sort_order: number
}

export interface Service {
  id: number
  category_id: number | null
  name: string
  slug: string
  short_description: string | null
  description: string | null
  thumbnail: string | null
  base_price: string | number
  default_duration_minutes: number
  status: 'active' | 'inactive'
  is_featured: boolean
  sort_order: number
  variants_count?: number
  variants: ServiceVariant[]

  category?: {
    id: number
    name: string
  } | null
}

export interface ServicePayload {
  category_id: number | null
  name: string
  slug?: string
  short_description: string
  description: string
  thumbnail?: string | null
  base_price: number
  default_duration_minutes: number
  status: 'active' | 'inactive'
  is_featured: boolean
  sort_order: number
}

export interface VariantPayload {
  name: string
  code?: string | null
  description: string
  price: number
  sale_price?: number | null
  duration_minutes: number
  deposit_type:
    | 'none'
    | 'fixed'
    | 'percent'
  deposit_value: number
  status: 'active' | 'inactive'
  sort_order: number
}

const serviceApi = {
  async getAll(params?: {
    search?: string
    category_id?: number
    status?: string
    page?: number
    per_page?: number
  }) {
    const response = await api.get(
      '/api/v1/admin/services',
      { params },
    )

    return response.data.data
  },

  async create(payload: ServicePayload) {
    const response = await api.post(
      '/api/v1/admin/services',
      payload,
    )

    return response.data
  },

  async update(
    id: number,
    payload: ServicePayload,
  ) {
    const response = await api.put(
      `/api/v1/admin/services/${id}`,
      payload,
    )

    return response.data
  },

  async remove(id: number) {
    const response = await api.delete(
      `/api/v1/admin/services/${id}`,
    )

    return response.data
  },

  async createVariant(
    serviceId: number,
    payload: VariantPayload,
  ) {
    const response = await api.post(
      `/api/v1/admin/services/${serviceId}/variants`,
      payload,
    )

    return response.data
  },

  async updateVariant(
    serviceId: number,
    variantId: number,
    payload: VariantPayload,
  ) {
    const response = await api.put(
      `/api/v1/admin/services/${serviceId}/variants/${variantId}`,
      payload,
    )

    return response.data
  },

  async removeVariant(
    serviceId: number,
    variantId: number,
  ) {
    const response = await api.delete(
      `/api/v1/admin/services/${serviceId}/variants/${variantId}`,
    )

    return response.data
  },
}

export default serviceApi