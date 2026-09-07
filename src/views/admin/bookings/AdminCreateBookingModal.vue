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
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import axios from 'axios'

import publicCatalogApi, {
  type PublicService,
  type PublicServiceVariant,
} from '@/services/publicCatalog.api'

import availabilityApi, {
  type AvailabilitySlot,
} from '@/services/availability.api'

import couponApi, {
  type CouponResult,
} from '@/services/coupon.api'

import adminBookingCreateApi, {
  type AdminCreatedBooking,
} from '@/services/adminBookingCreate.api'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [
    booking: AdminCreatedBooking,
  ]
}>()

const currentStep = ref(1)

const loadingServices = ref(false)
const loadingSlots = ref(false)
const checkingCoupon = ref(false)
const submitting = ref(false)

const services =
  ref<PublicService[]>([])

const selectedService =
  ref<PublicService | null>(null)

const selectedVariant =
  ref<PublicServiceVariant | null>(
    null,
  )

const selectedDate = ref('')

const slots =
  ref<AvailabilitySlot[]>([])

const selectedSlot =
  ref<AvailabilitySlot | null>(
    null,
  )

const availabilityError = ref('')
const couponCode = ref('')
const couponMessage = ref('')

const appliedCoupon =
  ref<CouponResult | null>(
    null,
  )

const submitError = ref('')

const createdBooking =
  ref<AdminCreatedBooking | null>(
    null,
  )

const customerForm = ref({
  name: '',
  phone: '',
  email: '',
  notes: '',
})

const steps = [
  {
    id: 1,
    title: 'Dịch vụ',
    description: 'Chọn gói',
  },
  {
    id: 2,
    title: 'Ngày & giờ',
    description: 'Lịch trống',
  },
  {
    id: 3,
    title: 'Khách hàng',
    description: 'Thông tin',
  },
  {
    id: 4,
    title: 'Xác nhận',
    description: 'Tạo lịch',
  },
]

const minDate = computed(() => {
  const date = new Date()

  const year =
    date.getFullYear()

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
})

const subtotal = computed(() => {
  if (!selectedVariant.value) {
    return 0
  }

  return Number(
    selectedVariant.value
      .sale_price ??
    selectedVariant.value
      .price,
  )
})

const discount = computed(() => {
  return Number(
    appliedCoupon.value
      ?.discount ??
    0,
  )
})

const total = computed(() => {
  return Math.max(
    subtotal.value -
      discount.value,
    0,
  )
})

const depositAmount =
  computed(() => {
    const variant =
      selectedVariant.value

    if (!variant) {
      return 0
    }

    if (
      variant.deposit_type ===
      'none'
    ) {
      return 0
    }

    if (
      variant.deposit_type ===
      'fixed'
    ) {
      return Math.min(
        Number(
          variant.deposit_value,
        ),
        total.value,
      )
    }

    if (
      variant.deposit_type ===
        'percent' ||
      variant.deposit_type ===
        'percentage'
    ) {
      return Math.min(
        (
          total.value *
          Number(
            variant.deposit_value,
          )
        ) / 100,
        total.value,
      )
    }

    return 0
  })

const canContinueCustomer =
  computed(() => {
    const email =
      customerForm.value.email.trim()

    return Boolean(
      customerForm.value
        .name
        .trim() &&
      customerForm.value
        .phone
        .trim() &&
      (
        !email ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(email)
      ) &&
      selectedSlot.value,
    )
  })

const highestAvailableStep =
  computed(() => {
    if (!selectedVariant.value) {
      return 1
    }

    if (!selectedSlot.value) {
      return 2
    }

    if (
      !canContinueCustomer.value
    ) {
      return 3
    }

    return 4
  })

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

const formatSelectedDate = (
  value: string,
) => {
  if (!value) {
    return '—'
  }

  const [
    year,
    month,
    day,
  ] = value.split('-')

  return `${day}/${month}/${year}`
}

const formatBackendDate = (
  value: string,
) =>
  formatSelectedDate(
    value.substring(0, 10),
  )

const formatBackendTime = (
  value: string,
) =>
  value.substring(11, 16)

