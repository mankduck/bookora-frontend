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
import {
  onMounted,
  reactive,
  ref,
} from 'vue'

import axios from 'axios'

import staffApi, {
  type Staff,
} from '@/services/staff.api'

import serviceApi, {
  type Service,
} from '@/services/service.api'

const staffList = ref<Staff[]>([])
const services = ref<Service[]>([])

const loading = ref(false)
const saving = ref(false)

const search = ref('')
const serviceFilter = ref('')
const statusFilter = ref('')

const modalOpen = ref(false)

const editingStaff =
  ref<Staff | null>(null)

const formError = ref('')

const defaultSchedules = () =>
  Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    start_time: '08:00',
    end_time: '17:00',
    is_working:
      day !== 0,
  }))

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  employee_code: '',
  position: '',
  bio: '',
  experience_years: 0,
  is_bookable: true,
  status: 'active' as
    | 'active'
    | 'inactive',
  sort_order: 0,
  service_ids: [] as number[],
  schedules: defaultSchedules(),
})

let searchTimer:
  | ReturnType<typeof setTimeout>
  | undefined

const dayName = (day: number) => {
  const days = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ]

  return days[day]
}

const loadServices = async () => {
  const result =
    await serviceApi.getAll({
      per_page: 100,
      status: 'active',
    })

  services.value = result.data
}

const loadStaff = async () => {
  loading.value = true

  try {
    const result =
      await staffApi.getAll({
        search:
          search.value || undefined,

        service_id:
          serviceFilter.value
            ? Number(serviceFilter.value)
            : undefined,

        status:
          statusFilter.value ||
          undefined,

        per_page: 100,
      })

    staffList.value =
      result.data
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(
    loadStaff,
    350,
  )
}

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.password = ''
  form.employee_code = ''
  form.position = ''
  form.bio = ''
  form.experience_years = 0
  form.is_bookable = true
  form.status = 'active'
  form.sort_order = 0
  form.service_ids = []
  form.schedules =
    defaultSchedules()

  formError.value = ''
}

const openCreate = () => {
  resetForm()
  editingStaff.value = null
  modalOpen.value = true
}

const openEdit = (
  staff: Staff,
) => {
  resetForm()

  editingStaff.value =
    staff

  form.name =
    staff.user.name

  form.email =
    staff.user.email ?? ''

  form.phone =
    staff.user.phone ?? ''

  form.employee_code =
    staff.employee_code ?? ''

  form.position =
    staff.position ?? ''

  form.bio =
    staff.bio ?? ''

  form.experience_years =
    staff.experience_years ?? 0

  form.is_bookable =
    staff.is_bookable

  form.status =
    staff.status

  form.sort_order =
    staff.sort_order ?? 0

  form.service_ids =
    staff.services.map(
      (service) => service.id,
    )

  const schedules =
    defaultSchedules()

  staff.schedules.forEach(
    (savedSchedule) => {
      const index =
        savedSchedule.day_of_week

      schedules[index] = {
        day_of_week:
          savedSchedule.day_of_week,

        start_time:
          savedSchedule.start_time
            .slice(0, 5),

        end_time:
          savedSchedule.end_time
            .slice(0, 5),

        is_working:
          savedSchedule.is_working,
      }
    },
  )

  form.schedules = schedules

  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editingStaff.value = null
  resetForm()
}

