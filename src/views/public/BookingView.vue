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
import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
} from 'vue'

import {
  RouterLink,
  useRoute,
} from 'vue-router'

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

import bookingApi, {
  type CreatedBooking,
} from '@/services/booking.api'

import { useAuthStore } from '@/stores/auth'

/*
 * Component nhỏ dùng chung ở Step 3 & 4.
 */
const OrderSummary = defineComponent({
  props: {
    serviceName: {
      type: String,
      required: true,
    },

    variantName: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    deposit: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const money = (
      value: number,
    ) => {
      return new Intl.NumberFormat(
        'vi-VN',
        {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        },
      ).format(value)
    }

    const row = (
      label: string,
      value: string,
      className = '',
    ) =>
      h(
        'div',
        {
          class: className,
        },
        [
          h('span', label),
          h('strong', value),
        ],
      )

    return () =>
      h(
        'aside',
        {
          class: 'order-summary',
        },
        [
          h(
            'div',
            {
              class:
                'order-summary-heading',
            },
            [
              h(
                'span',
                'TÓM TẮT LỊCH HẸN',
              ),
              h(
                'strong',
                'Chi tiết đặt lịch',
              ),
            ],
          ),

          h(
            'div',
            {
              class:
                'appointment-summary',
            },
            [
              row(
                'Dịch vụ',
                props.serviceName,
              ),

              row(
                'Gói',
                props.variantName,
              ),

              row(
                'Ngày',
                props.date,
              ),

              row(
                'Thời gian',
                `${props.startTime} - ${props.endTime}`,
              ),

              row(
                'Thời lượng',
                `${props.duration} phút`,
              ),
            ],
          ),

          h(
            'div',
            {
              class: 'price-summary',
            },
            [
              row(
                'Tạm tính',
                money(
                  props.subtotal,
                ),
              ),

              props.discount > 0
                ? row(
                    'Giảm giá',
                    `- ${money(
                      props.discount,
                    )}`,
                    'discount-row',
                  )
                : null,

              row(
                'Tổng cộng',
                money(props.total),
                'total-row',
              ),

              props.deposit > 0
                ? row(
                    'Tiền cọc dự kiến',
                    money(
                      props.deposit,
                    ),
                    'deposit-row',
                  )
                : null,
            ],
          ),

          h(
            'div',
            {
              class: 'summary-note',
            },
            'Giá cuối cùng sẽ được backend kiểm tra lại khi tạo booking.',
          ),
        ],
      )
  },
})

const route = useRoute()
const auth = useAuthStore()

const editingCustomerInfo = ref(false)

const currentStep = ref(1)

const loadingServices =
  ref(false)

const loadingSlots =
  ref(false)

const checkingCoupon =
  ref(false)

const submittingBooking =
  ref(false)

const services =
  ref<PublicService[]>([])

const selectedService =
  ref<PublicService | null>(null)

const selectedVariant =
  ref<PublicServiceVariant | null>(
    null,
  )

const selectedDate =
  ref('')

const slots =
  ref<AvailabilitySlot[]>([])

const selectedSlot =
  ref<AvailabilitySlot | null>(
    null,
  )

const availabilityError =
  ref('')

const couponCode =
  ref('')

const couponMessage =
  ref('')

const appliedCoupon =
  ref<CouponResult | null>(null)

const submitError =
  ref('')

const createdBooking =
  ref<CreatedBooking | null>(
    null,
  )

const customerForm = ref({
  name: '',
  phone: '',
  email: '',
  notes: '',
})

const fillCustomerFromAccount = () => {
  if (!auth.user) {
    return
  }

  customerForm.value.name = auth.user.name || ''
  customerForm.value.phone = auth.user.phone || ''
  customerForm.value.email = auth.user.email || ''
}

const editCustomerInfo = () => {
  editingCustomerInfo.value = true
}

const cancelCustomerInfoEdit = () => {
  fillCustomerFromAccount()
  editingCustomerInfo.value = false
}

const minDate = computed(() => {
  const today = new Date()

  const year =
    today.getFullYear()

  const month =
    String(
      today.getMonth() + 1,
    ).padStart(2, '0')

  const day =
    String(
      today.getDate(),
    ).padStart(2, '0')

  return `${year}-${month}-${day}`
})

const subtotal = computed(() => {
  if (!selectedVariant.value) {
    return 0
  }

  return Number(
    selectedVariant.value.sale_price ??
    selectedVariant.value.price,
  )
})