const getDepositText = (
  variant: PublicServiceVariant,
) => {
  if (
    variant.deposit_type ===
    'none'
  ) {
    return 'Không cần cọc'
  }

  if (
    variant.deposit_type ===
    'fixed'
  ) {
    return `Cọc ${formatMoney(
      variant.deposit_value,
    )}`
  }

  return `Cọc ${Number(
    variant.deposit_value,
  )}%`
}

const selectService = (
  service: PublicService,
) => {
  selectedService.value =
    service

  selectedVariant.value =
    null

  selectedDate.value = ''
  selectedSlot.value = null

  slots.value = []

  removeCoupon()
}

const selectVariant = (
  variant:
    PublicServiceVariant,
) => {
  selectedVariant.value =
    variant

  selectedDate.value = ''
  selectedSlot.value = null
  slots.value = []

  availabilityError.value = ''

  removeCoupon()
}

const goToStep = (
  step: number,
) => {
  if (
    step <=
    highestAvailableStep.value
  ) {
    currentStep.value =
      step
  }
}

const loadSlots = async () => {
  if (
    !selectedVariant.value ||
    !selectedDate.value
  ) {
    return
  }

  loadingSlots.value = true

  selectedSlot.value = null
  slots.value = []

  availabilityError.value = ''

  try {
    const response =
      await availabilityApi
        .getSlots(
          selectedVariant
            .value.id,
          selectedDate.value,
        )

    slots.value =
      response.slots
  } catch (error) {
    availabilityError.value =
      getErrorMessage(
        error,
        'Không thể kiểm tra lịch.',
      )
  } finally {
    loadingSlots.value = false
  }
}

const applyCoupon = async () => {
  if (
    !selectedVariant.value ||
    !couponCode.value.trim()
  ) {
    return
  }

  checkingCoupon.value = true

  couponMessage.value = ''

  try {
    const result =
      await couponApi.check(
        couponCode.value.trim(),
        selectedVariant
          .value.id,
      )

    appliedCoupon.value =
      result

    couponCode.value =
      result.coupon.code

    couponMessage.value =
      `Đã áp dụng ${result.coupon.code}.`
  } catch (error) {
    appliedCoupon.value = null

    couponMessage.value =
      getErrorMessage(
        error,
        'Mã ưu đãi không hợp lệ.',
      )
  } finally {
    checkingCoupon.value = false
  }
}

const removeCoupon = () => {
  appliedCoupon.value = null
  couponCode.value = ''
  couponMessage.value = ''
}

const submitBooking =
  async () => {
    if (
      submitting.value ||
      !selectedVariant.value ||
      !selectedSlot.value ||
      !canContinueCustomer.value
    ) {
      return
    }

    submitting.value = true
    submitError.value = ''

    try {
      const booking =
        await adminBookingCreateApi
          .create({
            variant_id:
              selectedVariant
                .value.id,

            start_at:
              selectedSlot
                .value
                .start_at,

            customer_name:
              customerForm
                .value
                .name
                .trim(),

            customer_phone:
              customerForm
                .value
                .phone
                .trim(),

            customer_email:
              customerForm
                .value
                .email
                .trim() ||
              null,

            notes:
              customerForm
                .value
                .notes
                .trim() ||
              null,

            coupon_code:
              appliedCoupon.value
                ?.coupon.code ||
              null,
          })

      createdBooking.value =
        booking

      emit(
        'created',
        booking,
      )
    } catch (error) {
      submitError.value =
        getErrorMessage(
          error,
          'Không thể tạo booking.',
        )

      if (
        axios.isAxiosError(
          error,
        ) &&
        error.response?.data
          ?.errors?.start_at
      ) {
        currentStep.value = 2

        await loadSlots()

        availabilityError.value =
          'Khung giờ vừa chọn không còn khả dụng. Vui lòng chọn giờ khác.'
      }
    } finally {
      submitting.value = false
    }
  }

const resetForm = () => {
  currentStep.value = 1

  selectedService.value =
    null

  selectedVariant.value =
    null

  selectedDate.value = ''
  selectedSlot.value = null

  slots.value = []

  customerForm.value = {
    name: '',
    phone: '',
    email: '',
    notes: '',
  }

  removeCoupon()

  submitError.value = ''
  availabilityError.value = ''

  createdBooking.value = null
}

