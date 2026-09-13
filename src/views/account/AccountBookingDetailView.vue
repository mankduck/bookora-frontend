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
                  v-if="previewUrl"
                  class="selected-preview"
                >
                  <img
                    :src="previewUrl"
                    alt="Ảnh đã chọn"
                  />

                  <span>Ảnh đang chờ tải lên</span>
                </div>

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
                        ? 'Đang tải ảnh...'
                        : latestProof
                          ? 'Tải ảnh thay thế'
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
                :class="proofMessageType"
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
import { useAccountBookingDetailView } from './AccountBookingDetailView.ts'

const {
  ref,
  RouterLink,
  booking,
  loading,
  errorMessage,
  uploading,
  deleting,
  proofMessage,
  proofNote,
  selectedFile,
  fileInput,
  paymentSummary,
  depositStatus,
  depositLabel,
  latestProof,
  showDepositArea,
  primaryStaffName,
  chooseFile,
  handleFileChange,
  uploadProof,
  deleteProof,
  formatDate,
  formatTime,
  formatMoney,
  formatFileSize,
  statusLabel,
  proofStatusLabel,
} = useAccountBookingDetailView()
</script>

<style scoped src="./AccountBookingDetailView.css"></style>
