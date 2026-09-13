import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
} from 'vue-router'
import axios from 'axios'
import customerBookingApi, {
  type CustomerBooking,
} from '@/services/customerBooking.api'

export function useAccountBookingsView() {
  const bookings =
    ref<CustomerBooking[]>([])

  const loading = ref(false)

  const errorMessage = ref('')

  const activeTab =
    ref('upcoming')

  const tabs = [
    {
      label: 'Sắp tới',
      value: 'upcoming',
    },
    {
      label: 'Chờ xác nhận',
      value: 'pending',
    },
    {
      label: 'Đã hoàn thành',
      value: 'completed',
    },
    {
      label: 'Đã huỷ',
      value: 'cancelled',
    },
    {
      label: 'Tất cả',
      value: 'all',
    },
  ]

  const filteredBookings =
    computed(() => {
      if (
        activeTab.value === 'all'
      ) {
        return bookings.value
      }
  
      if (
        activeTab.value === 'upcoming'
      ) {
        return bookings.value.filter(
          (booking) =>
            [
              'confirmed',
              'in_progress',
            ].includes(
              booking.status,
            ),
        )
      }
  
      return bookings.value.filter(
        (booking) =>
          booking.status ===
          activeTab.value,
      )
    })

  const loadBookings = async () => {
    loading.value = true
    errorMessage.value = ''
  
    try {
      const result =
        await customerBookingApi
          .getAll({
            per_page: 50,
          })
  
      bookings.value =
        result.data
    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        errorMessage.value =
          error.response?.data
            ?.message ||
          'Không thể tải lịch hẹn.'
      } else {
        errorMessage.value =
          'Có lỗi xảy ra.'
      }
    } finally {
      loading.value = false
    }
  }

  const parseDate = (
    value: string,
  ) =>
    new Date(
      value.replace(' ', 'T'),
    )

  const formatDay = (
    value: string,
  ) =>
    String(
      parseDate(value)
        .getDate(),
    ).padStart(2, '0')

  const formatMonth = (
    value: string,
  ) =>
    `TH${String(
      parseDate(value)
        .getMonth() + 1,
    ).padStart(2, '0')}`

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

  const paymentLabel = (
    value: string,
  ) => {
    const labels:
      Record<string, string> = {
        unpaid: 'Chưa thanh toán',
        partially_paid:
          'Đã thanh toán một phần',
        paid: 'Đã thanh toán',
        refunded: 'Đã hoàn tiền',
      }
  
    return labels[value] || value
  }

  onMounted(
    loadBookings,
  )

  return {
    RouterLink,
    bookings,
    loading,
    errorMessage,
    activeTab,
    tabs,
    filteredBookings,
    formatDay,
    formatMonth,
    formatTime,
    formatMoney,
    statusLabel,
    paymentLabel,
  };
}
