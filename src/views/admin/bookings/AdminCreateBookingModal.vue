<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @mousedown.self="requestClose"
    >
      <div class="booking-modal">
        <header class="modal-header">
          <div>
            <span class="eyebrow">
              ADMIN BOOKING
            </span>

            <h2>Tạo lịch hẹn mới</h2>

            <p>
              Tạo booking thay cho khách hàng.
            </p>
          </div>

          <button
            type="button"
            class="close-button"
            :disabled="submitting"
            @click="requestClose"
          >
            ×
          </button>
        </header>

        <div
          v-if="!createdBooking"
          class="progress"
        >
          <button
            v-for="step in steps"
            :key="step.id"
            type="button"
            class="progress-step"
            :class="{
              active:
                currentStep === step.id,
              completed:
                currentStep > step.id,
            }"
            :disabled="
              step.id >
              highestAvailableStep
            "
            @click="goToStep(step.id)"
          >
            <span>
              {{
                currentStep > step.id
                  ? '✓'
                  : step.id
              }}
            </span>

            <div>
              <strong>
                {{ step.title }}
              </strong>

              <small>
                {{ step.description }}
              </small>
            </div>
          </button>
        </div>

        <div class="modal-body">
          <!-- SUCCESS -->

          <section
            v-if="createdBooking"
            class="success-view"
          >
            <div class="success-icon">
              ✓
            </div>

            <span class="eyebrow">
              TẠO BOOKING THÀNH CÔNG
            </span>

            <h2>
              {{
                createdBooking.booking_code
              }}
            </h2>

            <p>
              Booking đã được thêm vào danh sách.
            </p>

            <div class="success-grid">
              <div>
                <span>Khách hàng</span>

                <strong>
                  {{
                    createdBooking
                      .customer_name
                  }}
                </strong>
              </div>

              <div>
                <span>Số điện thoại</span>

                <strong>
                  {{
                    createdBooking
                      .customer_phone
                  }}
                </strong>
              </div>

              <div>
                <span>Dịch vụ</span>

                <strong>
                  {{
                    createdBooking
                      .items[0]
                      ?.service_name ||
                    '—'
                  }}
                </strong>
              </div>

              <div>
                <span>Gói</span>

                <strong>
                  {{
                    createdBooking
                      .items[0]
                      ?.variant_name ||
                    '—'
                  }}
                </strong>
              </div>

              <div>
                <span>Ngày</span>

                <strong>
                  {{
                    formatBackendDate(
                      createdBooking
                        .start_at,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Thời gian</span>

                <strong>
                  {{
                    formatBackendTime(
                      createdBooking
                        .start_at,
                    )
                  }}
                  –
                  {{
                    formatBackendTime(
                      createdBooking
                        .end_at,
                    )
                  }}
                </strong>
              </div>
            </div>

            <div class="success-money">
              <div>
                <span>Tổng tiền</span>

                <strong>
                  {{
                    formatMoney(
                      createdBooking
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
                      createdBooking
                        .deposit_amount,
                    )
                  }}
                </strong>
              </div>
            </div>

            <div class="success-actions">
              <button
                type="button"
                class="secondary-button"
                @click="startNewBooking"
              >
                Tạo booking khác
              </button>

              <button
                type="button"
                class="primary-button"
                @click="closeAfterSuccess"
              >
                Hoàn tất
              </button>
            </div>
          </section>

          <!-- STEP 1 -->

          <section
            v-else-if="currentStep === 1"
            class="step-content"
          >
            <div class="section-heading">
              <span>01</span>

              <div>
                <h3>
                  Chọn dịch vụ
                </h3>

                <p>
                  Chọn dịch vụ khách muốn đặt.
                </p>
              </div>
            </div>

            <div
              v-if="loadingServices"
              class="state"
            >
              Đang tải dịch vụ...
            </div>

            <div
              v-else-if="
                services.length === 0
              "
              class="state"
            >
              Chưa có dịch vụ khả dụng.
            </div>

            <div
              v-else
              class="services-grid"
            >
              <button
                v-for="service in services"
                :key="service.id"
                type="button"
                class="service-card"
                :class="{
                  selected:
                    selectedService?.id ===
                    service.id,
                }"
                @click="
                  selectService(service)
                "
              >
                <div class="service-image">
                  <img
                    v-if="service.thumbnail"
                    :src="service.thumbnail"
                    :alt="service.name"
                  />

                  <span v-else>
                    {{
                      service.name
                        .charAt(0)
                        .toUpperCase()
                    }}
                  </span>
                </div>

                <div class="service-copy">
                  <strong>
                    {{ service.name }}
                  </strong>

                  <small>
                    {{
                      service.category?.name ||
                      'Dịch vụ'
                    }}
                  </small>

                  <p>
                    {{
                      service.short_description ||
                      'Dịch vụ đặt lịch.'
                    }}
                  </p>
                </div>

                <i>✓</i>
              </button>
            </div>

            <template
              v-if="selectedService"
            >
              <div class="divider" />

              <div class="section-heading">
                <span>02</span>

                <div>
                  <h3>
                    Chọn gói dịch vụ
                  </h3>

                  <p>
                    {{ selectedService.name }}
                  </p>
                </div>
              </div>

              <div
                v-if="
                  selectedService
                    .variants.length === 0
                "
                class="state small"
              >
                Dịch vụ này chưa có gói khả dụng.
              </div>

              <div
                v-else
                class="variants-grid"
              >
                <button
                  v-for="
                    variant in
                    selectedService.variants
                  "
                  :key="variant.id"
                  type="button"
                  class="variant-card"
                  :class="{
                    selected:
                      selectedVariant?.id ===
                      variant.id,
                  }"
                  @click="
                    selectVariant(
                      variant,
                    )
                  "
                >
                  <div class="variant-heading">
                    <div>
                      <strong>
                        {{ variant.name }}
                      </strong>

                      <small
                        v-if="variant.code"
                      >
                        {{ variant.code }}
                      </small>
                    </div>

                    <span />
                  </div>

                  <p>
                    {{
                      variant.description ||
                      'Gói dịch vụ.'
                    }}
                  </p>

                  <div class="variant-tags">
                    <span>
                      {{
                        variant
                          .duration_minutes
                      }}
                      phút
                    </span>

                    <span>
                      {{
                        getDepositText(
                          variant,
                        )
                      }}
                    </span>
                  </div>

                  <div class="variant-price">
                    <del
                      v-if="
                        variant.sale_price !==
                        null
                      "
                    >
                      {{
                        formatMoney(
                          variant.price,
                        )
                      }}
                    </del>

                    <strong>
                      {{
                        formatMoney(
                          variant.sale_price ??
                          variant.price,
                        )
                      }}
                    </strong>
                  </div>
                </button>
              </div>
            </template>
          </section>

          <!-- STEP 2 -->

          <section
            v-else-if="currentStep === 2"
            class="step-content"
          >
            <div class="section-heading">
              <span>03</span>

              <div>
                <h3>
                  Chọn ngày & giờ
                </h3>

                <p>
                  Chỉ hiển thị những khung giờ
                  còn nhân viên phù hợp.
                </p>
              </div>
            </div>

            <div class="schedule-layout">
              <aside class="schedule-sidebar">
                <label class="field">
                  <span>Ngày thực hiện</span>

                  <input
                    v-model="selectedDate"
                    type="date"
                    :min="minDate"
                    @change="loadSlots"
                  />
                </label>

                <div class="selected-package">
                  <span>Dịch vụ</span>

                  <strong>
                    {{
                      selectedService
                        ?.name ||
                      '—'
                    }}
                  </strong>

                  <span>Gói</span>

                  <strong>
                    {{
                      selectedVariant
                        ?.name ||
                      '—'
                    }}
                  </strong>

                  <span>Thời lượng</span>

                  <strong>
                    {{
                      selectedVariant
                        ?.duration_minutes ||
                      0
                    }}
                    phút
                  </strong>
                </div>
              </aside>

              <div class="slots-area">
                <div
                  v-if="!selectedDate"
                  class="slots-state"
                >
                  <strong>
                    Chưa chọn ngày
                  </strong>

                  <p>
                    Chọn ngày để xem khung giờ.
                  </p>
                </div>

                <div
                  v-else-if="loadingSlots"
                  class="slots-state"
                >
                  <strong>
                    Đang kiểm tra lịch...
                  </strong>
                </div>

                <div
                  v-else-if="
                    availabilityError
                  "
                  class="slots-state error"
                >
                  <strong>
                    Không thể tải lịch
                  </strong>

                  <p>
                    {{ availabilityError }}
                  </p>

                  <button
                    type="button"
                    class="secondary-button"
                    @click="loadSlots"
                  >
                    Thử lại
                  </button>
                </div>

                <div
                  v-else-if="
                    slots.length === 0
                  "
                  class="slots-state"
                >
                  <strong>
                    Không còn khung giờ
                  </strong>

                  <p>
                    Nhân viên đã kín lịch hoặc
                    không làm việc ngày này.
                  </p>
                </div>

                <div
                  v-else
                  class="slots-grid"
                >
                  <button
                    v-for="slot in slots"
                    :key="slot.start_at"
                    type="button"
                    class="slot-button"
                    :class="{
                      selected:
                        selectedSlot
                          ?.start_at ===
                        slot.start_at,
                    }"
                    @click="
                      selectedSlot =
                        slot
                    "
                  >
                    <strong>
                      {{ slot.start_time }}
                    </strong>

                    <span>
                      đến {{ slot.end_time }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- STEP 3 -->

          <section
            v-else-if="currentStep === 3"
            class="step-content"
          >
            <div class="section-heading">
              <span>04</span>

              <div>
                <h3>
                  Thông tin khách hàng
                </h3>

                <p>
                  Dùng cho khách gọi điện, inbox
                  hoặc đến trực tiếp.
                </p>
              </div>
            </div>

            <div class="customer-layout">
              <div>
                <div class="form-grid">
                  <label
                    class="field full"
                  >
                    <span>Họ và tên *</span>

                    <input
                      v-model.trim="
                        customerForm.name
                      "
                      type="text"
                      maxlength="150"
                      placeholder="Nguyễn Văn A"
                    />
                  </label>

                  <label class="field">
                    <span>
                      Số điện thoại *
                    </span>

                    <input
                      v-model.trim="
                        customerForm.phone
                      "
                      type="tel"
                      maxlength="30"
                      placeholder="0901 234 567"
                    />
                  </label>

                  <label class="field">
                    <span>Email</span>

                    <input
                      v-model.trim="
                        customerForm.email
                      "
                      type="email"
                      maxlength="190"
                      placeholder="email@example.com"
                    />
                  </label>

                  <label
                    class="field full"
                  >
                    <span>Ghi chú</span>

                    <textarea
                      v-model.trim="
                        customerForm.notes
                      "
                      rows="4"
                      maxlength="2000"
                      placeholder="Yêu cầu hoặc lưu ý..."
                    />
                  </label>
                </div>

                <div class="coupon-box">
                  <div class="coupon-heading">
                    <div>
                      <strong>
                        Mã ưu đãi
                      </strong>

                      <span>
                        Có thể bỏ qua.
                      </span>
                    </div>

                    <button
                      v-if="appliedCoupon"
                      type="button"
                      @click="removeCoupon"
                    >
                      Bỏ mã
                    </button>
                  </div>

                  <div class="coupon-input">
                    <input
                      v-model.trim="
                        couponCode
                      "
                      type="text"
                      maxlength="100"
                      placeholder="VD: BOOKORA10"
                      :disabled="
                        checkingCoupon ||
                        Boolean(
                          appliedCoupon,
                        )
                      "
                      @keyup.enter="
                        applyCoupon
                      "
                    />

                    <button
                      type="button"
                      :disabled="
                        !couponCode ||
                        checkingCoupon ||
                        Boolean(
                          appliedCoupon,
                        )
                      "
                      @click="applyCoupon"
                    >
                      {{
                        checkingCoupon
                          ? 'Đang kiểm tra...'
                          : appliedCoupon
                            ? 'Đã áp dụng'
                            : 'Áp dụng'
                      }}
                    </button>
                  </div>

                  <p
                    v-if="couponMessage"
                    class="coupon-message"
                    :class="{
                      success:
                        Boolean(
                          appliedCoupon,
                        ),
                      error:
                        !appliedCoupon,
                    }"
                  >
                    {{ couponMessage }}
                  </p>
                </div>
              </div>

              <aside class="summary-card">
                <span>TÓM TẮT</span>

                <h3>
                  Chi tiết booking
                </h3>

                <div class="summary-list">
                  <div>
                    <span>Dịch vụ</span>

                    <strong>
                      {{
                        selectedService
                          ?.name
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>Gói</span>

                    <strong>
                      {{
                        selectedVariant
                          ?.name
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>Ngày</span>

                    <strong>
                      {{
                        formatSelectedDate(
                          selectedDate,
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>Giờ</span>

                    <strong>
                      {{
                        selectedSlot
                          ?.start_time
                      }}
                      –
                      {{
                        selectedSlot
                          ?.end_time
                      }}
                    </strong>
                  </div>
                </div>

                <div class="summary-money">
                  <div>
                    <span>Tạm tính</span>

                    <strong>
                      {{
                        formatMoney(
                          subtotal,
                        )
                      }}
                    </strong>
                  </div>

                  <div
                    v-if="discount > 0"
                  >
                    <span>Giảm giá</span>

                    <strong>
                      -
                      {{
                        formatMoney(
                          discount,
                        )
                      }}
                    </strong>
                  </div>

                  <div class="total-line">
                    <span>Tổng cộng</span>

                    <strong>
                      {{
                        formatMoney(
                          total,
                        )
                      }}
                    </strong>
                  </div>

                  <div
                    v-if="
                      depositAmount > 0
                    "
                  >
                    <span>Cọc yêu cầu</span>

                    <strong>
                      {{
                        formatMoney(
                          depositAmount,
                        )
                      }}
                    </strong>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <!-- STEP 4 -->

          <section
            v-else
            class="step-content"
          >
            <div class="section-heading">
              <span>05</span>

              <div>
                <h3>
                  Xác nhận booking
                </h3>

                <p>
                  Kiểm tra lại trước khi tạo.
                </p>
              </div>
            </div>

            <div class="confirm-grid">
              <div class="confirm-card">
                <div class="confirm-title">
                  <strong>
                    Dịch vụ & lịch
                  </strong>

                  <button
                    type="button"
                    @click="
                      currentStep = 1
                    "
                  >
                    Sửa
                  </button>
                </div>

                <dl>
                  <div>
                    <dt>Dịch vụ</dt>
                    <dd>
                      {{
                        selectedService
                          ?.name
                      }}
                    </dd>
                  </div>

                  <div>
                    <dt>Gói</dt>
                    <dd>
                      {{
                        selectedVariant
                          ?.name
                      }}
                    </dd>
                  </div>

                  <div>
                    <dt>Ngày</dt>
                    <dd>
                      {{
                        formatSelectedDate(
                          selectedDate,
                        )
                      }}
                    </dd>
                  </div>

                  <div>
                    <dt>Giờ</dt>
                    <dd>
                      {{
                        selectedSlot
                          ?.start_time
                      }}
                      –
                      {{
                        selectedSlot
                          ?.end_time
                      }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div class="confirm-card">
                <div class="confirm-title">
                  <strong>
                    Khách hàng
                  </strong>

                  <button
                    type="button"
                    @click="
                      currentStep = 3
                    "
                  >
                    Sửa
                  </button>
                </div>

                <dl>
                  <div>
                    <dt>Họ tên</dt>
                    <dd>
                      {{ customerForm.name }}
                    </dd>
                  </div>

                  <div>
                    <dt>Điện thoại</dt>
                    <dd>
                      {{ customerForm.phone }}
                    </dd>
                  </div>

                  <div>
                    <dt>Email</dt>
                    <dd>
                      {{
                        customerForm.email ||
                        'Không có'
                      }}
                    </dd>
                  </div>

                  <div>
                    <dt>Mã ưu đãi</dt>
                    <dd>
                      {{
                        appliedCoupon
                          ?.coupon.code ||
                        'Không dùng'
                      }}
                    </dd>
                  </div>
                </dl>

                <div
                  v-if="
                    customerForm.notes
                  "
                  class="note-box"
                >
                  <span>Ghi chú</span>

                  <p>
                    {{ customerForm.notes }}
                  </p>
                </div>
              </div>

              <div class="confirm-card payment-card">
                <div>
                  <span>Tạm tính</span>

                  <strong>
                    {{
                      formatMoney(
                        subtotal,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Giảm giá</span>

                  <strong>
                    -
                    {{
                      formatMoney(
                        discount,
                      )
                    }}
                  </strong>
                </div>

                <div class="total-line">
                  <span>Tổng cộng</span>

                  <strong>
                    {{
                      formatMoney(
                        total,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Cọc yêu cầu</span>

                  <strong>
                    {{
                      formatMoney(
                        depositAmount,
                      )
                    }}
                  </strong>
                </div>
              </div>
            </div>

            <div
              v-if="submitError"
              class="submit-error"
            >
              <strong>
                Không thể tạo booking
              </strong>

              <p>
                {{ submitError }}
              </p>
            </div>
          </section>
        </div>

        <footer
          v-if="!createdBooking"
          class="modal-footer"
        >
          <button
            v-if="currentStep > 1"
            type="button"
            class="secondary-button"
            :disabled="submitting"
            @click="
              currentStep -= 1
            "
          >
            ← Quay lại
          </button>

          <div class="footer-info">
            <template
              v-if="currentStep === 1"
            >
              <span>Gói đã chọn</span>

              <strong>
                {{
                  selectedVariant
                    ?.name ||
                  'Chưa chọn'
                }}
              </strong>
            </template>

            <template
              v-else-if="
                currentStep === 2
              "
            >
              <span>Thời gian</span>

              <strong>
                {{
                  selectedSlot
                    ? `${formatSelectedDate(
                        selectedDate,
                      )} · ${selectedSlot.start_time}`
                    : 'Chưa chọn'
                }}
              </strong>
            </template>

            <template v-else>
              <span>Tổng booking</span>

              <strong>
                {{ formatMoney(total) }}
              </strong>
            </template>
          </div>

          <button
            v-if="currentStep === 1"
            type="button"
            class="primary-button"
            :disabled="
              !selectedVariant
            "
            @click="
              currentStep = 2
            "
          >
            Chọn ngày giờ →
          </button>

          <button
            v-else-if="
              currentStep === 2
            "
            type="button"
            class="primary-button"
            :disabled="
              !selectedSlot
            "
            @click="
              currentStep = 3
            "
          >
            Nhập khách hàng →
          </button>

          <button
            v-else-if="
              currentStep === 3
            "
            type="button"
            class="primary-button"
            :disabled="
              !canContinueCustomer
            "
            @click="
              currentStep = 4
            "
          >
            Kiểm tra booking →
          </button>

          <button
            v-else
            type="button"
            class="primary-button"
            :disabled="submitting"
            @click="submitBooking"
          >
            {{
              submitting
                ? 'Đang tạo...'
                : 'Tạo booking →'
            }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAdminCreateBookingModal } from './AdminCreateBookingModal.ts'
import type { AdminCreatedBooking } from '@/services/adminBookingCreate.api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [
    booking: AdminCreatedBooking,
  ]
}>()

const {
  currentStep,
  loadingServices,
  loadingSlots,
  checkingCoupon,
  submitting,
  services,
  selectedService,
  selectedVariant,
  selectedDate,
  slots,
  selectedSlot,
  availabilityError,
  couponCode,
  couponMessage,
  appliedCoupon,
  submitError,
  createdBooking,
  customerForm,
  steps,
  minDate,
  subtotal,
  discount,
  total,
  depositAmount,
  canContinueCustomer,
  highestAvailableStep,
  formatMoney,
  formatSelectedDate,
  formatBackendDate,
  formatBackendTime,
  getDepositText,
  selectService,
  selectVariant,
  goToStep,
  loadSlots,
  applyCoupon,
  removeCoupon,
  submitBooking,
  startNewBooking,
  requestClose,
  closeAfterSuccess,
} = useAdminCreateBookingModal(props, emit)
</script>

<style scoped src="./AdminCreateBookingModal.css"></style>