const discount = computed(() => {
  return Number(
    appliedCoupon.value?.discount ??
    0,
  )
})

const total = computed(() => {
  return Math.max(
    0,
    subtotal.value -
    discount.value,
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
      'percent'
    ) {
      return (
        total.value *
        Number(
          variant.deposit_value,
        )
      ) / 100
    }

    return 0
  })

const canContinueCustomer =
  computed(() => {
    const hasName =
      customerForm.value.name
        .trim().length > 0

    const hasPhone =
      customerForm.value.phone
        .trim().length > 0

    const validEmail =
      !customerForm.value.email ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
          customerForm.value.email,
        )

    return (
      hasName &&
      hasPhone &&
      validEmail &&
      Boolean(
        selectedSlot.value,
      )
    )
  })

const formatMoney = (
  value: string | number,
) => {
  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    },
  ).format(
    Number(value),
  )
}

const formatSelectedDate = (
  date: string,
) => {
  if (!date) {
    return ''
  }

  const [
    year,
    month,
    day,
  ] = date.split('-')

  return `${day}/${month}/${year}`
}

const formatBackendDate = (
  value: string,
) => {
  const datePart =
    value.substring(0, 10)

  return formatSelectedDate(
    datePart,
  )
}

const formatBackendTime = (
  value: string,
) => {
  return value.substring(
    11,
    16,
  )
}

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
    'percent'
  ) {
    return `Cọc ${Number(
      variant.deposit_value,
    )}%`
  }

  return `Cọc ${formatMoney(
    variant.deposit_value,
  )}`
}

const selectService = (
  service: PublicService,
) => {
  if (
    selectedService.value?.id ===
    service.id
  ) {
    return
  }

  selectedService.value =
    service

  selectedVariant.value =
    null

  resetTimeSelection()
  removeCoupon()
}

const selectVariant = (
  variant: PublicServiceVariant,
) => {
  if (
    selectedVariant.value?.id ===
    variant.id
  ) {
    return
  }

  selectedVariant.value =
    variant

  resetTimeSelection()
  removeCoupon()
}

const resetTimeSelection = () => {
  selectedDate.value = ''
  slots.value = []
  selectedSlot.value = null

  availabilityError.value = ''
}

const goToTimeStep = () => {
  if (
    !selectedService.value ||
    !selectedVariant.value
  ) {
    return
  }

  currentStep.value = 2
  scrollTop()
}

const goToCustomerStep = () => {
  if (!selectedSlot.value) {
    return
  }

  currentStep.value = 3
  scrollTop()
}

const goToConfirmation = () => {
  if (
    !canContinueCustomer.value
  ) {
    return
  }

  submitError.value = ''
  currentStep.value = 4

  scrollTop()
}

const handleDateChange =
  async () => {
    selectedSlot.value = null

    await loadSlots()
  }

const loadSlots = async () => {
  if (
    !selectedVariant.value ||
    !selectedDate.value
  ) {
    return
  }

  loadingSlots.value = true
  availabilityError.value = ''

  slots.value = []
  selectedSlot.value = null

  try {
    const result =
      await availabilityApi.getSlots(
        selectedVariant.value.id,
        selectedDate.value,
      )

    slots.value =
      result.slots
  } catch (error) {
    if (
      axios.isAxiosError(error)
    ) {
      availabilityError.value =
        error.response
          ?.data?.message ||
        'Không thể kiểm tra lịch trống.'
    } else {
      availabilityError.value =
        'Có lỗi xảy ra khi kiểm tra lịch.'
    }
  } finally {
    loadingSlots.value = false
  }
}

const handleCouponInput = () => {
  if (!appliedCoupon.value) {
    couponMessage.value = ''
  }
}

const applyCoupon = async () => {
  if (
    !couponCode.value ||
    !selectedVariant.value
  ) {
    return
  }

  checkingCoupon.value = true
  couponMessage.value = ''

  try {
    const result =
      await couponApi.check(
        couponCode.value,
        selectedVariant.value.id,
      )

    appliedCoupon.value =
      result

    couponCode.value =
      result.coupon.code

    couponMessage.value =
      `Đã áp dụng mã ${result.coupon.code}.`
  } catch (error) {
    appliedCoupon.value = null

    if (
      axios.isAxiosError(error)
    ) {
      couponMessage.value =
        getAxiosErrorMessage(
          error,
          'Mã giảm giá không hợp lệ.',
        )
    } else {
      couponMessage.value =
        'Không thể kiểm tra mã giảm giá.'
    }
  } finally {
    checkingCoupon.value = false
  }
}

