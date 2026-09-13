import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import adminCouponApi, {
  type AdminCoupon,
  type CouponPagination,
  type CouponPayload,
  type CouponRuntimeStatus,
  type CouponType,
} from '@/services/adminCoupon.api'

export function useCouponsView() {
  const coupons = ref<AdminCoupon[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const errorMessage = ref('')
  const formError = ref('')
  const modalOpen = ref(false)
  const editingCouponId = ref<number | null>(null)

  const search = ref('')
  const typeFilter = ref<CouponType | ''>('')
  const statusFilter = ref<CouponRuntimeStatus | ''>('')

  const pagination = reactive<CouponPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: null,
    to: null,
  })

  const form = reactive({
    code: '',
    name: '',
    description: '',
    type: 'percent' as CouponType,
    value: 10,
    min_order_amount: 0,
    max_discount_amount: '' as number | '',
    usage_limit: '' as number | '',
    usage_limit_per_customer: 1 as number | '',
    starts_at: '',
    ends_at: '',
    is_active: true,
  })

  let searchTimer: ReturnType<typeof setTimeout> | undefined

  const isEditing = computed(() => editingCouponId.value !== null)

  const modalTitle = computed(() =>
    isEditing.value ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá',
  )

  const getErrorMessage = (
    error: unknown,
    fallback = 'Không thể xử lý yêu cầu.',
  ) => {
    if (!axios.isAxiosError(error)) return fallback

    const errors = error.response?.data?.errors
    if (errors) {
      const firstKey = Object.keys(errors)[0]
      const firstMessage = errors[firstKey]?.[0]
      if (firstMessage) return firstMessage
    }

    return error.response?.data?.message || fallback
  }

  const formatMoney = (value: number | string | null) => {
    if (value === null || value === '') return '—'

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(value))
  }

  const formatDiscount = (coupon: AdminCoupon) => {
    return coupon.type === 'percent'
      ? `${Number(coupon.value)}%`
      : formatMoney(coupon.value)
  }

  const formatDateTime = (value: string | null) => {
    if (!value) return 'Không giới hạn'

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value.replace(' ', 'T')))
  }

  const toDateTimeLocal = (value: string | null) => {
    if (!value) return ''
    return value.replace(' ', 'T').slice(0, 16)
  }

  const runtimeLabel = (status: CouponRuntimeStatus) => {
    const labels: Record<CouponRuntimeStatus, string> = {
      active: 'Đang hoạt động',
      inactive: 'Đã tắt',
      scheduled: 'Sắp diễn ra',
      expired: 'Hết hạn',
      exhausted: 'Hết lượt',
    }

    return labels[status]
  }

  const loadCoupons = async (page = pagination.current_page) => {
    loading.value = true
    errorMessage.value = ''

    try {
      const data = await adminCouponApi.getAll({
        search: search.value || undefined,
        type: typeFilter.value || undefined,
        status: statusFilter.value || undefined,
        page,
        per_page: pagination.per_page,
      })

      coupons.value = data.coupons
      Object.assign(pagination, data.pagination)
    } catch (error) {
      errorMessage.value = getErrorMessage(
        error,
        'Không thể tải danh sách mã giảm giá.',
      )
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    if (searchTimer) clearTimeout(searchTimer)

    searchTimer = setTimeout(() => {
      loadCoupons(1)
    }, 350)
  }

  const applyFilters = () => {
    loadCoupons(1)
  }

  const resetFilters = () => {
    search.value = ''
    typeFilter.value = ''
    statusFilter.value = ''
    loadCoupons(1)
  }

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.last_page) return
    loadCoupons(page)
  }

  const resetForm = () => {
    editingCouponId.value = null
    form.code = ''
    form.name = ''
    form.description = ''
    form.type = 'percent'
    form.value = 10
    form.min_order_amount = 0
    form.max_discount_amount = ''
    form.usage_limit = ''
    form.usage_limit_per_customer = 1
    form.starts_at = ''
    form.ends_at = ''
    form.is_active = true
    formError.value = ''
  }

  const openCreateModal = () => {
    resetForm()
    modalOpen.value = true
  }

  const openEditModal = (coupon: AdminCoupon) => {
    editingCouponId.value = coupon.id
    form.code = coupon.code
    form.name = coupon.name
    form.description = coupon.description || ''
    form.type = coupon.type
    form.value = Number(coupon.value)
    form.min_order_amount = Number(coupon.min_order_amount || 0)
    form.max_discount_amount =
      coupon.max_discount_amount === null
        ? ''
        : Number(coupon.max_discount_amount)
    form.usage_limit =
      coupon.usage_limit === null ? '' : Number(coupon.usage_limit)
    form.usage_limit_per_customer =
      coupon.usage_limit_per_customer === null
        ? ''
        : Number(coupon.usage_limit_per_customer)
    form.starts_at = toDateTimeLocal(coupon.starts_at)
    form.ends_at = toDateTimeLocal(coupon.ends_at)
    form.is_active = coupon.is_active
    formError.value = ''
    modalOpen.value = true
  }

  const closeModal = () => {
    if (saving.value) return
    modalOpen.value = false
    resetForm()
  }

  const buildPayload = (): CouponPayload => ({
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim() || null,
    type: form.type,
    value: Number(form.value),
    min_order_amount: Number(form.min_order_amount || 0),
    max_discount_amount:
      form.max_discount_amount === ''
        ? null
        : Number(form.max_discount_amount),
    usage_limit:
      form.usage_limit === '' ? null : Number(form.usage_limit),
    usage_limit_per_customer:
      form.usage_limit_per_customer === ''
        ? null
        : Number(form.usage_limit_per_customer),
    starts_at: form.starts_at || null,
    ends_at: form.ends_at || null,
    is_active: form.is_active,
  })

  const saveCoupon = async () => {
    if (saving.value) return

    saving.value = true
    formError.value = ''

    try {
      const payload = buildPayload()

      if (editingCouponId.value) {
        await adminCouponApi.update(editingCouponId.value, payload)
      } else {
        await adminCouponApi.create(payload)
      }

      modalOpen.value = false
      resetForm()
      await loadCoupons(1)
    } catch (error) {
      formError.value = getErrorMessage(error)
    } finally {
      saving.value = false
    }
  }

  const toggleCoupon = async (coupon: AdminCoupon) => {
    if (saving.value) return

    saving.value = true

    try {
      await adminCouponApi.update(coupon.id, {
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        min_order_amount: Number(coupon.min_order_amount || 0),
        max_discount_amount: coupon.max_discount_amount,
        usage_limit: coupon.usage_limit,
        usage_limit_per_customer: coupon.usage_limit_per_customer,
        starts_at: coupon.starts_at,
        ends_at: coupon.ends_at,
        is_active: !coupon.is_active,
      })

      await loadCoupons(pagination.current_page)
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      saving.value = false
    }
  }

  const deleteCoupon = async (coupon: AdminCoupon) => {
    if (deleting.value) return

    if (
      !window.confirm(
        `Xoá mã “${coupon.code}”?\n\nNếu mã đã từng được sử dụng, hệ thống sẽ không cho xoá.`,
      )
    ) {
      return
    }

    deleting.value = true

    try {
      await adminCouponApi.remove(coupon.id)
      await loadCoupons(
        coupons.value.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page,
      )
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      deleting.value = false
    }
  }

  onMounted(() => {
    loadCoupons(1)
  })

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer)
  })

  return {
    coupons,
    loading,
    saving,
    deleting,
    errorMessage,
    formError,
    modalOpen,
    search,
    typeFilter,
    statusFilter,
    pagination,
    form,
    isEditing,
    modalTitle,
    formatMoney,
    formatDiscount,
    formatDateTime,
    runtimeLabel,
    loadCoupons,
    handleSearch,
    applyFilters,
    resetFilters,
    goToPage,
    openCreateModal,
    openEditModal,
    closeModal,
    saveCoupon,
    toggleCoupon,
    deleteCoupon,
  }
}
