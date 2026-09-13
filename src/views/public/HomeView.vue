<template>
  <div class="home-page">
    <template v-for="module in modules" :key="module.id">
      <section v-if="module.type === 'hero'" :id="module.slug" class="hero dynamic-hero">
        <div class="hero-inner">
          <div class="hero-copy">
            <span class="hero-label">{{ site.settings?.company_name || 'BOOKORA' }}</span>
            <h1>{{ module.title || site.settings?.tagline || 'Đặt lịch dịch vụ đơn giản hơn.' }}</h1>
            <p>{{ module.content || 'Chọn dịch vụ, gói phù hợp và khung giờ còn trống.' }}</p>
            <RouterLink to="/booking" class="hero-primary">
              {{ module.settings?.button_label || 'Đặt lịch ngay' }} <span>→</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <section v-else-if="module.type === 'services'" :id="module.slug" class="services-section dynamic-section">
        <div class="section-inner">
          <div class="section-heading">
            <div>
              <span class="eyebrow">DỊCH VỤ</span>
              <h2>{{ module.title || module.name }}</h2>
            </div>
          </div>

          <div v-if="loading" class="service-state">Đang tải...</div>
          <div v-else class="service-grid">
            <article
              v-for="service in featuredServices.slice(0, Number(module.settings?.limit || 6))"
              :key="service.id"
              class="service-card"
            >
              <div class="service-image">
                <img v-if="service.thumbnail" :src="service.thumbnail" :alt="service.name" />
                <div v-else class="image-placeholder"><span>{{ service.name.charAt(0) }}</span></div>
                <span v-if="service.category" class="category-badge">{{ service.category.name }}</span>
              </div>
              <div class="service-content">
                <div>
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.short_description || 'Khám phá dịch vụ và lựa chọn gói phù hợp.' }}</p>
                </div>
                <div class="service-bottom">
                  <div>
                    <span>Từ</span>
                    <strong>{{ formatMoney(service.base_price) }}</strong>
                  </div>
                  <RouterLink :to="{ path: '/booking', query: { service: service.slug } }" class="service-arrow">→</RouterLink>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section v-else-if="module.type === 'top_staff'" :id="module.slug" class="dynamic-section">
        <div class="section-inner">
          <div class="section-heading">
            <div>
              <span class="eyebrow">ĐÁNH GIÁ</span>
              <h2>{{ module.title || module.name }}</h2>
            </div>
          </div>

          <div class="staff-public-grid">
            <button
              v-for="(staff, index) in topStaff.slice(0, Number(module.settings?.limit || 4))"
              :key="staff.id"
              type="button"
              class="staff-public-card"
              @click="openStaffReviews(staff)"
            >
              <span class="staff-rank">#{{ index + 1 }}</span>
              <div class="staff-public-avatar">
                <img v-if="staff.user?.avatar" :src="staff.user.avatar" :alt="staff.user?.name" />
                <span v-else>{{ staff.user?.name?.charAt(0) || 'P' }}</span>
              </div>
              <strong>{{ staff.user?.name }}</strong>
              <span>{{ Number(staff.rating_avg || 0).toFixed(2) }} ★ · {{ staff.reviews_count }} đánh giá</span>
              <small>Xem đánh giá →</small>
            </button>
            <div v-if="!topStaff.length" class="service-state">Chưa có đánh giá nhân viên.</div>
          </div>
        </div>
      </section>

      <section v-else-if="module.type === 'posts'" :id="module.slug" class="dynamic-section">
        <div class="section-inner">
          <div class="section-heading">
            <div>
              <span class="eyebrow">NỘI DUNG</span>
              <h2>{{ module.title || module.name }}</h2>
            </div>
            <RouterLink to="/bai-viet" class="text-link">Xem tất cả →</RouterLink>
          </div>

          <div class="public-post-grid">
            <article v-for="post in posts.slice(0, Number(module.settings?.limit || 3))" :key="post.id">
              <img v-if="post.featured_image" :src="post.featured_image" :alt="post.title" />
              <div>
                <span>{{ post.published_at?.slice(0, 10) || '' }}</span>
                <h3>{{ post.title }}</h3>
                <p>{{ post.excerpt || 'Đọc bài viết mới từ Bookora.' }}</p>
                <RouterLink :to="`/bai-viet/${post.slug}`">Đọc bài →</RouterLink>
              </div>
            </article>
            <div v-if="!posts.length" class="service-state">Chưa có bài viết đã xuất bản.</div>
          </div>
        </div>
      </section>

      <section v-else-if="module.type === 'custom_html'" :id="module.slug" class="dynamic-section custom-html-section">
        <div v-if="module.custom_css" v-html="`<style>${module.custom_css}</style>`"></div>
        <div class="section-inner">
          <h2 v-if="module.title">{{ module.title }}</h2>
          <div class="custom-html" v-html="module.content"></div>
        </div>
      </section>
    </template>

    <div v-if="staffModalOpen" class="staff-review-overlay" @click.self="closeStaffReviews">
      <section class="staff-review-modal">
        <button type="button" class="staff-review-close" @click="closeStaffReviews">×</button>

        <div class="staff-review-header">
          <div class="staff-public-avatar large">
            <img v-if="selectedStaff?.user?.avatar" :src="selectedStaff.user.avatar" :alt="selectedStaff?.user?.name" />
            <span v-else>{{ selectedStaff?.user?.name?.charAt(0) || 'P' }}</span>
          </div>
          <div>
            <span class="eyebrow">PHOTO</span>
            <h3>{{ selectedStaff?.user?.name || 'Nhân viên' }}</h3>
            <p>{{ Number(selectedStaff?.average_rating ?? selectedStaff?.rating_avg ?? 0).toFixed(2) }} ★ · {{ selectedStaff?.reviews_count || 0 }} đánh giá</p>
          </div>
        </div>

        <div v-if="staffModalLoading" class="staff-review-state">Đang tải đánh giá...</div>
        <div v-else-if="!selectedStaffReviews.length" class="staff-review-state">Chưa có đánh giá công khai.</div>
        <div v-else class="staff-review-list">
          <article v-for="review in selectedStaffReviews" :key="review.id">
            <div class="staff-review-item-top">
              <div>
                <strong>{{ review.customer?.name || 'Khách hàng' }}</strong>
                <span>{{ review.booking?.booking_code || '' }}</span>
              </div>
              <b>{{ stars(Number(review.rating)) }}</b>
            </div>
            <p>{{ review.comment || 'Không có nhận xét.' }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHomeView } from './HomeView.ts'

const {
  RouterLink,
  site,
  loading,
  modules,
  featuredServices,
  posts,
  topStaff,
  staffModalOpen,
  staffModalLoading,
  selectedStaff,
  selectedStaffReviews,
  formatMoney,
  openStaffReviews,
  closeStaffReviews,
  stars,
} = useHomeView()
</script>

<style scoped src="./HomeView.css"></style>
