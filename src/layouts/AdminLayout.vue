<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo">
          B
        </div>

        <div class="sidebar-brand-copy">
          <strong>Bookora</strong>
          <span>Administration</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">
            Tổng quan
          </span>

          <RouterLink
            to="/admin"
            class="nav-item"
            exact-active-class="active"
          >
            <span class="nav-icon">⌂</span>
            <span>Dashboard</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">
            Vận hành
          </span>

          <RouterLink
            to="/admin/bookings"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon">◫</span>
            <span>Lịch đặt</span>
          </RouterLink>

          <RouterLink
            to="/admin/staff"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon">♙</span>
            <span>Nhân viên</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">
            Dịch vụ
          </span>

          <RouterLink
            to="/admin/services"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon">◆</span>
            <span>Dịch vụ &amp; Gói</span>
          </RouterLink>

          <RouterLink
            to="/admin/service-categories"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon">▦</span>
            <span>Danh mục</span>
          </RouterLink>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">
            Quản lý
          </span>

          <a class="nav-item disabled">
            <span class="nav-icon">♧</span>
            <span>Khách hàng</span>

            <span class="coming-soon">
              Soon
            </span>
          </a>

          <a class="nav-item disabled">
            <span class="nav-icon">◈</span>
            <span>Thanh toán</span>

            <span class="coming-soon">
              Soon
            </span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">
            Hệ thống
          </span>

          <a class="nav-item disabled">
            <span class="nav-icon">⚙</span>
            <span>Cài đặt</span>

            <span class="coming-soon">
              Soon
            </span>
          </a>
        </div>
      </nav>

      <div class="sidebar-user">
        <div class="avatar">
          {{ userInitial }}
        </div>

        <div class="sidebar-user-info">
          <strong>
            {{ auth.user?.name }}
          </strong>

          <span>
            {{ auth.user?.email }}
          </span>
        </div>

        <button
          class="logout-button"
          type="button"
          title="Đăng xuất"
          @click="handleLogout"
        >
          ↗
        </button>
      </div>
    </aside>

    <div class="admin-main">
      <header class="topbar">
        <div class="topbar-heading">
          <h1>
            {{ pageTitle }}
          </h1>

          <p>
            Quản lý hệ thống Bookora
          </p>
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

              <span>
                Administrator
              </span>
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
import { computed } from 'vue'

import {
  RouterLink,
  RouterView,
  useRoute,
  useRouter,
} from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const userInitial = computed(
  () =>
    auth.user?.name
      ?.charAt(0)
      .toUpperCase() ?? 'A',
)

const pageTitle = computed(() => {
  switch (route.name) {
    case 'admin-dashboard':
      return 'Dashboard'

    case 'admin-bookings':
      return 'Lịch đặt'

    case 'admin-service-categories':
      return 'Danh mục dịch vụ'

    case 'admin-services':
      return 'Dịch vụ & Gói'

    case 'admin-staff':
      return 'Nhân viên'

    default:
      return 'Bookora'
  }
})

const handleLogout = async () => {
  await auth.logout()
  await router.push('/login')
}
</script>

<style scoped>
.nav-section {
  display: grid;
  gap: 5px;
  margin-bottom: 12px;
}

.nav-section-title {
  padding: 8px 13px 4px;
  color: #696e79;
  font-size: 10px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 1.15px;
}

.sidebar-brand-copy {
  display: grid;
  gap: 3px;
}

.nav-item.disabled {
  cursor: default;
  opacity: 0.48;
  pointer-events: none;
}

.coming-soon {
  margin-left: auto;
  padding: 3px 6px;
  border: 1px solid #363942;
  border-radius: 999px;
  color: #737985;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.topbar-heading {
  display: grid;
  gap: 2px;
}
</style>