const removeCoupon = () => {
  couponCode.value = ''
  couponMessage.value = ''
  appliedCoupon.value = null
}

const submitBooking =
  async () => {
    if (
      submittingBooking.value ||
      !selectedVariant.value ||
      !selectedSlot.value ||
      !canContinueCustomer.value
    ) {
      return
    }

    submittingBooking.value = true
    submitError.value = ''

    try {
      const booking =
        await bookingApi.create({
          variant_id:
            selectedVariant.value.id,

          start_at:
            selectedSlot.value.start_at,

          customer_name:
            customerForm.value.name,

          customer_phone:
            customerForm.value.phone,

          customer_email:
            customerForm.value.email ||
            null,

          notes:
            customerForm.value.notes ||
            null,

          /*
           * Chỉ gửi coupon khi
           * đã được preview thành công.
           */
          coupon_code:
            appliedCoupon.value
              ? appliedCoupon.value
                  .coupon.code
              : null,
        })

      createdBooking.value =
        booking

      scrollTop()
    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        submitError.value =
          getAxiosErrorMessage(
            error,
            'Không thể tạo booking.',
          )

        /*
         * Nếu slot đã hết trong lúc
         * khách đang điền form.
         */
        const errors =
          error.response?.data
            ?.errors

        if (
          errors?.start_at
        ) {
          await handleSlotConflict()
        }

        return
      }

      submitError.value =
        'Có lỗi xảy ra khi tạo booking.'
    } finally {
      submittingBooking.value = false
    }
  }

const handleSlotConflict =
  async () => {
    currentStep.value = 2

    await loadSlots()

    availabilityError.value =
      'Khung giờ vừa chọn không còn khả dụng. Vui lòng chọn một khung giờ khác.'

    scrollTop()
  }

const getAxiosErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (
    !axios.isAxiosError(error)
  ) {
    return fallback
  }

  const response =
    error.response?.data

  if (
    response?.errors &&
    typeof response.errors ===
      'object'
  ) {
    const messages =
      Object.values(
        response.errors,
      ).flat()

    if (messages.length > 0) {
      return String(
        messages[0],
      )
    }
  }

  return (
    response?.message ||
    fallback
  )
}

const startNewBooking = () => {
  createdBooking.value = null

  currentStep.value = 1

  selectedService.value = null
  selectedVariant.value = null

  selectedDate.value = ''
  selectedSlot.value = null

  slots.value = []

  customerForm.value = {
    name: '',
    phone: '',
    email: '',
    notes: '',
  }

  fillCustomerFromAccount()
  editingCustomerInfo.value = false

  removeCoupon()

  submitError.value = ''
  availabilityError.value = ''

  scrollTop()
}

const scrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const loadServices = async () => {
  loadingServices.value = true

  try {
    services.value =
      await publicCatalogApi
        .getServices()

    const serviceSlug =
      route.query.service

    if (
      typeof serviceSlug ===
      'string'
    ) {
      const found =
        services.value.find(
          (service) =>
            service.slug ===
            serviceSlug,
        )

      if (found) {
        selectedService.value =
          found
      }
    }
  } finally {
    loadingServices.value = false
  }
}

onMounted(async () => {
  if (!auth.initialized) {
    try {
      await auth.fetchMe()
    } catch {
      // Route /booking đã được bảo vệ bởi auth guard.
      // Nếu session hết hạn, router/API sẽ xử lý đăng nhập lại.
    }
  }

  fillCustomerFromAccount()
  await loadServices()
})
</script>

<style scoped>
.booking-page {
  min-height: calc(100vh - 76px);
  padding: 65px 0 100px;
  background: #f4f4f1;
}

.booking-container {
  width: min(1030px, calc(100% - 40px));
  margin: 0 auto;
}

.booking-heading {
  max-width: 630px;
  margin-bottom: 35px;
}

.back-link {
  display: inline-block;
  margin-bottom: 36px;
  color: #7e8179;
  text-decoration: none;
  font-size: 10px;
}

.eyebrow {
  color: #91948c;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 2px;
}

.booking-heading h1 {
  margin: 10px 0 12px;
  font-size: 41px;
  letter-spacing: -2px;
}