const startNewBooking = () => {
  resetForm()
}

const requestClose = () => {
  if (submitting.value) {
    return
  }

  emit('close')
}

const closeAfterSuccess = () => {
  emit('close')
}

const getErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (
    axios.isAxiosError(error)
  ) {
    const data =
      error.response?.data

    if (
      data?.errors &&
      typeof data.errors ===
        'object'
    ) {
      const first =
        Object.values(
          data.errors,
        )
          .flat()
          .at(0)

      if (first) {
        return String(first)
      }
    }

    return (
      data?.message ||
      fallback
    )
  }

  if (
    error instanceof Error
  ) {
    return error.message
  }

  return fallback
}

const loadServices = async () => {
  loadingServices.value = true

  try {
    services.value =
      await publicCatalogApi
        .getServices()
  } catch (error) {
    window.alert(
      getErrorMessage(
        error,
        'Không thể tải dịch vụ.',
      ),
    )
  } finally {
    loadingServices.value =
      false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    document.body.style
      .overflow =
      isOpen
        ? 'hidden'
        : ''

    if (isOpen) {
      resetForm()
    }
  },
)

onMounted(loadServices)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: grid;
  place-items: center;
  padding: 26px;
  background: rgba(17, 18, 16, 0.58);
  backdrop-filter: blur(3px);
}

.booking-modal {
  width: min(1080px, 100%);
  max-height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: #f5f5f2;
  box-shadow:
    0 30px 100px
    rgba(0, 0, 0, 0.24);
}

.modal-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e1db;
  background: #fff;
}

.eyebrow {
  display: block;
  color: #94988f;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.modal-header h2 {
  margin: 5px 0 3px;
  font-size: 23px;
}

.modal-header p {
  margin: 0;
  color: #858980;
  font-size: 11px;
}

.close-button {
  width: 38px;
  height: 38px;
  border: 1px solid #dcded7;
  border-radius: 9px;
  background: #fff;
  font-size: 21px;
  cursor: pointer;
}

.progress {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 7px;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e1db;
  background: #fafaf8;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  text-align: left;
}

.progress-step > span {
  width: 27px;
  height: 27px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #e9eae5;
  color: #777b72;
  font-size: 9px;
  font-weight: 800;
}

.progress-step > div {
  display: grid;
  gap: 1px;
}

.progress-step strong {
  font-size: 11px;
}

.progress-step small {
  color: #979b91;
  font-size: 8px;
}

.progress-step.active {
  border-color: #d8dad3;
  background: #fff;
}

.progress-step.active > span,
.progress-step.completed > span {
  background: #1a1b18;
  color: #fff;
}

.modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 22px;
}

.step-content {
  padding: 21px;
  border: 1px solid #e0e1dc;
  border-radius: 14px;
  background: #fff;
}

