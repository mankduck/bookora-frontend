import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminDashboardApi, type DashboardData } from '@/services/adminDashboard.api'

export function useDashboardView() {
  const auth = useAuthStore()
  const router = useRouter()
  const loading = ref(true)
  const error = ref('')
  const data = ref<DashboardData>({
    stats: { today_bookings: 0, pending_bookings: 0, customers: 0, today_revenue: 0 },
    today_status: { confirmed: 0, in_progress: 0, completed: 0, cancelled: 0 },
    recent_bookings: [],
  })

  const formatMoney = (value: number | string) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0))
  const formatTime = (value: string) => value?.substring(11, 16) || '—'
  const formatDate = (value: string) => value ? new Intl.DateTimeFormat('vi-VN').format(new Date(value.replace(' ', 'T'))) : '—'
  const statusLabel = (status: string) => ({ pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', in_progress: 'Đang thực hiện', completed: 'Hoàn thành', cancelled: 'Đã huỷ', no_show: 'Không đến' } as Record<string, string>)[status] || status

  const load = async () => {
    loading.value = true; error.value = ''
    try { data.value = await adminDashboardApi.get() } catch (e: any) { error.value = e?.response?.data?.message || 'Không thể tải dashboard.' } finally { loading.value = false }
  }
  const openBooking = (id: number) => router.push(`/admin/bookings?booking=${id}`)
  const goBookings = () => router.push('/admin/bookings')

  onMounted(load)

  return { auth, loading, error, data, formatMoney, formatTime, formatDate, statusLabel, openBooking, goBookings, load }
}
