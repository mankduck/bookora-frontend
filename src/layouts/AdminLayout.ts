import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'

export function useAdminLayout() {
  const auth = useAuthStore()
  const site = useSiteStore()
  const route = useRoute()
  const userInitial = computed(() => auth.user?.name?.charAt(0).toUpperCase() ?? 'A')
  const siteName = computed(() => site.settings?.site_name || 'Bookora')
  const english = computed(() => site.settings?.admin_language === 'en')

  const viTitles: Record<string, string> = {
    'admin-dashboard':'Dashboard','admin-service-categories':'Danh mục dịch vụ','admin-services':'Dịch vụ & Gói','admin-staff':'Nhân viên','admin-customers':'Khách hàng','admin-coupons':'Mã giảm giá','admin-bookings':'Lịch đặt','admin-posts':'Bài viết','admin-reviews':'Đánh giá Photo','admin-settings':'Cài đặt','admin-homepage':'Bố cục trang chủ',
  }
  const enTitles: Record<string, string> = {
    'admin-dashboard':'Dashboard','admin-service-categories':'Service categories','admin-services':'Services & Packages','admin-staff':'Staff','admin-customers':'Customers','admin-coupons':'Coupons','admin-bookings':'Bookings','admin-posts':'Posts','admin-reviews':'Photo Reviews','admin-settings':'Settings','admin-homepage':'Homepage Layout',
  }
  const pageTitle = computed(() => (english.value ? enTitles : viTitles)[String(route.name)] || siteName.value)
  onMounted(async () => { await site.load(); document.documentElement.lang = english.value ? 'en' : 'vi' })
  return { RouterLink, RouterView, auth, site, english, siteName, userInitial, pageTitle }
}
