import {
  computed,
  reactive,
  ref,
} from 'vue'
import {
  RouterLink,
  useRoute,
  useRouter,
} from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export function useLoginView() {
  const auth = useAuthStore()

  const route = useRoute()

  const router = useRouter()

  const submitting = ref(false)

  const errorMessage = ref('')

  const form = reactive({
    login: '',
    password: '',
  })

  const redirectPath = computed(() => {
    const value =
      route.query.redirect
  
    if (
      typeof value === 'string' &&
      value.startsWith('/')
    ) {
      return value
    }
  
    return ''
  })

  const registerLink = computed(() => {
    if (!redirectPath.value) {
      return {
        name: 'register',
      }
    }
  
    return {
      name: 'register',
      query: {
        redirect:
          redirectPath.value,
      },
    }
  })

  const userHasRole = (
    roleCode: string,
  ) => {
    return Boolean(
      auth.user?.roles?.some(
        (role) =>
          role.code === roleCode,
      ),
    )
  }

  const roleHome = () => {
    if (
      userHasRole('admin')
    ) {
      return '/admin/dashboard'
    }
  
    return '/'
  }

  const submit = async () => {
    if (submitting.value) {
      return
    }
  
    submitting.value = true
    errorMessage.value = ''
  
    try {
      await auth.login({
        login: form.login,
        password: form.password,
      })
  
      if (
        redirectPath.value &&
        userHasRole('customer')
      ) {
        await router.replace(
          redirectPath.value,
        )
  
        return
      }
  
      await router.replace(
        roleHome(),
      )
    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        errorMessage.value =
          error.response?.data
            ?.message ||
          'Thông tin đăng nhập không chính xác.'
      } else {
        errorMessage.value =
          'Không thể đăng nhập. Vui lòng thử lại.'
      }
    } finally {
      submitting.value = false
    }
  }

  return {
    RouterLink,
    auth,
    submitting,
    errorMessage,
    form,
    registerLink,
    submit,
  };
}
