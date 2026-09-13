import api from '@/services/api'

export type CouponType = 'fixed' | 'percent'
export type CouponRuntimeStatus =
  | 'active'
  | 'inactive'
  | 'scheduled'
  | 'expired'
  | 'exhausted'

export interface AdminCoupon {
  id: number
  code: string
  name: string
  description: string | null
  type: CouponType
  value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  usage_limit_per_customer: number | null
  usage_count: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  runtime_status: CouponRuntimeStatus
  created_at: string | null
  updated_at: string | null
}

export interface CouponPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface CouponListParams {
  search?: string
  type?: CouponType | ''
  status?: CouponRuntimeStatus | ''
  page?: number
  per_page?: number
}

export interface CouponPayload {
  code: string
  name: string
  description: string | null
  type: CouponType
  value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  usage_limit_per_customer: number | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}

const adminCouponApi = {
  async getAll(params: CouponListParams = {}) {
    const response = await api.get('/api/v1/admin/coupons', {
      params,
    })

    return response.data.data as {
      coupons: AdminCoupon[]
      pagination: CouponPagination
    }
  },

  async getOne(couponId: number) {
    const response = await api.get(
      `/api/v1/admin/coupons/${couponId}`,
    )

    return response.data.data.coupon as AdminCoupon
  },

  async create(payload: CouponPayload) {
    const response = await api.post(
      '/api/v1/admin/coupons',
      payload,
    )

    return response.data.data.coupon as AdminCoupon
  },

  async update(couponId: number, payload: CouponPayload) {
    const response = await api.put(
      `/api/v1/admin/coupons/${couponId}`,
      payload,
    )

    return response.data.data.coupon as AdminCoupon
  },

  async remove(couponId: number) {
    await api.delete(`/api/v1/admin/coupons/${couponId}`)
  },
}

export default adminCouponApi