const saveStaff = async () => {
  formError.value = ''

  if (!form.name.trim()) {
    formError.value =
      'Vui lòng nhập họ tên.'
    return
  }

  if (!form.phone.trim()) {
    formError.value =
      'Vui lòng nhập số điện thoại.'
    return
  }

  if (
    !editingStaff.value &&
    form.password.length < 8
  ) {
    formError.value =
      'Mật khẩu phải có ít nhất 8 ký tự.'
    return
  }

  for (
    const schedule of form.schedules
  ) {
    if (
      schedule.is_working &&
      schedule.start_time >=
        schedule.end_time
    ) {
      formError.value =
        `${dayName(
          schedule.day_of_week,
        )}: giờ kết thúc phải sau giờ bắt đầu.`

      return
    }
  }

  saving.value = true

  try {
    const payload = {
      name:
        form.name.trim(),

      email:
        form.email.trim() ||
        null,

      phone:
        form.phone.trim(),

      password:
        form.password || undefined,

      employee_code:
        form.employee_code.trim() ||
        null,

      position:
        form.position.trim() ||
        null,

      bio:
        form.bio,

      experience_years:
        Number(
          form.experience_years,
        ),

      is_bookable:
        form.is_bookable,

      status:
        form.status,

      sort_order:
        Number(form.sort_order),

      service_ids:
        form.service_ids,

      schedules:
        form.schedules.map(
          (schedule) => ({
            day_of_week:
              schedule.day_of_week,

            start_time:
              schedule.start_time,

            end_time:
              schedule.end_time,

            is_working:
              schedule.is_working,
          }),
        ),
    }

    if (editingStaff.value) {
      await staffApi.update(
        editingStaff.value.id,
        payload,
      )
    } else {
      await staffApi.create(
        payload,
      )
    }

    closeModal()
    await loadStaff()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errors =
        error.response?.data?.errors

      const firstError =
        errors
          ? Object.values(errors)
              .flat()
              .at(0)
          : null

      formError.value =
        String(
          firstError ||
          error.response?.data?.message ||
          'Không thể lưu nhân viên.',
        )
    } else {
      formError.value =
        'Có lỗi xảy ra.'
    }
  } finally {
    saving.value = false
  }
}

const removeStaff = async (
  staff: Staff,
) => {
  if (
    !window.confirm(
      `Xóa nhân viên "${staff.user.name}"?`,
    )
  ) {
    return
  }

  try {
    await staffApi.remove(
      staff.id,
    )

    await loadStaff()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      window.alert(
        error.response?.data?.message ||
        'Không thể xóa nhân viên.',
      )
    }
  }
}

onMounted(async () => {
  await loadServices()
  await loadStaff()
})
</script>

<style scoped>
.staff-page {
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

.staff-panel {
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
  width: 360px;
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
  outline: 0;
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
  margin: 6px 0 17px;
  color: #969aa4;
  font-size: 11px;
}

.staff-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
  padding: 17px;
  background: #fafafb;
}

.staff-card {
  padding: 17px;
  border: 1px solid #e5e7ea;
  border-radius: 13px;
  background: #fff;
}

.staff-top {
  display: flex;
  gap: 12px;
}

.avatar-large {
  flex: 0 0 auto;
  width: 49px;
  height: 49px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #22252c;
  color: #fff;
  font-weight: 700;
}

