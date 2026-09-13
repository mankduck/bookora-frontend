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
import { useLoginView } from './LoginView.ts'

const {
  RouterLink,
  auth,
  submitting,
  errorMessage,
  form,
  registerLink,
  submit,
} = useLoginView()
</script>

<style scoped src="./LoginView.css"></style>
