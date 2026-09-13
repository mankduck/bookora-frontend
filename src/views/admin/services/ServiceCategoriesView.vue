<template>
  <section class="category-page">
    <div class="page-heading">
      <div>
        <span class="eyebrow">Dịch vụ</span>

        <h2>Danh mục dịch vụ</h2>

        <p>
          Tổ chức các nhóm dịch vụ được hiển thị trên website.
        </p>
      </div>

      <button
        class="primary-button"
        type="button"
        @click="openCreate"
      >
        + Thêm danh mục
      </button>
    </div>

    <div class="category-panel">
      <div class="category-toolbar">
        <div class="search-box">
          <span>⌕</span>

          <input
            v-model="search"
            type="text"
            placeholder="Tìm tên hoặc slug..."
            @input="handleSearch"
          />
        </div>

        <select
          v-model="statusFilter"
          class="filter-select"
          @change="loadCategories"
        >
          <option value="">
            Tất cả trạng thái
          </option>

          <option value="active">
            Đang hoạt động
          </option>

          <option value="inactive">
            Đã ẩn
          </option>
        </select>
      </div>

      <div
        v-if="loading"
        class="table-state"
      >
        Đang tải dữ liệu...
      </div>

      <div
        v-else-if="categories.length === 0"
        class="category-empty"
      >
        <div class="empty-icon">
          ▦
        </div>

        <strong>Chưa có danh mục</strong>

        <p>
          Tạo danh mục đầu tiên để bắt đầu quản lý dịch vụ.
        </p>

        <button
          class="primary-button"
          type="button"
          @click="openCreate"
        >
          + Tạo danh mục
        </button>
      </div>

      <div
        v-else
        class="category-table-wrap"
      >
        <table class="category-table">
          <thead>
            <tr>
              <th>Danh mục</th>
              <th>Danh mục cha</th>
              <th>Dịch vụ</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="category in categories"
              :key="category.id"
            >
              <td>
                <div class="category-name-cell">
                  <div class="category-thumbnail">
                    {{
                      category.name
                        .charAt(0)
                        .toUpperCase()
                    }}
                  </div>

                  <div>
                    <strong>
                      {{ category.name }}
                    </strong>

                    <span>
                      /{{ category.slug }}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <span class="muted">
                  {{
                    category.parent?.name ||
                    '—'
                  }}
                </span>
              </td>

              <td>
                {{ category.services_count ?? 0 }}
              </td>

              <td>
                {{ category.sort_order }}
              </td>

              <td>
                <span
                  class="category-status"
                  :class="category.status"
                >
                  {{
                    category.status === 'active'
                      ? 'Hoạt động'
                      : 'Đã ẩn'
                  }}
                </span>
              </td>

              <td>
                <div class="row-actions">
                  <button
                    type="button"
                    @click="openEdit(category)"
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    class="danger"
                    @click="removeCategory(category)"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="pagination.lastPage > 1"
        class="pagination"
      >
        <button
          type="button"
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
        >
          ←
        </button>

        <span>
          Trang {{ pagination.page }}
          /
          {{ pagination.lastPage }}
        </span>

        <button
          type="button"
          :disabled="
            pagination.page >= pagination.lastPage
          "
          @click="changePage(pagination.page + 1)"
        >
          →
        </button>
      </div>
    </div>

    <div
      v-if="modalOpen"
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <div class="category-modal">
        <div class="modal-heading">
          <div>
            <h3>
              {{
                editingCategory
                  ? 'Sửa danh mục'
                  : 'Thêm danh mục'
              }}
            </h3>

            <p>
              {{
                editingCategory
                  ? 'Cập nhật thông tin danh mục.'
                  : 'Tạo một nhóm dịch vụ mới.'
              }}
            </p>
          </div>

          <button
            class="modal-close"
            type="button"
            @click="closeModal"
          >
            ×
          </button>
        </div>

        <form
          class="category-form"
          @submit.prevent="saveCategory"
        >
          <div class="form-field">
            <label>Tên danh mục *</label>

            <input
              v-model="form.name"
              type="text"
              placeholder="Ví dụ: Chụp ảnh"
            />

            <span
              v-if="errors.name"
              class="field-error"
            >
              {{ errors.name }}
            </span>
          </div>

          <div class="form-field">
            <label>Slug</label>

            <input
              v-model="form.slug"
              type="text"
              placeholder="Để trống để tự tạo"
            />

            <span class="field-help">
              Ví dụ: chup-anh
            </span>
          </div>

          <div class="form-field">
            <label>Danh mục cha</label>

            <select v-model="form.parent_id">
              <option :value="null">
                Không có
              </option>

              <option
                v-for="category in parentOptions"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-field">
            <label>Mô tả</label>

            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Mô tả ngắn về danh mục..."
            />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Thứ tự</label>

              <input
                v-model.number="form.sort_order"
                type="number"
                min="0"
              />
            </div>

            <div class="form-field">
              <label>Trạng thái</label>

              <select v-model="form.status">
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
              @click="closeModal"
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
                  : editingCategory
                    ? 'Lưu thay đổi'
                    : 'Tạo danh mục'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useServiceCategoriesView } from './ServiceCategoriesView.ts'

const {
  categories,
  loading,
  saving,
  search,
  statusFilter,
  modalOpen,
  editingCategory,
  formError,
  errors,
  pagination,
  form,
  parentOptions,
  loadCategories,
  handleSearch,
  changePage,
  openCreate,
  openEdit,
  closeModal,
  saveCategory,
  removeCategory,
} = useServiceCategoriesView()
</script>

<style scoped src="./ServiceCategoriesView.css"></style>