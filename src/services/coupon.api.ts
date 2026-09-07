import api from '@/services/api'

export interface CouponResult {
  coupon: {
    id: number
    code: string
    name: string
    type: string
    value: string | number
  }

  subtotal: number
  discount: number
  total: number
}

const couponApi = {
  async check(
    code: string,
    variantId: number,
  ) {
    await api.get(
      '/sanctum/csrf-cookie',
    )

    const response = await api.post(
      '/api/v1/public/coupons/check',
      {
        code,
        variant_id: variantId,
      },
    )

    return response.data.data as CouponResult
  },
}

export default couponApi