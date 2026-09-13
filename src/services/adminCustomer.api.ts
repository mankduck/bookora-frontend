import api from '@/services/api'

export type CustomerStatus =
  | 'active'
  | 'inactive'

export interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  avatar: string | null
  status: CustomerStatus
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
  bookings_count: number
  completed_bookings_count: number
  total_spent: number
  latest_booking_at: string | null
}

export interface CustomerBookingItem {
  id: number
  service_id: number | null
  service_variant_id: number | null
  service_name: string
  variant_name: string | null
  price: number
  quantity: number
  duration_minutes: number
  subtotal: number
}

export interface CustomerBooking {
  id: number
  booking_code: string
  start_at: string
  end_at: string
  subtotal: number
  discount_amount: number
  total_amount: number
  deposit_amount: number
  status: string
  payment_status: string
  source: string | null
  customer_note: string | null
  items: CustomerBookingItem[]
}

export interface CustomerDetail
  extends Omit<
    Customer,
    | 'bookings_count'
    | 'completed_bookings_count'
    | 'total_spent'
    | 'latest_booking_at'
  > {
  stats: {
    bookings_count: number
    completed_bookings_count: number
    total_spent: number
    latest_booking_at: string | null
  }

  bookings: CustomerBooking[]
}

export interface CustomerPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface CustomerListParams {
  search?: string
  status?: string
  page?: number
  per_page?: number
}

export interface CreateCustomerPayload {
  name: string
  phone: string
  email: string | null
  password: string
  status: CustomerStatus
}

export interface UpdateCustomerPayload {
  name: string
  phone: string
  email: string | null
  status: CustomerStatus
}

const adminCustomerApi = {
  async getAll(
    params: CustomerListParams = {},
  ) {
    const response = await api.get(
      '/api/v1/admin/customers',
      {
        params,
      },
    )

    return response.data.data as {
      customers: Customer[]
      pagination: CustomerPagination
    }
  },

  async getOne(
    customerId: number,
  ) {
    const response = await api.get(
      `/api/v1/admin/customers/${customerId}`,
    )

    return response.data.data
      .customer as CustomerDetail
  },

  async create(
    payload: CreateCustomerPayload,
  ) {
    const response = await api.post(
      '/api/v1/admin/customers',
      payload,
    )

    return response.data.data
      .customer as Customer
  },

  async update(
    customerId: number,
    payload: UpdateCustomerPayload,
  ) {
    const response = await api.put(
      `/api/v1/admin/customers/${customerId}`,
      payload,
    )

    return response.data.data
      .customer as Customer
  },
}

export default adminCustomerApi