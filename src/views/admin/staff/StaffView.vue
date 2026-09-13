<template>
  <section class="staff-page">
    <div class="page-heading">
      <div>
        <span class="eyebrow">
          Nhân sự
        </span>

        <h2>Nhân viên</h2>

        <p>
          Quản lý nhân viên, dịch vụ phụ trách và lịch làm việc.
        </p>
      </div>

      <button
        class="primary-button"
        type="button"
        @click="openCreate"
      >
        + Thêm nhân viên
      </button>
    </div>

    <div class="staff-panel">
      <div class="toolbar">
        <div class="search-box">
          <span>⌕</span>

          <input
            v-model="search"
            type="text"
            placeholder="Tìm tên, email, số điện thoại..."
            @input="handleSearch"
          />
        </div>

        <select
          v-model="serviceFilter"
          @change="loadStaff"
        >
          <option value="">
            Tất cả dịch vụ
          </option>

          <option
            v-for="service in services"
            :key="service.id"
            :value="service.id"
          >
            {{ service.name }}
          </option>
        </select>

        <select
          v-model="statusFilter"
          @change="loadStaff"
        >
          <option value="">
            Tất cả trạng thái
          </option>

          <option value="active">
            Hoạt động
          </option>

          <option value="inactive">
            Đã khóa
          </option>
        </select>
      </div>

      <div
        v-if="loading"
        class="state"
      >
        Đang tải nhân viên...
      </div>

      <div
        v-else-if="staffList.length === 0"
        class="empty"
      >
        <div class="empty-icon">
          ♙
        </div>

        <strong>
          Chưa có nhân viên
        </strong>

        <p>
          Thêm nhân viên để bắt đầu phân công booking.
        </p>

        <button
          class="primary-button"
          type="button"
          @click="openCreate"
        >
          + Thêm nhân viên
        </button>
      </div>

      <div
        v-else
        class="staff-grid"
      >
        <article
          v-for="staff in staffList"
          :key="staff.id"
          class="staff-card"
        >
          <div class="staff-top">
            <div class="avatar-large">
              {{
                staff.user.name
                  .charAt(0)
                  .toUpperCase()
              }}
            </div>

            <div class="staff-basic">
              <div class="staff-name-row">
                <h3>
                  {{ staff.user.name }}
                </h3>

                <span
                  class="status"
                  :class="staff.status"
                >
                  {{
                    staff.status === 'active'
                      ? 'Hoạt động'
                      : 'Đã khóa'
                  }}
                </span>
              </div>

              <strong class="position">
                {{
                  staff.position ||
                  'Nhân viên'
                }}
              </strong>

              <span>
                {{ staff.user.phone }}
              </span>

              <span v-if="staff.user.email">
                {{ staff.user.email }}
              </span>
            </div>
          </div>

          <div class="staff-meta">
            <div>
              <span>Kinh nghiệm</span>

              <strong>
                {{ staff.experience_years }}
                năm
              </strong>
            </div>

            <div>
              <span>Dịch vụ</span>

              <strong>
                {{ staff.services.length }}
              </strong>
            </div>

            <div>
              <span>Nhận booking</span>

              <strong>
                {{
                  staff.is_bookable
                    ? 'Có'
                    : 'Không'
                }}
              </strong>
            </div>
          </div>

          <div class="service-tags">
            <span
              v-for="service in staff.services"
              :key="service.id"
            >
              {{ service.name }}
            </span>

            <span
              v-if="!staff.services.length"
              class="muted-tag"
            >
              Chưa gán dịch vụ
            </span>
          </div>

          <div class="staff-actions">
            <button
              type="button"
              @click="openEdit(staff)"
            >
              Sửa
            </button>

            <button
              type="button"
              class="danger"
              @click="removeStaff(staff)"
            >
              Xóa
            </button>
          </div>
        </article>
      </div>
    </div>

    <div
      v-if="modalOpen"
      class="modal-backdrop"
      @click.self="closeModal"
    >
      <div class="modal">
        <div class="modal-heading">
          <div>
            <h3>
              {{
                editingStaff
                  ? 'Sửa nhân viên'
                  : 'Thêm nhân viên'
              }}
            </h3>

            <p>
              Cấu hình tài khoản, nghiệp vụ và lịch làm việc.
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
          class="form"
          @submit.prevent="saveStaff"
        >
          <section class="form-section">
            <div class="section-heading">
              <strong>
                Thông tin tài khoản
              </strong>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>Họ tên *</label>

                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div class="form-field">
                <label>Số điện thoại *</label>

                <input
                  v-model="form.phone"
                  type="text"
                  placeholder="090..."
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>Email</label>

                <input
                  v-model="form.email"
                  type="email"
                  placeholder="staff@bookora.test"
                />
              </div>

              <div class="form-field">
                <label>
                  {{
                    editingStaff
                      ? 'Mật khẩu mới'
                      : 'Mật khẩu *'
                  }}
                </label>

                <input
                  v-model="form.password"
                  type="password"
                  :placeholder="
                    editingStaff
                      ? 'Để trống nếu không đổi'
                      : 'Tối thiểu 8 ký tự'
                  "
                />
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-heading">
              <strong>
                Hồ sơ nhân viên
              </strong>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>Mã nhân viên</label>

                <input
                  v-model="form.employee_code"
                  type="text"
                  placeholder="NV001"
                />
              </div>

              <div class="form-field">
                <label>Chức vụ</label>

                <input
                  v-model="form.position"
                  type="text"
                  placeholder="Photographer"
                />
              </div>
            </div>

            <div class="form-field">
              <label>Giới thiệu</label>

              <textarea
                v-model="form.bio"
                rows="3"
                placeholder="Thông tin nhân viên..."
              />
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>
                  Số năm kinh nghiệm
                </label>

                <input
                  v-model.number="
                    form.experience_years
                  "
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
                    Đã khóa
                  </option>
                </select>
              </div>
            </div>

            <label class="checkbox-row">
              <input
                v-model="form.is_bookable"
                type="checkbox"
              />

              <span>
                Có thể được phân công booking
              </span>
            </label>
          </section>

          <section class="form-section">
            <div class="section-heading">
              <strong>
                Dịch vụ có thể thực hiện
              </strong>
            </div>

            <div class="service-selector">
              <label
                v-for="service in services"
                :key="service.id"
                class="service-option"
              >
                <input
                  v-model="form.service_ids"
                  type="checkbox"
                  :value="service.id"
                />

                <span>
                  {{ service.name }}
                </span>
              </label>
            </div>
          </section>

          <section class="form-section">
            <div class="section-heading">
              <strong>
                Lịch làm việc hàng tuần
              </strong>

              <span>
                Booking Engine sẽ dùng lịch này để kiểm tra khả dụng.
              </span>
            </div>

            <div class="schedule-list">
              <div
                v-for="schedule in form.schedules"
                :key="schedule.day_of_week"
                class="schedule-row"
              >
                <label class="day-toggle">
                  <input
                    v-model="
                      schedule.is_working
                    "
                    type="checkbox"
                  />

                  <strong>
                    {{
                      dayName(
                        schedule.day_of_week,
                      )
                    }}
                  </strong>
                </label>

                <template
                  v-if="schedule.is_working"
                >
                  <input
                    v-model="
                      schedule.start_time
                    "
                    type="time"
                  />

                  <span>đến</span>

                  <input
                    v-model="
                      schedule.end_time
                    "
                    type="time"
                  />
                </template>

                <span
                  v-else
                  class="day-off"
                >
                  Nghỉ
                </span>
              </div>
            </div>
          </section>

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
                  : editingStaff
                    ? 'Lưu thay đổi'
                    : 'Tạo nhân viên'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useStaffView } from './StaffView.ts'

const {
  staffList,
  services,
  loading,
  saving,
  search,
  serviceFilter,
  statusFilter,
  modalOpen,
  editingStaff,
  formError,
  form,
  dayName,
  loadStaff,
  handleSearch,
  openCreate,
  openEdit,
  closeModal,
  saveStaff,
  removeStaff,
} = useStaffView()
</script>

<style scoped src="./StaffView.css"></style>
