<template>
  <section>
    <div class="dashboard-welcome">
      <div>
        <span class="eyebrow">
          Tổng quan hôm nay
        </span>

        <h2>
          Xin chào, {{ auth.user?.name }}
        </h2>

        <p>
          Đây là trung tâm quản lý hoạt động của Bookora.
        </p>
      </div>

      <button
        type="button"
        class="primary-button"
      >
        + Tạo lịch đặt
      </button>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <div class="stat-heading">
          <span>
            Lịch đặt hôm nay
          </span>

          <div class="stat-icon">
            ◫
          </div>
        </div>

        <strong>0</strong>

        <p>
          Chưa có lịch đặt
        </p>
      </article>

      <article class="stat-card">
        <div class="stat-heading">
          <span>
            Chờ xác nhận
          </span>

          <div class="stat-icon">
            ◷
          </div>
        </div>

        <strong>0</strong>

        <p>
          Đơn booking pending
        </p>
      </article>

      <article class="stat-card">
        <div class="stat-heading">
          <span>
            Khách hàng
          </span>

          <div class="stat-icon">
            ♧
          </div>
        </div>

        <strong>0</strong>

        <p>
          Tổng khách hàng
        </p>
      </article>

      <article class="stat-card">
        <div class="stat-heading">
          <span>
            Doanh thu
          </span>

          <div class="stat-icon">
            ◈
          </div>
        </div>

        <strong>
          0 ₫
        </strong>

        <p>
          Doanh thu hôm nay
        </p>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-heading">
          <div>
            <h3>
              Lịch đặt gần đây
            </h3>

            <p>
              Các booking mới nhất trong hệ thống
            </p>
          </div>

          <button
            type="button"
            class="text-button"
          >
            Xem tất cả
          </button>
        </div>

        <div class="empty-state">
          <div class="empty-icon">
            ◫
          </div>

          <strong>
            Chưa có lịch đặt
          </strong>

          <p>
            Booking mới sẽ xuất hiện tại đây.
          </p>
        </div>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <h3>
              Trạng thái hệ thống
            </h3>

            <p>
              Kiểm tra nhanh các module
            </p>
          </div>
        </div>

        <div class="system-list">
          <div class="system-item">
            <div>
              <strong>
                Laravel API
              </strong>

              <span>
                Backend service
              </span>
            </div>

            <span class="status-badge">
              Hoạt động
            </span>
          </div>

          <div class="system-item">
            <div>
              <strong>
                Authentication
              </strong>

              <span>
                Laravel Sanctum
              </span>
            </div>

            <span class="status-badge">
              Hoạt động
            </span>
          </div>

          <div class="system-item">
            <div>
              <strong>
                MySQL
              </strong>

              <span>
                Bookora database
              </span>
            </div>

            <span class="status-badge">
              Hoạt động
            </span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>