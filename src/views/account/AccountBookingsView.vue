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
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  RouterLink,
} from 'vue-router'

import axios from 'axios'

import customerBookingApi, {
  type CustomerBooking,
} from '@/services/customerBooking.api'

const bookings =
  ref<CustomerBooking[]>([])

const loading = ref(false)
const errorMessage = ref('')

const activeTab =
  ref('upcoming')

const tabs = [
  {
    label: 'Sắp tới',
    value: 'upcoming',
  },
  {
    label: 'Chờ xác nhận',
    value: 'pending',
  },
  {
    label: 'Đã hoàn thành',
    value: 'completed',
  },
  {
    label: 'Đã huỷ',
    value: 'cancelled',
  },
  {
    label: 'Tất cả',
    value: 'all',
  },
]

const filteredBookings =
  computed(() => {
    if (
      activeTab.value === 'all'
    ) {
      return bookings.value
    }

    if (
      activeTab.value === 'upcoming'
    ) {
      return bookings.value.filter(
        (booking) =>
          [
            'confirmed',
            'in_progress',
          ].includes(
            booking.status,
          ),
      )
    }

    return bookings.value.filter(
      (booking) =>
        booking.status ===
        activeTab.value,
    )
  })

const loadBookings = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result =
      await customerBookingApi
        .getAll({
          per_page: 50,
        })

    bookings.value =
      result.data
  } catch (error) {
    if (
      axios.isAxiosError(error)
    ) {
      errorMessage.value =
        error.response?.data
          ?.message ||
        'Không thể tải lịch hẹn.'
    } else {
      errorMessage.value =
        'Có lỗi xảy ra.'
    }
  } finally {
    loading.value = false
  }
}

const parseDate = (
  value: string,
) =>
  new Date(
    value.replace(' ', 'T'),
  )

const formatDay = (
  value: string,
) =>
  String(
    parseDate(value)
      .getDate(),
  ).padStart(2, '0')

const formatMonth = (
  value: string,
) =>
  `TH${String(
    parseDate(value)
      .getMonth() + 1,
  ).padStart(2, '0')}`

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

const paymentLabel = (
  value: string,
) => {
  const labels:
    Record<string, string> = {
      unpaid: 'Chưa thanh toán',
      partially_paid:
        'Đã thanh toán một phần',
      paid: 'Đã thanh toán',
      refunded: 'Đã hoàn tiền',
    }

  return labels[value] || value
}

onMounted(
  loadBookings,
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
      980px,
      calc(100% - 40px)
    );
  margin: 0 auto;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 30px;
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

.primary-link {
  min-height: 41px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-radius: 10px;
  background: #181916;
  color: #fff;
  text-decoration: none;
  font-size: 10px;
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 17px;
  padding: 5px;
  border: 1px solid #e1e2dc;
  border-radius: 12px;
  background: #fff;
}

.tabs button {
  flex: 1;
  height: 37px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #8e9189;
  font: inherit;
  font-size: 9px;
  font-weight: 650;
}

.tabs button.active {
  background: #181916;
  color: #fff;
}

.booking-list {
  display: grid;
  gap: 10px;
}

.booking-card {
  display: grid;
  grid-template-columns:
    62px 1fr auto;
  align-items: center;
  gap: 17px;
  padding: 17px;
  border: 1px solid #e2e3dd;
  border-radius: 15px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.16s,
    border-color 0.16s;
}

.booking-card:hover {
  transform:
    translateY(-1px);
  border-color: #bfc1ba;
}

.date-box {
  height: 62px;
  display: grid;
  place-content: center;
  justify-items: center;
  border-radius: 12px;
  background: #181916;
  color: #fff;
}

.date-box strong {
  font-size: 19px;
}

.date-box span {
  color: #aeb1a8;
  font-size: 7px;
  font-weight: 700;
}

.booking-main {
  min-width: 0;
}

.booking-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.booking-code {
  color: #9a9d95;
  font-size: 7px;
  font-weight: 750;
  letter-spacing: 0.8px;
}

.booking-topline h3 {
  margin: 4px 0 3px;
  font-size: 13px;
}

.booking-topline p {
  margin: 0;
  color: #92958d;
  font-size: 9px;
}

.booking-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 13px;
  color: #858981;
  font-size: 8px;
}

.booking-meta strong {
  margin-left: auto;
  color: #181916;
  font-size: 10px;
}

.status-badge {
  flex: 0 0 auto;
  padding: 6px 8px;
  border-radius: 999px;
  background: #f0f0ec;
  color: #73766f;
  font-size: 7px;
  font-weight: 750;
}

.status-pending {
  background: #fff5dc;
  color: #9b7715;
}

.status-confirmed {
  background: #e9f4eb;
  color: #4e7958;
}

.status-in_progress {
  background: #e9eff8;
  color: #4e6789;
}

.status-completed {
  background: #edf0ec;
  color: #586157;
}

.status-cancelled,
.status-no_show {
  background: #f8eaea;
  color: #9b5252;
}

.arrow {
  color: #969991;
  font-size: 17px;
}

.state,
.empty-card {
  min-height: 260px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 7px;
  border: 1px solid #e2e3dd;
  border-radius: 15px;
  background: #fff;
  color: #8f928a;
  font-size: 10px;
}

.state.error {
  color: #a24e4e;
}

.empty-card p {
  margin: 0 0 10px;
  color: #989b93;
  font-size: 9px;
}

.empty-icon {
  font-size: 23px;
}

@media (max-width: 700px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .tabs {
    overflow-x: auto;
  }

  .tabs button {
    min-width: 105px;
  }

  .booking-card {
    grid-template-columns:
      55px 1fr;
  }

  .arrow {
    display: none;
  }

  .booking-topline {
    flex-direction: column;
  }

  .booking-meta {
    flex-wrap: wrap;
  }

  .booking-meta strong {
    width: 100%;
    margin-left: 0;
  }
}
</style>
