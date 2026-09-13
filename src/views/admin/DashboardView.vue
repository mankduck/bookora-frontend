<template>
  <section>
    <div class="dashboard-welcome">
      <div><span class="eyebrow">Tổng quan hôm nay</span><h2>Xin chào, {{ auth.user?.name }}</h2><p>Dữ liệu hoạt động thực tế của Bookora.</p></div>
      <button type="button" class="primary-button" @click="goBookings">+ Tạo lịch đặt</button>
    </div>

    <div v-if="error" class="state error"><strong>Không thể tải dashboard</strong><p>{{ error }}</p><button @click="load">Thử lại</button></div>
    <template v-else>
      <div class="stats-grid">
        <article class="stat-card"><div class="stat-heading"><span>Lịch đặt hôm nay</span><div class="stat-icon">◫</div></div><strong>{{ data.stats.today_bookings }}</strong><p>Lịch thực hiện trong ngày</p></article>
        <article class="stat-card"><div class="stat-heading"><span>Chờ xác nhận</span><div class="stat-icon">◷</div></div><strong>{{ data.stats.pending_bookings }}</strong><p>Booking đang pending</p></article>
        <article class="stat-card"><div class="stat-heading"><span>Khách hàng</span><div class="stat-icon">♧</div></div><strong>{{ data.stats.customers }}</strong><p>Tổng khách hàng</p></article>
        <article class="stat-card"><div class="stat-heading"><span>Doanh thu</span><div class="stat-icon">◈</div></div><strong>{{ formatMoney(data.stats.today_revenue) }}</strong><p>Tiền đã xác nhận hôm nay</p></article>
      </div>

      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-heading"><div><h3>Lịch đặt gần đây</h3><p>Các booking mới nhất trong hệ thống</p></div><button type="button" class="text-button" @click="goBookings">Xem tất cả</button></div>
          <div v-if="loading" class="empty-state">Đang tải...</div>
          <div v-else-if="!data.recent_bookings.length" class="empty-state"><div class="empty-icon">◫</div><strong>Chưa có lịch đặt</strong><p>Booking mới sẽ xuất hiện tại đây.</p></div>
          <div v-else class="dashboard-bookings">
            <button v-for="booking in data.recent_bookings" :key="booking.id" class="dashboard-booking-row" @click="openBooking(booking.id)">
              <div><strong>{{ booking.booking_code }}</strong><span>{{ booking.customer_name }} · {{ booking.items?.[0]?.service_name || 'Dịch vụ' }}</span></div>
              <div class="dashboard-booking-meta"><strong>{{ formatDate(booking.start_at) }} · {{ formatTime(booking.start_at) }}</strong><span :class="`dashboard-status status-${booking.status}`">{{ statusLabel(booking.status) }}</span></div>
            </button>
          </div>
        </section>

        <section class="panel">
          <div class="panel-heading"><div><h3>Hoạt động hôm nay</h3><p>Tiến độ booking theo trạng thái</p></div></div>
          <div class="system-list">
            <div class="system-item"><div><strong>Đã xác nhận</strong><span>Booking sẵn sàng thực hiện</span></div><span class="status-badge">{{ data.today_status.confirmed }}</span></div>
            <div class="system-item"><div><strong>Đang thực hiện</strong><span>Dịch vụ đang diễn ra</span></div><span class="status-badge">{{ data.today_status.in_progress }}</span></div>
            <div class="system-item"><div><strong>Hoàn thành</strong><span>Booking hoàn tất hôm nay</span></div><span class="status-badge">{{ data.today_status.completed }}</span></div>
            <div class="system-item"><div><strong>Đã huỷ</strong><span>Booking bị huỷ</span></div><span class="status-badge">{{ data.today_status.cancelled }}</span></div>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { useDashboardView } from './DashboardView.ts'
const { auth, loading, error, data, formatMoney, formatTime, formatDate, statusLabel, openBooking, goBookings, load } = useDashboardView()
</script>
