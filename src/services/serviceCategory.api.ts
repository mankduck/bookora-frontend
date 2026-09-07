import api from '@/services/api'

export interface ServiceCategory {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  sort_order: number
  status: 'active' | 'inactive'
  services_count?: number

  parent?: {
    id: number
    name: string
  } | null
}

export interface ServiceCategoryPayload {
  parent_id: number | null
  name: string
  slug?: string
  description: string
  thumbnail?: string | null
  sort_order: number
  status: 'active' | 'inactive'
}

export interface CategoryListResponse {
  current_page: number
  data: ServiceCategory[]
  last_page: number
  per_page: number
  total: number
}

const serviceCategoryApi = {
  async getAll(params?: {
    search?: string
    status?: string
    page?: number
    per_page?: number
  }) {
    const response = await api.get(
      '/api/v1/admin/service-categories',
      {
        params,
      },
    )

    return response.data.data as CategoryListResponse
  },

  async create(payload: ServiceCategoryPayload) {
    const response = await api.post(
      '/api/v1/admin/service-categories',
      payload,
    )

    return response.data
  },

  async update(
    id: number,
    payload: ServiceCategoryPayload,
  ) {
    const response = await api.put(
      `/api/v1/admin/service-categories/${id}`,
      payload,
    )

    return response.data
  },

  async remove(id: number) {
    const response = await api.delete(
      `/api/v1/admin/service-categories/${id}`,
    )

    return response.data
  },
}

export default serviceCategoryApi