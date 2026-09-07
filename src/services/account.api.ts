import api from '@/services/api'

export interface AccountProfile {
  id: number
  name: string
  email: string | null
  phone: string | null
  avatar?: string | null
}

const accountApi = {
  async getProfile() {
    const response = await api.get(
      '/api/v1/customer/profile',
    )

    return response.data.data
      .user as AccountProfile
  },

  async updateProfile(payload: {
    name: string
    email?: string | null
    phone: string
  }) {
    const response = await api.put(
      '/api/v1/customer/profile',
      payload,
    )

    return response.data.data
      .user as AccountProfile
  },
}

export default accountApi
