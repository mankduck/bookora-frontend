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
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export function useRegisterView() {
  const auth = useAuthStore()

  const route = useRoute()

  const router = useRouter()

  const submitting = ref(false)

  const errorMessage = ref('')

  const form = reactive({
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const redirectPath = computed(() => {
    const value = route.query.redirect
  
    if (
      typeof value === 'string' &&
      value.startsWith('/')
    ) {
      return value
    }
  
    return '/booking'
  })

  const loginLink = computed(() => ({
    name: 'login',
    query: {
      redirect: redirectPath.value,
    },
  }))

  const getValidationMessage = (
    data: any,
  ) => {
    const errors = data?.errors
  
    if (!errors) {
      return (
        data?.message ||
        'Không thể tạo tài khoản.'
      )
    }
  
    const firstKey =
      Object.keys(errors)[0]
  
    const firstError =
      errors[firstKey]?.[0]
  
    return (
      firstError ||
      data?.message ||
      'Thông tin chưa hợp lệ.'
    )
  }

  const submit = async () => {
    if (submitting.value) {
      return
    }
  
    if (
      form.password !==
      form.password_confirmation
    ) {
      errorMessage.value =
        'Mật khẩu nhập lại chưa khớp.'
  
      return
    }
  
    submitting.value = true
    errorMessage.value = ''
  
    try {
      await api.get(
        '/sanctum/csrf-cookie',
      )
  
      await api.post(
        '/api/v1/auth/register',
        {
          name: form.name,
          phone: form.phone,
          email:
            form.email || null,
          password: form.password,
          password_confirmation:
            form.password_confirmation,
        },
      )
  
      await auth.fetchMe()
  
      await router.replace(
        redirectPath.value,
      )
    } catch (error) {
      if (axios.isAxiosError(error)) {
        errorMessage.value =
          getValidationMessage(
            error.response?.data,
          )
      } else {
        errorMessage.value =
          'Không thể tạo tài khoản. Vui lòng thử lại.'
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
    loginLink,
    submit,
  };
}
