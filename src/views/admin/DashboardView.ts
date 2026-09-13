import { useAuthStore } from '@/stores/auth'

export function useDashboardView() {
  const auth = useAuthStore()

  return {
    auth,
  };
}
