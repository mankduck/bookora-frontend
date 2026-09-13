<template>
  <section class="account-page">
    <div class="account-container">
      <div class="page-heading">
        <div>
          <span class="eyebrow">
            TÀI KHOẢN
          </span>

          <h1>
            Lịch hẹn của tôi
          </h1>

          <p>
            Theo dõi các lịch đang chờ,
            lịch sắp tới và lịch đã hoàn thành.
          </p>
        </div>

        <RouterLink
          to="/booking"
          class="primary-link"
        >
          + Đặt lịch mới
        </RouterLink>
      </div>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="{
            active:
              activeTab === tab.value,
          }"
          @click="
            activeTab = tab.value
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        v-if="loading"
        class="state"
      >
        Đang tải lịch hẹn...
      </div>

      <div
        v-else-if="errorMessage"
        class="state error"
      >
        <strong>
          Không thể tải lịch hẹn
        </strong>

        <span>
          {{ errorMessage }}
        </span>
      </div>

      <div
        v-else-if="
          filteredBookings.length === 0
        "
        class="empty-card"
      >
        <span class="empty-icon">
          ◷
        </span>

        <strong>
          Chưa có lịch hẹn
        </strong>

        <p>
          Những lịch phù hợp với bộ lọc
          hiện tại sẽ xuất hiện ở đây.
        </p>

        <RouterLink
          to="/booking"
          class="primary-link"
        >
          Đặt lịch ngay
        </RouterLink>
      </div>

      <div
        v-else
        class="booking-list"
      >
        <RouterLink
          v-for="
            booking in filteredBookings
          "
          :key="booking.id"
          :to="`/account/bookings/${booking.id}`"
          class="booking-card"
        >
          <div class="date-box">
            <strong>
              {{
                formatDay(
                  booking.start_at,
                )
              }}
            </strong>

            <span>
              {{
                formatMonth(
                  booking.start_at,
                )
              }}
            </span>
          </div>

          <div class="booking-main">
            <div class="booking-topline">
              <div>
                <span class="booking-code">
                  {{
                    booking.booking_code
                  }}
                </span>

                <h3>
                  {{
                    booking.items[0]
                      ?.service_name ||
                    'Dịch vụ'
                  }}
                </h3>

                <p>
                  {{
                    booking.items[0]
                      ?.variant_name ||
                    'Không có gói'
                  }}
                </p>
              </div>

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
            </div>

            <div class="booking-meta">
              <span>
                ◷
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
              </span>

              <span>
                {{
                  paymentLabel(
                    booking.payment_status,
                  )
                }}
              </span>

              <strong>
                {{
                  formatMoney(
                    booking.total_amount,
                  )
                }}
              </strong>
            </div>
          </div>

          <span class="arrow">
            →
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAccountBookingsView } from './AccountBookingsView.ts'

const {
  RouterLink,
  bookings,
  loading,
  errorMessage,
  activeTab,
  tabs,
  filteredBookings,
  formatDay,
  formatMonth,
  formatTime,
  formatMoney,
  statusLabel,
  paymentLabel,
} = useAccountBookingsView()
</script>

<style scoped src="./AccountBookingsView.css"></style>
