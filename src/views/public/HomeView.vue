<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <span class="hero-label">
            BOOKORA BOOKING PLATFORM
          </span>

          <h1>
            Đặt lịch dịch vụ
            <span>đơn giản hơn.</span>
          </h1>

          <p>
            Chọn dịch vụ, gói phù hợp và khung giờ còn trống.
            Bookora giúp trải nghiệm đặt lịch nhanh gọn từ
            đầu đến cuối.
          </p>

          <div class="hero-actions">
            <RouterLink
              to="/booking"
              class="hero-primary"
            >
              Đặt lịch ngay
              <span>→</span>
            </RouterLink>

            <a
              href="#services"
              class="hero-secondary"
            >
              Khám phá dịch vụ
            </a>
          </div>

          <div class="hero-trust">
            <div>
              <strong>01</strong>
              <span>Chọn dịch vụ</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Chọn thời gian</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Xác nhận lịch</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card large-card">
            <div class="visual-top">
              <span>
                Đặt lịch nhanh
              </span>

              <span class="live-dot">
                Online
              </span>
            </div>

            <div class="mini-calendar">
              <div class="calendar-heading">
                <strong>Tháng 9</strong>
                <span>2026</span>
              </div>

              <div class="calendar-days">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>

                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span class="selected">10</span>
                <span>11</span>
                <span>12</span>
                <span>13</span>
              </div>
            </div>

            <div class="time-slots">
              <span>08:00</span>
              <span>09:30</span>
              <span class="active">10:00</span>
              <span>14:30</span>
            </div>
          </div>

          <div class="floating-card top">
            <span class="floating-icon">
              ✓
            </span>

            <div>
              <strong>
                Lịch đã xác nhận
              </strong>

              <span>
                10:00 · 10/09/2026
              </span>
            </div>
          </div>

          <div class="floating-card bottom">
            <span class="floating-icon dark">
              ◆
            </span>

            <div>
              <strong>
                Gói Premium
              </strong>

              <span>
                4 giờ · Cọc 30%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="services"
      class="services-section"
    >
      <div class="section-inner">
        <div class="section-heading">
          <div>
            <span class="eyebrow">
              DỊCH VỤ
            </span>

            <h2>
              Dịch vụ nổi bật
            </h2>
          </div>

          <RouterLink
            to="/booking"
            class="view-all"
          >
            Xem tất cả →
          </RouterLink>
        </div>

        <div
          v-if="loading"
          class="service-state"
        >
          Đang tải dịch vụ...
        </div>

        <div
          v-else-if="featuredServices.length === 0"
          class="service-state"
        >
          Chưa có dịch vụ nổi bật.
        </div>

        <div
          v-else
          class="service-grid"
        >
          <article
            v-for="service in featuredServices"
            :key="service.id"
            class="service-card"
          >
            <div class="service-image">
              <img
                v-if="service.thumbnail"
                :src="service.thumbnail"
                :alt="service.name"
              />

              <div
                v-else
                class="image-placeholder"
              >
                <span>
                  {{ service.name.charAt(0) }}
                </span>
              </div>

              <span
                v-if="service.category"
                class="category-badge"
              >
                {{ service.category.name }}
              </span>
            </div>

            <div class="service-content">
              <div>
                <h3>
                  {{ service.name }}
                </h3>

                <p>
                  {{
                    service.short_description ||
                    'Khám phá dịch vụ và lựa chọn gói phù hợp với nhu cầu của bạn.'
                  }}
                </p>
              </div>

              <div class="service-bottom">
                <div>
                  <span>Từ</span>

                  <strong>
                    {{ formatMoney(service.base_price) }}
                  </strong>
                </div>

                <RouterLink
                  :to="{
                    path: '/booking',
                    query: {
                      service: service.slug,
                    },
                  }"
                  class="service-arrow"
                >
                  →
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section
      id="about"
      class="process-section"
    >
      <div class="section-inner">
        <div class="process-copy">
          <span class="eyebrow light">
            CÁCH HOẠT ĐỘNG
          </span>

          <h2>
            Một quy trình đặt lịch
            <br />
            không làm bạn mất thời gian.
          </h2>

          <p>
            Bookora tự kết nối dịch vụ, gói, lịch làm việc
            và thời gian còn trống để khách hàng chỉ nhìn
            thấy những lựa chọn thực sự có thể đặt.
          </p>
        </div>

        <div class="process-steps">
          <article>
            <span>01</span>

            <div>
              <strong>
                Chọn dịch vụ
              </strong>

              <p>
                Chọn dịch vụ và gói phù hợp với nhu cầu.
              </p>
            </div>
          </article>

          <article>
            <span>02</span>

            <div>
              <strong>
                Chọn ngày giờ
              </strong>

              <p>
                Hệ thống chỉ hiển thị các slot còn khả dụng.
              </p>
            </div>
          </article>

          <article>
            <span>03</span>

            <div>
              <strong>
                Gửi yêu cầu
              </strong>

              <p>
                Điền thông tin và hoàn tất yêu cầu đặt lịch.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-box">
        <span>
          Bạn đã sẵn sàng?
        </span>

        <h2>
          Chọn lịch phù hợp với bạn.
        </h2>

        <RouterLink
          to="/booking"
          class="hero-primary"
        >
          Bắt đầu đặt lịch
          <span>→</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useHomeView } from './HomeView.ts'

const {
  ref,
  RouterLink,
  loading,
  featuredServices,
  formatMoney,
} = useHomeView()
</script>

<style scoped src="./HomeView.css"></style>