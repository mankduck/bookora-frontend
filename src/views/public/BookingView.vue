<template>
  <div class="booking-page">
    <div class="booking-container">
      <div
        v-if="!createdBooking"
        class="booking-heading"
      >
        <RouterLink
          to="/"
          class="back-link"
        >
          ← Trang chủ
        </RouterLink>

        <span class="eyebrow">
          ĐẶT LỊCH
        </span>

        <h1>
          Hoàn tất lịch hẹn của bạn.
        </h1>

        <p>
          Chọn dịch vụ, thời gian và cung cấp thông tin.
          Hệ thống sẽ kiểm tra lại mọi thứ trước khi tạo lịch.
        </p>
      </div>

      <div
        v-if="!createdBooking"
        class="booking-progress"
      >
        <div
          class="progress-item"
          :class="{ active: currentStep >= 1 }"
        >
          <span>1</span>
          <strong>Dịch vụ</strong>
        </div>

        <div
          class="progress-line"
          :class="{ active: currentStep >= 2 }"
        />

        <div
          class="progress-item"
          :class="{ active: currentStep >= 2 }"
        >
          <span>2</span>
          <strong>Thời gian</strong>
        </div>

        <div
          class="progress-line"
          :class="{ active: currentStep >= 3 }"
        />

        <div
          class="progress-item"
          :class="{ active: currentStep >= 3 }"
        >
          <span>3</span>
          <strong>Thông tin</strong>
        </div>

        <div
          class="progress-line"
          :class="{ active: currentStep >= 4 }"
        />

        <div
          class="progress-item"
          :class="{ active: currentStep >= 4 }"
        >
          <span>4</span>
          <strong>Xác nhận</strong>
        </div>
      </div>

      <!-- SUCCESS -->

      <section
        v-if="createdBooking"
        class="success-card"
      >
        <div class="success-icon">
          ✓
        </div>

        <span class="success-label">
          ĐẶT LỊCH THÀNH CÔNG
        </span>

        <h1>
          Yêu cầu của bạn đã được ghi nhận.
        </h1>

        <p class="success-description">
          Chúng tôi sẽ kiểm tra và xác nhận lịch hẹn của bạn.
          Vui lòng lưu lại mã booking bên dưới.
        </p>

        <div class="booking-code-box">
          <span>
            MÃ ĐẶT LỊCH
          </span>

          <strong>
            {{ createdBooking.booking_code }}
          </strong>
        </div>

        <div class="success-details">
          <div>
            <span>
              Dịch vụ
            </span>

            <strong>
              {{
                createdBooking.items[0]
                  ?.service_name
              }}
            </strong>
          </div>

          <div>
            <span>
              Gói dịch vụ
            </span>

            <strong>
              {{
                createdBooking.items[0]
                  ?.variant_name
              }}
            </strong>
          </div>

          <div>
            <span>
              Ngày
            </span>

            <strong>
              {{
                formatBackendDate(
                  createdBooking.start_at,
                )
              }}
            </strong>
          </div>

          <div>
            <span>
              Thời gian
            </span>

            <strong>
              {{
                formatBackendTime(
                  createdBooking.start_at,
                )
              }}
              -
              {{
                formatBackendTime(
                  createdBooking.end_at,
                )
              }}
            </strong>
          </div>

          <div>
            <span>
              Khách hàng
            </span>

            <strong>
              {{
                createdBooking.customer_name
              }}
            </strong>
          </div>

          <div>
            <span>
              Số điện thoại
            </span>

            <strong>
              {{
                createdBooking.customer_phone
              }}
            </strong>
          </div>
        </div>

        <div class="success-prices">
          <div>
            <span>
              Tạm tính
            </span>

            <strong>
              {{
                formatMoney(
                  createdBooking.subtotal,
                )
              }}
            </strong>
          </div>

          <div
            v-if="
              Number(
                createdBooking.discount,
              ) > 0
            "
          >
            <span>
              Giảm giá
            </span>

            <strong class="discount-text">
              -
              {{
                formatMoney(
                  createdBooking.discount,
                )
              }}
            </strong>
          </div>

          <div class="success-total">
            <span>
              Tổng cộng
            </span>

            <strong>
              {{
                formatMoney(
                  createdBooking.total,
                )
              }}
            </strong>
          </div>

          <div
            v-if="
              Number(
                createdBooking.deposit,
              ) > 0
            "
            class="success-deposit"
          >
            <span>
              Cần đặt cọc
            </span>

            <strong>
              {{
                formatMoney(
                  createdBooking.deposit,
                )
              }}
            </strong>
          </div>
        </div>

        <div class="success-status">
          <span class="status-dot" />

          <div>
            <strong>
              Đang chờ xác nhận
            </strong>

            <span>
              Booking đã được tạo nhưng chưa
              được nhân viên xác nhận.
            </span>
          </div>
        </div>

        <div class="success-actions">
          <RouterLink
            to="/"
            class="secondary-button"
          >
            Về trang chủ
          </RouterLink>

          <button
            type="button"
            class="primary-button"
            @click="startNewBooking"
          >
            Đặt lịch khác
            <span>→</span>
          </button>
        </div>
      </section>

      <!-- BOOKING CARD -->

      <section
        v-else
        class="booking-card"
      >
        <!-- STEP 1 -->

        <template v-if="currentStep === 1">
          <div class="card-section">
            <div class="section-title">
              <span>01</span>

              <div>
                <h2>
                  Chọn dịch vụ
                </h2>

                <p>
                  Chọn loại dịch vụ bạn đang quan tâm.
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
              v-else
              class="services-grid"
            >
              <button
                v-for="service in services"
                :key="service.id"
                type="button"
                class="service-option"
                :class="{
                  selected:
                    selectedService?.id ===
                    service.id,
                }"
                @click="
                  selectService(service)
                "
              >
                <div class="option-image">
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

                <div class="option-content">
                  <strong>
                    {{ service.name }}
                  </strong>

                  <span>
                    {{
                      service.category?.name ||
                      'Dịch vụ'
                    }}
                  </span>

                  <p>
                    {{
                      service.short_description ||
                      'Lựa chọn dịch vụ phù hợp với bạn.'
                    }}
                  </p>
                </div>

                <span class="check">
                  ✓
                </span>
              </button>
            </div>
          </div>

          <div
            v-if="selectedService"
            class="card-section variant-section"
          >
            <div class="section-title">
              <span>02</span>

              <div>
                <h2>
                  Chọn gói dịch vụ
                </h2>

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
              class="variant-grid"
            >
              <button
                v-for="
                  variant in
                  selectedService.variants
                "
                :key="variant.id"
                type="button"
                class="variant-option"
                :class="{
                  selected:
                    selectedVariant?.id ===
                    variant.id,
                }"
                @click="
                  selectVariant(variant)
                "
              >
                <div class="variant-header">
                  <div>
                    <strong>
                      {{ variant.name }}
                    </strong>

                    <span
                      v-if="variant.code"
                    >
                      {{ variant.code }}
                    </span>
                  </div>

                  <span class="radio">
                    <i />
                  </span>
                </div>

                <p>
                  {{
                    variant.description ||
                    'Gói dịch vụ phù hợp với nhu cầu của bạn.'
                  }}
                </p>

                <div class="variant-meta">
                  <span>
                    {{
                      variant.duration_minutes
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
                  <div>
                    <del
                      v-if="
                        variant.sale_price
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
                </div>
              </button>
            </div>
          </div>

          <div
            v-if="selectedVariant"
            class="booking-summary"
          >
            <div>
              <span>
                Dịch vụ đã chọn
              </span>

              <strong>
                {{ selectedService?.name }}
                ·
                {{ selectedVariant.name }}
              </strong>
            </div>

            <div class="summary-price">
              <span>
                Tổng dự kiến
              </span>

              <strong>
                {{
                  formatMoney(
                    selectedVariant.sale_price ??
                    selectedVariant.price,
                  )
                }}
              </strong>
            </div>

            <button
              type="button"
              class="continue-button"
              @click="goToTimeStep"
            >
              Tiếp tục chọn thời gian
              <span>→</span>
            </button>
          </div>
        </template>

        <!-- STEP 2 -->

        <template v-if="currentStep === 2">
          <div class="card-section">
            <div class="section-title">
              <span>03</span>

              <div>
                <h2>
                  Chọn ngày
                </h2>

                <p>
                  Hệ thống sẽ kiểm tra lịch làm việc
                  và các booking hiện có.
                </p>
              </div>
            </div>

            <div class="time-layout">
              <div class="date-panel">
                <label class="date-field">
                  <span>
                    Ngày đặt lịch
                  </span>

                  <input
                    v-model="selectedDate"
                    type="date"
                    :min="minDate"
                    @change="
                      handleDateChange
                    "
                  />
                </label>

                <div class="selected-info-card">
                  <span>Dịch vụ</span>

                  <strong>
                    {{ selectedService?.name }}
                  </strong>

                  <span>Gói</span>

                  <strong>
                    {{ selectedVariant?.name }}
                  </strong>

                  <span>Thời lượng</span>

                  <strong>
                    {{
                      selectedVariant
                        ?.duration_minutes
                    }}
                    phút
                  </strong>

                  <span>Giá dự kiến</span>

                  <strong>
                    {{
                      selectedVariant
                        ? formatMoney(
                            selectedVariant.sale_price ??
                            selectedVariant.price,
                          )
                        : ''
                    }}
                  </strong>
                </div>
              </div>

              <div class="slots-panel">
                <div class="slots-heading">
                  <div>
                    <strong>
                      Khung giờ còn trống
                    </strong>

                    <span
                      v-if="selectedDate"
                    >
                      {{
                        formatSelectedDate(
                          selectedDate,
                        )
                      }}
                    </span>

                    <span v-else>
                      Chọn ngày để xem lịch trống
                    </span>
                  </div>

                  <button
                    v-if="selectedDate"
                    type="button"
                    class="refresh-button"
                    :disabled="loadingSlots"
                    @click="loadSlots"
                  >
                    ↻
                  </button>
                </div>

                <div
                  v-if="!selectedDate"
                  class="slots-empty"
                >
                  <div class="slots-empty-icon">
                    ◷
                  </div>

                  <strong>
                    Chưa chọn ngày
                  </strong>

                  <p>
                    Chọn một ngày để xem các
                    khung giờ còn khả dụng.
                  </p>
                </div>

                <div
                  v-else-if="loadingSlots"
                  class="slots-empty"
                >
                  <div class="loader" />

                  <strong>
                    Đang kiểm tra lịch...
                  </strong>

                  <p>
                    Bookora đang tìm các
                    khung giờ còn khả dụng.
                  </p>
                </div>

                <div
                  v-else-if="
                    availabilityError
                  "
                  class="slots-empty error"
                >
                  <div class="slots-empty-icon">
                    !
                  </div>

                  <strong>
                    Không thể tải lịch
                  </strong>

                  <p>
                    {{ availabilityError }}
                  </p>

                  <button
                    type="button"
                    class="retry-button"
                    @click="loadSlots"
                  >
                    Thử lại
                  </button>
                </div>

                <div
                  v-else-if="
                    slots.length === 0
                  "
                  class="slots-empty"
                >
                  <div class="slots-empty-icon">
                    ×
                  </div>

                  <strong>
                    Không còn khung giờ
                  </strong>

                  <p>
                    Ngày này chưa có nhân viên phù hợp
                    hoặc toàn bộ lịch đã kín.
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
                        selectedSlot?.start_at ===
                        slot.start_at,
                    }"
                    @click="
                      selectedSlot = slot
                    "
                  >
                    <strong>
                      {{ slot.start_time }}
                    </strong>

                    <span>
                      đến {{ slot.end_time }}
                    </span>

                    <i>✓</i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="booking-summary">
            <button
              type="button"
              class="back-button"
              @click="
                currentStep = 1
              "
            >
              ← Quay lại
            </button>

            <div>
              <span>
                Thời gian đã chọn
              </span>

              <strong
                v-if="selectedSlot"
              >
                {{
                  formatSelectedDate(
                    selectedDate,
                  )
                }}
                ·
                {{
                  selectedSlot.start_time
                }}
              </strong>

              <strong v-else>
                Chưa chọn
              </strong>
            </div>

            <div class="summary-price">
              <span>Thời lượng</span>

              <strong>
                {{
                  selectedVariant
                    ?.duration_minutes
                }}
                phút
              </strong>
            </div>

            <button
              type="button"
              class="continue-button"
              :disabled="
                !selectedSlot
              "
              @click="
                goToCustomerStep
              "
            >
              Tiếp tục
              <span>→</span>
            </button>
          </div>
        </template>

        <!-- STEP 3 -->

        <template v-if="currentStep === 3">
          <div class="card-section">
            <div class="section-title">
              <span>04</span>

              <div>
                <h2>
                  Thông tin của bạn
                </h2>

                <p>
                  Dùng để liên hệ và xác nhận lịch.
                </p>
              </div>
            </div>

            <div class="customer-layout">
              <div class="customer-form">
                <div class="account-info-bar">
                  <div>
                    <span class="account-info-label">
                      THÔNG TIN TỪ TÀI KHOẢN
                    </span>

                    <strong>
                      {{ auth.user?.name }}
                    </strong>

                    <p>
                      Thông tin liên hệ được lấy từ tài khoản của bạn.
                      Bạn có thể chỉnh riêng cho lịch hẹn này nếu cần.
                    </p>
                  </div>

                  <button
                    v-if="!editingCustomerInfo"
                    type="button"
                    class="edit-customer-button"
                    @click="editCustomerInfo"
                  >
                    Sửa thông tin
                  </button>

                  <button
                    v-else
                    type="button"
                    class="cancel-customer-button"
                    @click="cancelCustomerInfoEdit"
                  >
                    Hủy chỉnh sửa
                  </button>
                </div>

                <div class="form-grid">
                  <label class="form-field full">
                    <span>
                      Họ và tên *
                    </span>

                    <input
                      v-model.trim="
                        customerForm.name
                      "
                      type="text"
                      maxlength="150"
                      :disabled="!editingCustomerInfo"
                      placeholder="Nguyễn Văn A"
                    />
                  </label>

                  <label class="form-field">
                    <span>
                      Số điện thoại *
                    </span>

                    <input
                      v-model.trim="
                        customerForm.phone
                      "
                      type="tel"
                      maxlength="20"
                      :disabled="!editingCustomerInfo"
                      placeholder="0901 234 567"
                    />
                  </label>

                  <label class="form-field">
                    <span>
                      Email
                    </span>

                    <input
                      v-model.trim="
                        customerForm.email
                      "
                      type="email"
                      maxlength="190"
                      :disabled="!editingCustomerInfo"
                      placeholder="email@example.com"
                    />
                  </label>

                  <label class="form-field full">
                    <span>
                      Ghi chú
                    </span>

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
                        Có thể bỏ qua nếu không có.
                      </span>
                    </div>

                    <button
                      v-if="appliedCoupon"
                      type="button"
                      class="remove-coupon"
                      @click="removeCoupon"
                    >
                      Bỏ mã
                    </button>
                  </div>

                  <div class="coupon-input-row">
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
                      @input="
                        handleCouponInput
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
                      @click="
                        applyCoupon
                      "
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
                        appliedCoupon,
                      error:
                        !appliedCoupon,
                    }"
                  >
                    {{ couponMessage }}
                  </p>
                </div>
              </div>

              <OrderSummary
                :service-name="
                  selectedService?.name || ''
                "
                :variant-name="
                  selectedVariant?.name || ''
                "
                :date="
                  formatSelectedDate(
                    selectedDate,
                  )
                "
                :start-time="
                  selectedSlot?.start_time || ''
                "
                :end-time="
                  selectedSlot?.end_time || ''
                "
                :duration="
                  selectedVariant
                    ?.duration_minutes || 0
                "
                :subtotal="subtotal"
                :discount="discount"
                :total="total"
                :deposit="
                  depositAmount
                "
              />
            </div>
          </div>

          <div class="booking-summary">
            <button
              type="button"
              class="back-button"
              @click="
                currentStep = 2
              "
            >
              ← Quay lại
            </button>

            <div>
              <span>
                Khách hàng
              </span>

              <strong>
                {{
                  customerForm.name ||
                  'Chưa nhập thông tin'
                }}
              </strong>
            </div>

            <div class="summary-price">
              <span>
                Tổng dự kiến
              </span>

              <strong>
                {{ formatMoney(total) }}
              </strong>
            </div>

            <button
              type="button"
              class="continue-button"
              :disabled="
                !canContinueCustomer
              "
              @click="
                goToConfirmation
              "
            >
              Kiểm tra thông tin
              <span>→</span>
            </button>
          </div>
        </template>

        <!-- STEP 4 -->

        <template v-if="currentStep === 4">
          <div class="card-section">
            <div class="section-title">
              <span>05</span>

              <div>
                <h2>
                  Xác nhận đặt lịch
                </h2>

                <p>
                  Kiểm tra thông tin lần cuối trước
                  khi gửi yêu cầu.
                </p>
              </div>
            </div>

            <div class="confirmation-layout">
              <div class="confirmation-main">
                <div class="confirm-block">
                  <div class="confirm-block-title">
                    <span>
                      DỊCH VỤ & THỜI GIAN
                    </span>

                    <button
                      type="button"
                      @click="
                        currentStep = 1
                      "
                    >
                      Chỉnh sửa
                    </button>
                  </div>

                  <div class="confirm-grid">
                    <div>
                      <span>
                        Dịch vụ
                      </span>

                      <strong>
                        {{
                          selectedService?.name
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Gói
                      </span>

                      <strong>
                        {{
                          selectedVariant?.name
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Ngày
                      </span>

                      <strong>
                        {{
                          formatSelectedDate(
                            selectedDate,
                          )
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Khung giờ
                      </span>

                      <strong>
                        {{
                          selectedSlot?.start_time
                        }}
                        -
                        {{
                          selectedSlot?.end_time
                        }}
                      </strong>
                    </div>
                  </div>
                </div>

                <div class="confirm-block">
                  <div class="confirm-block-title">
                    <span>
                      THÔNG TIN KHÁCH HÀNG
                    </span>

                    <button
                      type="button"
                      @click="
                        currentStep = 3
                      "
                    >
                      Chỉnh sửa
                    </button>
                  </div>

                  <div class="confirm-grid">
                    <div>
                      <span>
                        Họ tên
                      </span>

                      <strong>
                        {{
                          customerForm.name
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Điện thoại
                      </span>

                      <strong>
                        {{
                          customerForm.phone
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {{
                          customerForm.email ||
                          'Không cung cấp'
                        }}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Mã ưu đãi
                      </span>

                      <strong>
                        {{
                          appliedCoupon
                            ?.coupon.code ||
                          'Không sử dụng'
                        }}
                      </strong>
                    </div>
                  </div>

                  <div
                    v-if="
                      customerForm.notes
                    "
                    class="confirm-note"
                  >
                    <span>
                      Ghi chú
                    </span>

                    <p>
                      {{
                        customerForm.notes
                      }}
                    </p>
                  </div>
                </div>

                <div class="final-notice">
                  <span>i</span>

                  <p>
                    Sau khi gửi, hệ thống sẽ kiểm tra
                    lại giá, mã ưu đãi và tình trạng
                    khung giờ trên máy chủ. Booking
                    mới sẽ có trạng thái
                    <strong>đang chờ xác nhận</strong>.
                  </p>
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
              </div>

              <OrderSummary
                :service-name="
                  selectedService?.name || ''
                "
                :variant-name="
                  selectedVariant?.name || ''
                "
                :date="
                  formatSelectedDate(
                    selectedDate,
                  )
                "
                :start-time="
                  selectedSlot?.start_time || ''
                "
                :end-time="
                  selectedSlot?.end_time || ''
                "
                :duration="
                  selectedVariant
                    ?.duration_minutes || 0
                "
                :subtotal="subtotal"
                :discount="discount"
                :total="total"
                :deposit="
                  depositAmount
                "
              />
            </div>
          </div>

          <div class="booking-summary">
            <button
              type="button"
              class="back-button"
              :disabled="
                submittingBooking
              "
              @click="
                currentStep = 3
              "
            >
              ← Quay lại
            </button>

            <div>
              <span>
                Thanh toán
              </span>

              <strong>
                {{
                  depositAmount > 0
                    ? `Cọc dự kiến ${formatMoney(
                        depositAmount,
                      )}`
                    : 'Chưa yêu cầu thanh toán'
                }}
              </strong>
            </div>

            <div class="summary-price">
              <span>
                Tổng dự kiến
              </span>

              <strong>
                {{ formatMoney(total) }}
              </strong>
            </div>

            <button
              type="button"
              class="continue-button submit-button"
              :disabled="
                submittingBooking
              "
              @click="
                submitBooking
              "
            >
              <template
                v-if="
                  submittingBooking
                "
              >
                <span
                  class="button-loader"
                />
                Đang tạo lịch...
              </template>

              <template v-else>
                Xác nhận đặt lịch
                <span>→</span>
              </template>
            </button>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingView } from './BookingView.ts'

const {
  h,
  ref,
  RouterLink,
  OrderSummary,
  auth,
  editingCustomerInfo,
  currentStep,
  loadingServices,
  loadingSlots,
  checkingCoupon,
  submittingBooking,
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
  editCustomerInfo,
  cancelCustomerInfoEdit,
  minDate,
  subtotal,
  discount,
  total,
  depositAmount,
  canContinueCustomer,
  formatMoney,
  formatSelectedDate,
  formatBackendDate,
  formatBackendTime,
  getDepositText,
  selectService,
  selectVariant,
  goToTimeStep,
  goToCustomerStep,
  goToConfirmation,
  handleDateChange,
  loadSlots,
  handleCouponInput,
  applyCoupon,
  removeCoupon,
  submitBooking,
  startNewBooking,
} = useBookingView()
</script>

<style scoped src="./BookingView.css"></style>