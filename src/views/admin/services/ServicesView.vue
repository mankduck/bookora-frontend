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
import {
  onMounted,
  reactive,
  ref,
} from 'vue'
import axios from 'axios'

import serviceApi, {
  type Service,
  type ServiceVariant,
} from '@/services/service.api'

import serviceCategoryApi, {
  type ServiceCategory,
} from '@/services/serviceCategory.api'

const services = ref<Service[]>([])
const categories = ref<ServiceCategory[]>([])

const loading = ref(false)
const saving = ref(false)

const search = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

const expandedServiceId =
  ref<number | null>(null)

const serviceModalOpen = ref(false)
const variantModalOpen = ref(false)

const editingService =
  ref<Service | null>(null)

const selectedService =
  ref<Service | null>(null)

const editingVariant =
  ref<ServiceVariant | null>(null)

const formError = ref('')

const serviceForm = reactive({
  category_id: null as number | null,
  name: '',
  slug: '',
  short_description: '',
  description: '',
  base_price: 0,
  default_duration_minutes: 60,
  status: 'active' as 'active' | 'inactive',
  is_featured: false,
  sort_order: 0,
})

const variantForm = reactive({
  name: '',
  code: '',
  description: '',
  price: 0,
  sale_price: null as number | null,
  duration_minutes: 60,
  deposit_type: 'none' as
    | 'none'
    | 'fixed'
    | 'percent',
  deposit_value: 0,
  status: 'active' as
    | 'active'
    | 'inactive',
  sort_order: 0,
})

let searchTimer:
  | ReturnType<typeof setTimeout>
  | undefined

const formatMoney = (
  value: string | number | null,
) => {
  const number = Number(value ?? 0)

  return new Intl.NumberFormat(
    'vi-VN',
    {
      style: 'currency',
      currency: 'VND',
    },
  ).format(number)
}

const depositText = (
  variant: ServiceVariant,
) => {
  if (variant.deposit_type === 'none') {
    return 'Không'
  }

  if (variant.deposit_type === 'percent') {
    return `${Number(
      variant.deposit_value,
    )}%`
  }

  return formatMoney(
    variant.deposit_value,
  )
}

const loadCategories = async () => {
  const result =
    await serviceCategoryApi.getAll({
      per_page: 100,
    })

  categories.value = result.data
}

const loadServices = async () => {
  loading.value = true

  try {
    const result =
      await serviceApi.getAll({
        search:
          search.value || undefined,

        category_id:
          categoryFilter.value
            ? Number(categoryFilter.value)
            : undefined,

        status:
          statusFilter.value ||
          undefined,

        per_page: 50,
      })

    services.value = result.data
  } finally {
    loading.value = false
  }
}

const reloadFromFirstPage = () => {
  loadServices()
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(
    loadServices,
    350,
  )
}

const toggleVariants = (
  serviceId: number,
) => {
  expandedServiceId.value =
    expandedServiceId.value === serviceId
      ? null
      : serviceId
}

const resetServiceForm = () => {
  serviceForm.category_id = null
  serviceForm.name = ''
  serviceForm.slug = ''
  serviceForm.short_description = ''
  serviceForm.description = ''
  serviceForm.base_price = 0
  serviceForm.default_duration_minutes = 60
  serviceForm.status = 'active'
  serviceForm.is_featured = false
  serviceForm.sort_order = 0

  formError.value = ''
}

const openCreateService = () => {
  resetServiceForm()

  editingService.value = null
  serviceModalOpen.value = true
}

const openEditService = (
  service: Service,
) => {
  resetServiceForm()

  editingService.value = service

  serviceForm.category_id =
    service.category_id

  serviceForm.name =
    service.name

  serviceForm.slug =
    service.slug

  serviceForm.short_description =
    service.short_description ?? ''

  serviceForm.description =
    service.description ?? ''

  serviceForm.base_price =
    Number(service.base_price)

  serviceForm.default_duration_minutes =
    service.default_duration_minutes

  serviceForm.status =
    service.status

  serviceForm.is_featured =
    service.is_featured

  serviceForm.sort_order =
    service.sort_order

  serviceModalOpen.value = true
}

const closeServiceModal = () => {
  serviceModalOpen.value = false
  editingService.value = null
  resetServiceForm()
}

