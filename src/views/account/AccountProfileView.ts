import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'
import axios from 'axios'
import accountApi from '@/services/account.api'
import { useAuthStore } from '@/stores/auth'

export function useAccountProfileView() {
  const auth = useAuthStore()

  const loading = ref(false)

  const saving = ref(false)

  const message = ref('')

  const hasError = ref(false)

  const form = reactive({
    name: '',
    phone: '',
    email: '',
  })

  const initial = computed(
    () =>
      form.name
        .trim()
        .charAt(0)
        .toUpperCase() || 'U',
  )

  const fillForm = (
    user: {
      name: string
      phone: string | null
      email: string | null
    },
  ) => {
    form.name = user.name || ''
    form.phone = user.phone || ''
    form.email = user.email || ''
  }

  const loadProfile = async () => {
    loading.value = true
  
    try {
      const user =
        await accountApi
          .getProfile()
  
      fillForm(user)
    } finally {
      loading.value = false
    }
  }

  const saveProfile = async () => {
    saving.value = true
    message.value = ''
    hasError.value = false
  
    try {
      const user =
        await accountApi
          .updateProfile({
            name: form.name,
            phone: form.phone,
            email:
              form.email || null,
          })
  
      fillForm(user)
  
      /*
       * Refresh Pinia để header đổi tên/email
       * ngay lập tức sau khi lưu.
       */
      await auth.fetchMe()
  
      message.value =
        'Đã cập nhật thông tin.'
    } catch (error) {
      hasError.value = true
  
      if (
        axios.isAxiosError(error)
      ) {
        const errors =
          error.response?.data
            ?.errors
  
        const firstError =
          errors
            ? Object.values(errors)
                .flat()
                .at(0)
            : null
  
        message.value =
          String(
            firstError ||
            error.response?.data
              ?.message ||
            'Không thể cập nhật thông tin.',
          )
      } else {
        message.value =
          'Có lỗi xảy ra.'
      }
    } finally {
      saving.value = false
    }
  }

  onMounted(
    loadProfile,
  )

  return {
    loading,
    saving,
    message,
    hasError,
    form,
    initial,
    saveProfile,
  };
}
