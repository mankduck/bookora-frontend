<template>
  <section class="services-page">
    <div class="page-heading">
      <div>
        <span class="eyebrow">
          Dịch vụ
        </span>

        <h2>Quản lý dịch vụ</h2>

        <p>
          Quản lý dịch vụ, giá cơ bản và các gói lựa chọn.
        </p>
      </div>

      <button
        class="primary-button"
        type="button"
        @click="openCreateService"
      >
        + Thêm dịch vụ
      </button>
    </div>

    <div class="service-panel">
      <div class="toolbar">
        <div class="search-box">
          <span>⌕</span>

          <input
            v-model="search"
            type="text"
            placeholder="Tìm dịch vụ..."
            @input="handleSearch"
          />
        </div>

        <select
          v-model="categoryFilter"
          @change="reloadFromFirstPage"
        >
          <option value="">
            Tất cả danh mục
          </option>

          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>

        <select
          v-model="statusFilter"
          @change="reloadFromFirstPage"
        >
          <option value="">
            Tất cả trạng thái
          </option>

          <option value="active">
            Hoạt động
          </option>

          <option value="inactive">
            Đã ẩn
          </option>
        </select>
      </div>

      <div
        v-if="loading"
        class="state"
      >
        Đang tải dịch vụ...
      </div>

      <div
        v-else-if="services.length === 0"
        class="empty"
      >
        <div class="empty-icon">
          ◆
        </div>

        <strong>Chưa có dịch vụ</strong>

        <p>
          Tạo dịch vụ đầu tiên để bắt đầu cấu hình booking.
        </p>

        <button
          class="primary-button"
          type="button"
          @click="openCreateService"
        >
          + Thêm dịch vụ
        </button>
      </div>

      <div
        v-else
        class="service-list"
      >
        <article
          v-for="service in services"
          :key="service.id"
          class="service-card"
        >
          <div class="service-main">
            <div class="service-avatar">
              {{ service.name.charAt(0).toUpperCase() }}
            </div>

            <div class="service-info">
              <div class="service-title-row">
                <h3>
                  {{ service.name }}
                </h3>

                <span
                  v-if="service.is_featured"
                  class="featured-badge"
                >
                  Nổi bật
                </span>

                <span
                  class="status"
                  :class="service.status"
                >
                  {{
                    service.status === 'active'
                      ? 'Hoạt động'
                      : 'Đã ẩn'
                  }}
                </span>
              </div>

              <p>
                {{
                  service.short_description ||
                  'Chưa có mô tả'
                }}
              </p>

              <div class="service-meta">
                <span>
                  {{
                    service.category?.name ||
                    'Chưa phân loại'
                  }}
                </span>

                <span>
                  {{ formatMoney(service.base_price) }}
                </span>

                <span>
                  {{ service.default_duration_minutes }}
                  phút
                </span>

                <span>
                  {{ service.variants?.length ?? 0 }}
                  gói
                </span>
              </div>
            </div>

            <div class="service-actions">
              <button
                type="button"
                @click="toggleVariants(service.id)"
              >
                {{
                  expandedServiceId === service.id
                    ? 'Thu gọn'
                    : 'Gói dịch vụ'
                }}
              </button>

              <button
                type="button"
                @click="openEditService(service)"
              >
                Sửa
              </button>

              <button
                type="button"
                class="danger"
                @click="removeService(service)"
              >
                Xóa
              </button>
            </div>
          </div>

          <div
            v-if="expandedServiceId === service.id"
            class="variants-section"
          >
            <div class="variants-heading">
              <div>
                <strong>
                  Các gói dịch vụ
                </strong>

                <span>
                  Các lựa chọn khách hàng có thể đặt.
                </span>
              </div>

              <button
                type="button"
                class="secondary-button"
                @click="openCreateVariant(service)"
              >
                + Thêm gói
              </button>
            </div>

            <div
              v-if="!service.variants?.length"
              class="variant-empty"
            >
              Chưa có gói dịch vụ.
            </div>

            <div
              v-else
              class="variant-grid"
            >
              <article
                v-for="variant in service.variants"
                :key="variant.id"
                class="variant-card"
              >
                <div class="variant-top">
                  <div>
                    <strong>
                      {{ variant.name }}
                    </strong>

                    <span v-if="variant.code">
                      {{ variant.code }}
                    </span>
                  </div>

                  <span
                    class="status"
                    :class="variant.status"
                  >
                    {{
                      variant.status === 'active'
                        ? 'Hoạt động'
                        : 'Ẩn'
                    }}
                  </span>
                </div>

                <div class="variant-price">
                  <strong>
                    {{
                      formatMoney(
                        variant.sale_price ||
                        variant.price,
                      )
                    }}
                  </strong>

                  <del v-if="variant.sale_price">
                    {{ formatMoney(variant.price) }}
                  </del>
                </div>

                <div class="variant-details">
                  <span>
                    {{ variant.duration_minutes }} phút
                  </span>

                  <span>
                    Cọc:
                    {{ depositText(variant) }}
                  </span>
                </div>

                <div class="variant-actions">
                  <button
                    type="button"
                    @click="
                      openEditVariant(
                        service,
                        variant,
                      )
                    "
                  >
                    Sửa
                  </button>

                  <button
                    class="danger"
                    type="button"
                    @click="
                      removeVariant(
                        service,
                        variant,
                      )
                    "
                  >
                    Xóa
                  </button>
                </div>
              </article>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- SERVICE MODAL -->

    <div
      v-if="serviceModalOpen"
      class="modal-backdrop"
      @click.self="closeServiceModal"
    >
      <div class="modal">
        <div class="modal-heading">
          <div>
            <h3>
              {{
                editingService
                  ? 'Sửa dịch vụ'
                  : 'Thêm dịch vụ'
              }}
            </h3>

            <p>
              Thiết lập thông tin cơ bản của dịch vụ.
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            @click="closeServiceModal"
          >
            ×
          </button>
        </div>

        <form
          class="form"
          @submit.prevent="saveService"
        >
          <div class="form-field">
            <label>
              Tên dịch vụ *
            </label>

            <input
              v-model="serviceForm.name"
              type="text"
              placeholder="Ví dụ: Chụp ảnh cưới"
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Danh mục</label>

              <select
                v-model="serviceForm.category_id"
              >
                <option :value="null">
                  Chưa phân loại
                </option>

                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-field">
              <label>Slug</label>

              <input
                v-model="serviceForm.slug"
                type="text"
                placeholder="Tự tạo nếu để trống"
              />
            </div>
          </div>

          <div class="form-field">
            <label>Mô tả ngắn</label>

            <input
              v-model="
                serviceForm.short_description
              "
              type="text"
              placeholder="Mô tả ngắn hiển thị trên card"
            />
          </div>

          <div class="form-field">
            <label>Mô tả chi tiết</label>

            <textarea
              v-model="serviceForm.description"
              rows="4"
              placeholder="Nội dung chi tiết..."
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Giá cơ bản</label>

              <input
                v-model.number="
                  serviceForm.base_price
                "
                type="number"
                min="0"
              />
            </div>

            <div class="form-field">
              <label>Thời lượng mặc định</label>

              <input
                v-model.number="
                  serviceForm.default_duration_minutes
                "
                type="number"
                min="1"
              />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Thứ tự</label>

              <input
                v-model.number="
                  serviceForm.sort_order
                "
                type="number"
                min="0"
              />
            </div>

            <div class="form-field">
              <label>Trạng thái</label>

              <select
                v-model="serviceForm.status"
              >
                <option value="active">
                  Hoạt động
                </option>

                <option value="inactive">
                  Ẩn
                </option>
              </select>
            </div>
          </div>

          <label class="checkbox-field">
            <input
              v-model="
                serviceForm.is_featured
              "
              type="checkbox"
            />

            <span>
              Đánh dấu là dịch vụ nổi bật
            </span>
          </label>

          <p
            v-if="formError"
            class="form-error"
          >
            {{ formError }}
          </p>

          <div class="modal-actions">
            <button
              class="secondary-button"
              type="button"
              @click="closeServiceModal"
            >
              Hủy
            </button>

            <button
              class="primary-button"
              type="submit"
              :disabled="saving"
            >
              {{
                saving
                  ? 'Đang lưu...'
                  : 'Lưu dịch vụ'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- VARIANT MODAL -->

    <div
      v-if="variantModalOpen"
      class="modal-backdrop"
      @click.self="closeVariantModal"
    >
      <div class="modal">
        <div class="modal-heading">
          <div>
            <h3>
              {{
                editingVariant
                  ? 'Sửa gói dịch vụ'
                  : 'Thêm gói dịch vụ'
              }}
            </h3>

            <p>
              {{ selectedService?.name }}
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            @click="closeVariantModal"
          >
            ×
          </button>
        </div>

        <form
          class="form"
          @submit.prevent="saveVariant"
        >
          <div class="form-grid">
            <div class="form-field">
              <label>Tên gói *</label>

              <input
                v-model="variantForm.name"
                type="text"
                placeholder="Premium"
              />
            </div>

            <div class="form-field">
              <label>Mã gói</label>

              <input
                v-model="variantForm.code"
                type="text"
                placeholder="PREMIUM"
              />
            </div>
          </div>

          <div class="form-field">
            <label>Mô tả</label>

            <textarea
              v-model="variantForm.description"
              rows="3"
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Giá</label>

              <input
                v-model.number="variantForm.price"
                type="number"
                min="0"
              />
            </div>

            <div class="form-field">
              <label>Giá khuyến mãi</label>

              <input
                v-model.number="
                  variantForm.sale_price
                "
                type="number"
                min="0"
              />
            </div>
          </div>

          <div class="form-field">
            <label>Thời lượng</label>

            <input
              v-model.number="
                variantForm.duration_minutes
              "
              type="number"
              min="1"
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Kiểu tiền cọc</label>

              <select
                v-model="
                  variantForm.deposit_type
                "
              >
                <option value="none">
                  Không cọc
                </option>

                <option value="fixed">
                  Số tiền cố định
                </option>

                <option value="percent">
                  Phần trăm
                </option>
              </select>
            </div>

            <div class="form-field">
              <label>
                Giá trị tiền cọc
              </label>

              <input
                v-model.number="
                  variantForm.deposit_value
                "
                type="number"
                min="0"
                :disabled="
                  variantForm.deposit_type ===
                  'none'
                "
              />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Thứ tự</label>

              <input
                v-model.number="
                  variantForm.sort_order
                "
                type="number"
                min="0"
              />
            </div>

            <div class="form-field">
              <label>Trạng thái</label>

              <select
                v-model="
                  variantForm.status
                "
              >
                <option value="active">
                  Hoạt động
                </option>

                <option value="inactive">
                  Ẩn
                </option>
              </select>
            </div>
          </div>

          <p
            v-if="formError"
            class="form-error"
          >
            {{ formError }}
          </p>

          <div class="modal-actions">
            <button
              class="secondary-button"
              type="button"
              @click="closeVariantModal"
            >
              Hủy
            </button>

            <button
              class="primary-button"
              type="submit"
              :disabled="saving"
            >
              {{
                saving
                  ? 'Đang lưu...'
                  : 'Lưu gói dịch vụ'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useServicesView } from './ServicesView.ts'

const {
  services,
  categories,
  loading,
  saving,
  search,
  categoryFilter,
  statusFilter,
  expandedServiceId,
  serviceModalOpen,
  variantModalOpen,
  editingService,
  selectedService,
  editingVariant,
  formError,
  serviceForm,
  variantForm,
  formatMoney,
  depositText,
  reloadFromFirstPage,
  handleSearch,
  toggleVariants,
  openCreateService,
  openEditService,
  closeServiceModal,
  saveService,
  removeService,
  openCreateVariant,
  openEditVariant,
  closeVariantModal,
  saveVariant,
  removeVariant,
} = useServicesView()
</script>

<style scoped src="./ServicesView.css"></style>