.booking-heading p {
  max-width: 540px;
  margin: 0;
  color: #83867e;
  font-size: 11px;
  line-height: 1.7;
}

.booking-progress {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #a3a69f;
}

.progress-item span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 1px solid #d7d9d3;
  border-radius: 50%;
  font-size: 8px;
}

.progress-item strong {
  white-space: nowrap;
  font-size: 9px;
}

.progress-item.active {
  color: #181916;
}

.progress-item.active span {
  border-color: #181916;
  background: #181916;
  color: #fff;
}

.progress-line {
  width: 55px;
  height: 1px;
  margin: 0 10px;
  background: #dadbd6;
}

.progress-line.active {
  background: #181916;
}

.booking-card {
  overflow: hidden;
  border: 1px solid #e1e2dd;
  border-radius: 20px;
  background: #fff;
}

.card-section {
  padding: 27px;
}

.card-section + .card-section {
  border-top: 1px solid #ebebe7;
}

.section-title {
  display: flex;
  gap: 13px;
  margin-bottom: 20px;
}

.section-title > span {
  width: 29px;
  height: 29px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #181916;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
}

.section-title h2 {
  margin: 0;
  font-size: 14px;
}

.section-title p {
  margin: 4px 0 0;
  color: #969991;
  font-size: 9px;
}

.services-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.service-option {
  position: relative;
  display: flex;
  gap: 13px;
  padding: 13px;
  border: 1px solid #e3e4df;
  border-radius: 13px;
  background: #fff;
  text-align: left;
  transition: 0.2s ease;
}

.service-option:hover {
  border-color: #bcbeb7;
}

.service-option.selected {
  border-color: #181916;
  box-shadow:
    inset 0 0 0 1px #181916;
}

.option-image {
  flex: 0 0 auto;
  width: 74px;
  height: 74px;
  overflow: hidden;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #ebebe7;
}

.option-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.option-image span {
  color: #a1a49c;
  font-size: 26px;
  font-weight: 750;
}

.option-content {
  min-width: 0;
  display: grid;
  align-content: center;
}

.option-content strong {
  font-size: 11px;
}

.option-content > span {
  margin-top: 2px;
  color: #999c94;
  font-size: 8px;
}

.option-content p {
  margin: 7px 25px 0 0;
  color: #858880;
  font-size: 8px;
  line-height: 1.45;
}

.check {
  position: absolute;
  top: 11px;
  right: 11px;
  width: 20px;
  height: 20px;
  display: none;
  place-items: center;
  border-radius: 50%;
  background: #181916;
  color: #fff;
  font-size: 8px;
}

.service-option.selected .check {
  display: grid;
}

.variant-section {
  background: #fbfbf9;
}

.variant-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.variant-option {
  display: grid;
  padding: 17px;
  border: 1px solid #e2e3de;
  border-radius: 13px;
  background: #fff;
  text-align: left;
  transition: 0.2s ease;
}

.variant-option:hover {
  border-color: #bbbdb6;
}

.variant-option.selected {
  border-color: #181916;
  box-shadow:
    inset 0 0 0 1px #181916;
}

.variant-header {
  display: flex;
  justify-content: space-between;
}

.variant-header > div {
  display: grid;
  gap: 3px;
}

.variant-header strong {
  font-size: 12px;
}

.variant-header div span {
  color: #a0a39b;
  font-size: 7px;
}

.radio {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border: 1px solid #d6d8d2;
  border-radius: 50%;
}

.radio i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.variant-option.selected .radio {
  border-color: #181916;
}

.variant-option.selected .radio i {
  background: #181916;
}

.variant-option > p {
  min-height: 42px;
  margin: 13px 0;
  color: #858880;
  font-size: 8px;
  line-height: 1.55;
}

.variant-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
}

.variant-meta span {
  padding: 5px 7px;
  border-radius: 6px;
  background: #f2f2ef;
  color: #73766e;
  font-size: 7px;
}

.variant-price {
  margin-top: auto;
  padding-top: 13px;
  border-top: 1px solid #eeeeea;
}

.variant-price div {
  display: grid;
  gap: 2px;
}

.variant-price del {
  color: #a7aaa2;
  font-size: 8px;
}

.variant-price strong {
  font-size: 14px;
}

.booking-summary {
  display: grid;
  grid-template-columns:
    auto 1fr auto auto;
  align-items: center;
  gap: 25px;
  padding: 19px 27px;
  background: #181916;
  color: #fff;
}

