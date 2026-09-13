<template>
  <div class="page">
    <header class="page-header">
      <div>
        <span class="eyebrow"> QUẢN LÝ LỊCH HẸN </span>

        <h1>Bookings</h1>

        <p>
          Theo dõi lịch hẹn, nhân viên phụ trách, tiền cọc và trạng thái thực
          hiện.
        </p>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="create-booking-button"
          @click="openCreateBooking"
        >
          <span>+</span>
          Tạo lịch hẹn
        </button>

        <div class="header-stats">
          <div>
            <span>Tổng</span>

            <strong>
              {{ pagination.total }}
            </strong>
          </div>

          <div>
            <span>Trang</span>

            <strong>
              {{ pagination.currentPage }}
              /
              {{ pagination.lastPage }}
            </strong>
          </div>
        </div>
      </div>
    </header>

    <section class="filters-card">
      <input
        v-model.trim="filters.search"
        type="search"
        placeholder="Mã booking, tên, SĐT..."
        @keyup.enter="applyFilters"
      />

      <select v-model="filters.status" @change="applyFilters">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="in_progress">Đang thực hiện</option>
        <option value="completed">Hoàn thành</option>
        <option value="cancelled">Đã huỷ</option>
        <option value="no_show">Không đến</option>
      </select>

      <select v-model="filters.payment_status" @change="applyFilters">
        <option value="">Tất cả thanh toán</option>
        <option value="unpaid">Chưa thanh toán</option>
        <option value="partially_paid">Thanh toán một phần</option>
        <option value="paid">Đã thanh toán</option>
        <option value="refunded">Đã hoàn tiền</option>
      </select>

      <input v-model="filters.date" type="date" @change="applyFilters" />

      <button type="button" class="secondary-button" @click="resetFilters">
        Đặt lại
      </button>
    </section>

    <section class="content-card">
      <div v-if="loading" class="state">Đang tải booking...</div>

      <div v-else-if="errorMessage" class="state error">
        <strong>Không thể tải booking</strong>
        <p>{{ errorMessage }}</p>
        <button type="button" @click="loadBookings">Thử lại</button>
      </div>

      <div v-else-if="bookings.length === 0" class="state">
        Chưa có booking phù hợp.
      </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Booking</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Thời gian</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Photo phụ trách</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>
                <div class="stack">
                  <strong>{{ booking.booking_code }}</strong>
                  <span>#{{ booking.id }}</span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>{{ booking.customer_name }}</strong>
                  <span>{{ booking.customer_phone }}</span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>
                    {{ booking.items[0]?.service_name || "—" }}
                  </strong>
                  <span>
                    {{ booking.items[0]?.variant_name || "Không có gói" }}
                  </span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>{{ formatDate(booking.start_at) }}</strong>
                  <span>
                    {{ formatTime(booking.start_at) }} –
                    {{ formatTime(booking.end_at) }}
                  </span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>
                    {{ formatMoney(booking.total_amount) }}
                  </strong>

                  <div class="payment-status-row">
                    <span
                      class="deposit-text payment-pill"
                      :class="`deposit-${getDepositStatus(booking)}`"
                    >
                      {{ getDepositLabel(booking) }}
                    </span>

                    <span
                      class="payment-text payment-pill"
                      :class="
                        booking.payment_status === 'paid'
                          ? 'payment-paid'
                          : 'payment-unpaid'
                      "
                    >
                      {{
                        booking.payment_status === "paid"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"
                      }}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="status-badge" :class="`status-${booking.status}`">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </td>

              <td>
                <div
                  v-if="getPrimaryStaffName(booking)"
                  class="primary-staff-cell"
                >
                  <strong>{{ getPrimaryStaffName(booking) }}</strong>
                  <span v-if="getAuxiliaryCount(booking) > 0">
                    +{{ getAuxiliaryCount(booking) }} hỗ trợ
                  </span>
                </div>

                <span v-else class="muted"> Chưa phân công </span>
              </td>

              <td>
                <button
                  type="button"
                  class="view-button"
                  @click="openBooking(booking.id)"
                >
                  Xem →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.lastPage > 1" class="pagination">
        <button
          type="button"
          :disabled="pagination.currentPage <= 1"
          @click="changePage(pagination.currentPage - 1)"
        >
          ←
        </button>

        <span>
          Trang {{ pagination.currentPage }}/{{ pagination.lastPage }}
        </span>

        <button
          type="button"
          :disabled="pagination.currentPage >= pagination.lastPage"
          @click="changePage(pagination.currentPage + 1)"
        >
          →
        </button>
      </div>
    </section>

    <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
      <aside class="drawer">
        <div class="drawer-header">
          <div>
            <span>BOOKING DETAIL</span>
            <h2>
              {{ selectedBooking?.booking_code || "Đang tải..." }}
            </h2>
          </div>

          <button type="button" class="close-button" @click="closeDetail">
            ×
          </button>
        </div>

        <div v-if="loadingDetail" class="state">Đang tải chi tiết...</div>

        <div v-else-if="selectedBooking" class="drawer-content">
          <section class="detail-status">
            <span
              class="status-badge"
              :class="`status-${selectedBooking.status}`"
            >
              {{ getStatusLabel(selectedBooking.status) }}
            </span>

            <select
              v-model="depositAdminStatus"
              class="deposit-status-select"
              :disabled="changingDepositStatus"
              @change="changeDepositStatus"
            >
              <option value="unpaid">Chưa cọc</option>
              <option value="paid">Đã cọc</option>
            </select>

            <select
              v-if="selectedBooking.status === 'in_progress'"
              class="payment-status-select"
              :class="{
                'payment-is-paid': selectedBooking.payment_status === 'paid',
              }"
              :value="
                selectedBooking.payment_status === 'paid' ? 'paid' : 'unpaid'
              "
              :disabled="markingPaid || changingStatus"
              @change="
                ($event) => {
                  const value = ($event.target as HTMLSelectElement).value;

                  if (value === 'paid') {
                    markPaid();
                  }
                }
              "
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>

            <span
              v-else-if="
                selectedBooking.status === 'completed' &&
                selectedBooking.payment_status === 'paid'
              "
              class="payment-done-badge"
            >
              Đã thanh toán
            </span>
          </section>

          <section class="detail-section">
            <h3>Khách hàng</h3>
            <div class="detail-grid">
              <div>
                <span>Họ tên</span>
                <strong>{{ selectedBooking.customer_name }}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{{ selectedBooking.customer_phone }}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{{
                  selectedBooking.customer_email || "Không có"
                }}</strong>
              </div>
              <div>
                <span>Nguồn</span>
                <strong>{{ selectedBooking.source || "—" }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <h3>Dịch vụ & lịch</h3>
            <div class="detail-grid">
              <div>
                <span>Dịch vụ</span>
                <strong>{{
                  selectedBooking.items[0]?.service_name || "—"
                }}</strong>
              </div>
              <div>
                <span>Gói</span>
                <strong>{{
                  selectedBooking.items[0]?.variant_name || "—"
                }}</strong>
              </div>
              <div>
                <span>Ngày</span>
                <strong>{{ formatDate(selectedBooking.start_at) }}</strong>
              </div>
              <div>
                <span>Thời gian</span>
                <strong>
                  {{ formatTime(selectedBooking.start_at) }} –
                  {{ formatTime(selectedBooking.end_at) }}
                </strong>
              </div>
            </div>
          </section>

          <section class="detail-section payment-section">
            <div class="section-title-row">
              <h3>Thanh toán & tiền cọc</h3>
              <span
                class="deposit-badge"
                :class="`deposit-${selectedDepositStatus}`"
              >
                {{ selectedDepositLabel }}
              </span>
            </div>

            <div class="price-list">
              <div>
                <span>Tạm tính</span>
                <strong>{{ formatMoney(selectedBooking.subtotal) }}</strong>
              </div>

              <div>
                <span>Giảm giá</span>
                <strong
                  :class="{
                    'discount-money': Number(selectedBooking.discount_amount) > 0,
                  }"
                >
                  {{
                    Number(selectedBooking.discount_amount) > 0
                      ? `-${formatMoney(selectedBooking.discount_amount)}`
                      : formatMoney(0)
                  }}
                </strong>
              </div>

              <div>
                <span>Mã giảm giá</span>
                <strong
                  v-if="selectedBooking.coupon"
                  class="coupon-code"
                  :title="selectedBooking.coupon.name"
                >
                  {{ selectedBooking.coupon.code }}
                </strong>
                <strong v-else class="muted-value">Không sử dụng</strong>
              </div>

              <div class="price-subtotal">
                <span>Tổng sau giảm</span>
                <strong>{{ formatMoney(selectedSummary.total_amount) }}</strong>
              </div>

              <div>
                <span>Cọc yêu cầu</span>
                <strong>{{
                  formatMoney(selectedSummary.deposit_amount)
                }}</strong>
              </div>
              <div>
                <span>Đã xác nhận</span>
                <strong class="paid-money">
                  {{ formatMoney(selectedSummary.approved_amount) }}
                </strong>
              </div>
              <div>
                <span>Cọc còn thiếu</span>
                <strong>{{
                  formatMoney(selectedSummary.deposit_remaining)
                }}</strong>
              </div>
              <div class="price-total">
                <span>Còn thanh toán</span>
                <strong>{{
                  formatMoney(selectedSummary.remaining_amount)
                }}</strong>
              </div>
            </div>

            <div
              v-if="selectedBooking.payment_proofs?.length"
              class="proof-list"
            >
              <article
                v-for="proof in selectedBooking.payment_proofs"
                :key="proof.id"
                class="proof-card"
                :class="{ 'manual-proof-card': proof.is_manual }"
              >
                <a
                  v-if="proof.image_url"
                  :href="proof.image_url"
                  target="_blank"
                  rel="noopener"
                >
                  <img :src="proof.image_url" alt="Ảnh chuyển khoản" />
                </a>

                <div v-else-if="proof.is_manual" class="manual-proof-icon">
                  <span>✓</span>
                  <strong>
                    {{ manualMethodLabel(proof.manual_method) }}
                  </strong>
                </div>

                <div class="proof-body">
                  <div class="proof-top">
                    <span class="proof-status" :class="`proof-${proof.status}`">
                      {{ proofLabel(proof.status) }}
                    </span>
                    <strong>{{ formatMoney(proof.amount) }}</strong>
                  </div>

                  <p v-if="proof.customer_note">
                    {{ proof.customer_note }}
                  </p>

                  <p v-if="proof.rejection_reason" class="rejection">
                    {{ proof.rejection_reason }}
                  </p>

                  <div v-if="proof.status === 'pending'" class="proof-actions">
                    <button
                      type="button"
                      class="approve-button"
                      :disabled="reviewingProofId === proof.id"
                      @click="approveProof(proof.id)"
                    >
                      Xác nhận đã nhận tiền
                    </button>

                    <button
                      type="button"
                      class="reject-button"
                      :disabled="reviewingProofId === proof.id"
                      @click="rejectProof(proof.id)"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="no-proof">
              Chưa có giao dịch hoặc ảnh chuyển khoản.
            </div>
          </section>

          <section class="operations-grid">
            <div class="operation-card">
              <div class="operation-heading">
                <span class="operation-number">01</span>
                <div>
                  <strong>Phân công Photo</strong>
                  <p>Chỉ có một nhân viên chính cho booking.</p>
                </div>
              </div>

              <div v-if="primaryAssignment" class="current-primary">
                <span>Đang phụ trách</span>
                <strong>
                  {{ primaryAssignment.staff?.user?.name || "Nhân viên" }}
                </strong>
                <small>
                  {{ primaryAssignment.staff?.position || "Photo" }}
                </small>
              </div>

              <div v-else class="operation-empty">Chưa có Photo chính.</div>

              <template v-if="canAssignStaff">
                <div v-if="loadingEligibleStaff" class="muted">
                  Đang kiểm tra nhân viên...
                </div>

                <div v-else-if="eligibleStaff.length === 0" class="muted">
                  Không có nhân viên khả dụng.
                </div>

                <div v-else class="assignment-controls">
                  <select v-model.number="selectedStaffId">
                    <option :value="null" disabled>Chọn nhân viên</option>
                    <option
                      v-for="staff in eligibleStaff"
                      :key="staff.id"
                      :value="staff.id"
                    >
                      {{ staff.user.name }} — {{ staff.position || "Photo" }}
                    </option>
                  </select>

                  <button
                    type="button"
                    class="confirm-booking-button"
                    :disabled="!selectedStaffId || assigningStaff"
                    @click="assignPrimaryStaff"
                  >
                    {{
                      assigningStaff
                        ? "Đang lưu..."
                        : primaryAssignment
                          ? "Đổi Photo"
                          : "Phân công"
                    }}
                  </button>
                </div>
              </template>

              <div v-else class="muted">
                Chỉ phân công khi đơn đã xác nhận hoặc đang thực hiện.
              </div>
            </div>

            <div class="operation-card">
              <div class="operation-heading">
                <span class="operation-number">02</span>
                <div>
                  <strong>Trạng thái đơn</strong>
                  <p>Admin điều khiển tiến trình thực hiện booking.</p>
                </div>
              </div>

              <div class="current-status-box">
                <span>Hiện tại</span>
                <strong>{{ getStatusLabel(selectedBooking.status) }}</strong>
              </div>

              <template v-if="statusOptions.length > 0">
                <select v-model="statusTarget" class="status-select">
                  <option value="" disabled>Chọn trạng thái mới</option>
                  <option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <textarea
                  v-if="statusTarget === 'cancelled'"
                  v-model.trim="statusReason"
                  rows="3"
                  maxlength="1000"
                  placeholder="Lý do huỷ booking"
                />

                <button
                  type="button"
                  class="status-update-button"
                  :disabled="!statusTarget || changingStatus"
                  @click="changeBookingStatus"
                >
                  {{
                    changingStatus ? "Đang cập nhật..." : "Cập nhật trạng thái"
                  }}
                </button>
              </template>

              <div v-else class="operation-empty">
                Trạng thái này đã kết thúc và không còn bước tiếp theo.
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>

    <AdminCreateBookingModal
      :open="showCreateBooking"
      @close="closeCreateBooking"
      @created="handleBookingCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { useBookingsView } from './BookingsView.ts'

