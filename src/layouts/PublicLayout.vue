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
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  RouterLink,
  RouterView,
  useRoute,
  useRouter,
} from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)

const userInitial = computed(
  () =>
    auth.user?.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || 'U',
)

const loginLink = computed(() => ({
  name: 'login',
  query:
    route.path === '/'
      ? undefined
      : {
          redirect: route.fullPath,
        },
}))

const closeMenu = () => {
  menuOpen.value = false
}

const handleDocumentClick = () => {
  closeMenu()
}

const handleLogout = async () => {
  closeMenu()

  await auth.logout()

  await router.push('/')
}

onMounted(async () => {
  document.addEventListener(
    'click',
    handleDocumentClick,
  )

  /*
   * Trang public không có requiresAuth nên router guard
   * không nhất thiết gọi /auth/me khi refresh trình duyệt.
   * PublicLayout chủ động khôi phục session để header
   * luôn hiện đúng tài khoản sau khi đăng nhập.
   */
  if (!auth.initialized) {
    try {
      await auth.fetchMe()
    } catch {
      // Chưa đăng nhập: giữ giao diện guest.
    }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleDocumentClick,
  )
})
</script>

<style scoped>
.public-shell {
  min-height: 100vh;
  background: #f7f7f4;
  color: #181916;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 78px;
  border-top: 4px solid #181916;
  border-bottom: 1px solid #e6e7e2;
  background: rgba(250, 250, 248, 0.96);
  backdrop-filter: blur(14px);
}

.header-inner {
  width: min(1200px, calc(100% - 40px));
  height: 74px;
  display: grid;
  grid-template-columns:
    1fr auto 1fr;
  align-items: center;
  gap: 30px;
  margin: 0 auto;
}

.brand {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #181916;
  text-decoration: none;
}

.brand-mark {
  width: 35px;
  height: 35px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #181916;
  color: #fff;
  font-size: 14px;
  font-weight: 850;
}

.brand strong {
  font-size: 16px;
  letter-spacing: -0.3px;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  position: relative;
  padding: 27px 0 24px;
  color: #696c65;
  text-decoration: none;
  font-size: 11px;
  font-weight: 550;
}

.nav-link:hover,
.nav-link.active {
  color: #181916;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 17px;
  left: 0;
  height: 2px;
  background: #181916;
}

.header-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-link {
  color: #555850;
  text-decoration: none;
  font-size: 11px;
  font-weight: 650;
}

.booking-link {
  height: 39px;
  display: inline-flex;
  align-items: center;
  padding: 0 17px;
  border-radius: 11px;
  background: #181916;
  color: #fff;
  text-decoration: none;
  font-size: 11px;
  font-weight: 700;
}

.account-menu {
  position: relative;
}

.account-trigger {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px 0 6px;
  border: 1px solid #e0e1dc;
  border-radius: 12px;
  background: #fff;
  color: #181916;
}

.account-avatar {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #181916;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.account-name {
  max-width: 150px;
  overflow: hidden;
  font-size: 10px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron {
  color: #92958d;
  font-size: 10px;
}

.account-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 235px;
  overflow: hidden;
  border: 1px solid #e0e1dc;
  border-radius: 13px;
  background: #fff;
  box-shadow:
    0 18px 50px
    rgba(24, 25, 22, 0.12);
}

.dropdown-user {
  display: grid;
  gap: 3px;
  padding: 15px;
  border-bottom: 1px solid #ecece8;
}

.dropdown-user strong {
  font-size: 11px;
}

.dropdown-user span {
  overflow: hidden;
  color: #969990;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-link {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  border: 0;
  background: #fff;
  color: #4f524b;
  text-decoration: none;
  font: inherit;
  font-size: 10px;
  text-align: left;
}

.dropdown-link:hover {
  background: #f5f5f2;
  color: #181916;
}

.dropdown-link > span {
  width: 18px;
  color: #858981;
  text-align: center;
}

.logout-link {
  border-top: 1px solid #ecece8;
  color: #a14343;
}

@media (max-width: 820px) {
  .header-inner {
    grid-template-columns:
      auto 1fr;
  }

  .main-nav {
    display: none;
  }

  .header-actions {
    justify-self: end;
  }

  .account-name {
    display: none;
  }
}

@media (max-width: 520px) {
  .header-inner {
    width: calc(100% - 24px);
  }

  .brand strong {
    display: none;
  }

  .booking-link {
    padding: 0 12px;
  }
}
</style>
