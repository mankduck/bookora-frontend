<template>
  <div class="public-shell">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink
          to="/"
          class="brand"
          @click="closeMenu"
        >
          <span class="brand-mark">B</span>
          <strong>Bookora</strong>
        </RouterLink>

        <nav class="main-nav">
          <RouterLink
            to="/"
            class="nav-link"
            exact-active-class="active"
          >
            Trang chủ
          </RouterLink>

          <a
            href="/#services"
            class="nav-link"
          >
            Dịch vụ
          </a>

          <a
            href="/#about"
            class="nav-link"
          >
            Giới thiệu
          </a>

          <a
            href="/#contact"
            class="nav-link"
          >
            Liên hệ
          </a>
        </nav>

        <div class="header-actions">
          <template v-if="auth.user">
            <div
              class="account-menu"
              @click.stop
            >
              <button
                type="button"
                class="account-trigger"
                @click="menuOpen = !menuOpen"
              >
                <span class="account-avatar">
                  {{ userInitial }}
                </span>

                <span class="account-name">
                  {{ auth.user.name }}
                </span>

                <span class="chevron">
                  {{ menuOpen ? '⌃' : '⌄' }}
                </span>
              </button>

              <div
                v-if="menuOpen"
                class="account-dropdown"
              >
                <div class="dropdown-user">
                  <strong>
                    {{ auth.user.name }}
                  </strong>

                  <span>
                    {{
                      auth.user.email ||
                      auth.user.phone ||
                      'Tài khoản khách hàng'
                    }}
                  </span>
                </div>

                <RouterLink
                  to="/account/bookings"
                  class="dropdown-link"
                  @click="closeMenu"
                >
                  <span>◷</span>
                  Lịch hẹn của tôi
                </RouterLink>

                <RouterLink
                  to="/account/profile"
                  class="dropdown-link"
                  @click="closeMenu"
                >
                  <span>♙</span>
                  Thông tin cá nhân
                </RouterLink>

                <button
                  type="button"
                  class="dropdown-link logout-link"
                  @click="handleLogout"
                >
                  <span>↗</span>
                  Đăng xuất
                </button>
              </div>
            </div>
          </template>

          <RouterLink
            v-else
            :to="loginLink"
            class="login-link"
          >
            Đăng nhập
          </RouterLink>

          <RouterLink
            to="/booking"
            class="booking-link"
          >
            Đặt lịch
          </RouterLink>
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { usePublicLayout } from './PublicLayout.ts'

const {
  ref,
  RouterLink,
  RouterView,
  auth,
  menuOpen,
  userInitial,
  loginLink,
  closeMenu,
  handleLogout,
} = usePublicLayout()
</script>

<style scoped src="./PublicLayout.css"></style>
