<template>
  <div class="public-shell">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand" @click="closeMenu">
          <img v-if="site.settings?.logo_url" :src="site.settings.logo_url" class="brand-logo-image" alt="Logo" />
          <span v-else class="brand-mark">B</span>
          <strong>{{ siteName }}</strong>
        </RouterLink>

        <nav class="main-nav">
          <RouterLink to="/" class="nav-link" exact-active-class="active">Trang chủ</RouterLink>
          <a v-for="module in navigationModules" :key="module.id" :href="`/#${module.slug}`" class="nav-link">{{ module.nav_label || module.name }}</a>
        </nav>

        <div class="header-actions">
          <template v-if="auth.user">
            <NotificationBell />
            <div class="account-menu" @click.stop>
              <button type="button" class="account-trigger" @click="menuOpen = !menuOpen">
                <span class="account-avatar">{{ userInitial }}</span><span class="account-name">{{ auth.user.name }}</span><span class="chevron">{{ menuOpen ? '⌃' : '⌄' }}</span>
              </button>
              <div v-if="menuOpen" class="account-dropdown">
                <div class="dropdown-user"><strong>{{ auth.user.name }}</strong><span>{{ auth.user.email || auth.user.phone || 'Tài khoản khách hàng' }}</span></div>
                <RouterLink to="/account/bookings" class="dropdown-link" @click="closeMenu"><span>◷</span>Lịch hẹn của tôi</RouterLink>
                <RouterLink to="/account/profile" class="dropdown-link" @click="closeMenu"><span>♙</span>Thông tin cá nhân</RouterLink>
                <button type="button" class="dropdown-link logout-link" @click="handleLogout"><span>↗</span>Đăng xuất</button>
              </div>
            </div>
          </template>
          <RouterLink v-else :to="loginLink" class="login-link">Đăng nhập</RouterLink>
          <RouterLink to="/booking" class="booking-link">Đặt lịch</RouterLink>
        </div>
      </div>
    </header>

    <main><RouterView /></main>

    <footer class="site-footer" id="contact">
      <div class="footer-inner">
        <div class="footer-brand"><strong>{{ site.settings?.company_name || siteName }}</strong><p>{{ site.settings?.tagline || 'Đặt lịch dịch vụ đơn giản hơn.' }}</p></div>
        <div class="footer-column"><strong>Liên hệ</strong><span v-if="site.settings?.phone">{{ site.settings.phone }}</span><span v-if="site.settings?.email">{{ site.settings.email }}</span><span v-if="site.settings?.address">{{ site.settings.address }}</span></div>
        <div class="footer-column"><strong>Giờ mở cửa</strong><span>{{ site.settings?.business_hours || 'Đang cập nhật' }}</span><a v-if="site.settings?.facebook_url" :href="site.settings.facebook_url" target="_blank">Facebook</a><a v-if="site.settings?.instagram_url" :href="site.settings.instagram_url" target="_blank">Instagram</a></div>
      </div>
      <div v-if="site.settings?.map_embed_url" class="footer-map"><iframe :src="site.settings.map_embed_url" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { usePublicLayout } from './PublicLayout.ts'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
const { RouterLink, RouterView, auth, site, menuOpen, userInitial, loginLink, navigationModules, siteName, closeMenu, handleLogout } = usePublicLayout()
</script>
<style scoped src="./PublicLayout.css"></style>