.staff-basic {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.staff-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.staff-name-row h3 {
  margin: 0;
  font-size: 13px;
}

.staff-basic > span {
  color: #8c9099;
  font-size: 9px;
}

.position {
  color: #5c6069;
  font-size: 10px;
}

.status {
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

.staff-meta {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 5px;
  margin: 17px 0;
  padding: 12px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.staff-meta div {
  display: grid;
  gap: 3px;
}

.staff-meta span {
  color: #999da6;
  font-size: 8px;
}

.staff-meta strong {
  font-size: 10px;
}

.service-tags {
  min-height: 25px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.service-tags span {
  padding: 5px 7px;
  border-radius: 6px;
  background: #f1f2f4;
  color: #61656e;
  font-size: 8px;
}

.service-tags .muted-tag {
  color: #9a9ea7;
}

.staff-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 15px;
}

.staff-actions button {
  padding: 7px 10px;
  border: 1px solid #e1e3e7;
  border-radius: 7px;
  background: #fff;
  font-size: 9px;
}

.staff-actions .danger {
  color: #ba4545;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 17, 22, 0.48);
}

.modal {
  width: min(760px, 100%);
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
  margin: 5px 0 0;
  color: #979ba4;
  font-size: 10px;
}

.modal-close {
  width: 31px;
  height: 31px;
  border: 0;
  border-radius: 8px;
  background: #f1f2f4;
  font-size: 19px;
}

.form {
  display: grid;
  gap: 18px;
}

.form-section {
  display: grid;
  gap: 13px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eceef1;
}

.section-heading {
  display: grid;
  gap: 3px;
}

.section-heading strong {
  font-size: 11px;
}

.section-heading span {
  color: #999da6;
  font-size: 9px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
  border: 1px solid #e0e2e6;
  border-radius: 9px;
  background: #fbfbfc;
  outline: none;
  font: inherit;
  font-size: 11px;
}

.form-field input,
.form-field select {
  height: 41px;
  padding: 0 11px;
}

.form-field textarea {
  padding: 10px 11px;
  resize: vertical;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
}

.service-selector {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.service-option {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px;
  border: 1px solid #e3e5e9;
  border-radius: 8px;
  font-size: 10px;
}

.schedule-list {
  display: grid;
  gap: 7px;
}

.schedule-row {
  min-height: 43px;
  display: grid;
  grid-template-columns:
    150px 120px 30px 120px;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid #e9eaed;
  border-radius: 8px;
}

.day-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-toggle strong {
  font-size: 10px;
}

.schedule-row input[type="time"] {
  height: 31px;
  padding: 0 7px;
  border: 1px solid #e0e2e6;
  border-radius: 7px;
  font-size: 10px;
}

.schedule-row > span {
  color: #999da6;
  font-size: 9px;
}

.day-off {
  grid-column: 2 / 5;
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
}

.secondary-button {
  height: 40px;
  padding: 0 14px;
  border: 1px solid #e1e3e7;
  border-radius: 8px;
  background: #fff;
  font-size: 10px;
}

/* ===== STAFF TYPOGRAPHY SCALE ===== */

.staff-page {
  font-size: 14px;
}

/* Header trang */
.page-heading .eyebrow {
  font-size: 11px;
}

.page-heading h2 {
  font-size: 30px;
}

.page-heading p {
  font-size: 13px;
  line-height: 1.6;
}

/* Nút chính */
.primary-button,
.secondary-button {
  font-size: 12px;
}

/* Toolbar */
.search-box input,
.toolbar select {
  font-size: 13px;
}

.search-box span {
  font-size: 17px;
}

/* Card nhân viên */
.staff-name-row h3 {
  font-size: 16px;
}

.staff-name-row .status {
  font-size: 10px;
}

.staff-basic .position {
  font-size: 13px;
}

.staff-basic > span {
  font-size: 12px;
}

.staff-meta span {
  font-size: 10px;
}

.staff-meta strong {
  font-size: 13px;
}

.service-tags span {
  font-size: 10px;
}

.staff-actions button {
  font-size: 11px;
}

/* Empty / loading */
.state,
.empty {
  font-size: 13px;
}

.empty strong {
  font-size: 15px;
}

.empty p {
  font-size: 12px;
}

/* ===== MODAL THÊM / SỬA NHÂN VIÊN ===== */

.modal {
  font-size: 14px;
}

/* Header modal */
.modal-heading h3 {
  font-size: 21px;
}

.modal-heading p {
  font-size: 12px;
  line-height: 1.5;
}

.modal-close {
  font-size: 20px;
}

/* Section */
.section-heading strong {
  font-size: 14px;
}

/* Label */
.form-field label {
  font-size: 12px;
}

/* Input */
.form-field input,
.form-field textarea,
.form-field select {
  font-size: 13px;
}

/* Checkbox */
.checkbox-row {
  font-size: 12px;
}

/* Dịch vụ phụ trách */
.service-option,
.service-checkbox,
.service-item {
  font-size: 12px;
}

/* Lịch làm việc */
.schedule-row,
.schedule-item {
  font-size: 12px;
}

.schedule-row strong,
.schedule-item strong {
  font-size: 12px;
}

.schedule-row input,
.schedule-item input {
  font-size: 12px;
}

.day-off {
  font-size: 11px;
}

/* Error */
.form-error {
  font-size: 12px;
}

/* Footer modal */
.modal-actions button {
  font-size: 12px;
}

@media (max-width: 1050px) {
  .staff-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .page-heading,
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .staff-grid,
  .form-grid,
  .service-selector {
    grid-template-columns: 1fr;
  }

  .schedule-row {
    grid-template-columns: 1fr;
  }

  .day-off {
    grid-column: auto;
  }
}
</style>
