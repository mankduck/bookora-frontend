import api from '@/services/api'

export interface StaffSchedule {
  id?: number
  staff_id?: number
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
}

export interface StaffService {
  id: number
  name: string
  slug: string
  status: string
}

export interface Staff {
  id: number
  user_id: number
  employee_code: string | null
  position: string | null
  bio: string | null
  experience_years: number
  is_bookable: boolean
  status: 'active' | 'inactive'
  sort_order: number

  user: {
    id: number
    name: string
    email: string | null
    phone: string | null
    avatar: string | null
    status: string
  }

  services: StaffService[]
  schedules: StaffSchedule[]
}

export interface StaffPayload {
  name: string
  email?: string | null
  phone: string
  password?: string
  avatar?: string | null

  employee_code?: string | null
  position?: string | null
  bio?: string | null
  experience_years: number
  is_bookable: boolean
  status: 'active' | 'inactive'
  sort_order: number

  service_ids: number[]
  schedules: StaffSchedule[]
}

const staffApi = {
  async getAll(params?: {
    search?: string
    status?: string
    service_id?: number
    page?: number
    per_page?: number
  }) {
    const response = await api.get(
      '/api/v1/admin/staff',
      {
        params,
      },
    )

    return response.data.data
  },

  async create(payload: StaffPayload) {
    const response = await api.post(
      '/api/v1/admin/staff',
      payload,
    )

    return response.data
  },

  async update(
    id: number,
    payload: StaffPayload,
  ) {
    const response = await api.put(
      `/api/v1/admin/staff/${id}`,
      payload,
    )

    return response.data
  },

  async remove(id: number) {
    const response = await api.delete(
      `/api/v1/admin/staff/${id}`,
    )

    return response.data
  },
}

export default staffApi