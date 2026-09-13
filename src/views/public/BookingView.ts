import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
  useRoute,
} from 'vue-router'
import axios from 'axios'
import publicCatalogApi, {
  type PublicService,
  type PublicServiceVariant,
} from '@/services/publicCatalog.api'
import availabilityApi, {
  type AvailabilitySlot,
} from '@/services/availability.api'
import couponApi, {
  type CouponResult,
} from '@/services/coupon.api'
import bookingApi, {
  type CreatedBooking,
} from '@/services/booking.api'
import { useAuthStore } from '@/stores/auth'

export function useBookingView() {
  /*
   * Component nhỏ dùng chung ở Step 3 & 4.
   */
  const OrderSummary = defineComponent({
    props: {
      serviceName: {
        type: String,
        required: true,
      },
  
      variantName: {
        type: String,
        required: true,
      },
  
      date: {
        type: String,
        required: true,
      },
  
      startTime: {
        type: String,
        required: true,
      },
  
      endTime: {
        type: String,
        required: true,
      },
  
      duration: {
        type: Number,
        required: true,
      },
  
      subtotal: {
        type: Number,
        required: true,
      },
  
      discount: {
        type: Number,
        required: true,
      },
  
      total: {
        type: Number,
        required: true,
      },
  
      deposit: {
        type: Number,
        required: true,
      },
    },
  
    setup(props) {
      const money = (
        value: number,
      ) => {
        return new Intl.NumberFormat(
          'vi-VN',
          {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          },
        ).format(value)
      }
  
      const row = (
        label: string,
        value: string,
        className = '',
      ) =>
        h(
          'div',
          {
            class: className,
          },
          [
            h('span', label),
            h('strong', value),
          ],
        )
  
      return () =>
        h(
          'aside',
          {
            class: 'order-summary',
          },
          [
            h(
              'div',
              {
                class:
                  'order-summary-heading',
              },
              [
                h(
                  'span',
                  'TÓM TẮT LỊCH HẸN',
                ),
                h(
                  'strong',
                  'Chi tiết đặt lịch',
                ),
              ],
            ),
  
            h(
              'div',
              {
                class:
                  'appointment-summary',
              },
              [
                row(
                  'Dịch vụ',
                  props.serviceName,
                ),
  
                row(
                  'Gói',
                  props.variantName,
                ),
  
                row(
                  'Ngày',
                  props.date,
                ),
  
                row(
                  'Thời gian',
                  `${props.startTime} - ${props.endTime}`,
                ),
  
                row(
                  'Thời lượng',
                  `${props.duration} phút`,
                ),
              ],
            ),
  
            h(
              'div',
              {
                class: 'price-summary',
              },
              [
                row(
                  'Tạm tính',
                  money(
                    props.subtotal,
                  ),
                ),
  
                props.discount > 0
                  ? row(
                      'Giảm giá',
                      `- ${money(
                        props.discount,
                      )}`,
                      'discount-row',
                    )
                  : null,
  
                row(
                  'Tổng cộng',
                  money(props.total),
                  'total-row',
                ),
  
                props.deposit > 0
                  ? row(
                      'Tiền cọc dự kiến',
                      money(
                        props.deposit,
                      ),
                      'deposit-row',
                    )
                  : null,
              ],
            ),
  
            h(
              'div',
              {
                class: 'summary-note',
              },
              'Giá cuối cùng sẽ được backend kiểm tra lại khi tạo booking.',
            ),
          ],
        )
    },
  })

  const route = useRoute()

  const auth = useAuthStore()

  const editingCustomerInfo = ref(false)

  const currentStep = ref(1)

  const loadingServices =
    ref(false)

  const loadingSlots =
    ref(false)

  const checkingCoupon =
    ref(false)

  const submittingBooking =
    ref(false)

  const services =
    ref<PublicService[]>([])

  const selectedService =
    ref<PublicService | null>(null)

  const selectedVariant =
    ref<PublicServiceVariant | null>(
      null,
    )

  const selectedDate =
    ref('')

  const slots =
    ref<AvailabilitySlot[]>([])

  const selectedSlot =
    ref<AvailabilitySlot | null>(
      null,
    )

  const availabilityError =
    ref('')

  const couponCode =
    ref('')

  const couponMessage =
    ref('')

  const appliedCoupon =
    ref<CouponResult | null>(null)

  const submitError =
    ref('')

  const createdBooking =
    ref<CreatedBooking | null>(
      null,
    )

  const customerForm = ref({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  const fillCustomerFromAccount = () => {
    if (!auth.user) {
      return
    }
  
    customerForm.value.name = auth.user.name || ''
    customerForm.value.phone = auth.user.phone || ''
    customerForm.value.email = auth.user.email || ''
  }

  const editCustomerInfo = () => {
    editingCustomerInfo.value = true
  }

  const cancelCustomerInfoEdit = () => {
    fillCustomerFromAccount()
    editingCustomerInfo.value = false
  }

  const minDate = computed(() => {
    const today = new Date()
  
    const year =
      today.getFullYear()
  
    const month =
      String(
        today.getMonth() + 1,
      ).padStart(2, '0')
  
    const day =
      String(
        today.getDate(),
      ).padStart(2, '0')
  
    return `${year}-${month}-${day}`
  })

  const subtotal = computed(() => {
    if (!selectedVariant.value) {
      return 0
    }
  
    return Number(
      selectedVariant.value.sale_price ??
      selectedVariant.value.price,
    )
  })

  const discount = computed(() => {
    return Number(
      appliedCoupon.value?.discount ??
      0,
    )
  })

  const total = computed(() => {
    return Math.max(
      0,
      subtotal.value -
      discount.value,
    )
  })

  const depositAmount =
    computed(() => {
      const variant =
        selectedVariant.value
  
      if (!variant) {
        return 0
      }
  
      if (
        variant.deposit_type ===
        'none'
      ) {
        return 0
      }
  
      if (
        variant.deposit_type ===
        'fixed'
      ) {
        return Math.min(
          Number(
            variant.deposit_value,
          ),
          total.value,
        )
      }
  
      if (
        variant.deposit_type ===
        'percent'
      ) {
        return (
          total.value *
          Number(
            variant.deposit_value,
          )
        ) / 100
      }
  
      return 0
    })

  const canContinueCustomer =
    computed(() => {
      const hasName =
        customerForm.value.name
          .trim().length > 0
  
      const hasPhone =
        customerForm.value.phone
          .trim().length > 0
  
      const validEmail =
        !customerForm.value.email ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(
            customerForm.value.email,
          )
  
      return (
        hasName &&
        hasPhone &&
        validEmail &&
        Boolean(
          selectedSlot.value,
        )
      )
    })

  const formatMoney = (
    value: string | number,
  ) => {
    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      },
    ).format(
      Number(value),
    )
  }

  const formatSelectedDate = (
    date: string,
  ) => {
    if (!date) {
      return ''
    }
  
    const [
      year,
      month,
      day,
    ] = date.split('-')
  
    return `${day}/${month}/${year}`
  }

  const formatBackendDate = (
    value: string,
  ) => {
    const datePart =
      value.substring(0, 10)
  
    return formatSelectedDate(
      datePart,
    )
  }

  const formatBackendTime = (
    value: string,
  ) => {
    return value.substring(
      11,
      16,
    )
  }

  const getDepositText = (
    variant: PublicServiceVariant,
  ) => {
    if (
      variant.deposit_type ===
      'none'
    ) {
      return 'Không cần cọc'
    }
  
    if (
      variant.deposit_type ===
      'percent'
    ) {
      return `Cọc ${Number(
        variant.deposit_value,
      )}%`
    }
  
    return `Cọc ${formatMoney(
      variant.deposit_value,
    )}`
  }

  const selectService = (
    service: PublicService,
  ) => {
    if (
      selectedService.value?.id ===
      service.id
    ) {
      return
    }
  
    selectedService.value =
      service
  
    selectedVariant.value =
      null
  
    resetTimeSelection()
    removeCoupon()
  }

  const selectVariant = (
    variant: PublicServiceVariant,
  ) => {
    if (
      selectedVariant.value?.id ===
      variant.id
    ) {
      return
    }
  
    selectedVariant.value =
      variant
  
    resetTimeSelection()
    removeCoupon()
  }

  const resetTimeSelection = () => {
    selectedDate.value = ''
    slots.value = []
    selectedSlot.value = null
  
    availabilityError.value = ''
  }

  const goToTimeStep = () => {
    if (
      !selectedService.value ||
      !selectedVariant.value
    ) {
      return
    }
  
    currentStep.value = 2
    scrollTop()
  }

  const goToCustomerStep = () => {
    if (!selectedSlot.value) {
      return
    }
  
    currentStep.value = 3
    scrollTop()
  }

  const goToConfirmation = () => {
    if (
      !canContinueCustomer.value
    ) {
      return
    }
  
    submitError.value = ''
    currentStep.value = 4
  
    scrollTop()
  }

  const handleDateChange =
    async () => {
      selectedSlot.value = null
  
      await loadSlots()
    }

  const loadSlots = async () => {
    if (
      !selectedVariant.value ||
      !selectedDate.value
    ) {
      return
    }
  
    loadingSlots.value = true
    availabilityError.value = ''
  
    slots.value = []
    selectedSlot.value = null
  
    try {
      const result =
        await availabilityApi.getSlots(
          selectedVariant.value.id,
          selectedDate.value,
        )
  
      slots.value =
        result.slots
    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        availabilityError.value =
          error.response
            ?.data?.message ||
          'Không thể kiểm tra lịch trống.'
      } else {
        availabilityError.value =
          'Có lỗi xảy ra khi kiểm tra lịch.'
      }
    } finally {
      loadingSlots.value = false
    }
  }

  const handleCouponInput = () => {
    if (!appliedCoupon.value) {
      couponMessage.value = ''
    }
  }

  const applyCoupon = async () => {
    if (
      !couponCode.value ||
      !selectedVariant.value
    ) {
      return
    }
  
    checkingCoupon.value = true
    couponMessage.value = ''
  
    try {
      const result =
        await couponApi.check(
          couponCode.value,
          selectedVariant.value.id,
        )
  
      appliedCoupon.value =
        result
  
      couponCode.value =
        result.coupon.code
  
      couponMessage.value =
        `Đã áp dụng mã ${result.coupon.code}.`
    } catch (error) {
      appliedCoupon.value = null
  
      if (
        axios.isAxiosError(error)
      ) {
        couponMessage.value =
          getAxiosErrorMessage(
            error,
            'Mã giảm giá không hợp lệ.',
          )
      } else {
        couponMessage.value =
          'Không thể kiểm tra mã giảm giá.'
      }
    } finally {
      checkingCoupon.value = false
    }
  }

  const removeCoupon = () => {
    couponCode.value = ''
    couponMessage.value = ''
    appliedCoupon.value = null
  }

  const submitBooking =
    async () => {
      if (
        submittingBooking.value ||
        !selectedVariant.value ||
        !selectedSlot.value ||
        !canContinueCustomer.value
      ) {
        return
      }
  
      submittingBooking.value = true
      submitError.value = ''
  
      try {
        const booking =
          await bookingApi.create({
            variant_id:
              selectedVariant.value.id,
  
            start_at:
              selectedSlot.value.start_at,
  
            customer_name:
              customerForm.value.name,
  
            customer_phone:
              customerForm.value.phone,
  
            customer_email:
              customerForm.value.email ||
              null,
  
            notes:
              customerForm.value.notes ||
              null,
  
            /*
             * Chỉ gửi coupon khi
             * đã được preview thành công.
             */
            coupon_code:
              appliedCoupon.value
                ? appliedCoupon.value
                    .coupon.code
                : null,
          })
  
        createdBooking.value =
          booking
  
        scrollTop()
      } catch (error) {
        if (
          axios.isAxiosError(error)
        ) {
          submitError.value =
            getAxiosErrorMessage(
              error,
              'Không thể tạo booking.',
            )
  
          /*
           * Nếu slot đã hết trong lúc
           * khách đang điền form.
           */
          const errors =
            error.response?.data
              ?.errors
  
          if (
            errors?.start_at
          ) {
            await handleSlotConflict()
          }
  
          return
        }
  
        submitError.value =
          'Có lỗi xảy ra khi tạo booking.'
      } finally {
        submittingBooking.value = false
      }
    }

  const handleSlotConflict =
    async () => {
      currentStep.value = 2
  
      await loadSlots()
  
      availabilityError.value =
        'Khung giờ vừa chọn không còn khả dụng. Vui lòng chọn một khung giờ khác.'
  
      scrollTop()
    }

  const getAxiosErrorMessage = (
    error: unknown,
    fallback: string,
  ) => {
    if (
      !axios.isAxiosError(error)
    ) {
      return fallback
    }
  
    const response =
      error.response?.data
  
    if (
      response?.errors &&
      typeof response.errors ===
        'object'
    ) {
      const messages =
        Object.values(
          response.errors,
        ).flat()
  
      if (messages.length > 0) {
        return String(
          messages[0],
        )
      }
    }
  
    return (
      response?.message ||
      fallback
    )
  }

  const startNewBooking = () => {
    createdBooking.value = null
  
    currentStep.value = 1
  
    selectedService.value = null
    selectedVariant.value = null
  
    selectedDate.value = ''
    selectedSlot.value = null
  
    slots.value = []
  
    customerForm.value = {
      name: '',
      phone: '',
      email: '',
      notes: '',
    }
  
    fillCustomerFromAccount()
    editingCustomerInfo.value = false
  
    removeCoupon()
  
    submitError.value = ''
    availabilityError.value = ''
  
    scrollTop()
  }

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const loadServices = async () => {
    loadingServices.value = true
  
    try {
      services.value =
        await publicCatalogApi
          .getServices()
  
      const serviceSlug =
        route.query.service
  
      if (
        typeof serviceSlug ===
        'string'
      ) {
        const found =
          services.value.find(
            (service) =>
              service.slug ===
              serviceSlug,
          )
  
        if (found) {
          selectedService.value =
            found
        }
      }
    } finally {
      loadingServices.value = false
    }
  }

  onMounted(async () => {
    if (!auth.initialized) {
      try {
        await auth.fetchMe()
      } catch {
        // Route /booking đã được bảo vệ bởi auth guard.
        // Nếu session hết hạn, router/API sẽ xử lý đăng nhập lại.
      }
    }
  
    fillCustomerFromAccount()
    await loadServices()
  })

  return {
    h,
    ref,
    RouterLink,
    OrderSummary,
    auth,
    editingCustomerInfo,
    currentStep,
    loadingServices,
    loadingSlots,
    checkingCoupon,
    submittingBooking,
    services,
    selectedService,
    selectedVariant,
    selectedDate,
    slots,
    selectedSlot,
    availabilityError,
    couponCode,
    couponMessage,
    appliedCoupon,
    submitError,
    createdBooking,
    customerForm,
    editCustomerInfo,
    cancelCustomerInfoEdit,
    minDate,
    subtotal,
    discount,
    total,
    depositAmount,
    canContinueCustomer,
    formatMoney,
    formatSelectedDate,
    formatBackendDate,
    formatBackendTime,
    getDepositText,
    selectService,
    selectVariant,
    goToTimeStep,
    goToCustomerStep,
    goToConfirmation,
    handleDateChange,
    loadSlots,
    handleCouponInput,
    applyCoupon,
    removeCoupon,
    submitBooking,
    startNewBooking,
  };
}