.booking-summary > div {
  display: grid;
  gap: 3px;
}

.booking-summary span {
  color: #898d84;
  font-size: 8px;
}

.booking-summary strong {
  font-size: 11px;
}

.summary-price {
  text-align: right;
}

.continue-button,
.back-button {
  height: 43px;
  border-radius: 9px;
  padding: 0 15px;
  font-size: 9px;
  font-weight: 700;
}

.continue-button {
  border: 0;
  background: #fff;
  color: #181916;
}

.back-button {
  border: 1px solid #383a35;
  background: transparent;
  color: #b6b9b1;
}

.continue-button:disabled,
.back-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.state {
  padding: 70px 0;
  color: #90938b;
  text-align: center;
  font-size: 10px;
}

.state.small {
  padding: 30px 0;
}

/* TIME */

.time-layout {
  display: grid;
  grid-template-columns:
    260px minmax(0, 1fr);
  gap: 28px;
}

.date-panel {
  display: grid;
  align-content: start;
  gap: 14px;
}

.date-field {
  display: grid;
  gap: 7px;
}

.date-field span {
  font-size: 9px;
  font-weight: 700;
}

.date-field input {
  height: 45px;
  padding: 0 12px;
  border: 1px solid #dedfd9;
  border-radius: 10px;
  background: #fafaf8;
}

.selected-info-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 15px;
  border-radius: 12px;
  background: #f2f2ef;
}

.selected-info-card span {
  color: #8b8e86;
  font-size: 8px;
}

.selected-info-card strong {
  text-align: right;
  font-size: 8px;
}

.slots-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.slots-heading > div {
  display: grid;
  gap: 4px;
}

.slots-heading strong {
  font-size: 11px;
}

.slots-heading span {
  color: #93968e;
  font-size: 8px;
}

.refresh-button {
  width: 31px;
  height: 31px;
  border: 1px solid #e0e1dc;
  border-radius: 8px;
  background: #fff;
}

.slots-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.slot-button {
  position: relative;
  min-height: 64px;
  display: grid;
  place-content: center;
  gap: 3px;
  border: 1px solid #e1e2dd;
  border-radius: 10px;
  background: #fff;
}

.slot-button strong {
  font-size: 11px;
}

.slot-button span {
  color: #999c94;
  font-size: 7px;
}

.slot-button i {
  display: none;
}

.slot-button.selected {
  background: #181916;
  color: #fff;
}

.slot-button.selected i {
  position: absolute;
  top: 7px;
  right: 7px;
  display: block;
  color: #fff;
  font-size: 8px;
}

.slots-empty {
  min-height: 240px;
  display: grid;
  place-content: center;
  justify-items: center;
  padding: 30px;
  border: 1px dashed #dcded8;
  border-radius: 12px;
  background: #fafaf8;
  text-align: center;
}

.slots-empty-icon {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
  border-radius: 10px;
  background: #e9eae5;
}

.slots-empty p {
  max-width: 270px;
  color: #999c94;
  font-size: 8px;
}

.retry-button {
  margin-top: 10px;
}

.loader,
.button-loader {
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loader {
  width: 25px;
  height: 25px;
  border: 2px solid #dedfd9;
  border-top-color: #181916;
}

.button-loader {
  width: 12px;
  height: 12px;
  display: inline-block;
  border: 2px solid #ddd;
  border-top-color: #181916;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* CUSTOMER */

.customer-layout,
.confirmation-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) 310px;
  gap: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  display: grid;
  gap: 7px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field span {
  font-size: 9px;
  font-weight: 700;
}

.form-field input,
.form-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dedfd9;
  border-radius: 10px;
  background: #fafaf8;
  outline: none;
  font: inherit;
  font-size: 10px;
}

.form-field input {
  height: 44px;
  padding: 0 12px;
}

.form-field textarea {
  padding: 12px;
  resize: vertical;
}


.account-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding: 16px 18px;
  border: 1px solid #e1e2dd;
  border-radius: 12px;
  background: #f8f8f5;
}

