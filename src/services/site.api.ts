import api from './api'

export interface SiteSettings {
  site_name: string
  company_name: string
  tagline: string
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  business_hours: string | null
  map_embed_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  primary_color: string
  secondary_color: string
  admin_language: 'vi' | 'en'
}

export interface HomepageModule {
  id: number
  type: 'hero' | 'services' | 'posts' | 'top_staff' | 'custom_html'
  name: string
  slug: string
  title: string | null
  content: string | null
  custom_css: string | null
  settings: Record<string, any> | null
  sort_order: number
  is_enabled: boolean
  is_locked: boolean
  show_in_nav: boolean
  nav_label: string | null
}

export const siteApi = {
  async config() {
    const response = await api.get('/api/v1/public/site-config')
    return response.data.data as { settings: SiteSettings; modules: HomepageModule[] }
  },
  async homeData() {
    const response = await api.get('/api/v1/public/home-data')
    return response.data.data as { services: any[]; posts: any[]; top_staff: any[] }
  },
  async staffReviews(staffId: number) {
    const response = await api.get(`/api/v1/public/staff/${staffId}/reviews`)
    return response.data.data as { staff: any; reviews: any[] }
  },
}
