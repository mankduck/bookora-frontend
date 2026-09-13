import api from './api'

export type ReviewFilters = {
  search?: string
  rating?: string | number
  staff_id?: string | number
}

export const adminReviewApi = {
  async list(params: ReviewFilters = {}) {
    const response = await api.get('/api/v1/admin/reviews', { params })
    return response.data.data
  },
  async stats() {
    const response = await api.get('/api/v1/admin/reviews/stats')
    return response.data.data
  },
}
