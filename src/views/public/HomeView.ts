import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { PublicService } from '@/services/publicCatalog.api'
import { siteApi } from '@/services/site.api'
import { useSiteStore } from '@/stores/site'

export function useHomeView() {
  const site = useSiteStore()
  const loading = ref(false)
  const featuredServices = ref<PublicService[]>([])
  const posts = ref<any[]>([])
  const topStaff = ref<any[]>([])

  const staffModalOpen = ref(false)
  const staffModalLoading = ref(false)
  const selectedStaff = ref<any | null>(null)
  const selectedStaffReviews = ref<any[]>([])

  const modules = computed(() => site.modules.filter((module) => module.is_enabled))

  const formatMoney = (value: string | number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value))

  const loadHomeContent = async () => {
    const home = await siteApi.homeData()
    featuredServices.value = (home.services || []).slice(0, 6) as PublicService[]
    posts.value = home.posts
    topStaff.value = [...home.top_staff].sort((a, b) => {
      const ratingDiff = Number(b.rating_avg || 0) - Number(a.rating_avg || 0)
      if (ratingDiff !== 0) return ratingDiff
      return Number(b.reviews_count || 0) - Number(a.reviews_count || 0)
    })
  }

  const load = async () => {
    loading.value = true
    try {
      await site.load()
      await loadHomeContent()
    } finally {
      loading.value = false
    }
  }

  const handleRealtimeNotification = (event: Event) => {
    const notification = (event as CustomEvent).detail as { type?: string } | undefined
    if (notification?.type !== 'site_updated') return
    void loadHomeContent()
  }

  const openStaffReviews = async (staff: any) => {
    staffModalOpen.value = true
    staffModalLoading.value = true
    selectedStaff.value = staff
    selectedStaffReviews.value = []
    try {
      const data = await siteApi.staffReviews(Number(staff.id))
      selectedStaff.value = data.staff
      selectedStaffReviews.value = [...data.reviews].sort((a, b) => {
        const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return Number(b.id || 0) - Number(a.id || 0)
      })
    } finally {
      staffModalLoading.value = false
    }
  }

  const closeStaffReviews = () => {
    staffModalOpen.value = false
    selectedStaff.value = null
    selectedStaffReviews.value = []
  }

  const stars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  onMounted(() => {
    void load()
    window.addEventListener('bookora:notification', handleRealtimeNotification)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('bookora:notification', handleRealtimeNotification)
  })

  return {
    RouterLink,
    site,
    loading,
    modules,
    featuredServices,
    posts,
    topStaff,
    staffModalOpen,
    staffModalLoading,
    selectedStaff,
    selectedStaffReviews,
    formatMoney,
    openStaffReviews,
    closeStaffReviews,
    stars,
  }
}
