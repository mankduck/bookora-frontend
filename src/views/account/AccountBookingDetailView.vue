<template>
  <section class="account-page">
    <div class="account-container">
      <RouterLink
        to="/account/bookings"
        class="back-link"
      >
        ← Quay lại lịch hẹn
      </RouterLink>

      <div
        v-if="loading"
        class="state"
      >
        Đang tải chi tiết...
      </div>

      <div
        v-else-if="errorMessage"
        class="state error"
      >
        {{ errorMessage }}
      </div>

      <template v-else-if="booking">
        <div class="detail-heading">
          <div>
            <span class="eyebrow">
              {{ booking.booking_code }}
            </span>

            <h1>
              {{
                booking.items[0]
                  ?.service_name ||
                'Chi tiết lịch hẹn'
              }}
            </h1>

            <p>
              {{
                booking.items[0]
                  ?.variant_name ||
                'Không có gói'
              }}
            </p>
          </div>

          <div class="heading-badges">
            <span
              class="status-badge"
              :class="
                `status-${booking.status}`
              "
            >
              {{
                statusLabel(
                  booking.status,
                )
              }}
            </span>

            <span
              class="deposit-badge"
              :class="
                `deposit-${depositStatus}`
              "
            >
              {{ depositLabel }}
            </span>
          </div>
        </div>

        <div class="detail-grid">
          <section class="detail-card">
            <h2>Thông tin lịch hẹn</h2>

            <div class="info-list">
              <div>
                <span>Ngày</span>
                <strong>
                  {{
                    formatDate(
                      booking.start_at,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Thời gian</span>
                <strong>
                  {{
                    formatTime(
                      booking.start_at,
                    )
                  }}
                  –
                  {{
                    formatTime(
                      booking.end_at,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Thời lượng</span>
                <strong>
                  {{
                    booking.items[0]
                      ?.duration_minutes ||
                    0
                  }}
                  phút
                </strong>
              </div>

              <div>
                <span>Nhân viên</span>
                <strong>
                  {{ primaryStaffName }}
                </strong>
              </div>
            </div>
          </section>

          <section class="detail-card payment-card">
            <div class="card-title-row">
              <h2>Thanh toán</h2>

              <span
                class="deposit-badge"
                :class="
                  `deposit-${depositStatus}`
                "
              >
                {{ depositLabel }}
              </span>
            </div>

            <div class="info-list">
              <div>
                <span>Tổng giá dịch vụ</span>
                <strong>
                  {{
                    formatMoney(
                      paymentSummary
                        .total_amount,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Cọc yêu cầu</span>
                <strong>
                  {{
                    formatMoney(
                      paymentSummary
                        .deposit_amount,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Đã xác nhận</span>
                <strong class="paid-money">
                  {{
                    formatMoney(
                      paymentSummary
                        .approved_amount,
                    )
                  }}
                </strong>
              </div>

              <div class="total-line">
                <span>Còn thanh toán</span>
                <strong>
                  {{
                    formatMoney(
                      paymentSummary
                        .remaining_amount,
                    )
                  }}
                </strong>
              </div>
            </div>
          </section>

          <section
            v-if="showDepositArea"
            class="detail-card full transfer-card"
          >
            <div class="transfer-heading">
              <div>
                <span class="eyebrow">
                  THANH TOÁN TIỀN CỌC
                </span>

                <h2>
                  Còn thiếu
                  {{
                    formatMoney(
                      paymentSummary
                        .deposit_remaining,
                    )
                  }}
                  tiền cọc
                </h2>

                <p>
                  Chuyển khoản đúng số tiền
                  và nội dung bên dưới, sau đó
                  tải ảnh giao dịch lên để admin
                  kiểm tra.
                </p>
              </div>
            </div>

            <div class="transfer-layout">
              <div class="qr-box">
                <img
                  v-if="
                    booking.bank_transfer
                      ?.qr_url
                  "
                  :src="
                    booking.bank_transfer
                      .qr_url
                  "
                  alt="QR chuyển khoản"
                />

                <div
                  v-else
                  class="qr-empty"
                >
                  <strong>
                    Chưa cấu hình QR
                  </strong>

                  <span>
                    Admin cần cấu hình thông tin
                    ngân hàng trong backend.
                  </span>
                </div>
              </div>

              <div class="bank-info">
                <div>
                  <span>Ngân hàng</span>
                  <strong>
                    {{
                      booking.bank_transfer
                        ?.bank_name ||
                      'Chưa cấu hình'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Số tài khoản</span>
                  <strong>
                    {{
                      booking.bank_transfer
                        ?.account_number ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Chủ tài khoản</span>
                  <strong>
                    {{
                      booking.bank_transfer
                        ?.account_name ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Số tiền cần cọc</span>
                  <strong class="money-emphasis">
                    {{
                      formatMoney(
                        paymentSummary
                          .deposit_remaining,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Nội dung</span>
                  <strong>
                    {{
                      booking.bank_transfer
                        ?.transfer_content ||
                      booking.booking_code
                    }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="proof-area">
              <div class="proof-heading">
                <div>
                  <strong>
                    Ảnh chuyển khoản
                  </strong>

                  <span>
                    JPG, PNG hoặc WEBP · tối đa
                    5MB
                  </span>
                </div>
              </div>

              <div
                v-if="latestProof"
                class="proof-current"
              >
                <a
                  v-if="latestProof.image_url"
                  :href="latestProof.image_url"
                  target="_blank"
                  rel="noopener"
                  class="proof-image-link"
                >
                  <img
                    :src="
                      latestProof.image_url
                    "
                    alt="Ảnh chuyển khoản"
                  />
                </a>

                <div class="proof-copy">
                  <span
                    class="proof-status"
                    :class="
                      `proof-${latestProof.status}`
                    "
                  >
                    {{
                      proofStatusLabel(
                        latestProof.status,
                      )
                    }}
                  </span>

                  <p
                    v-if="
                      latestProof.status ===
                      'pending'
                    "
                  >
                    Admin chưa kiểm tra giao dịch.
                    Bạn vẫn có thể thay hoặc xoá
                    ảnh.
                  </p>

                  <p
                    v-else-if="
                      latestProof.status ===
                      'rejected'
                    "
                    class="rejected-copy"
                  >
                    {{
                      latestProof
                        .rejection_reason ||
                      'Ảnh chưa được chấp nhận.'
                    }}
                  </p>

                  <p v-else>
                    Giao dịch này đã được admin
                    xác nhận.
                  </p>
                </div>
              </div>

              <div
                v-if="
                  !latestProof ||
                  latestProof.status !==
                    'approved'
                "
                class="upload-box"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="file-input"
                  @change="handleFileChange"
                />

                <div
                  v-if="selectedFile"
                  class="selected-file"
                >
                  <strong>
                    {{ selectedFile.name }}
                  </strong>

                  <span>
                    {{
                      formatFileSize(
                        selectedFile.size,
                      )
                    }}
                  </span>
                </div>

                <textarea
                  v-model.trim="proofNote"
                  rows="3"
                  maxlength="1000"
                  placeholder="Ghi chú cho admin (không bắt buộc)"
                />

                <div class="proof-actions">
                  <button
                    type="button"
                    class="secondary-button"
                    @click="chooseFile"
                  >
                    {{
                      latestProof
                        ? 'Chọn ảnh khác'
                        : 'Chọn ảnh'
                    }}
                  </button>

                  <button
                    type="button"
                    class="primary-button"
                    :disabled="
                      !selectedFile ||
                      uploading
                    "
                    @click="uploadProof"
                  >
                    {{
                      uploading
                        ? 'Đang tải...'
                        : latestProof
                          ? 'Thay ảnh'
                          : 'Tải ảnh lên'
                    }}
                  </button>

                  <button
                    v-if="latestProof"
                    type="button"
                    class="danger-button"
                    :disabled="deleting"
                    @click="deleteProof"
                  >
                    {{
                      deleting
                        ? 'Đang xoá...'
                        : 'Xoá ảnh'
                    }}
                  </button>
                </div>
              </div>

              <div
                v-if="proofMessage"
                class="proof-message"
              >
                {{ proofMessage }}
              </div>
            </div>
          </section>

          <section
            v-else-if="
              paymentSummary
                .deposit_amount > 0
            "
            class="detail-card full paid-card"
          >
            <div class="paid-icon">✓</div>

            <div>
              <strong>
                Đã hoàn tất tiền cọc
              </strong>

              <p>
                Hệ thống đã xác nhận
                {{
                  formatMoney(
                    paymentSummary
                      .approved_amount,
                  )
                }}.
                Còn
                {{
                  formatMoney(
                    paymentSummary
                      .remaining_amount,
                  )
                }}
                cần thanh toán.
              </p>
            </div>
          </section>

          <section class="detail-card full">
            <h2>Thông tin liên hệ</h2>

            <div class="contact-grid">
              <div>
                <span>Họ tên</span>
                <strong>
                  {{ booking.customer_name }}
                </strong>
              </div>

              <div>
                <span>Số điện thoại</span>
                <strong>
                  {{ booking.customer_phone }}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {{
                    booking.customer_email ||
                    'Không có'
                  }}
                </strong>
              </div>
            </div>

            <div
              v-if="booking.customer_note"
              class="note-box"
            >
              <span>Ghi chú</span>
              <p>
                {{ booking.customer_note }}
              </p>
            </div>
          </section>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  RouterLink,
  useRoute,
} from 'vue-router'

import axios from 'axios'

import customerBookingApi, {
  type CustomerBooking,
  type PaymentProof,
  type PaymentSummary,
} from '@/services/customerBooking.api'

const route = useRoute()

const booking =
  ref<CustomerBooking | null>(null)

const loading = ref(false)
const errorMessage = ref('')
const uploading = ref(false)
const deleting = ref(false)
const proofMessage = ref('')
const proofNote = ref('')
const selectedFile =
  ref<File | null>(null)

const fileInput =
  ref<HTMLInputElement | null>(null)

const emptySummary:
  PaymentSummary = {
    total_amount: 0,
    deposit_amount: 0,
    approved_amount: 0,
    deposit_remaining: 0,
    remaining_amount: 0,
    deposit_status:
      'not_required',
    has_pending_proof: false,
    latest_proof_status: null,
  }

const paymentSummary = computed(
  () =>
    booking.value
      ?.payment_summary ||
    emptySummary,
)

const depositStatus = computed(
  () =>
    paymentSummary.value
      .deposit_status,
)

const depositLabel = computed(() => {
  const labels:
    Record<string, string> = {
      not_required:
        'Không cần cọc',
      unpaid:
        'Chưa cọc',
      pending_review:
        'Chờ kiểm tra',
      partially_paid:
        'Cọc chưa đủ',
      paid:
        'Đã cọc',
    }

  return (
    labels[depositStatus.value] ||
    depositStatus.value
  )
})

const latestProof = computed<
  PaymentProof | null
>(() => {
  return (
    booking.value
      ?.payment_proofs?.[0] ||
    null
  )
})

const showDepositArea = computed(
  () =>
    paymentSummary.value
      .deposit_amount > 0 &&
    paymentSummary.value
      .deposit_remaining > 0,
)

const primaryStaffName =
  computed(() => {
    const assignments =
      booking.value
        ?.staff_assignments || []

    const primary =
      assignments.find(
        (item) =>
          item.is_primary,
      ) ||
      assignments[0]

    return (
      primary?.staff?.user?.name ||
      'Chưa phân công'
    )
  })

const loadBooking = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    booking.value =
      await customerBookingApi
        .getOne(
          Number(
            route.params.id,
          ),
        )
  } catch (error) {
    errorMessage.value =
      getErrorMessage(
        error,
        'Không thể tải booking.',
      )
  } finally {
    loading.value = false
  }
}

const chooseFile = () => {
  fileInput.value?.click()
}

const handleFileChange = (
  event: Event,
) => {
  proofMessage.value = ''

  const target =
    event.target as
      HTMLInputElement

  const file =
    target.files?.[0] ||
    null

  if (!file) {
    selectedFile.value = null
    return
  }

  if (
    ![
      'image/jpeg',
      'image/png',
      'image/webp',
    ].includes(file.type)
  ) {
    proofMessage.value =
      'Chỉ hỗ trợ JPG, PNG hoặc WEBP.'

    selectedFile.value = null
    target.value = ''
    return
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    proofMessage.value =
      'Ảnh tối đa 5MB.'

    selectedFile.value = null
    target.value = ''
    return
  }

  selectedFile.value = file
}

const uploadProof = async () => {
  if (
    !booking.value ||
    !selectedFile.value ||
    uploading.value
  ) {
    return
  }

  uploading.value = true
  proofMessage.value = ''

  try {
    booking.value =
      await customerBookingApi
        .uploadPaymentProof(
          booking.value.id,
          selectedFile.value,
          proofNote.value,
        )

    selectedFile.value = null
    proofNote.value = ''

    if (fileInput.value) {
      fileInput.value.value = ''
    }

    proofMessage.value =
      'Đã tải ảnh. Admin sẽ kiểm tra giao dịch.'
  } catch (error) {
    proofMessage.value =
      getErrorMessage(
        error,
        'Không thể tải ảnh.',
      )
  } finally {
    uploading.value = false
  }
}

const deleteProof = async () => {
  if (
    !booking.value ||
    !latestProof.value ||
    deleting.value
  ) {
    return
  }

  if (
    !window.confirm(
      'Xoá ảnh chuyển khoản này?',
    )
  ) {
    return
  }

  deleting.value = true
  proofMessage.value = ''

  try {
    booking.value =
      await customerBookingApi
        .deletePaymentProof(
          booking.value.id,
          latestProof.value.id,
        )

    proofMessage.value =
      'Đã xoá ảnh chuyển khoản.'
  } catch (error) {
    proofMessage.value =
      getErrorMessage(
        error,
        'Không thể xoá ảnh.',
      )
  } finally {
    deleting.value = false
  }
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (
    axios.isAxiosError(error)
  ) {
    return (
      error.response?.data
        ?.message ||
      fallback
    )
  }

  return fallback
}

const parseDate = (
  value: string,
) =>
  new Date(
    value.replace(' ', 'T'),
  )

const formatDate = (
  value: string,
) =>
  new Intl.DateTimeFormat(
    'vi-VN',
    {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(
    parseDate(value),
  )

const formatTime = (
  value: string,
) =>
  value.substring(11, 16)

const formatMoney = (
  value: string | number,
) =>
  new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    },
  ).format(Number(value))

const formatFileSize = (
  value: number,
) => {
  if (value < 1024 * 1024) {
    return `${Math.ceil(
      value / 1024,
    )} KB`
  }

  return `${
    (
      value /
      1024 /
      1024
    ).toFixed(1)
  } MB`
}

const statusLabel = (
  value: string,
) => {
  const labels:
    Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      in_progress:
        'Đang thực hiện',
      completed: 'Hoàn thành',
      cancelled: 'Đã huỷ',
      no_show: 'Không đến',
    }

  return labels[value] || value
}

const proofStatusLabel = (
  value: string,
) => {
  const labels:
    Record<string, string> = {
      pending:
        'Đang chờ kiểm tra',
      approved:
        'Đã xác nhận',
      rejected:
        'Chưa được chấp nhận',
    }

  return labels[value] || value
}

onMounted(loadBooking)
</script>

<style scoped>
.account-page {
  min-height: calc(100vh - 78px);
  padding: 55px 0 100px;
  background: #f4f4f1;
}

.account-container {
  width: min(980px, calc(100% - 40px));
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  margin-bottom: 28px;
  color: #74776f;
  font-size: 13px;
  text-decoration: none;
}

.detail-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.eyebrow {
  color: #8b8f85;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.detail-heading h1 {
  margin: 7px 0 5px;
  font-size: 36px;
  letter-spacing: -1.2px;
}

.detail-heading p {
  margin: 0;
  color: #858980;
  font-size: 14px;
}

.heading-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-badge,
.deposit-badge,
.proof-status {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.status-badge {
  background: #eeeeea;
}

.status-pending,
.deposit-pending_review {
  background: #fff3d6;
  color: #8e6c16;
}

.status-confirmed,
.deposit-paid,
.proof-approved {
  background: #e7f4e8;
  color: #426e4d;
}

.status-cancelled,
.status-no_show,
.proof-rejected {
  background: #f8e7e7;
  color: #985050;
}

.deposit-unpaid,
.deposit-partially_paid {
  background: #f8e8e1;
  color: #9b5a3e;
}

.deposit-not_required {
  background: #ededE9;
  color: #666a62;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-card {
  padding: 24px;
  border: 1px solid #dedfd9;
  border-radius: 16px;
  background: #fff;
}

.detail-card.full {
  grid-column: 1 / -1;
}

.detail-card h2 {
  margin: 0 0 18px;
  font-size: 18px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.card-title-row h2 {
  margin: 0;
}

.info-list {
  display: grid;
  gap: 12px;
}

.info-list > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 11px;
  border-bottom: 1px solid #efefeb;
}

.info-list > div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.info-list span,
.contact-grid span,
.note-box span,
.bank-info span {
  color: #8f9389;
  font-size: 12px;
}

.info-list strong,
.contact-grid strong,
.bank-info strong {
  font-size: 14px;
  text-align: right;
}

.total-line {
  padding-top: 5px;
}

.total-line strong {
  font-size: 18px;
}

.paid-money {
  color: #467451;
}

.transfer-card {
  padding: 28px;
}

.transfer-heading h2 {
  margin: 7px 0 7px;
  font-size: 24px;
}

.transfer-heading p {
  max-width: 650px;
  margin: 0;
  color: #797d74;
  font-size: 14px;
  line-height: 1.65;
}

.transfer-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
  margin-top: 25px;
}

.qr-box {
  min-height: 260px;
  display: grid;
  place-items: center;
  padding: 14px;
  border: 1px solid #e1e2dc;
  border-radius: 15px;
  background: #fafaf8;
}

.qr-box img {
  width: 100%;
  max-width: 230px;
  display: block;
}

.qr-empty {
  display: grid;
  gap: 6px;
  text-align: center;
}

.qr-empty strong {
  font-size: 15px;
}

.qr-empty span {
  color: #8a8e84;
  font-size: 12px;
  line-height: 1.5;
}

.bank-info {
  display: grid;
  align-content: start;
  gap: 0;
  border: 1px solid #e5e6e0;
  border-radius: 14px;
  overflow: hidden;
}

.bank-info > div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 16px;
  border-bottom: 1px solid #ededE8;
}

.bank-info > div:last-child {
  border-bottom: 0;
}

.money-emphasis {
  font-size: 19px !important;
}

.proof-area {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e7e8e2;
}

.proof-heading strong {
  display: block;
  font-size: 16px;
}

.proof-heading span {
  color: #92968c;
  font-size: 12px;
}

.proof-current {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 18px;
  margin-top: 16px;
  padding: 15px;
  border: 1px solid #e4e5df;
  border-radius: 14px;
}

.proof-image-link {
  display: block;
}

.proof-image-link img {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 10px;
}

.proof-copy {
  display: grid;
  align-content: start;
  gap: 10px;
}

.proof-copy p {
  margin: 0;
  color: #73776e;
  font-size: 13px;
  line-height: 1.55;
}

.rejected-copy {
  color: #985050 !important;
}

.upload-box {
  display: grid;
  gap: 12px;
  margin-top: 15px;
  padding: 18px;
  border: 1px dashed #cfd1c9;
  border-radius: 14px;
  background: #fafaf8;
}

.file-input {
  display: none;
}

.selected-file {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 12px;
  border-radius: 10px;
  background: #fff;
}

.selected-file strong {
  font-size: 13px;
}

.selected-file span {
  color: #898d84;
  font-size: 12px;
}

.upload-box textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 13px;
  border: 1px solid #dedfd9;
  border-radius: 10px;
  outline: none;
  background: #fff;
  font: inherit;
  font-size: 13px;
  resize: vertical;
}

.proof-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.primary-button,
.secondary-button,
.danger-button {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #181916;
  background: #181916;
  color: #fff;
}

.secondary-button {
  border: 1px solid #d7d9d2;
  background: #fff;
  color: #383b36;
}

.danger-button {
  border: 1px solid #edd0d0;
  background: #fff4f4;
  color: #9a4c4c;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.proof-message {
  margin-top: 12px;
  font-size: 13px;
}

.paid-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #f4faf4;
}

.paid-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #4d7657;
  color: #fff;
  font-size: 20px;
}

.paid-card strong {
  font-size: 16px;
}

.paid-card p {
  margin: 5px 0 0;
  color: #6f756d;
  font-size: 13px;
}

.contact-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.contact-grid > div {
  display: grid;
  gap: 5px;
}

.contact-grid strong {
  text-align: left;
}

.note-box {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #eeeeea;
}

.note-box p {
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.state {
  padding: 40px;
  border-radius: 15px;
  background: #fff;
  font-size: 14px;
  text-align: center;
}

.state.error {
  color: #9b5252;
}

@media (max-width: 760px) {
  .detail-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-grid,
  .transfer-layout {
    grid-template-columns: 1fr;
  }

  .detail-card.full {
    grid-column: auto;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .proof-current {
    grid-template-columns: 1fr;
  }

  .proof-image-link img {
    height: auto;
    max-height: 320px;
  }
}
</style>
