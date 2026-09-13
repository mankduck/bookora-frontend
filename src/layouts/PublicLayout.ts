import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSiteStore } from '@/stores/site'

export function usePublicLayout() {
  const auth = useAuthStore()
  const site = useSiteStore()
  const route = useRoute()
  const router = useRouter()
  const menuOpen = ref(false)

  const userInitial = computed(() => auth.user?.name?.trim().charAt(0).toUpperCase() || 'U')
  const loginLink = computed(() => ({ name: 'login', query: route.path === '/' ? undefined : { redirect: route.fullPath } }))
  const navigationModules = computed(() => site.modules.filter((m) => m.show_in_nav && m.is_enabled))
  const siteName = computed(() => site.settings?.site_name || 'Bookora')
  const closeMenu = () => { menuOpen.value = false }
  const handleDocumentClick = () => closeMenu()
  const handleLogout = async () => { closeMenu(); await auth.logout(); await router.push('/') }

  onMounted(async () => {
    document.addEventListener('click', handleDocumentClick)
    site.load()
    if (!auth.initialized) {
      try { await auth.fetchMe() } catch { /* guest */ }
    }
  })
  onBeforeUnmount(() => document.removeEventListener('click', handleDocumentClick))

  return { RouterLink, RouterView, auth, site, menuOpen, userInitial, loginLink, navigationModules, siteName, closeMenu, handleLogout }
}