const saveService = async () => {
  formError.value = ''

  if (!serviceForm.name.trim()) {
    formError.value =
      'Vui lòng nhập tên dịch vụ.'
    return
  }

  saving.value = true

  try {
    const payload = {
      category_id:
        serviceForm.category_id,

      name:
        serviceForm.name.trim(),

      slug:
        serviceForm.slug.trim() ||
        undefined,

      short_description:
        serviceForm.short_description,

      description:
        serviceForm.description,

      base_price:
        Number(serviceForm.base_price),

      default_duration_minutes:
        Number(
          serviceForm.default_duration_minutes,
        ),

      status:
        serviceForm.status,

      is_featured:
        serviceForm.is_featured,

      sort_order:
        Number(
          serviceForm.sort_order,
        ),
    }

    if (editingService.value) {
      await serviceApi.update(
        editingService.value.id,
        payload,
      )
    } else {
      await serviceApi.create(payload)
    }

    closeServiceModal()
    await loadServices()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      formError.value =
        error.response?.data?.message ||
        Object.values(
          error.response?.data?.errors ?? {},
        )?.[0]?.[0] ||
        'Không thể lưu dịch vụ.'
    }
  } finally {
    saving.value = false
  }
}

const removeService = async (
  service: Service,
) => {
  if (
    !window.confirm(
      `Xóa dịch vụ "${service.name}"?`,
    )
  ) {
    return
  }

  try {
    await serviceApi.remove(service.id)
    await loadServices()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      window.alert(
        error.response?.data?.message ||
        'Không thể xóa dịch vụ.',
      )
    }
  }
}

const resetVariantForm = () => {
  variantForm.name = ''
  variantForm.code = ''
  variantForm.description = ''
  variantForm.price = 0
  variantForm.sale_price = null
  variantForm.duration_minutes = 60
  variantForm.deposit_type = 'none'
  variantForm.deposit_value = 0
  variantForm.status = 'active'
  variantForm.sort_order = 0

  formError.value = ''
}

const openCreateVariant = (
  service: Service,
) => {
  resetVariantForm()

  selectedService.value = service
  editingVariant.value = null

  variantForm.price =
    Number(service.base_price)

  variantForm.duration_minutes =
    service.default_duration_minutes

  variantModalOpen.value = true
}

const openEditVariant = (
  service: Service,
  variant: ServiceVariant,
) => {
  resetVariantForm()

  selectedService.value = service
  editingVariant.value = variant

  variantForm.name = variant.name
  variantForm.code = variant.code ?? ''
  variantForm.description =
    variant.description ?? ''

  variantForm.price =
    Number(variant.price)

  variantForm.sale_price =
    variant.sale_price === null
      ? null
      : Number(variant.sale_price)

  variantForm.duration_minutes =
    variant.duration_minutes

  variantForm.deposit_type =
    variant.deposit_type

  variantForm.deposit_value =
    Number(variant.deposit_value)

  variantForm.status =
    variant.status

  variantForm.sort_order =
    variant.sort_order

  variantModalOpen.value = true
}

const closeVariantModal = () => {
  variantModalOpen.value = false
  selectedService.value = null
  editingVariant.value = null

  resetVariantForm()
}

const saveVariant = async () => {
  if (!selectedService.value) {
    return
  }

  formError.value = ''

  if (!variantForm.name.trim()) {
    formError.value =
      'Vui lòng nhập tên gói.'
    return
  }

  saving.value = true

  try {
    const payload = {
      name: variantForm.name.trim(),

      code:
        variantForm.code.trim() ||
        null,

      description:
        variantForm.description,

      price:
        Number(variantForm.price),

      sale_price:
        variantForm.sale_price === null ||
        variantForm.sale_price === 0
          ? null
          : Number(
              variantForm.sale_price,
            ),

      duration_minutes:
        Number(
          variantForm.duration_minutes,
        ),

      deposit_type:
        variantForm.deposit_type,

      deposit_value:
        variantForm.deposit_type ===
        'none'
          ? 0
          : Number(
              variantForm.deposit_value,
            ),

      status:
        variantForm.status,

      sort_order:
        Number(
          variantForm.sort_order,
        ),
    }

    if (editingVariant.value) {
      await serviceApi.updateVariant(
        selectedService.value.id,
        editingVariant.value.id,
        payload,
      )
    } else {
      await serviceApi.createVariant(
        selectedService.value.id,
        payload,
      )
    }

    const serviceId =
      selectedService.value.id

    closeVariantModal()

    await loadServices()

    expandedServiceId.value =
      serviceId
  } catch (error) {
    if (axios.isAxiosError(error)) {
      formError.value =
        error.response?.data?.message ||
        Object.values(
          error.response?.data?.errors ?? {},
        )?.[0]?.[0] ||
        'Không thể lưu gói.'
    }
  } finally {
    saving.value = false
  }
}

