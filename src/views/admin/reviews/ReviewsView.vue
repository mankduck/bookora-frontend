<template>
  <section class="reviews-page">
    <div class="module-page-header">
      <div>
        <span class="eyebrow">Chất lượng dịch vụ</span>
        <h2>Đánh giá Photo</h2>
        <p>Theo dõi chất lượng nhân viên từ các booking đã hoàn thành.</p>
      </div>
    </div>

    <div class="review-stats">
      <article><span>Điểm trung bình</span><strong>{{ Number(stats.average_rating || 0).toFixed(2) }} / 5</strong></article>
      <article><span>Tổng đánh giá</span><strong>{{ stats.total_reviews }}</strong></article>
      <article><span>Photo nổi bật</span><strong>{{ stats.staff?.[0]?.user?.name || '—' }}</strong></article>
      <article><span>5 sao</span><strong>{{ stats.distribution?.[5] || 0 }}</strong></article>
    </div>

    <div class="review-grid">
      <section class="review-panel">
        <div class="panel-head">
          <div>
            <h3>Đánh giá gần đây</h3>
            <p>Lọc theo nhân viên, số sao hoặc nội dung đánh giá.</p>
          </div>

          <div class="review-filters">
            <input
              v-model="filters.search"
              placeholder="Khách, booking, nội dung..."
              @keyup.enter="load"
            />

            <select v-model="filters.staff_id" @change="load">
              <option value="">Tất cả nhân viên</option>
              <option v-for="staff in stats.staff" :key="staff.id" :value="staff.id">
                {{ staff.user?.name || `Photo #${staff.id}` }}
              </option>
            </select>

            <select v-model="filters.rating" @change="load">
              <option value="">Tất cả sao</option>
              <option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="n">{{ n }} sao</option>
            </select>

            <button type="button" class="review-reset" @click="resetFilters">Đặt lại</button>
          </div>
        </div>

        <div v-if="loading" class="state">Đang tải...</div>
        <div v-else-if="!reviews.length" class="state">Chưa có đánh giá phù hợp.</div>
        <div v-else class="review-list">
          <article v-for="review in reviews" :key="review.id">
            <div class="review-top">
              <div>
                <strong>{{ review.customer?.name || 'Khách hàng' }}</strong>
                <span>{{ review.booking?.booking_code }} · {{ review.staff?.user?.name }}</span>
              </div>
              <b>{{ stars(review.rating) }}</b>
            </div>
            <p>{{ review.comment || 'Không có nhận xét.' }}</p>
          </article>
        </div>
      </section>

      <section class="review-panel">
        <div class="panel-head">
          <div>
            <h3>Xếp hạng Photo</h3>
            <p>Sắp xếp theo điểm trung bình rồi số lượt đánh giá.</p>
          </div>
        </div>

        <div class="staff-ranking">
          <article v-for="(staff, index) in stats.staff" :key="staff.id">
            <span class="rank">{{ Number(index) + 1 }}</span>
            <div>
              <strong>{{ staff.user?.name }}</strong>
              <span>{{ Number(staff.rating_avg || 0).toFixed(2) }} ★ · {{ staff.reviews_count }} đánh giá</span>
            </div>
          </article>
          <div v-if="!stats.staff?.length" class="state">Chưa có dữ liệu.</div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useReviewsView } from './ReviewsView.ts'

const {
  loading,
  reviews,
  stats,
  filters,
  load,
  resetFilters,
  stars,
} = useReviewsView()
</script>

<style scoped src="./ReviewsView.css"></style>