.section-heading {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.section-heading > span {
  width: 29px;
  height: 29px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #1a1b18;
  color: #fff;
  font-size: 8px;
  font-weight: 800;
}

.section-heading h3 {
  margin: 0;
  font-size: 16px;
}

.section-heading p {
  margin: 3px 0 0;
  color: #92968c;
  font-size: 10px;
}

.divider {
  height: 1px;
  margin: 23px 0;
  background: #ecece8;
}

.services-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.service-card {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e1dc;
  border-radius: 11px;
  background: #fff;
  text-align: left;
}

.service-card.selected {
  border-color: #1a1b18;
  box-shadow:
    inset 0 0 0 1px #1a1b18;
}

.service-image {
  width: 70px;
  height: 70px;
  flex: 0 0 auto;
  overflow: hidden;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #ededE9;
}

.service-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-image span {
  color: #989c93;
  font-size: 24px;
  font-weight: 800;
}

.service-copy {
  min-width: 0;
  display: grid;
  align-content: center;
}

.service-copy strong {
  font-size: 12px;
}

.service-copy small {
  margin-top: 2px;
  color: #999d93;
  font-size: 8px;
}

.service-copy p {
  margin: 6px 25px 0 0;
  color: #858980;
  font-size: 9px;
  line-height: 1.45;
}

.service-card > i {
  position: absolute;
  top: 9px;
  right: 9px;
  display: none;
  width: 19px;
  height: 19px;
  place-items: center;
  border-radius: 50%;
  background: #1a1b18;
  color: #fff;
  font-size: 8px;
  font-style: normal;
}

.service-card.selected > i {
  display: grid;
}

.variants-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.variant-card {
  display: grid;
  padding: 15px;
  border: 1px solid #e0e1dc;
  border-radius: 11px;
  background: #fff;
  text-align: left;
}

.variant-card.selected {
  border-color: #1a1b18;
  box-shadow:
    inset 0 0 0 1px #1a1b18;
}

.variant-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.variant-heading > div {
  display: grid;
  gap: 2px;
}

.variant-heading strong {
  font-size: 12px;
}

.variant-heading small {
  color: #999d93;
  font-size: 8px;
}

.variant-heading > span {
  width: 14px;
  height: 14px;
  border: 1px solid #cfd1ca;
  border-radius: 50%;
}

.variant-card.selected
  .variant-heading > span {
  border: 4px solid #1a1b18;
}

.variant-card > p {
  min-height: 40px;
  margin: 10px 0;
  color: #83877e;
  font-size: 9px;
  line-height: 1.45;
}

.variant-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.variant-tags span {
  padding: 4px 6px;
  border-radius: 5px;
  background: #f1f1ed;
  color: #777b72;
  font-size: 8px;
}

.variant-price {
  display: grid;
  gap: 2px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #eeeeea;
}

.variant-price del {
  color: #a1a49c;
  font-size: 9px;
}

.variant-price strong {
  font-size: 15px;
}

.schedule-layout {
  display: grid;
  grid-template-columns:
    230px 1fr;
  gap: 20px;
}

.schedule-sidebar {
  display: grid;
  align-content: start;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field.full {
  grid-column: 1 / -1;
}

.field > span {
  font-size: 10px;
  font-weight: 700;
}

.field input,
.field textarea,
.coupon-input input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 11px;
  border: 1px solid #dcddd7;
  border-radius: 8px;
  outline: none;
  background: #fff;
  font: inherit;
  font-size: 11px;
}

.field textarea {
  resize: vertical;
}

.selected-package {
  display: grid;
  gap: 3px;
  padding: 12px;
  border-radius: 9px;
  background: #f5f5f2;
}

.selected-package span {
  margin-top: 6px;
  color: #969a91;
  font-size: 8px;
}

.selected-package span:first-child {
  margin-top: 0;
}

.selected-package strong {
  font-size: 10px;
}

.slots-area {
  min-height: 230px;
}

.slots-state,
.state {
  min-height: 200px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 6px;
  text-align: center;
}

.state.small {
  min-height: 80px;
}

.slots-state strong {
  font-size: 12px;
}

.slots-state p {
  max-width: 320px;
  margin: 0;
  color: #878b82;
  font-size: 10px;
}

.slots-state.error {
  color: #984f4f;
}

.slots-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 7px;
}

.slot-button {
  min-height: 58px;
  display: grid;
  place-content: center;
  gap: 2px;
  border: 1px solid #dedfd9;
  border-radius: 8px;
  background: #fff;
}

.slot-button strong {
  font-size: 12px;
}

.slot-button span {
  color: #91958c;
  font-size: 8px;
}

.slot-button.selected {
  border-color: #1a1b18;
  background: #1a1b18;
  color: #fff;
}

.slot-button.selected span {
  color: #b5b8b0;
}

