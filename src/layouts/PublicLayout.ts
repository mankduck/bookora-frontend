import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import {
  RouterLink,
  RouterView,
  useRoute,
  useRouter,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function usePublicLayout() {
  const auth = useAuthStore()

  const route = useRoute()

  const router = useRouter()

  const menuOpen = ref(false)

  const userInitial = computed(
    () =>
      auth.user?.name
        ?.trim()
        .charAt(0)
        .toUpperCase() || 'U',
  )

  const loginLink = computed(() => ({
    name: 'login',
    query:
      route.path === '/'
        ? undefined
        : {
            redirect: route.fullPath,
          },
  }))

  const closeMenu = () => {
    menuOpen.value = false
  }

  const handleDocumentClick = () => {
    closeMenu()
  }

  const handleLogout = async () => {
    closeMenu()
  
    await auth.logout()
  
    await router.push('/')
  }

  onMounted(async () => {
    document.addEventListener(
      'click',
      handleDocumentClick,
    )
  
    /*
     * Trang public không có requiresAuth nên router guard
     * không nhất thiết gọi /auth/me khi refresh trình duyệt.
     * PublicLayout chủ động khôi phục session để header
     * luôn hiện đúng tài khoản sau khi đăng nhập.
     */
    if (!auth.initialized) {
      try {
        await auth.fetchMe()
      } catch {
        // Chưa đăng nhập: giữ giao diện guest.
      }
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener(
      'click',
      handleDocumentClick,
    )
  })

  return {
    ref,
    RouterLink,
    RouterView,
    auth,
    menuOpen,
    userInitial,
    loginLink,
    closeMenu,
    handleLogout,
  };
}
