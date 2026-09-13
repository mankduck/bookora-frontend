<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo">B</div>

        <div>
          <strong>Bookora</strong>
          <span>Administration</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          to="/admin/dashboard"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon"> ◫ </span>

          <span>Dashboard</span>
        </RouterLink>

        <div class="nav-section">
          <span class="nav-section-title"> Booking </span>

          <RouterLink
            to="/admin/bookings"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ◇ </span>

            <span>Lịch đặt</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> Dịch vụ </span>

          <RouterLink
            to="/admin/service-categories"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ▦ </span>

            <span>Danh mục</span>
          </RouterLink>

          <RouterLink
            to="/admin/services"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ◆ </span>

            <span> Dịch vụ & Gói </span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> Khách hàng </span>

          <RouterLink
            to="/admin/customers"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ♙ </span>

            <span>Khách hàng</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> Marketing </span>

          <RouterLink
            to="/admin/coupons"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ％ </span>

            <span>Mã giảm giá</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> Nhân sự </span>

          <RouterLink to="/admin/staff" class="nav-item" active-class="active">
            <span class="nav-icon"> ♧ </span>

            <span>Nhân viên</span>
          </RouterLink>
        </div>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="topbar">
        <div>
          <h1>
            {{ pageTitle }}
          </h1>

          <p>Quản lý hệ thống Bookora</p>
        </div>

        <div class="topbar-actions">
          <div class="topbar-profile">
            <div class="avatar small">
              {{ userInitial }}
            </div>

            <div>
              <strong>
                {{ auth.user?.name }}
              </strong>

              <span> Administrator </span>
            </div>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminLayout } from "./AdminLayout.ts";

const { RouterLink, RouterView, auth, userInitial, pageTitle } =
  useAdminLayout();
</script>

<style scoped src="./AdminLayout.css"></style>
