<template>
  <section class="coupons-page">
    <header class="page-heading">
      <div>
        <span class="eyebrow">PROMOTION MANAGEMENT</span>
        <h2>Mã giảm giá</h2>
        <p>Quản lý voucher, thời gian áp dụng và giới hạn sử dụng.</p>
      </div>

      <div class="heading-actions">
        <div class="heading-stat">
          <span>Tổng mã</span>
          <strong>{{ pagination.total }}</strong>
        </div>

        <button type="button" class="create-button" @click="openCreateModal">
          <span>＋</span>
          Tạo mã giảm giá
        </button>
      </div>
    </header>

    <section class="coupon-panel">
      <div class="toolbar">
        <div class="search-box">
          <span>⌕</span>
          <input
            v-model.trim="search"
            type="text"
            placeholder="Tìm mã hoặc tên chương trình..."
            @input="handleSearch"
          />
        </div>

        <select v-model="typeFilter" @change="applyFilters">
          <option value="">Tất cả loại</option>
          <option value="percent">Phần trăm</option>
          <option value="fixed">Số tiền cố định</option>
        </select>

        <select v-model="statusFilter" @change="applyFilters">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="scheduled">Sắp diễn ra</option>
          <option value="expired">Hết hạn</option>
          <option value="inactive">Đã tắt</option>
        </select>

        <button
          type="button"
          class="refresh-button"
          :disabled="loading"
          @click="resetFilters"
        >
          ↻ Đặt lại
        </button>
      </div>

      <div v-if="loading" class="state-box">
        <div class="loader" />
        <strong>Đang tải mã giảm giá...</strong>
      </div>

      <div v-else-if="errorMessage" class="state-box error">
        <strong>Không thể tải dữ liệu</strong>
        <span>{{ errorMessage }}</span>
        <button type="button" @click="loadCoupons">Thử lại</button>
      </div>

      <div v-else-if="coupons.length === 0" class="state-box">
        <div class="empty-icon">％</div>
        <strong>Chưa có mã giảm giá</strong>
        <span>Tạo voucher đầu tiên để sử dụng trong luồng đặt lịch.</span>
      </div>

      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã giảm giá</th>
                <th>Mức giảm</th>
                <th>Điều kiện</th>
                <th>Lượt dùng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>

            <tbody>
              <tr v-for="coupon in coupons" :key="coupon.id">
                <td>
                  <div class="coupon-name-cell">
                    <strong class="coupon-code">{{ coupon.code }}</strong>
                    <div>
                      <strong>{{ coupon.name }}</strong>
                      <span>{{ coupon.description || "Không có mô tả" }}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="value-cell">
                    <strong>{{ formatDiscount(coupon) }}</strong>
                    <span
                      v-if="
                        coupon.type === 'percent' && coupon.max_discount_amount
                      "
                    >
                      Tối đa {{ formatMoney(coupon.max_discount_amount) }}
                    </span>
                    <span v-else>{{
                      coupon.type === "percent"
                        ? "Theo phần trăm"
                        : "Giảm trực tiếp"
                    }}</span>
                  </div>
                </td>

                <td>
                  <div class="condition-cell">
                    <span>Đơn tối thiểu</span>
                    <strong>{{ formatMoney(coupon.min_order_amount) }}</strong>
                    <small>
                      {{
                        coupon.usage_limit_per_customer
                          ? `${coupon.usage_limit_per_customer} lần / khách`
                          : "Không giới hạn / khách"
                      }}
                    </small>
                  </div>
                </td>

                <td>
                  <div class="usage-cell">
                    <strong>{{ coupon.usage_count }}</strong>
                    <span>/ {{ coupon.usage_limit ?? "∞" }}</span>
                  </div>
                </td>

                <td>
                  <div class="date-cell">
                    <span>Bắt đầu: {{ formatDateTime(coupon.starts_at) }}</span>
                    <span>Kết thúc: {{ formatDateTime(coupon.ends_at) }}</span>
                  </div>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="`status-${coupon.runtime_status}`"
                  >
                    {{ runtimeLabel(coupon.runtime_status) }}
                  </span>
                </td>

                <td>
                  <div class="row-actions">
                    <button
                      type="button"
                      class="toggle-button"
                      :class="{ active: coupon.is_active }"
                      :title="coupon.is_active ? 'Tắt mã' : 'Bật mã'"
                      :disabled="saving"
                      @click="toggleCoupon(coupon)"
                    >
                      <span />
                    </button>

                    <button
                      type="button"
                      class="icon-button"
                      title="Chỉnh sửa"
                      @click="openEditModal(coupon)"
                    >
                      Sửa
                    </button>

                    <button
                      type="button"
                      class="icon-button danger"
                      title="Xoá"
                      :disabled="deleting"
                      @click="deleteCoupon(coupon)"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span>
            Hiển thị {{ pagination.from || 0 }}–{{ pagination.to || 0 }} /
            {{ pagination.total }} mã
          </span>

          <div class="pagination-actions">
            <button
              type="button"
              :disabled="pagination.current_page <= 1"
              @click="goToPage(pagination.current_page - 1)"
            >
              ←
            </button>

            <strong
              >{{ pagination.current_page }} /
              {{ pagination.last_page }}</strong
            >

            <button
              type="button"
              :disabled="pagination.current_page >= pagination.last_page"
              @click="goToPage(pagination.current_page + 1)"
            >
              →
            </button>
          </div>
        </div>
      </template>
    </section>

    <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
      <section class="coupon-modal">
        <header class="modal-header">
          <div>
            <span>{{ isEditing ? "EDIT COUPON" : "NEW COUPON" }}</span>
            <h3>{{ modalTitle }}</h3>
          </div>

          <button type="button" class="close-button" @click="closeModal">
            ×
          </button>
        </header>

        <form class="coupon-form" @submit.prevent="saveCoupon">
          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="form-grid two-columns">
            <label>
              <span>Mã giảm giá *</span>
              <input
                v-model.trim="form.code"
                type="text"
                maxlength="50"
                placeholder="VD: BOOKORA20"
                required
                @input="form.code = form.code.toUpperCase()"
              />
            </label>

            <label>
              <span>Tên chương trình *</span>
              <input
                v-model.trim="form.name"
                type="text"
                maxlength="150"
                placeholder="Ưu đãi khách mới"
                required
              />
            </label>
          </div>

          <label>
            <span>Mô tả</span>
            <textarea
              v-model.trim="form.description"
              rows="3"
              maxlength="1000"
              placeholder="Ghi chú nội bộ hoặc mô tả chương trình..."
            />
          </label>

          <div class="form-grid three-columns">
            <label>
              <span>Loại giảm *</span>
              <select v-model="form.type">
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định</option>
              </select>
            </label>

            <label>
              <span>{{
                form.type === "percent" ? "Phần trăm giảm *" : "Số tiền giảm *"
              }}</span>
              <input
                v-model.number="form.value"
                type="number"
                min="0.01"
                :max="form.type === 'percent' ? 100 : undefined"
                step="0.01"
                required
              />
            </label>

            <label>
              <span>Đơn tối thiểu</span>
              <input
                v-model.number="form.min_order_amount"
                type="number"
                min="0"
                step="1000"
              />
            </label>
          </div>

          <div class="form-grid three-columns">
            <label>
              <span>Giảm tối đa</span>
              <input
                v-model.number="form.max_discount_amount"
                type="number"
                min="0"
                step="1000"
                :disabled="form.type === 'fixed'"
                placeholder="Không giới hạn"
              />
            </label>

            <label>
              <span>Tổng lượt sử dụng</span>
              <input
                v-model.number="form.usage_limit"
                type="number"
                min="1"
                step="1"
                placeholder="Không giới hạn"
              />
            </label>

            <label>
              <span>Lượt / khách</span>
              <input
                v-model.number="form.usage_limit_per_customer"
                type="number"
                min="1"
                step="1"
                placeholder="Không giới hạn"
              />
            </label>
          </div>

          <div class="form-grid two-columns">
            <label>
              <span>Bắt đầu</span>
              <input v-model="form.starts_at" type="datetime-local" />
            </label>

            <label>
              <span>Kết thúc</span>
              <input v-model="form.ends_at" type="datetime-local" />
            </label>
          </div>

          <label class="switch-row">
            <div>
              <strong>Kích hoạt mã</strong>
              <span>Tắt để ngừng cho khách áp dụng mã này.</span>
            </div>

            <input v-model="form.is_active" type="checkbox" />
          </label>

          <footer class="modal-actions">
            <button
              type="button"
              class="secondary-button"
              :disabled="saving"
              @click="closeModal"
            >
              Huỷ
            </button>
            <button type="submit" class="primary-button" :disabled="saving">
              {{
                saving
                  ? "Đang lưu..."
                  : isEditing
                    ? "Lưu thay đổi"
                    : "Tạo mã giảm giá"
              }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCouponsView } from "./CouponsView.ts";

const {
  coupons,
  loading,
  saving,
  deleting,
  errorMessage,
  formError,
  modalOpen,
  search,
  typeFilter,
  statusFilter,
  pagination,
  form,
  isEditing,
  modalTitle,
  formatMoney,
  formatDiscount,
  formatDateTime,
  runtimeLabel,
  loadCoupons,
  handleSearch,
  applyFilters,
  resetFilters,
  goToPage,
  openCreateModal,
  openEditModal,
  closeModal,
  saveCoupon,
  toggleCoupon,
  deleteCoupon,
} = useCouponsView();
</script>

<style scoped src="./CouponsView.css"></style>