.customer-layout {
  display: grid;
  grid-template-columns:
    1.35fr 0.65fr;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.coupon-box {
  display: grid;
  gap: 9px;
  margin-top: 13px;
  padding: 13px;
  border-radius: 10px;
  background: #f5f5f2;
}

.coupon-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.coupon-heading > div {
  display: grid;
  gap: 2px;
}

.coupon-heading strong {
  font-size: 11px;
}

.coupon-heading span {
  color: #969a91;
  font-size: 8px;
}

.coupon-heading button {
  border: 0;
  background: transparent;
  color: #984f4f;
  font-size: 9px;
}

.coupon-input {
  display: grid;
  grid-template-columns:
    1fr auto;
  gap: 7px;
}

.coupon-input button {
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  background: #1a1b18;
  color: #fff;
  font-size: 9px;
}

.coupon-message {
  margin: 0;
  font-size: 9px;
}

.coupon-message.success {
  color: #467051;
}

.coupon-message.error {
  color: #984f4f;
}

.summary-card {
  align-self: start;
  padding: 15px;
  border: 1px solid #e0e1dc;
  border-radius: 10px;
  background: #fafaf8;
}

.summary-card > span {
  color: #969a91;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
}

.summary-card h3 {
  margin: 4px 0 13px;
  font-size: 14px;
}

.summary-list,
.summary-money {
  display: grid;
  gap: 7px;
}

.summary-list > div,
.summary-money > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.summary-list span,
.summary-money span {
  color: #8d9188;
  font-size: 9px;
}

.summary-list strong,
.summary-money strong {
  font-size: 10px;
  text-align: right;
}

.summary-money {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e1e2dc;
}

.total-line {
  padding-top: 7px;
  border-top: 1px solid #e1e2dc;
}

.total-line strong {
  font-size: 14px !important;
}

.confirm-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.confirm-card {
  padding: 14px;
  border: 1px solid #e0e1dc;
  border-radius: 10px;
}

.confirm-title {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 11px;
}

.confirm-title strong {
  font-size: 12px;
}

.confirm-title button {
  border: 0;
  background: transparent;
  color: #747970;
  font-size: 9px;
  text-decoration: underline;
}

.confirm-card dl {
  display: grid;
  gap: 7px;
  margin: 0;
}

.confirm-card dl > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.confirm-card dt {
  color: #8d9188;
  font-size: 9px;
}

.confirm-card dd {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  text-align: right;
}

.payment-card {
  display: grid;
  grid-column: 1 / -1;
  gap: 8px;
}

.payment-card > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.payment-card span {
  color: #8d9188;
  font-size: 9px;
}

.payment-card strong {
  font-size: 11px;
}

.note-box {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f5f2;
}

.note-box span {
  color: #8d9188;
  font-size: 8px;
}

.note-box p {
  margin: 4px 0 0;
  font-size: 10px;
}

.submit-error {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #efd0d0;
  border-radius: 9px;
  background: #fff3f3;
  color: #964d4d;
}

.submit-error strong {
  font-size: 11px;
}

.submit-error p {
  margin: 4px 0 0;
  font-size: 9px;
}

.modal-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 67px;
  padding: 11px 20px;
  border-top: 1px solid #dedfd9;
  background: #1a1b18;
}

.footer-info {
  min-width: 160px;
  display: grid;
  gap: 2px;
}

.footer-info span {
  color: #979b91;
  font-size: 8px;
}

.footer-info strong {
  color: #fff;
  font-size: 10px;
}

.primary-button,
.secondary-button {
  min-height: 39px;
  padding: 0 13px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}

.primary-button {
  margin-left: auto;
  border: 0;
  background: #fff;
  color: #1a1b18;
}

.secondary-button {
  border: 1px solid #d8dad3;
  background: #fff;
  color: #3a3d38;
}

.modal-footer
  .secondary-button {
  border-color: #41433e;
  background: transparent;
  color: #c0c3bb;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.success-view {
  padding: 28px;
  text-align: center;
}

.success-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #507459;
  color: #fff;
  font-size: 20px;
}

.success-view h2 {
  margin: 6px 0;
  font-size: 25px;
}

.success-view > p {
  margin: 0 0 20px;
  color: #82867d;
  font-size: 10px;
}

.success-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 8px;
  max-width: 720px;
  margin: 0 auto;
  text-align: left;
}

.success-grid > div {
  display: grid;
  gap: 3px;
  padding: 11px;
  border-radius: 8px;
  background: #f5f5f2;
}

.success-grid span,
.success-money span {
  color: #90948b;
  font-size: 8px;
}

.success-grid strong {
  font-size: 10px;
}

.success-money {
  max-width: 720px;
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 8px auto 0;
  text-align: left;
}

.success-money > div {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  background: #1a1b18;
  color: #fff;
}

