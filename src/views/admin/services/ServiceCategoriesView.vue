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
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'

import axios from 'axios'

import serviceCategoryApi, {
  type ServiceCategory,
} from '@/services/serviceCategory.api'

const categories = ref<ServiceCategory[]>([])
const loading = ref(false)
const saving = ref(false)

const search = ref('')
const statusFilter = ref('')

const modalOpen = ref(false)

const editingCategory =
  ref<ServiceCategory | null>(null)

const formError = ref('')

const errors = reactive({
  name: '',
})

const pagination = reactive({
  page: 1,
  lastPage: 1,
  total: 0,
})

const form = reactive({
  parent_id: null as number | null,
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
  status: 'active' as 'active' | 'inactive',
})

const parentOptions = computed(() =>
  categories.value.filter(
    (category) =>
      category.id !== editingCategory.value?.id,
  ),
)

let searchTimer: ReturnType<typeof setTimeout>

const loadCategories = async () => {
  loading.value = true

  try {
    const result =
      await serviceCategoryApi.getAll({
        search: search.value || undefined,
        status:
          statusFilter.value || undefined,
        page: pagination.page,
        per_page: 20,
      })

    categories.value = result.data

    pagination.page = result.current_page
    pagination.lastPage = result.last_page
    pagination.total = result.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    pagination.page = 1
    loadCategories()
  }, 350)
}

const changePage = (page: number) => {
  pagination.page = page
  loadCategories()
}

const resetForm = () => {
  form.parent_id = null
  form.name = ''
  form.slug = ''
  form.description = ''
  form.sort_order = 0
  form.status = 'active'

  errors.name = ''
  formError.value = ''
}

const openCreate = () => {
  resetForm()

  editingCategory.value = null
  modalOpen.value = true
}

const openEdit = (
  category: ServiceCategory,
) => {
  resetForm()

  editingCategory.value = category

  form.parent_id = category.parent_id
  form.name = category.name
  form.slug = category.slug
  form.description =
    category.description ?? ''
  form.sort_order = category.sort_order
  form.status = category.status

  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editingCategory.value = null
  resetForm()
}

const saveCategory = async () => {
  errors.name = ''
  formError.value = ''

  if (!form.name.trim()) {
    errors.name =
      'Vui lòng nhập tên danh mục.'
    return
  }

  saving.value = true

  try {
    const payload = {
      parent_id: form.parent_id,
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description,
      sort_order: form.sort_order,
      status: form.status,
    }

    if (editingCategory.value) {
      await serviceCategoryApi.update(
        editingCategory.value.id,
        payload,
      )
    } else {
      await serviceCategoryApi.create(
        payload,
      )
    }

    closeModal()
    await loadCategories()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errors.name =
        error.response?.data?.errors?.name?.[0] ??
        ''

      formError.value =
        error.response?.data?.message ??
        'Không thể lưu danh mục.'
    } else {
      formError.value =
        'Có lỗi xảy ra khi lưu dữ liệu.'
    }
  } finally {
    saving.value = false
  }
}

const removeCategory = async (
  category: ServiceCategory,
) => {
  const confirmed = window.confirm(
    `Bạn có chắc muốn xóa "${category.name}"?`,
  )

  if (!confirmed) {
    return
  }

  try {
    await serviceCategoryApi.remove(
      category.id,
    )

    await loadCategories()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      window.alert(
        error.response?.data?.message ??
          'Không thể xóa danh mục.',
      )
    }
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.category-page {
  width: 100%;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.page-heading h2 {
  margin: 6px 0;
  font-size: 25px;
  letter-spacing: -0.7px;
}

.page-heading p {
  margin: 0;
  color: #8c909a;
  font-size: 12px;
}

.category-panel {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8e9ed;
  border-radius: 15px;
}

.category-toolbar {
  display: flex;
  gap: 12px;
  padding: 17px;
  border-bottom: 1px solid #eceef1;
}

.search-box {
  width: min(370px, 100%);
  height: 40px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
}

.search-box span {
  color: #8b8f99;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 12px;
}

.filter-select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #fff;
  outline: none;
  font-size: 12px;
}

.category-table-wrap {
  overflow-x: auto;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th {
  padding: 12px 17px;
  background: #fafafb;
  color: #9296a0;
  font-size: 10px;
  font-weight: 650;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.category-table td {
  padding: 14px 17px;
  border-top: 1px solid #f0f1f3;
  font-size: 12px;
}

.category-name-cell {
  display: flex;
  align-items: center;
  gap: 11px;
}

.category-thumbnail {
  width: 37px;
  height: 37px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #f0f1f4;
  color: #474b54;
  font-weight: 700;
}

.category-name-cell > div:last-child {
  display: grid;
  gap: 3px;
}

.category-name-cell strong {
  font-size: 12px;
}

.category-name-cell span {
  color: #999da6;
  font-size: 10px;
}

.muted {
  color: #8c9099;
}

.category-status {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 650;
}

.category-status.active {
  background: #edf8f0;
  color: #3f8055;
}

.category-status.inactive {
  background: #f1f2f4;
  color: #7e828c;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.row-actions button {
  padding: 6px 9px;
  border: 1px solid #e2e4e8;
  border-radius: 7px;
  background: #fff;
  color: #555a64;
  font-size: 10px;
}

.row-actions .danger {
  color: #bd4b4b;
}

.category-empty,
.table-state {
  min-height: 330px;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
}

.category-empty strong {
  font-size: 13px;
}

.category-empty p {
  margin: 6px 0 17px;
  color: #969aa4;
  font-size: 11px;
}

.table-state {
  color: #969aa4;
  font-size: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 13px 17px;
  border-top: 1px solid #eceef1;
}

.pagination span {
  color: #7f838d;
  font-size: 10px;
}

.pagination button {
  width: 30px;
  height: 30px;
  border: 1px solid #e1e3e7;
  border-radius: 7px;
  background: #fff;
}

.pagination button:disabled {
  opacity: 0.4;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 17, 22, 0.45);
  backdrop-filter: blur(2px);
}

.category-modal {
  width: min(520px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  background: #fff;
  border-radius: 17px;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.18);
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 23px;
}

.modal-heading h3 {
  margin: 0;
  font-size: 18px;
}

.modal-heading p {
  margin: 5px 0 0;
  color: #969aa4;
  font-size: 11px;
}

.modal-close {
  width: 31px;
  height: 31px;
  border: 0;
  border-radius: 8px;
  background: #f3f4f6;
  color: #747983;
  font-size: 19px;
}

.category-form {
  display: grid;
  gap: 17px;
}

.form-field {
  display: grid;
  gap: 7px;
}

.form-field label {
  font-size: 11px;
  font-weight: 650;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 0 12px;
  border: 1px solid #e0e2e7;
  border-radius: 9px;
  background: #fbfbfc;
  outline: none;
  font: inherit;
  font-size: 12px;
}

.form-field input,
.form-field select {
  height: 42px;
}

.form-field textarea {
  padding-top: 11px;
  resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #858a95;
  background: #fff;
}

.field-help {
  color: #a1a4ad;
  font-size: 9px;
}

.field-error,
.form-error {
  color: #bd4141;
  font-size: 10px;
}

.form-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff4f4;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding-top: 7px;
}

.secondary-button {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #e1e3e7;
  border-radius: 9px;
  background: #fff;
  color: #555963;
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 700px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-toolbar {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>