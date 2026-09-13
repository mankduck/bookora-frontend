import api from '@/services/api'

export interface PublicServiceCategory {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string | null
  thumbnail: string | null
  sort_order: number
  services_count: number
}

export interface PublicServiceVariant {
  id: number
  service_id: number
  name: string
  code: string | null
  description: string | null
  thumbnail: string | null
  price: string | number
  sale_price: string | number | null
  duration_minutes: number
  deposit_type:
    | 'none'
    | 'fixed'
    | 'percent'
  deposit_value: string | number
  status: 'active' | 'inactive'
  sort_order: number
}

export interface PublicService {
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

  category?: {
    id: number
    name: string
    slug: string
  } | null

  variants: PublicServiceVariant[]
}

const publicCatalogApi = {
  async getCategories() {
    const response = await api.get(
      '/api/v1/public/service-categories',
    )

    return response.data.data
      .categories as PublicServiceCategory[]
  },

  async getServices(params?: {
    category?: string
    featured?: boolean
    search?: string
  }) {
    const response = await api.get(
      '/api/v1/public/services',
      {
        params,
      },
    )

    return response.data.data
      .services as PublicService[]
  },

  async getService(slug: string) {
    const response = await api.get(
      `/api/v1/public/services/${slug}`,
    )

    return response.data.data
      .service as PublicService
  },
}

export default publicCatalogApi