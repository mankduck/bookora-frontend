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
        <span>TẠO TÀI KHOẢN</span>

        <h1>
          Bắt đầu đặt lịch.
        </h1>

        <p>
          Tài khoản giúp bạn quản lý lịch hẹn,
          thanh toán và thay đổi lịch sau này.
        </p>
      </div>

      <form
        class="auth-form"
        @submit.prevent="submit"
      >
        <label>
          <span>Họ và tên</span>

          <input
            v-model.trim="form.name"
            type="text"
            maxlength="150"
            autocomplete="name"
            required
          />
        </label>

        <div class="two-columns">
          <label>
            <span>Số điện thoại</span>

            <input
              v-model.trim="form.phone"
              type="tel"
              maxlength="20"
              autocomplete="tel"
              required
            />
          </label>

          <label>
            <span>Email</span>

            <input
              v-model.trim="form.email"
              type="email"
              maxlength="190"
              autocomplete="email"
            />
          </label>
        </div>

        <label>
          <span>Mật khẩu</span>

          <input
            v-model="form.password"
            type="password"
            minlength="8"
            autocomplete="new-password"
            required
          />
        </label>

        <label>
          <span>Nhập lại mật khẩu</span>

          <input
            v-model="
              form.password_confirmation
            "
            type="password"
            minlength="8"
            autocomplete="new-password"
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
              ? 'Đang tạo tài khoản...'
              : 'Tạo tài khoản'
          }}
        </button>
      </form>

      <div class="auth-footer">
        <span>
          Đã có tài khoản?
        </span>

        <RouterLink
          :to="loginLink"
        >
          Đăng nhập
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRegisterView } from './RegisterView.ts'

const {
  RouterLink,
  auth,
  submitting,
  errorMessage,
  form,
  loginLink,
  submit,
} = useRegisterView()
</script>

<style scoped src="./RegisterView.css"></style>
