import { defineStore } from 'pinia'
import { siteApi, type HomepageModule, type SiteSettings } from '@/services/site.api'

export const useSiteStore = defineStore('site', {
  state: () => ({
    settings: null as SiteSettings | null,
    modules: [] as HomepageModule[],
    loaded: false,
    loading: false,
  }),
  actions: {
    async load(force = false) {
      if ((this.loaded && !force) || this.loading) return
      this.loading = true
      try {
        const data = await siteApi.config()
        this.settings = data.settings
        this.modules = data.modules
        this.loaded = true
        document.documentElement.style.setProperty('--brand-primary', data.settings.primary_color || '#181916')
        document.documentElement.style.setProperty('--brand-secondary', data.settings.secondary_color || '#f4f4f1')
      } finally {
        this.loading = false
      }
    },
  },
})