const {
  ref,
  AdminCreateBookingModal,
  loading,
  loadingDetail,
  loadingEligibleStaff,
  assigningStaff,
  changingStatus,
  reviewingProofId,
  markingPaid,
  eligibleStaff,
  selectedStaffId,
  bookings,
  selectedBooking,
  showDetail,
  errorMessage,
  statusTarget,
  statusReason,
  showCreateBooking,
  depositAdminStatus,
  changingDepositStatus,
  filters,
  pagination,
  selectedSummary,
  selectedDepositStatus,
  selectedDepositLabel,
  primaryAssignment,
  canAssignStaff,
  statusOptions,
  getStatusLabel,
  proofLabel,
  manualMethodLabel,
  getDepositStatus,
  getDepositLabel,
  getPrimaryStaffName,
  getAuxiliaryCount,
  formatDate,
  formatTime,
  formatMoney,
  loadBookings,
  applyFilters,
  resetFilters,
  changePage,
  changeDepositStatus,
  markPaid,
  openBooking,
  approveProof,
  rejectProof,
  changeBookingStatus,
  assignPrimaryStaff,
  closeDetail,
  openCreateBooking,
  closeCreateBooking,
  handleBookingCreated,
} = useBookingsView()
</script>

<style scoped src="./BookingsView.css"></style>