const removeVariant = async (
  service: Service,
  variant: ServiceVariant,
) => {
  if (
    !window.confirm(
      `Xóa gói "${variant.name}"?`,
    )
  ) {
    return
  }

  try {
    await serviceApi.removeVariant(
      service.id,
      variant.id,
    )

    await loadServices()

    expandedServiceId.value =
      service.id
  } catch (error) {
    if (axios.isAxiosError(error)) {
      window.alert(
        error.response?.data?.message ||
        'Không thể xóa gói.',
      )
    }
  }
}

onMounted(async () => {
  await loadCategories()
  await loadServices()
})
</script>

<style scoped>
.services-page {
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
}

.page-heading p {
  margin: 0;
  color: #8d919b;
  font-size: 12px;
}

.service-panel {
  overflow: hidden;
  border: 1px solid #e8e9ed;
  border-radius: 15px;
  background: #fff;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 17px;
  border-bottom: 1px solid #eceef1;
}

.search-box {
  width: 340px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #e4e6ea;
  border-radius: 9px;
  background: #f8f9fa;
}

.search-box input {
  width: 100%;
  height: 40px;
  border: 0;
  outline: none;
  background: transparent;
}

.toolbar select {
  height: 40px;
  padding: 0 11px;
  border: 1px solid #e4e6ea;
  border-radius: 9px;
  background: #fff;
}

.state,
.empty {
  min-height: 330px;
  display: grid;
  place-content: center;
  justify-items: center;
}

.empty p {
  margin: 5px 0 18px;
  color: #969aa4;
  font-size: 11px;
}

.service-list {
  display: grid;
}

.service-card {
  border-bottom: 1px solid #eceef1;
}

.service-card:last-child {
  border-bottom: 0;
}

.service-main {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 17px;
}

.service-avatar {
  flex: 0 0 auto;
  width: 47px;
  height: 47px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #f0f1f4;
  font-weight: 750;
}

.service-info {
  flex: 1;
}

.service-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.service-title-row h3 {
  margin: 0;
  font-size: 14px;
}

.service-info p {
  margin: 5px 0 7px;
  color: #8a8e98;
  font-size: 11px;
}

.service-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
  color: #777b85;
  font-size: 10px;
}

.status,
.featured-badge {
  padding: 4px 7px;
  border-radius: 99px;
  font-size: 8px;
  font-weight: 650;
}

.status.active {
  background: #edf8f0;
  color: #3f8055;
}

.status.inactive {
  background: #f0f1f3;
  color: #7e828c;
}

.featured-badge {
  background: #fff6dd;
  color: #957017;
}

.service-actions,
.variant-actions {
  display: flex;
  gap: 6px;
}

.service-actions button,
.variant-actions button {
  padding: 7px 10px;
  border: 1px solid #e1e3e7;
  border-radius: 7px;
  background: #fff;
  font-size: 10px;
}

.danger {
  color: #ba4545;
}

.variants-section {
  padding: 17px;
  background: #fafafb;
  border-top: 1px solid #eceef1;
}

.variants-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 13px;
}

.variants-heading > div {
  display: grid;
  gap: 3px;
}

.variants-heading strong {
  font-size: 11px;
}

.variants-heading span {
  color: #969aa4;
  font-size: 9px;
}

.variant-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.variant-card {
  padding: 14px;
  border: 1px solid #e5e7ea;
  border-radius: 11px;
  background: #fff;
}

.variant-top {
  display: flex;
  justify-content: space-between;
}

.variant-top > div {
  display: grid;
}

.variant-top strong {
  font-size: 11px;
}

