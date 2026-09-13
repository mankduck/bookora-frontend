<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo">B</div>

        <div>
          <strong>{{ siteName }}</strong>
          <span>{{ english ? "Administration" : "Quản trị" }}</span>
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
          <span class="nav-section-title"> {{ english ? "Booking" : "Booking" }} </span>

          <RouterLink
            to="/admin/bookings"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ◇ </span>

            <span>{{ english ? "Bookings" : "Lịch đặt" }}</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> {{ english ? "Services" : "Dịch vụ" }} </span>

          <RouterLink
            to="/admin/service-categories"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ▦ </span>

            <span>{{ english ? "Categories" : "Danh mục" }}</span>
          </RouterLink>

          <RouterLink
            to="/admin/services"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ◆ </span>

            <span>{{ english ? "Services & Packages" : "Dịch vụ & Gói" }}</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> {{ english ? "Customers" : "Khách hàng" }} </span>

          <RouterLink
            to="/admin/customers"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon"> ♙ </span>

            <span>{{ english ? "Customers" : "Khách hàng" }}</span>
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

            <span>{{ english ? "Coupons" : "Mã giảm giá" }}</span>
          </RouterLink>
        </div>


        <div class="nav-section">
          <span class="nav-section-title"> {{ english ? "Content" : "Nội dung" }} </span>
          <RouterLink to="/admin/posts" class="nav-item" active-class="active"><span class="nav-icon"> ▤ </span><span>{{ english ? "Posts" : "Bài viết" }}</span></RouterLink>
          <RouterLink to="/admin/reviews" class="nav-item" active-class="active"><span class="nav-icon"> ★ </span><span>{{ english ? "Photo Reviews" : "Đánh giá Photo" }}</span></RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> {{ english ? "Appearance" : "Giao diện" }} </span>
          <RouterLink to="/admin/homepage" class="nav-item" active-class="active"><span class="nav-icon"> ☷ </span><span>{{ english ? "Homepage Layout" : "Bố cục trang chủ" }}</span></RouterLink>
          <RouterLink to="/admin/settings" class="nav-item" active-class="active"><span class="nav-icon"> ⚙ </span><span>{{ english ? "Settings" : "Cài đặt" }}</span></RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title"> {{ english ? "Staff" : "Nhân sự" }} </span>

          <RouterLink to="/admin/staff" class="nav-item" active-class="active">
            <span class="nav-icon"> ♧ </span>

            <span>{{ english ? "Staff" : "Nhân viên" }}</span>
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

          <p>{{ english ? `Manage ${siteName}` : `Quản lý hệ thống ${siteName}` }}</p>
        </div>

        <div class="topbar-actions">
          <NotificationBell />

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
import NotificationBell from "@/components/notifications/NotificationBell.vue";

const { RouterLink, RouterView, auth, site, english, siteName, userInitial, pageTitle } =
  useAdminLayout();
</script>

<style scoped src="./AdminLayout.css"></style>
