import { onMounted, reactive, ref } from 'vue'
import { adminReviewApi } from '@/services/adminReview.api'

export function useReviewsView() {
  const loading = ref(true)
  const reviews = ref<any[]>([])
  const stats = ref<any>({
    total_reviews: 0,
    average_rating: 0,
    distribution: {},
    staff: [],
  })

  const filters = reactive({
    search: '',
    rating: '',
    staff_id: '',
  })

  const load = async () => {
    loading.value = true
    try {
      const [reviewResult, statsResult] = await Promise.all([
        adminReviewApi.list(filters),
        adminReviewApi.stats(),
      ])
      reviews.value = reviewResult.data
      stats.value = statsResult
    } finally {
      loading.value = false
    }
  }

  const resetFilters = async () => {
    filters.search = ''
    filters.rating = ''
    filters.staff_id = ''
    await load()
  }

  const stars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

  onMounted(load)

  return {
    loading,
    reviews,
    stats,
    filters,
    load,
    resetFilters,
    stars,
  }
}