.variant-top span {
  color: #9599a2;
  font-size: 8px;
}

.variant-price {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin: 14px 0 10px;
}

.variant-price strong {
  font-size: 16px;
}

.variant-price del {
  color: #a2a5ad;
  font-size: 9px;
}

.variant-details {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  color: #7e828c;
  font-size: 9px;
}

.variant-empty {
  padding: 20px;
  border: 1px dashed #dfe1e6;
  border-radius: 10px;
  color: #9296a0;
  text-align: center;
  font-size: 10px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 17, 22, 0.45);
}

.modal {
  width: min(600px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  border-radius: 17px;
  background: #fff;
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
}

.modal-heading h3 {
  margin: 0;
  font-size: 18px;
}

.modal-heading p {
  margin: 4px 0 0;
  color: #9498a2;
  font-size: 10px;
}

.modal-close {
  width: 31px;
  height: 31px;
  border: 0;
  border-radius: 8px;
  background: #f2f3f5;
  font-size: 19px;
}

.form {
  display: grid;
  gap: 15px;
}

.form-field {
  display: grid;
  gap: 7px;
}

.form-field label {
  font-size: 10px;
  font-weight: 650;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 0 11px;
  border: 1px solid #e0e2e6;
  border-radius: 9px;
  outline: none;
  background: #fbfbfc;
  font: inherit;
  font-size: 11px;
}

.form-field input,
.form-field select {
  height: 41px;
}

.form-field textarea {
  padding-top: 10px;
  resize: vertical;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
}

.form-error {
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  background: #fff2f2;
  color: #b84545;
  font-size: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 5px;
}

.secondary-button {
  height: 40px;
  padding: 0 13px;
  border: 1px solid #e1e3e7;
  border-radius: 8px;
  background: #fff;
  font-size: 10px;
}

/* ===== SERVICES TYPOGRAPHY SCALE ===== */

.services-page,
.page {
  font-size: 14px;
}

/* Header */
.page-heading .eyebrow,
.page-header .eyebrow {
  font-size: 11px;
}

.page-heading h2,
.page-header h1 {
  font-size: 30px;
}

.page-heading p,
.page-header p {
  font-size: 13px;
  line-height: 1.6;
}

/* Toolbar / filter */
.search-box input,
.toolbar input,
.toolbar select,
.filters-card input,
.filters-card select {
  font-size: 13px;
}

/* Nút */
.primary-button,
.secondary-button,
.view-button,
.edit-button,
.delete-button,
.add-variant-button {
  font-size: 12px;
}

/* Card / table */
.service-card h3,
.service-name,
.service-title {
  font-size: 15px;
}

.service-card p,
.service-description,
.service-meta span {
  font-size: 12px;
}

table th {
  font-size: 11px;
}

table td {
  font-size: 13px;
}

table td strong {
  font-size: 13px;
}

/* Badge */
.status,
.status-badge,
.featured-badge {
  font-size: 10px;
}

/* ===== MODAL DỊCH VỤ ===== */

.modal {
  font-size: 14px;
}

.modal-heading h3,
.modal-header h2 {
  font-size: 21px;
}

.modal-heading p,
.modal-header p {
  font-size: 12px;
  line-height: 1.5;
}

.section-heading strong {
  font-size: 14px;
}

.form-field label {
  font-size: 12px;
}

.form-field input,
.form-field textarea,
.form-field select {
  font-size: 13px;
}

.form-error {
  font-size: 12px;
}

.modal-actions button {
  font-size: 12px;
}

/* ===== SERVICE VARIANTS / GÓI ===== */

.variant-title,
.variant-card h4,
.variant-card h3 {
  font-size: 14px;
}

.variant-card p,
.variant-description {
  font-size: 12px;
  line-height: 1.5;
}

.variant-meta span,
.variant-tag,
.variant-badge {
  font-size: 10px;
}

.variant-price,
.variant-price strong {
  font-size: 16px;
}

.variant-price del {
  font-size: 11px;
}

/* Form gói */
.variant-form label {
  font-size: 12px;
}

.variant-form input,
.variant-form textarea,
.variant-form select {
  font-size: 13px;
}

@media (max-width: 900px) {
  .variant-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .page-heading,
  .service-main,
  .toolbar {
    align-items: stretch;
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