.success-money strong {
  font-size: 11px;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
}

.success-actions
  .primary-button {
  margin-left: 0;
  background: #1a1b18;
  color: #fff;
}

/* ===== MODAL TYPOGRAPHY SCALE ===== */

.booking-modal {
  font-size: 14px;
}

/* Tiêu đề modal */
.modal-header h2 {
  font-size: 25px;
}

.modal-header p {
  font-size: 13px;
}

.eyebrow {
  font-size: 11px;
}

/* Thanh 4 bước */
.progress-step strong {
  font-size: 13px;
}

.progress-step small {
  font-size: 11px;
}

.progress-step > span {
  font-size: 11px;
}

/* Tiêu đề từng section */
.section-heading h3 {
  font-size: 18px;
}

.section-heading p {
  font-size: 12px;
}

.section-heading > span {
  font-size: 10px;
}

/* Service */
.service-copy strong {
  font-size: 14px;
}

.service-copy small {
  font-size: 11px;
}

.service-copy p {
  font-size: 12px;
  line-height: 1.55;
}

/* Gói dịch vụ */
.variant-heading strong {
  font-size: 14px;
}

.variant-heading small {
  font-size: 11px;
}

.variant-card > p {
  font-size: 12px;
  line-height: 1.55;
}

.variant-tags span {
  font-size: 10px;
}

.variant-price del {
  font-size: 11px;
}

.variant-price strong {
  font-size: 17px;
}

/* Form */
.field > span {
  font-size: 12px;
}

.field input,
.field textarea,
.coupon-input input {
  font-size: 13px;
}

/* Thông tin gói đang chọn */
.selected-package span {
  font-size: 10px;
}

.selected-package strong {
  font-size: 12px;
}

/* Khung giờ */
.slots-state strong {
  font-size: 14px;
}

.slots-state p {
  font-size: 12px;
}

.slot-button strong {
  font-size: 14px;
}

.slot-button span {
  font-size: 10px;
}

/* Coupon */
.coupon-heading strong {
  font-size: 13px;
}

.coupon-heading span {
  font-size: 11px;
}

.coupon-heading button,
.coupon-input button {
  font-size: 11px;
}

.coupon-message {
  font-size: 11px;
}

/* Tóm tắt */
.summary-card > span {
  font-size: 10px;
}

.summary-card h3 {
  font-size: 16px;
}

.summary-list span,
.summary-money span {
  font-size: 11px;
}

.summary-list strong,
.summary-money strong {
  font-size: 12px;
}

.total-line strong {
  font-size: 16px !important;
}

/* Xác nhận booking */
.confirm-title strong {
  font-size: 14px;
}

.confirm-title button {
  font-size: 11px;
}

.confirm-card dt {
  font-size: 11px;
}

.confirm-card dd {
  font-size: 12px;
}

.payment-card span {
  font-size: 11px;
}

.payment-card strong {
  font-size: 13px;
}

.note-box span {
  font-size: 10px;
}

.note-box p {
  font-size: 12px;
}

/* Error */
.submit-error strong {
  font-size: 13px;
}

.submit-error p {
  font-size: 11px;
}

/* Footer */
.footer-info span {
  font-size: 10px;
}

.footer-info strong {
  font-size: 12px;
}

.primary-button,
.secondary-button {
  font-size: 12px;
}

/* Màn tạo thành công */
.success-view h2 {
  font-size: 27px;
}

.success-view > p {
  font-size: 12px;
}

.success-grid span,
.success-money span {
  font-size: 10px;
}

.success-grid strong {
  font-size: 12px;
}

.success-money strong {
  font-size: 13px;
}

@media (max-width: 760px) {
  .modal-overlay {
    padding: 0;
  }

  .booking-modal {
    width: 100%;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }

  .progress,
  .variants-grid,
  .services-grid,
  .form-grid,
  .confirm-grid,
  .success-grid,
  .success-money {
    grid-template-columns: 1fr;
  }

  .progress {
    display: none;
  }

  .schedule-layout,
  .customer-layout {
    grid-template-columns: 1fr;
  }

  .slots-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .field.full,
  .payment-card {
    grid-column: auto;
  }
}
</style>