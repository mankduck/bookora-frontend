<template>
  <section class="account-page">
    <div class="account-container">
      <div class="page-heading">
        <span class="eyebrow">
          TÀI KHOẢN
        </span>

        <h1>
          Thông tin cá nhân
        </h1>

        <p>
          Thông tin này sẽ được dùng làm
          mặc định khi bạn đặt lịch.
        </p>
      </div>

      <div
        v-if="loading"
        class="state"
      >
        Đang tải thông tin...
      </div>

      <form
        v-else
        class="profile-card"
        @submit.prevent="saveProfile"
      >
        <div class="profile-intro">
          <div class="avatar">
            {{ initial }}
          </div>

          <div>
            <strong>
              {{ form.name || 'Khách hàng' }}
            </strong>

            <span>
              Tài khoản Bookora
            </span>
          </div>
        </div>

        <div class="form-grid">
          <label class="field full">
            <span>Họ và tên *</span>

            <input
              v-model.trim="form.name"
              type="text"
              maxlength="150"
              required
            />
          </label>

          <label class="field">
            <span>Số điện thoại *</span>

            <input
              v-model.trim="form.phone"
              type="tel"
              maxlength="20"
              required
            />
          </label>

          <label class="field">
            <span>Email</span>

            <input
              v-model.trim="form.email"
              type="email"
              maxlength="190"
            />
          </label>
        </div>

        <div
          v-if="message"
          class="message"
          :class="{
            error: hasError,
          }"
        >
          {{ message }}
        </div>

        <div class="form-actions">
          <button
            type="submit"
            :disabled="saving"
          >
            {{
              saving
                ? 'Đang lưu...'
                : 'Lưu thay đổi'
            }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAccountProfileView } from './AccountProfileView.ts'

const {
  loading,
  saving,
  message,
  hasError,
  form,
  initial,
  saveProfile,
} = useAccountProfileView()
</script>

<style scoped src="./AccountProfileView.css"></style>
