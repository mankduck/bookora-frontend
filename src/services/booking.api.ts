import api from '@/services/api'

export interface CreateBookingPayload {
  service_variant_id: number
  start_at: string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  customer_note?: string | null
  coupon_code?: string | null
}

export interface CreatedBookingItem {
  id: number
  booking_id: number
  service_id: number | null
  service_variant_id: number | null
  service_name: string
  variant_name: string | null
  price: string | number
  quantity: number
  duration_minutes: number
  subtotal: string | number
}

export interface CreatedBooking {
  id: number
  booking_code: string
  customer_id: number
  start_at: string
  end_at: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  subtotal: string | number
  discount: string | number
  total: string | number
  deposit: string | number
  status: string
  payment_status: string
  items: CreatedBookingItem[]
}

const bookingApi = {
  async create(
    payload: CreateBookingPayload,
  ) {
    const response = await api.post(
      '/api/v1/customer/bookings',
      payload,
    )

    return response.data.data
      .booking as CreatedBooking
  },
}

export default bookingApi