.account-info-bar > div {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.account-info-label {
  color: #969991;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.2px;
}

.account-info-bar strong {
  font-size: 13px;
}

.account-info-bar p {
  margin: 0;
  color: #858880;
  font-size: 10px;
  line-height: 1.55;
}

.edit-customer-button,
.cancel-customer-button {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.edit-customer-button {
  border: 0;
  background: #181916;
  color: #fff;
}

.cancel-customer-button {
  border: 1px solid #d8d9d4;
  background: #fff;
  color: #555850;
}

.form-field input:disabled {
  border-color: #e5e6e1;
  background: #f1f1ee;
  color: #5f625b;
  cursor: not-allowed;
  opacity: 1;
}

.coupon-box {
  margin-top: 22px;
  padding: 16px;
  border: 1px solid #e4e5e0;
  border-radius: 12px;
  background: #f8f8f5;
}

.coupon-heading {
  display: flex;
  justify-content: space-between;
}

.coupon-heading > div {
  display: grid;
  gap: 3px;
}

.coupon-heading strong {
  font-size: 10px;
}

.coupon-heading span {
  color: #969991;
  font-size: 8px;
}

.remove-coupon {
  border: 0;
  background: transparent;
  color: #9b5555;
  font-size: 8px;
}

.coupon-input-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-top: 12px;
}

.coupon-input-row input {
  height: 41px;
  padding: 0 12px;
  border: 1px solid #dedfd9;
  border-radius: 9px;
  text-transform: uppercase;
}

.coupon-input-row button {
  min-width: 90px;
  border: 0;
  border-radius: 9px;
  background: #181916;
  color: #fff;
  font-size: 8px;
}

.coupon-message {
  margin: 9px 0 0;
  font-size: 8px;
}

.coupon-message.success {
  color: #537354;
}

.coupon-message.error {
  color: #a74d4d;
}

/* ORDER SUMMARY */

:deep(.order-summary) {
  overflow: hidden;
  align-self: start;
  border: 1px solid #e2e3de;
  border-radius: 14px;
  background: #fafaf8;
}

:deep(.order-summary-heading) {
  display: grid;
  gap: 5px;
  padding: 17px;
  border-bottom: 1px solid #e5e6e1;
}

:deep(.order-summary-heading span) {
  color: #9a9d95;
  font-size: 7px;
  letter-spacing: 1.4px;
}

:deep(.order-summary-heading strong) {
  font-size: 12px;
}

:deep(.appointment-summary),
:deep(.price-summary) {
  display: grid;
  gap: 10px;
  padding: 17px;
}

:deep(.appointment-summary) {
  border-bottom: 1px solid #e5e6e1;
}

:deep(.appointment-summary > div),
:deep(.price-summary > div) {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

:deep(.appointment-summary span),
:deep(.price-summary span) {
  color: #8d9088;
  font-size: 8px;
}

:deep(.appointment-summary strong),
:deep(.price-summary strong) {
  text-align: right;
  font-size: 8px;
}

:deep(.discount-row strong) {
  color: #587659;
}

:deep(.total-row) {
  padding-top: 11px;
  border-top: 1px solid #dedfd9;
}

:deep(.total-row strong) {
  font-size: 14px;
}

:deep(.deposit-row) {
  padding: 9px;
  border-radius: 8px;
  background: #ededE8;
}

:deep(.summary-note) {
  padding: 13px 17px;
  border-top: 1px solid #e5e6e1;
  color: #989b93;
  font-size: 7px;
  line-height: 1.55;
}

/* CONFIRMATION */

.confirmation-main {
  display: grid;
  gap: 13px;
}

.confirm-block {
  padding: 18px;
  border: 1px solid #e4e5e0;
  border-radius: 13px;
}

.confirm-block-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 17px;
}

.confirm-block-title span {
  color: #92958d;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 1px;
}

.confirm-block-title button {
  border: 0;
  background: transparent;
  color: #555850;
  font-size: 8px;
  text-decoration: underline;
}

.confirm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17px;
}

.confirm-grid > div {
  display: grid;
  gap: 4px;
}

.confirm-grid span,
.confirm-note span {
  color: #969991;
  font-size: 8px;
}

.confirm-grid strong {
  font-size: 10px;
}

.confirm-note {
  margin-top: 17px;
  padding-top: 14px;
  border-top: 1px solid #ecece8;
}

.confirm-note p {
  margin: 5px 0 0;
  font-size: 9px;
  line-height: 1.6;
}

.final-notice {
  display: flex;
  gap: 11px;
  padding: 14px;
  border-radius: 11px;
  background: #f0f1ed;
}

