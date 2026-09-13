<template>
  <section class="customers-page">
    <header class="page-heading">
      <div>
        <span class="eyebrow">
          CUSTOMER MANAGEMENT
        </span>

        <h2>Khách hàng</h2>

        <p>
          Quản lý tài khoản, lịch sử đặt lịch
          và giá trị khách hàng.
        </p>
      </div>

      <div class="heading-actions">
        <div class="heading-stat">
          <span>Tổng khách hàng</span>

          <strong>
            {{ pagination.total }}
          </strong>
        </div>

        <button
          type="button"
          class="create-button"
          @click="openCreateModal"
        >
          <span>＋</span>
          Tạo khách hàng
        </button>
      </div>
    </header>

    <section class="customer-panel">
      <div class="toolbar">
        <div class="search-box">
          <span>⌕</span>

          <input
            v-model.trim="search"
            type="text"
            placeholder="Tìm tên, số điện thoại, email..."
            @input="handleSearch"
          />
        </div>

        <select
          v-model="statusFilter"
          @change="applyFilters"
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

        <button
          type="button"
          class="refresh-button"
          :disabled="loading"
          @click="loadCustomers"
        >
          ↻
          Làm mới
        </button>
      </div>

      <div
        v-if="loading"
        class="state-box"
      >
        <div class="loader" />

        <strong>
          Đang tải khách hàng...
        </strong>
      </div>

      <div
        v-else-if="errorMessage"
        class="state-box error"
      >
        <strong>
          Không thể tải danh sách
        </strong>

        <span>
          {{ errorMessage }}
        </span>

        <button
          type="button"
          @click="loadCustomers"
        >
          Thử lại
        </button>
      </div>

      <div
        v-else-if="
          customers.length === 0
        "
        class="state-box"
      >
        <div class="empty-icon">
          ♙
        </div>

        <strong>
          Chưa có khách hàng
        </strong>

        <span>
          Không tìm thấy tài khoản phù hợp
          với bộ lọc hiện tại.
        </span>
      </div>

      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Booking</th>
                <th>Hoàn thành</th>
                <th>Tổng chi</th>
                <th>Booking gần nhất</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="
                  customer in customers
                "
                :key="customer.id"
              >
                <td>
                  <div class="customer-cell">
                    <div class="avatar">
                      {{
                        getInitial(
                          customer.name,
                        )
                      }}
                    </div>

                    <div>
                      <strong>
                        {{ customer.name }}
                      </strong>

                      <span>
                        #{{ customer.id }}
                        ·
                        {{
                          formatJoinedDate(
                            customer.created_at,
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="contact-cell">
                    <strong>
                      {{
                        customer.phone ||
                        'Chưa có SĐT'
                      }}
                    </strong>

                    <span>
                      {{
                        customer.email ||
                        'Chưa có email'
                      }}
                    </span>
                  </div>
                </td>

                <td>
                  <strong class="number-value">
                    {{
                      customer.bookings_count
                    }}
                  </strong>
                </td>

                <td>
                  <strong class="number-value">
                    {{
                      customer
                        .completed_bookings_count
                    }}
                  </strong>
                </td>

                <td>
                  <strong class="money-value">
                    {{
                      formatMoney(
                        customer.total_spent,
                      )
                    }}
                  </strong>
                </td>

                <td>
                  <div
                    v-if="
                      customer.latest_booking_at
                    "
                    class="date-cell"
                  >
                    <strong>
                      {{
                        formatDate(
                          customer
                            .latest_booking_at,
                        )
                      }}
                    </strong>

                    <span>
                      {{
                        formatTime(
                          customer
                            .latest_booking_at,
                        )
                      }}
                    </span>
                  </div>

                  <span
                    v-else
                    class="muted"
                  >
                    Chưa có
                  </span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="
                      customer.status
                    "
                  >
                    {{
                      customer.status ===
                      'active'
                        ? 'Hoạt động'
                        : 'Đã khóa'
                    }}
                  </span>
                </td>

                <td class="actions-cell">
                  <button
                    type="button"
                    class="view-button"
                    @click="
                      openCustomer(
                        customer.id,
                      )
                    "
                  >
                    Xem
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span>
            Hiển thị
            {{ pagination.from || 0 }}
            –
            {{ pagination.to || 0 }}
            trong
            {{ pagination.total }}
            khách hàng
          </span>

          <div class="pagination-actions">
            <button
              type="button"
              :disabled="
                pagination.current_page <=
                1
              "
              @click="
                goToPage(
                  pagination.current_page -
                    1,
                )
              "
            >
              ←
            </button>

            <span>
              Trang
              {{
                pagination.current_page
              }}
              /
              {{ pagination.last_page }}
            </span>

            <button
              type="button"
              :disabled="
                pagination.current_page >=
                pagination.last_page
              "
              @click="
                goToPage(
                  pagination.current_page +
                    1,
                )
              "
            >
              →
            </button>
          </div>
        </div>
      </template>
    </section>

    <!-- CREATE CUSTOMER -->

    <Teleport to="body">
      <div
        v-if="createModalOpen"
        class="modal-backdrop"
        @click.self="closeCreateModal"
      >
        <div class="create-modal">
          <div class="modal-heading">
            <div>
              <span>
                NEW CUSTOMER
              </span>

              <h3>
                Tạo khách hàng
              </h3>

              <p>
                Tạo tài khoản khách hàng mới
                để đặt lịch và quản lý booking.
              </p>
            </div>

            <button
              type="button"
              class="close-button"
              @click="closeCreateModal"
            >
              ×
            </button>
          </div>

          <form
            class="create-form"
            @submit.prevent="createCustomer"
          >
            <div class="form-field">
              <label>
                Họ và tên
              </label>

              <input
                v-model.trim="createForm.name"
                type="text"
                maxlength="150"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>
                  Số điện thoại
                </label>

                <input
                  v-model.trim="
                    createForm.phone
                  "
                  type="tel"
                  maxlength="30"
                  placeholder="09xxxxxxxx"
                  required
                />
              </div>

              <div class="form-field">
                <label>Email</label>

                <input
                  v-model.trim="
                    createForm.email
                  "
                  type="email"
                  placeholder="customer@email.com"
                />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>
                  Mật khẩu
                </label>

                <input
                  v-model="
                    createForm.password
                  "
                  type="password"
                  minlength="8"
                  placeholder="Tối thiểu 8 ký tự"
                  required
                />
              </div>

              <div class="form-field">
                <label>
                  Trạng thái
                </label>

                <select
                  v-model="
                    createForm.status
                  "
                >
                  <option value="active">
                    Hoạt động
                  </option>

                  <option value="inactive">
                    Đã khóa
                  </option>
                </select>
              </div>
            </div>

            <p
              v-if="createError"
              class="form-error"
            >
              {{ createError }}
            </p>

            <div class="modal-actions">
              <button
                type="button"
                class="cancel-button"
                :disabled="creating"
                @click="closeCreateModal"
              >
                Hủy
              </button>

              <button
                type="submit"
                class="save-button"
                :disabled="creating"
              >
                {{
                  creating
                    ? 'Đang tạo...'
                    : 'Tạo khách hàng'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- DETAIL DRAWER -->

    <Teleport to="body">
      <div
        v-if="drawerOpen"
        class="drawer-backdrop"
        @click.self="closeDrawer"
      >
        <aside class="customer-drawer">
          <div class="drawer-header">
            <div>
              <span>
                CUSTOMER PROFILE
              </span>

              <h3>
                Chi tiết khách hàng
              </h3>
            </div>

            <button
              type="button"
              class="close-button"
              @click="closeDrawer"
            >
              ×
            </button>
          </div>

          <div
            v-if="loadingDetail"
            class="drawer-state"
          >
            <div class="loader" />

            <strong>
              Đang tải thông tin...
            </strong>
          </div>

          <template
            v-else-if="selectedCustomer"
          >
            <div class="profile-card">
              <div class="profile-avatar">
                {{
                  getInitial(
                    selectedCustomer.name,
                  )
                }}
              </div>

              <div class="profile-main">
                <h4>
                  {{
                    selectedCustomer.name
                  }}
                </h4>

                <span>
                  {{
                    selectedCustomer.phone ||
                    'Chưa có số điện thoại'
                  }}
                </span>

                <span>
                  {{
                    selectedCustomer.email ||
                    'Chưa có email'
                  }}
                </span>
              </div>

              <span
                class="status-badge"
                :class="
                  selectedCustomer.status
                "
              >
                {{
                  selectedCustomer.status ===
                  'active'
                    ? 'Hoạt động'
                    : 'Đã khóa'
                }}
              </span>
            </div>

            <div class="stats-grid">
              <article>
                <span>
                  Tổng booking
                </span>

                <strong>
                  {{
                    selectedCustomer.stats
                      .bookings_count
                  }}
                </strong>
              </article>

              <article>
                <span>
                  Hoàn thành
                </span>

                <strong>
                  {{
                    selectedCustomer.stats
                      .completed_bookings_count
                  }}
                </strong>
              </article>

              <article class="wide">
                <span>
                  Tổng chi
                </span>

                <strong>
                  {{
                    formatMoney(
                      selectedCustomer.stats
                        .total_spent,
                    )
                  }}
                </strong>
              </article>
            </div>

            <section class="drawer-section">
              <div class="section-heading">
                <div>
                  <strong>
                    Thông tin tài khoản
                  </strong>

                  <span>
                    Thông tin đăng nhập của khách.
                  </span>
                </div>

                <button
                  v-if="!editing"
                  type="button"
                  class="edit-button"
                  @click="startEditing"
                >
                  Sửa
                </button>
              </div>

              <form
                v-if="editing"
                class="edit-form"
                @submit.prevent="
                  saveCustomer
                "
              >
                <label>
                  <span>Họ và tên</span>

                  <input
                    v-model.trim="form.name"
                    type="text"
                    required
                  />
                </label>

                <label>
                  <span>
                    Số điện thoại
                  </span>

                  <input
                    v-model.trim="form.phone"
                    type="text"
                    required
                  />
                </label>

                <label>
                  <span>Email</span>

                  <input
                    v-model.trim="form.email"
                    type="email"
                  />
                </label>

                <label>
                  <span>
                    Trạng thái
                  </span>

                  <select
                    v-model="form.status"
                  >
                    <option value="active">
                      Hoạt động
                    </option>

                    <option value="inactive">
                      Đã khóa
                    </option>
                  </select>
                </label>

                <p
                  v-if="formError"
                  class="form-error"
                >
                  {{ formError }}
                </p>

                <div class="form-actions">
                  <button
                    type="button"
                    class="cancel-button"
                    @click="cancelEditing"
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    class="save-button"
                    :disabled="saving"
                  >
                    {{
                      saving
                        ? 'Đang lưu...'
                        : 'Lưu thay đổi'
                    }}
                  </button>
                </div>
              </form>

              <div
                v-else
                class="info-list"
              >
                <div>
                  <span>
                    Họ và tên
                  </span>

                  <strong>
                    {{
                      selectedCustomer.name
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Điện thoại
                  </span>

                  <strong>
                    {{
                      selectedCustomer.phone ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {{
                      selectedCustomer.email ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Ngày tham gia
                  </span>

                  <strong>
                    {{
                      formatDate(
                        selectedCustomer
                          .created_at,
                      )
                    }}
                  </strong>
                </div>
              </div>
            </section>

            <section class="drawer-section">
              <div class="section-heading">
                <div>
                  <strong>
                    Lịch sử booking
                  </strong>

                  <span>
                    Các booking gắn với tài khoản này.
                  </span>
                </div>
              </div>

              <div
                v-if="
                  selectedCustomer.bookings
                    .length === 0
                "
                class="booking-empty"
              >
                Khách hàng chưa có booking.
              </div>

              <div
                v-else
                class="booking-list"
              >
                <article
                  v-for="
                    booking in
                    selectedCustomer.bookings
                  "
                  :key="booking.id"
                  class="booking-card"
                >
                  <div class="booking-head">
                    <div>
                      <strong>
                        {{
                          booking.booking_code
                        }}
                      </strong>

                      <span>
                        {{
                          formatDateTime(
                            booking.start_at,
                          )
                        }}
                      </span>
                    </div>

                    <strong>
                      {{
                        formatMoney(
                          booking.total_amount,
                        )
                      }}
                    </strong>
                  </div>

                  <div
                    v-if="
                      booking.items.length
                    "
                    class="service-name"
                  >
                    <strong>
                      {{
                        booking.items[0]
                          ?.service_name
                      }}
                    </strong>

                    <span>
                      {{
                        booking.items[0]
                          ?.variant_name ||
                        'Không có gói'
                      }}
                    </span>
                  </div>
                </article>
              </div>
            </section>
          </template>
        </aside>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { useCustomersView } from './CustomersView.ts'

const {
  ref,
  customers,
  pagination,
  loading,
  loadingDetail,
  saving,
  creating,
  errorMessage,
  formError,
  createError,
  search,
  statusFilter,
  drawerOpen,
  createModalOpen,
  editing,
  selectedCustomer,
  form,
  createForm,
  loadCustomers,
  handleSearch,
  applyFilters,
  goToPage,
  openCreateModal,
  closeCreateModal,
  createCustomer,
  openCustomer,
  closeDrawer,
  startEditing,
  cancelEditing,
  saveCustomer,
  getInitial,
  formatMoney,
  formatDate,
  formatTime,
  formatDateTime,
  formatJoinedDate,
} = useCustomersView()
</script>

<style scoped src="./CustomersView.css"></style>