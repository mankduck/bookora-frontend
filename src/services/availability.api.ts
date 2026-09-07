import api from '@/services/api'

export interface AvailabilitySlot {
  start_time: string
  end_time: string
  start_at: string
  end_at: string
}

export interface AvailabilityResult {
  date: string

  service: {
    id: number
    name: string
  }

  variant: {
    id: number
    name: string
    duration_minutes: number
    price: string | number
    sale_price: string | number | null
  }

  slots: AvailabilitySlot[]
}

const availabilityApi = {
  async getSlots(
    variantId: number,
    date: string,
  ) {
    const response = await api.get(
      '/api/v1/availability',
      {
        params: {
          variant_id: variantId,
          date,
        },
      },
    )

    return response.data.data as AvailabilityResult
  },
}

export default availabilityApi