import api from '@/services/api'

export interface AdminCreatedBookingItem {
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

export interface AdminCreatedBooking {
  id: number
  booking_code: string

  customer_id: number | null

  start_at: string
  end_at: string

  customer_name: string
  customer_phone: string
  customer_email: string | null

  subtotal: string | number
  discount_amount: string | number
  total_amount: string | number
  deposit_amount: string | number

  status: string
  payment_status: string
  source: string | null

  items: AdminCreatedBookingItem[]
}

export interface AdminCreateBookingPayload {
  variant_id: number
  start_at: string

  customer_name: string
  customer_phone: string
  customer_email?: string | null

  notes?: string | null
  coupon_code?: string | null
}

const adminBookingCreateApi = {
  async create(
    payload: AdminCreateBookingPayload,
  ) {
    const response = await api.post(
      '/api/v1/admin/bookings',
      payload,
    )

    return response.data.data
      .booking as AdminCreatedBooking
  },
}

export default adminBookingCreateApi