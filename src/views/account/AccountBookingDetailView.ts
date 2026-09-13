import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
  useRoute,
} from 'vue-router'
import axios from 'axios'
import customerBookingApi, {
  type CustomerBooking,
  type PaymentProof,
  type PaymentSummary,
} from '@/services/customerBooking.api'

export function useAccountBookingDetailView() {
  const route = useRoute()

  const booking =
    ref<CustomerBooking | null>(null)

  const loading = ref(false)

  const errorMessage = ref('')

  const uploading = ref(false)

  const deleting = ref(false)

  const proofMessage = ref('')

  const proofMessageType = ref<'success' | 'error' | ''>('')

  const previewUrl = ref('')

  const proofNote = ref('')

  const selectedFile =
    ref<File | null>(null)

  const fileInput =
    ref<HTMLInputElement | null>(null)

  const emptySummary:
    PaymentSummary = {
      total_amount: 0,
      deposit_amount: 0,
      approved_amount: 0,
      deposit_remaining: 0,
      remaining_amount: 0,
      deposit_status:
        'not_required',
      has_pending_proof: false,
      latest_proof_status: null,
    }

  const paymentSummary = computed(
    () =>
      booking.value
        ?.payment_summary ||
      emptySummary,
  )

  const depositStatus = computed(
    () =>
      paymentSummary.value
        .deposit_status,
  )

  const depositLabel = computed(() => {
    const labels:
      Record<string, string> = {
        not_required:
          'Không cần cọc',
        unpaid:
          'Chưa cọc',
        pending_review:
          'Chờ kiểm tra',
        partially_paid:
          'Cọc chưa đủ',
        paid:
          'Đã cọc',
      }
  
    return (
      labels[depositStatus.value] ||
      depositStatus.value
    )
  })

  const latestProof = computed<
    PaymentProof | null
  >(() => {
    return (
      booking.value
        ?.payment_proofs?.[0] ||
      null
    )
  })

  const showDepositArea = computed(
    () =>
      paymentSummary.value
        .deposit_amount > 0 &&
      paymentSummary.value
        .deposit_remaining > 0,
  )

  const primaryStaffName =
    computed(() => {
      const assignments =
        booking.value
          ?.staff_assignments || []
  
      const primary =
        assignments.find(
          (item) =>
            item.is_primary,
        ) ||
        assignments[0]
  
      return (
        primary?.staff?.user?.name ||
        'Chưa phân công'
      )
    })

  const loadBooking = async () => {
    loading.value = true
    errorMessage.value = ''
  
    try {
      booking.value =
        await customerBookingApi
          .getOne(
            Number(
              route.params.id,
            ),
          )
    } catch (error) {
      errorMessage.value =
        getErrorMessage(
          error,
          'Không thể tải booking.',
        )
    } finally {
      loading.value = false
    }
  }

  const chooseFile = () => {
    fileInput.value?.click()
  }

  const clearPreview = () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }

  const handleFileChange = (
    event: Event,
  ) => {
    proofMessage.value = ''
    proofMessageType.value = ''
    clearPreview()
  
    const target =
      event.target as
        HTMLInputElement
  
    const file =
      target.files?.[0] ||
      null
  
    if (!file) {
      selectedFile.value = null
      return
    }
  
    if (
      ![
        'image/jpeg',
        'image/png',
        'image/webp',
      ].includes(file.type)
    ) {
      proofMessage.value =
        'Chỉ hỗ trợ JPG, PNG hoặc WEBP.'
      proofMessageType.value = 'error'
  
      selectedFile.value = null
      target.value = ''
      return
    }
  
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      proofMessage.value =
        'Ảnh tối đa 5MB.'
      proofMessageType.value = 'error'
  
      selectedFile.value = null
      target.value = ''
      return
    }
  
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }

  const uploadProof = async () => {
    if (
      !booking.value ||
      !selectedFile.value ||
      uploading.value
    ) {
      return
    }
  
    uploading.value = true
    proofMessage.value = ''
    proofMessageType.value = ''
  
    try {
      const bookingId = booking.value.id

      await customerBookingApi
        .uploadPaymentProof(
          bookingId,
          selectedFile.value,
          proofNote.value,
        )

      await loadBooking()

      clearPreview()
      selectedFile.value = null
      proofNote.value = ''
  
      if (fileInput.value) {
        fileInput.value.value = ''
      }
  
      proofMessage.value =
        'Đã tải ảnh thành công. Admin sẽ kiểm tra giao dịch.'
      proofMessageType.value = 'success'
    } catch (error) {
      proofMessage.value =
        getErrorMessage(
          error,
          'Không thể tải ảnh.',
        )
      proofMessageType.value = 'error'
    } finally {
      uploading.value = false
    }
  }

  const deleteProof = async () => {
    if (
      !booking.value ||
      !latestProof.value ||
      deleting.value
    ) {
      return
    }
  
    if (
      !window.confirm(
        'Xoá ảnh chuyển khoản này?',
      )
    ) {
      return
    }
  
    deleting.value = true
    proofMessage.value = ''
    proofMessageType.value = ''
  
    try {
      booking.value =
        await customerBookingApi
          .deletePaymentProof(
            booking.value.id,
            latestProof.value.id,
          )
  
      proofMessage.value =
        'Đã xoá ảnh chuyển khoản.'
      proofMessageType.value = 'success'
    } catch (error) {
      proofMessage.value =
        getErrorMessage(
          error,
          'Không thể xoá ảnh.',
        )
      proofMessageType.value = 'error'
    } finally {
      deleting.value = false
    }
  }

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ) => {
    if (
      axios.isAxiosError(error)
    ) {
      return (
        error.response?.data
          ?.message ||
        fallback
      )
    }
  
    return fallback
  }

  const parseDate = (
    value: string,
  ) =>
    new Date(
      value.replace(' ', 'T'),
    )

  const formatDate = (
    value: string,
  ) =>
    new Intl.DateTimeFormat(
      'vi-VN',
      {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(
      parseDate(value),
    )

  const formatTime = (
    value: string,
  ) =>
    value.substring(11, 16)

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

  const formatFileSize = (
    value: number,
  ) => {
    if (value < 1024 * 1024) {
      return `${Math.ceil(
        value / 1024,
      )} KB`
    }
  
    return `${
      (
        value /
        1024 /
        1024
      ).toFixed(1)
    } MB`
  }

  const statusLabel = (
    value: string,
  ) => {
    const labels:
      Record<string, string> = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        in_progress:
          'Đang thực hiện',
        completed: 'Hoàn thành',
        cancelled: 'Đã huỷ',
        no_show: 'Không đến',
      }
  
    return labels[value] || value
  }

  const proofStatusLabel = (
    value: string,
  ) => {
    const labels:
      Record<string, string> = {
        pending:
          'Đang chờ kiểm tra',
        approved:
          'Đã xác nhận',
        rejected:
          'Chưa được chấp nhận',
      }
  
    return labels[value] || value
  }

  onMounted(loadBooking)
  onBeforeUnmount(clearPreview)

  return {
    ref,
    RouterLink,
    booking,
    loading,
    errorMessage,
    uploading,
    deleting,
    proofMessage,
    proofMessageType,
    previewUrl,
    proofNote,
    selectedFile,
    fileInput,
    paymentSummary,
    depositStatus,
    depositLabel,
    latestProof,
    showDepositArea,
    primaryStaffName,
    chooseFile,
    handleFileChange,
    uploadProof,
    deleteProof,
    formatDate,
    formatTime,
    formatMoney,
    formatFileSize,
    statusLabel,
    proofStatusLabel,
  };
}