.final-notice > span {
  flex: 0 0 auto;
  width: 21px;
  height: 21px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #181916;
  color: #fff;
  font-size: 8px;
}

.final-notice p {
  margin: 2px 0 0;
  color: #72756d;
  font-size: 8px;
  line-height: 1.6;
}

.submit-error {
  padding: 14px;
  border: 1px solid #efd4d4;
  border-radius: 11px;
  background: #fff7f7;
}

.submit-error strong {
  color: #9b4848;
  font-size: 9px;
}

.submit-error p {
  margin: 5px 0 0;
  color: #a76666;
  font-size: 8px;
}

/* SUCCESS */

.success-card {
  width: min(700px, 100%);
  margin: 25px auto 0;
  padding: 55px;
  box-sizing: border-box;
  border: 1px solid #e0e1dc;
  border-radius: 24px;
  background: #fff;
  text-align: center;
}

.success-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #181916;
  color: #fff;
  font-size: 19px;
}

.success-label {
  color: #7f827a;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 1.7px;
}

.success-card h1 {
  margin: 12px 0;
  font-size: 31px;
  letter-spacing: -1.4px;
}

.success-description {
  max-width: 470px;
  margin: 0 auto;
  color: #858880;
  font-size: 10px;
  line-height: 1.7;
}

.booking-code-box {
  width: min(380px, 100%);
  margin: 28px auto;
  padding: 17px;
  border: 1px dashed #bfc1ba;
  border-radius: 13px;
  background: #f5f5f2;
}

.booking-code-box span {
  display: block;
  margin-bottom: 6px;
  color: #92958d;
  font-size: 7px;
  letter-spacing: 1.3px;
}

.booking-code-box strong {
  font-size: 21px;
  letter-spacing: 1px;
}

.success-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  overflow: hidden;
  border: 1px solid #e5e6e1;
  border-radius: 13px;
  background: #e5e6e1;
  text-align: left;
}

.success-details > div {
  display: grid;
  gap: 5px;
  padding: 14px;
  background: #fff;
}

.success-details span,
.success-prices span {
  color: #92958d;
  font-size: 8px;
}

.success-details strong {
  font-size: 10px;
}

.success-prices {
  display: grid;
  gap: 10px;
  margin-top: 14px;
  padding: 17px;
  border-radius: 13px;
  background: #f5f5f2;
  text-align: left;
}

.success-prices > div {
  display: flex;
  justify-content: space-between;
}

.success-prices strong {
  font-size: 9px;
}

.success-prices .success-total {
  margin-top: 3px;
  padding-top: 11px;
  border-top: 1px solid #dadbd6;
}

.success-total strong {
  font-size: 15px;
}

.discount-text {
  color: #587659;
}

.success-deposit {
  padding: 9px;
  border-radius: 8px;
  background: #e9eae5;
}

.success-status {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 14px;
  padding: 14px;
  border: 1px solid #e4e5e0;
  border-radius: 12px;
  text-align: left;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #b68d3c;
}

.success-status div {
  display: grid;
  gap: 3px;
}

.success-status strong {
  font-size: 9px;
}

.success-status span {
  color: #92958d;
  font-size: 8px;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 9px;
  margin-top: 24px;
}

.primary-button,
.secondary-button {
  height: 43px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 0 16px;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 700;
  text-decoration: none;
}

.primary-button {
  border: 0;
  background: #181916;
  color: #fff;
}

.secondary-button {
  border: 1px solid #dedfd9;
  background: #fff;
  color: #555850;
}

@media (max-width: 850px) {
  .time-layout,
  .customer-layout,
  .confirmation-layout {
    grid-template-columns: 1fr;
  }

  .variant-grid {
    grid-template-columns: 1fr;
  }

  .slots-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

  .booking-summary {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-price {
    text-align: left;
  }
}

@media (max-width: 650px) {
  .booking-heading h1 {
    font-size: 34px;
  }

  .booking-progress {
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .services-grid,
  .form-grid,
  .confirm-grid,
  .success-details {
    grid-template-columns: 1fr;
  }

  .form-field.full {
    grid-column: auto;
  }

  .progress-line {
    width: 25px;
  }

  .slots-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .card-section {
    padding: 20px;
  }

  .success-card {
    padding: 35px 20px;
  }

  .success-actions {
    flex-direction: column;
  }

  .account-info-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .edit-customer-button,
  .cancel-customer-button {
    width: 100%;
  }
}
</style>