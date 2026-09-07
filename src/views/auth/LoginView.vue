<template>
  <main class="auth-page">
    <section class="auth-card">
      <RouterLink
        to="/"
        class="brand"
      >
        <span class="brand-mark">B</span>

        <div>
          <strong>Bookora</strong>
          <span>Booking Platform</span>
        </div>
      </RouterLink>

      <div class="auth-heading">
        <span>ĐĂNG NHẬP</span>

        <h1>
          Chào mừng bạn quay lại.
        </h1>

        <p>
          Đăng nhập để đặt lịch và quản lý
          các lịch hẹn của bạn.
        </p>
      </div>

      <form
        class="auth-form"
        @submit.prevent="submit"
      >
        <label>
          <span>Email hoặc số điện thoại</span>

          <input
            v-model.trim="form.login"
            type="text"
            autocomplete="username"
            placeholder="email@example.com"
            required
          />
        </label>

        <label>
          <span>Mật khẩu</span>

          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>

        <div
          v-if="errorMessage"
          class="auth-error"
        >
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="submitting"
        >
          {{
            submitting
              ? 'Đang đăng nhập...'
              : 'Đăng nhập'
          }}
        </button>
      </form>

      <div class="auth-footer">
        <span>
          Chưa có tài khoản?
        </span>

        <RouterLink
          :to="registerLink"
        >
          Tạo tài khoản
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 18px;
  background:
    radial-gradient(
      circle at top left,
      #f1f1ec,
      transparent 34%
    ),
    #f8f8f5;
}

.auth-card {
  width: min(100%, 460px);
  padding: 38px;
  border: 1px solid #e3e4df;
  border-radius: 20px;
  background: #fff;
  box-shadow:
    0 24px 70px
    rgba(27, 28, 24, 0.08);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: #181916;
  text-decoration: none;
}

.brand-mark {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #181916;
  color: #fff;
  font-weight: 800;
}

.brand > div {
  display: grid;
  gap: 1px;
}

.brand strong {
  font-size: 15px;
}

.brand div span {
  color: #999c94;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.auth-heading {
  margin: 34px 0 26px;
}

.auth-heading > span {
  color: #8e9189;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1px;
}

.auth-heading h1 {
  margin: 7px 0 9px;
  color: #181916;
  font-size: 30px;
  letter-spacing: -1px;
}

.auth-heading p {
  margin: 0;
  color: #8f928a;
  font-size: 12px;
  line-height: 1.6;
}

.auth-form {
  display: grid;
  gap: 16px;
}

.auth-form label {
  display: grid;
  gap: 7px;
}

.auth-form label span {
  color: #676b62;
  font-size: 10px;
  font-weight: 650;
}

.auth-form input {
  width: 100%;
  height: 46px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px solid #dedfd9;
  border-radius: 10px;
  outline: none;
  background: #fafaf8;
  color: #181916;
  font: inherit;
  font-size: 12px;
}

.auth-form input:focus {
  border-color: #181916;
  background: #fff;
}

.auth-error {
  padding: 11px 12px;
  border-radius: 9px;
  background: #fff0f0;
  color: #bd3838;
  font-size: 10px;
  line-height: 1.5;
}

.submit-button {
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #181916;
  color: #fff;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.auth-footer {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 22px;
  color: #979a92;
  font-size: 10px;
}

.auth-footer a {
  color: #181916;
  font-weight: 750;
}
</style>
