import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'
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
import adminBookingCreateApi, {
  type AdminCreatedBooking,
} from '@/services/adminBookingCreate.api'

export function useAdminCreateBookingModal(props: any, emit: any) {
  const currentStep = ref(1)

  const loadingServices = ref(false)

  const loadingSlots = ref(false)

  const checkingCoupon = ref(false)

  const submitting = ref(false)

  const services =
    ref<PublicService[]>([])

  const selectedService =
    ref<PublicService | null>(null)

  const selectedVariant =
    ref<PublicServiceVariant | null>(
      null,
    )

  const selectedDate = ref('')

  const slots =
    ref<AvailabilitySlot[]>([])

  const selectedSlot =
    ref<AvailabilitySlot | null>(
      null,
    )

  const availabilityError = ref('')

  const couponCode = ref('')

  const couponMessage = ref('')

  const appliedCoupon =
    ref<CouponResult | null>(
      null,
    )

  const submitError = ref('')

  const createdBooking =
    ref<AdminCreatedBooking | null>(
      null,
    )

  const customerForm = ref({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  const steps = [
    {
      id: 1,
      title: 'Dịch vụ',
      description: 'Chọn gói',
    },
    {
      id: 2,
      title: 'Ngày & giờ',
      description: 'Lịch trống',
    },
    {
      id: 3,
      title: 'Khách hàng',
      description: 'Thông tin',
    },
    {
      id: 4,
      title: 'Xác nhận',
      description: 'Tạo lịch',
    },
  ]

  const minDate = computed(() => {
    const date = new Date()
  
    const year =
      date.getFullYear()
  
    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0')
  
    const day =
      String(
        date.getDate(),
      ).padStart(2, '0')
  
    return `${year}-${month}-${day}`
  })

  const subtotal = computed(() => {
    if (!selectedVariant.value) {
      return 0
    }
  
    return Number(
      selectedVariant.value
        .sale_price ??
      selectedVariant.value
        .price,
    )
  })

  const discount = computed(() => {
    return Number(
      appliedCoupon.value
        ?.discount ??
      0,
    )
  })

  const total = computed(() => {
    return Math.max(
      subtotal.value -
        discount.value,
      0,
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
          'percent' ||
        variant.deposit_type ===
          'percentage'
      ) {
        return Math.min(
          (
            total.value *
            Number(
              variant.deposit_value,
            )
          ) / 100,
          total.value,
        )
      }
  
      return 0
    })

  const canContinueCustomer =
    computed(() => {
      const email =
        customerForm.value.email.trim()
  
      return Boolean(
        customerForm.value
          .name
          .trim() &&
        customerForm.value
          .phone
          .trim() &&
        (
          !email ||
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email)
        ) &&
        selectedSlot.value,
      )
    })

  const highestAvailableStep =
    computed(() => {
      if (!selectedVariant.value) {
        return 1
      }
  
      if (!selectedSlot.value) {
        return 2
      }
  
      if (
        !canContinueCustomer.value
      ) {
        return 3
      }
  
      return 4
    })

  const formatMoney = (
    value: string | number,
  ) =>
    new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      },
    ).format(Number(value))

  const formatSelectedDate = (
    value: string,
  ) => {
    if (!value) {
      return '—'
    }
  
    const [
      year,
      month,
      day,
    ] = value.split('-')
  
    return `${day}/${month}/${year}`
  }

  const formatBackendDate = (
    value: string,
  ) =>
    formatSelectedDate(
      value.substring(0, 10),
    )

  const formatBackendTime = (
    value: string,
  ) =>
    value.substring(11, 16)

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
      'fixed'
    ) {
      return `Cọc ${formatMoney(
        variant.deposit_value,
      )}`
    }
  
    return `Cọc ${Number(
      variant.deposit_value,
    )}%`
  }

  const selectService = (
    service: PublicService,
  ) => {
    selectedService.value =
      service
  
    selectedVariant.value =
      null
  
    selectedDate.value = ''
    selectedSlot.value = null
  
    slots.value = []
  
    removeCoupon()
  }

  const selectVariant = (
    variant:
      PublicServiceVariant,
  ) => {
    selectedVariant.value =
      variant
  
    selectedDate.value = ''
    selectedSlot.value = null
    slots.value = []
  
    availabilityError.value = ''
  
    removeCoupon()
  }

  const goToStep = (
    step: number,
  ) => {
    if (
      step <=
      highestAvailableStep.value
    ) {
      currentStep.value =
        step
    }
  }

  const loadSlots = async () => {
    if (
      !selectedVariant.value ||
      !selectedDate.value
    ) {
      return
    }
  
    loadingSlots.value = true
  
    selectedSlot.value = null
    slots.value = []
  
    availabilityError.value = ''
  
    try {
      const response =
        await availabilityApi
          .getSlots(
            selectedVariant
              .value.id,
            selectedDate.value,
          )
  
      slots.value =
        response.slots
    } catch (error) {
      availabilityError.value =
        getErrorMessage(
          error,
          'Không thể kiểm tra lịch.',
        )
    } finally {
      loadingSlots.value = false
    }
  }

  const applyCoupon = async () => {
    if (
      !selectedVariant.value ||
      !couponCode.value.trim()
    ) {
      return
    }
  
    checkingCoupon.value = true
  
    couponMessage.value = ''
  
    try {
      const result =
        await couponApi.check(
          couponCode.value.trim(),
          selectedVariant
            .value.id,
        )
  
      appliedCoupon.value =
        result
  
      couponCode.value =
        result.coupon.code
  
      couponMessage.value =
        `Đã áp dụng ${result.coupon.code}.`
    } catch (error) {
      appliedCoupon.value = null
  
      couponMessage.value =
        getErrorMessage(
          error,
          'Mã ưu đãi không hợp lệ.',
        )
    } finally {
      checkingCoupon.value = false
    }
  }

  const removeCoupon = () => {
    appliedCoupon.value = null
    couponCode.value = ''
    couponMessage.value = ''
  }

  const submitBooking =
    async () => {
      if (
        submitting.value ||
        !selectedVariant.value ||
        !selectedSlot.value ||
        !canContinueCustomer.value
      ) {
        return
      }
  
      submitting.value = true
      submitError.value = ''
  
      try {
        const booking =
          await adminBookingCreateApi
            .create({
              variant_id:
                selectedVariant
                  .value.id,
  
              start_at:
                selectedSlot
                  .value
                  .start_at,
  
              customer_name:
                customerForm
                  .value
                  .name
                  .trim(),
  
              customer_phone:
                customerForm
                  .value
                  .phone
                  .trim(),
  
              customer_email:
                customerForm
                  .value
                  .email
                  .trim() ||
                null,
  
              notes:
                customerForm
                  .value
                  .notes
                  .trim() ||
                null,
  
              coupon_code:
                appliedCoupon.value
                  ?.coupon.code ||
                null,
            })
  
        createdBooking.value =
          booking
  
        emit(
          'created',
          booking,
        )
      } catch (error) {
        submitError.value =
          getErrorMessage(
            error,
            'Không thể tạo booking.',
          )
  
        if (
          axios.isAxiosError(
            error,
          ) &&
          error.response?.data
            ?.errors?.start_at
        ) {
          currentStep.value = 2
  
          await loadSlots()
  
          availabilityError.value =
            'Khung giờ vừa chọn không còn khả dụng. Vui lòng chọn giờ khác.'
        }
      } finally {
        submitting.value = false
      }
    }

  const resetForm = () => {
    currentStep.value = 1
  
    selectedService.value =
      null
  
    selectedVariant.value =
      null
  
    selectedDate.value = ''
    selectedSlot.value = null
  
    slots.value = []
  
    customerForm.value = {
      name: '',
      phone: '',
      email: '',
      notes: '',
    }
  
    removeCoupon()
  
    submitError.value = ''
    availabilityError.value = ''
  
    createdBooking.value = null
  }

  const startNewBooking = () => {
    resetForm()
  }

  const requestClose = () => {
    if (submitting.value) {
      return
    }
  
    emit('close')
  }

  const closeAfterSuccess = () => {
    emit('close')
  }

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ) => {
    if (
      axios.isAxiosError(error)
    ) {
      const data =
        error.response?.data
  
      if (
        data?.errors &&
        typeof data.errors ===
          'object'
      ) {
        const first =
          Object.values(
            data.errors,
          )
            .flat()
            .at(0)
  
        if (first) {
          return String(first)
        }
      }
  
      return (
        data?.message ||
        fallback
      )
    }
  
    if (
      error instanceof Error
    ) {
      return error.message
    }
  
    return fallback
  }

  const loadServices = async () => {
    loadingServices.value = true
  
    try {
      services.value =
        await publicCatalogApi
          .getServices()
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
          'Không thể tải dịch vụ.',
        ),
      )
    } finally {
      loadingServices.value =
        false
    }
  }

  watch(
    () => props.open,
    (isOpen) => {
      document.body.style
        .overflow =
        isOpen
          ? 'hidden'
          : ''
  
      if (isOpen) {
        resetForm()
      }
    },
  )

  onMounted(loadServices)

  return {
    currentStep,
    loadingServices,
    loadingSlots,
    checkingCoupon,
    submitting,
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
    steps,
    minDate,
    subtotal,
    discount,
    total,
    depositAmount,
    canContinueCustomer,
    highestAvailableStep,
    formatMoney,
    formatSelectedDate,
    formatBackendDate,
    formatBackendTime,
    getDepositText,
    selectService,
    selectVariant,
    goToStep,
    loadSlots,
    applyCoupon,
    removeCoupon,
    submitBooking,
    startNewBooking,
    requestClose,
    closeAfterSuccess,
  };
}
