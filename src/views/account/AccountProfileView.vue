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
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'

import axios from 'axios'

import accountApi from '@/services/account.api'
import { useAuthStore } from '@/stores/auth'

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
</script>

<style scoped>
.account-page {
  min-height:
    calc(100vh - 78px);
  padding: 62px 0 100px;
  background: #f4f4f1;
}

.account-container {
  width:
    min(
      760px,
      calc(100% - 40px)
    );
  margin: 0 auto;
}

.page-heading {
  margin-bottom: 26px;
}

.eyebrow {
  color: #94978f;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.7px;
}

.page-heading h1 {
  margin: 8px 0 7px;
  font-size: 34px;
  letter-spacing: -1.4px;
}

.page-heading p {
  margin: 0;
  color: #8b8e86;
  font-size: 11px;
}

.profile-card {
  padding: 25px;
  border: 1px solid #e1e2dc;
  border-radius: 17px;
  background: #fff;
}

.profile-intro {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ecece8;
}

.avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #181916;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
}

.profile-intro > div:last-child {
  display: grid;
  gap: 3px;
}

.profile-intro strong {
  font-size: 12px;
}

.profile-intro span {
  color: #999c94;
  font-size: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 7px;
}

.field.full {
  grid-column: 1 / -1;
}

.field span {
  color: #686c63;
  font-size: 9px;
  font-weight: 650;
}

.field input {
  height: 45px;
  padding: 0 12px;
  border: 1px solid #dfe0da;
  border-radius: 10px;
  outline: none;
  background: #fafaf8;
  font: inherit;
  font-size: 10px;
}

.field input:focus {
  border-color: #181916;
  background: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.form-actions button {
  height: 42px;
  padding: 0 17px;
  border: 0;
  border-radius: 10px;
  background: #181916;
  color: #fff;
  font: inherit;
  font-size: 9px;
  font-weight: 750;
}

.form-actions button:disabled {
  opacity: 0.6;
}

.message {
  margin-top: 15px;
  padding: 11px 12px;
  border-radius: 9px;
  background: #ebf4ec;
  color: #52715a;
  font-size: 9px;
}

.message.error {
  background: #f9eaea;
  color: #9a5050;
}

.state {
  min-height: 260px;
  display: grid;
  place-content: center;
  border: 1px solid #e1e2dc;
  border-radius: 17px;
  background: #fff;
  color: #8f928a;
  font-size: 10px;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.full {
    grid-column: auto;
  }
}
</style>
