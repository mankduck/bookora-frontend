import {
  onMounted,
  ref,
} from 'vue'
import { RouterLink } from 'vue-router'
import publicCatalogApi, {
  type PublicService,
} from '@/services/publicCatalog.api'

export function useHomeView() {
  const loading = ref(false)

  const featuredServices =
    ref<PublicService[]>([])

  const formatMoney = (
    value: string | number,
  ) => {
    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      },
    ).format(Number(value))
  }

  const loadFeaturedServices =
    async () => {
      loading.value = true
  
      try {
        const featured =
          await publicCatalogApi.getServices({
            featured: true,
          })
  
        if (featured.length) {
          featuredServices.value =
            featured.slice(0, 3)
  
          return
        }
  
        const all =
          await publicCatalogApi.getServices()
  
        featuredServices.value =
          all.slice(0, 3)
      } finally {
        loading.value = false
      }
    }

  onMounted(loadFeaturedServices)

  return {
    ref,
    RouterLink,
    loading,
    featuredServices,
    formatMoney,
  };
}
