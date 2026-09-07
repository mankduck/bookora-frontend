<template>
  <div class="page">
<header class="page-header">
  <div>
    <span class="eyebrow">
      QUẢN LÝ LỊCH HẸN
    </span>

    <h1>Bookings</h1>

    <p>
      Theo dõi lịch hẹn, nhân viên phụ trách,
      tiền cọc và trạng thái thực hiện.
    </p>
  </div>

  <div class="header-actions">
    <button
      type="button"
      class="create-booking-button"
      @click="openCreateBooking"
    >
      <span>+</span>
      Tạo lịch hẹn
    </button>

    <div class="header-stats">
      <div>
        <span>Tổng</span>

        <strong>
          {{ pagination.total }}
        </strong>
      </div>

      <div>
        <span>Trang</span>

        <strong>
          {{ pagination.currentPage }}
          /
          {{ pagination.lastPage }}
        </strong>
      </div>
    </div>
  </div>
</header>

    <section class="filters-card">
      <input
        v-model.trim="filters.search"
        type="search"
        placeholder="Mã booking, tên, SĐT..."
        @keyup.enter="applyFilters"
      />

      <select v-model="filters.status" @change="applyFilters">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="in_progress">Đang thực hiện</option>
        <option value="completed">Hoàn thành</option>
        <option value="cancelled">Đã huỷ</option>
        <option value="no_show">Không đến</option>
      </select>

      <select v-model="filters.payment_status" @change="applyFilters">
        <option value="">Tất cả thanh toán</option>
        <option value="unpaid">Chưa thanh toán</option>
        <option value="partially_paid">Thanh toán một phần</option>
        <option value="paid">Đã thanh toán</option>
        <option value="refunded">Đã hoàn tiền</option>
      </select>

      <input v-model="filters.date" type="date" @change="applyFilters" />

      <button type="button" class="secondary-button" @click="resetFilters">
        Đặt lại
      </button>
    </section>

    <section class="content-card">
      <div v-if="loading" class="state">Đang tải booking...</div>

      <div v-else-if="errorMessage" class="state error">
        <strong>Không thể tải booking</strong>
        <p>{{ errorMessage }}</p>
        <button type="button" @click="loadBookings">Thử lại</button>
      </div>

      <div v-else-if="bookings.length === 0" class="state">
        Chưa có booking phù hợp.
      </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Booking</th>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Thời gian</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Photo phụ trách</th>
              <th />
            </tr>
          </thead>

          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>
                <div class="stack">
                  <strong>{{ booking.booking_code }}</strong>
                  <span>#{{ booking.id }}</span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>{{ booking.customer_name }}</strong>
                  <span>{{ booking.customer_phone }}</span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>
                    {{ booking.items[0]?.service_name || "—" }}
                  </strong>
                  <span>
                    {{ booking.items[0]?.variant_name || "Không có gói" }}
                  </span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>{{ formatDate(booking.start_at) }}</strong>
                  <span>
                    {{ formatTime(booking.start_at) }} –
                    {{ formatTime(booking.end_at) }}
                  </span>
                </div>
              </td>

              <td>
                <div class="stack">
                  <strong>{{ formatMoney(booking.total_amount) }}</strong>
                  <span
                    class="deposit-text"
                    :class="`deposit-${getDepositStatus(booking)}`"
                  >
                    {{ getDepositLabel(booking) }}
                  </span>
                </div>
              </td>

              <td>
                <span class="status-badge" :class="`status-${booking.status}`">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </td>

              <td>
                <div
                  v-if="getPrimaryStaffName(booking)"
                  class="primary-staff-cell"
                >
                  <strong>{{ getPrimaryStaffName(booking) }}</strong>
                  <span v-if="getAuxiliaryCount(booking) > 0">
                    +{{ getAuxiliaryCount(booking) }} hỗ trợ
                  </span>
                </div>

                <span v-else class="muted"> Chưa phân công </span>
              </td>

              <td>
                <button
                  type="button"
                  class="view-button"
                  @click="openBooking(booking.id)"
                >
                  Xem →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.lastPage > 1" class="pagination">
        <button
          type="button"
          :disabled="pagination.currentPage <= 1"
          @click="changePage(pagination.currentPage - 1)"
        >
          ←
        </button>

        <span>
          Trang {{ pagination.currentPage }}/{{ pagination.lastPage }}
        </span>

        <button
          type="button"
          :disabled="pagination.currentPage >= pagination.lastPage"
          @click="changePage(pagination.currentPage + 1)"
        >
          →
        </button>
      </div>
    </section>

    <div v-if="showDetail" class="drawer-overlay" @click.self="closeDetail">
      <aside class="drawer">
        <div class="drawer-header">
          <div>
            <span>BOOKING DETAIL</span>
            <h2>
              {{ selectedBooking?.booking_code || "Đang tải..." }}
            </h2>
          </div>

          <button type="button" class="close-button" @click="closeDetail">
            ×
          </button>
        </div>

        <div v-if="loadingDetail" class="state">Đang tải chi tiết...</div>

        <div v-else-if="selectedBooking" class="drawer-content">
          <section class="detail-status">
            <span
              class="status-badge"
              :class="`status-${selectedBooking.status}`"
            >
              {{ getStatusLabel(selectedBooking.status) }}
            </span>

            <select
              v-model="depositAdminStatus"
              class="deposit-status-select"
              :disabled="changingDepositStatus"
              @change="changeDepositStatus"
            >
              <option value="unpaid">Chưa cọc</option>

              <option value="paid">Đã cọc</option>
            </select>
          </section>

          <section class="detail-section">
            <h3>Khách hàng</h3>
            <div class="detail-grid">
              <div>
                <span>Họ tên</span>
                <strong>{{ selectedBooking.customer_name }}</strong>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{{ selectedBooking.customer_phone }}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{{
                  selectedBooking.customer_email || "Không có"
                }}</strong>
              </div>
              <div>
                <span>Nguồn</span>
                <strong>{{ selectedBooking.source || "—" }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-section">
            <h3>Dịch vụ & lịch</h3>
            <div class="detail-grid">
              <div>
                <span>Dịch vụ</span>
                <strong>{{
                  selectedBooking.items[0]?.service_name || "—"
                }}</strong>
              </div>
              <div>
                <span>Gói</span>
                <strong>{{
                  selectedBooking.items[0]?.variant_name || "—"
                }}</strong>
              </div>
              <div>
                <span>Ngày</span>
                <strong>{{ formatDate(selectedBooking.start_at) }}</strong>
              </div>
              <div>
                <span>Thời gian</span>
                <strong>
                  {{ formatTime(selectedBooking.start_at) }} –
                  {{ formatTime(selectedBooking.end_at) }}
                </strong>
              </div>
            </div>
          </section>

          <section class="detail-section payment-section">
            <div class="section-title-row">
              <h3>Thanh toán & tiền cọc</h3>
              <span
                class="deposit-badge"
                :class="`deposit-${selectedDepositStatus}`"
              >
                {{ selectedDepositLabel }}
              </span>
            </div>

            <div class="price-list">
              <div>
                <span>Tổng tiền</span>
                <strong>{{ formatMoney(selectedSummary.total_amount) }}</strong>
              </div>
              <div>
                <span>Cọc yêu cầu</span>
                <strong>{{
                  formatMoney(selectedSummary.deposit_amount)
                }}</strong>
              </div>
              <div>
                <span>Đã xác nhận</span>
                <strong class="paid-money">
                  {{ formatMoney(selectedSummary.approved_amount) }}
                </strong>
              </div>
              <div>
                <span>Cọc còn thiếu</span>
                <strong>{{
                  formatMoney(selectedSummary.deposit_remaining)
                }}</strong>
              </div>
              <div class="price-total">
                <span>Còn thanh toán</span>
                <strong>{{
                  formatMoney(selectedSummary.remaining_amount)
                }}</strong>
              </div>
            </div>

            <div
              v-if="selectedBooking.payment_proofs?.length"
              class="proof-list"
            >
              <article
                v-for="proof in selectedBooking.payment_proofs"
                :key="proof.id"
                class="proof-card"
                :class="{ 'manual-proof-card': proof.is_manual }"
              >
                <a
                  v-if="proof.image_url"
                  :href="proof.image_url"
                  target="_blank"
                  rel="noopener"
                >
                  <img :src="proof.image_url" alt="Ảnh chuyển khoản" />
                </a>

                <div v-else-if="proof.is_manual" class="manual-proof-icon">
                  <span>✓</span>
                  <strong>
                    {{ manualMethodLabel(proof.manual_method) }}
                  </strong>
                </div>

                <div class="proof-body">
                  <div class="proof-top">
                    <span class="proof-status" :class="`proof-${proof.status}`">
                      {{ proofLabel(proof.status) }}
                    </span>
                    <strong>{{ formatMoney(proof.amount) }}</strong>
                  </div>

                  <p v-if="proof.customer_note">
                    {{ proof.customer_note }}
                  </p>

                  <p v-if="proof.rejection_reason" class="rejection">
                    {{ proof.rejection_reason }}
                  </p>

                  <div v-if="proof.status === 'pending'" class="proof-actions">
                    <button
                      type="button"
                      class="approve-button"
                      :disabled="reviewingProofId === proof.id"
                      @click="approveProof(proof.id)"
                    >
                      Xác nhận đã nhận tiền
                    </button>

                    <button
                      type="button"
                      class="reject-button"
                      :disabled="reviewingProofId === proof.id"
                      @click="rejectProof(proof.id)"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="no-proof">
              Chưa có giao dịch hoặc ảnh chuyển khoản.
            </div>
          </section>

          <section class="operations-grid">
            <div class="operation-card">
              <div class="operation-heading">
                <span class="operation-number">01</span>
                <div>
                  <strong>Phân công Photo</strong>
                  <p>Chỉ có một nhân viên chính cho booking.</p>
                </div>
              </div>

              <div v-if="primaryAssignment" class="current-primary">
                <span>Đang phụ trách</span>
                <strong>
                  {{ primaryAssignment.staff?.user?.name || "Nhân viên" }}
                </strong>
                <small>
                  {{ primaryAssignment.staff?.position || "Photo" }}
                </small>
              </div>

              <div v-else class="operation-empty">Chưa có Photo chính.</div>

              <template v-if="canAssignStaff">
                <div v-if="loadingEligibleStaff" class="muted">
                  Đang kiểm tra nhân viên...
                </div>

                <div v-else-if="eligibleStaff.length === 0" class="muted">
                  Không có nhân viên khả dụng.
                </div>

                <div v-else class="assignment-controls">
                  <select v-model.number="selectedStaffId">
                    <option :value="null" disabled>Chọn nhân viên</option>
                    <option
                      v-for="staff in eligibleStaff"
                      :key="staff.id"
                      :value="staff.id"
                    >
                      {{ staff.user.name }} — {{ staff.position || "Photo" }}
                    </option>
                  </select>

                  <button
                    type="button"
                    class="confirm-booking-button"
                    :disabled="!selectedStaffId || assigningStaff"
                    @click="assignPrimaryStaff"
                  >
                    {{
                      assigningStaff
                        ? "Đang lưu..."
                        : primaryAssignment
                          ? "Đổi Photo"
                          : "Phân công"
                    }}
                  </button>
                </div>
              </template>

              <div v-else class="muted">
                Chỉ phân công khi đơn đã xác nhận hoặc đang thực hiện.
              </div>
            </div>

            <div class="operation-card">
              <div class="operation-heading">
                <span class="operation-number">02</span>
                <div>
                  <strong>Trạng thái đơn</strong>
                  <p>Admin điều khiển tiến trình thực hiện booking.</p>
                </div>
              </div>

              <div class="current-status-box">
                <span>Hiện tại</span>
                <strong>{{ getStatusLabel(selectedBooking.status) }}</strong>
              </div>

              <template v-if="statusOptions.length > 0">
                <select v-model="statusTarget" class="status-select">
                  <option value="" disabled>Chọn trạng thái mới</option>
                  <option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <textarea
                  v-if="statusTarget === 'cancelled'"
                  v-model.trim="statusReason"
                  rows="3"
                  maxlength="1000"
                  placeholder="Lý do huỷ booking"
                />

                <button
                  type="button"
                  class="status-update-button"
                  :disabled="!statusTarget || changingStatus"
                  @click="changeBookingStatus"
                >
                  {{
                    changingStatus ? "Đang cập nhật..." : "Cập nhật trạng thái"
                  }}
                </button>
              </template>

              <div v-else class="operation-empty">
                Trạng thái này đã kết thúc và không còn bước tiếp theo.
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>

    <AdminCreateBookingModal
      :open="showCreateBooking"
      @close="closeCreateBooking"
      @created="handleBookingCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

import axios from "axios";

import adminBookingApi, {
  type AdminBooking,
  type EligibleStaff,
  type PaymentSummary,
} from "@/services/adminBooking.api";

import AdminCreateBookingModal from "@/views/admin/bookings/AdminCreateBookingModal.vue";

const loading = ref(false);
const loadingDetail = ref(false);
const confirming = ref(false);
const loadingEligibleStaff = ref(false);
const assigningStaff = ref(false);
const changingStatus = ref(false);
const recordingPayment = ref(false);
const reviewingProofId = ref<number | null>(null);

const eligibleStaff = ref<EligibleStaff[]>([]);
const selectedStaffId = ref<number | null>(null);
const bookings = ref<AdminBooking[]>([]);
const selectedBooking = ref<AdminBooking | null>(null);
const showDetail = ref(false);
const errorMessage = ref("");
const statusTarget = ref("");
const statusReason = ref("");

const showCreateBooking = ref(false);

const manualPayment = reactive({
  amount: 0,
  method: "cash" as "cash" | "bank_transfer" | "other",
  note: "",
});

const depositAdminStatus = ref<"unpaid" | "paid">("unpaid");

const changingDepositStatus = ref(false);

const filters = reactive({
  search: "",
  status: "",
  payment_status: "",
  date: "",
});

const pagination = reactive({
  currentPage: 1,
  lastPage: 1,
  perPage: 15,
  total: 0,
});

const emptySummary: PaymentSummary = {
  total_amount: 0,
  deposit_amount: 0,
  approved_amount: 0,
  deposit_remaining: 0,
  remaining_amount: 0,
  deposit_status: "not_required",
  has_pending_proof: false,
  latest_proof_status: null,
};

const selectedSummary = computed(
  () => selectedBooking.value?.payment_summary || emptySummary,
);

const selectedDepositStatus = computed(
  () => selectedSummary.value.deposit_status,
);

const selectedDepositLabel = computed(() =>
  depositLabel(selectedDepositStatus.value),
);

const primaryAssignment = computed(() => {
  const assignments = selectedBooking.value?.staff_assignments || [];

  return (
    assignments.find((item) => item.is_primary || item.role === "primary") ||
    null
  );
});

const canAssignStaff = computed(() => {
  return Boolean(
    selectedBooking.value &&
    ["confirmed", "in_progress"].includes(selectedBooking.value.status),
  );
});

const statusOptions = computed(() => {
  const status = selectedBooking.value?.status;

  if (status === "pending") {
    return [
      { value: "confirmed", label: "Đã xác nhận" },
      { value: "cancelled", label: "Huỷ booking" },
    ];
  }

  if (status === "confirmed") {
    return [
      { value: "in_progress", label: "Đang thực hiện" },
      { value: "completed", label: "Hoàn thành" },
      { value: "cancelled", label: "Huỷ booking" },
      { value: "no_show", label: "Khách không đến" },
    ];
  }

  if (status === "in_progress") {
    return [
      { value: "completed", label: "Hoàn thành" },
      { value: "cancelled", label: "Huỷ booking" },
      { value: "no_show", label: "Khách không đến" },
    ];
  }

  return [];
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    cancelled: "Đã huỷ",
    no_show: "Không đến",
  };

  return labels[status] || status;
};

const depositLabel = (status: string) => {
  const labels: Record<string, string> = {
    not_required: "Không cần cọc",
    unpaid: "Chưa cọc",
    pending_review: "Chờ kiểm tra cọc",
    partially_paid: "Cọc chưa đủ",
    paid: "Đã cọc",
  };

  return labels[status] || status;
};

const proofLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Chờ kiểm tra",
    approved: "Đã xác nhận",
    rejected: "Đã từ chối",
  };

  return labels[status] || status;
};

const manualMethodLabel = (method?: string | null) => {
  const labels: Record<string, string> = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    other: "Thanh toán khác",
  };

  return method ? labels[method] || method : "Ghi nhận thủ công";
};

const getDepositStatus = (booking: AdminBooking) =>
  booking.payment_summary?.deposit_status ||
  (Number(booking.deposit_amount) > 0 ? "unpaid" : "not_required");

const getDepositLabel = (booking: AdminBooking) =>
  depositLabel(getDepositStatus(booking));

const getPrimaryAssignment = (booking: AdminBooking) => {
  const assignments = booking.staff_assignments || [];
  return assignments.find((item) => item.is_primary || item.role === "primary");
};

const getPrimaryStaffName = (booking: AdminBooking) =>
  getPrimaryAssignment(booking)?.staff?.user?.name || "";

const getAuxiliaryCount = (booking: AdminBooking) => {
  const assignments = booking.staff_assignments || [];
  return assignments.filter(
    (item) => !(item.is_primary || item.role === "primary"),
  ).length;
};

const parseDateTime = (value: string) => new Date(value.replace(" ", "T"));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseDateTime(value));

const formatTime = (value: string) => value.substring(11, 16);

const formatMoney = (value: string | number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));

const getErrorMessage = (
  error: unknown,
  fallback = "Không thể tải dữ liệu.",
) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
};

const loadBookings = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const result = await adminBookingApi.getAll({
      search: filters.search || undefined,
      status: filters.status || undefined,
      payment_status: filters.payment_status || undefined,
      date: filters.date || undefined,
      page: pagination.currentPage,
      per_page: pagination.perPage,
    });

    bookings.value = result.data;
    pagination.currentPage = result.current_page;
    pagination.lastPage = result.last_page;
    pagination.total = result.total;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  pagination.currentPage = 1;
  loadBookings();
};

const resetFilters = () => {
  filters.search = "";
  filters.status = "";
  filters.payment_status = "";
  filters.date = "";
  pagination.currentPage = 1;
  loadBookings();
};

const changePage = (page: number) => {
  if (page < 1 || page > pagination.lastPage) return;
  pagination.currentPage = page;
  loadBookings();
};

const resetActionForms = () => {
  statusTarget.value = "";
  statusReason.value = "";

  depositAdminStatus.value =
    selectedSummary.value.deposit_remaining <= 0 ? "paid" : "unpaid";
};

const changeDepositStatus = async () => {
  if (!selectedBooking.value || changingDepositStatus.value) {
    return;
  }

  /*
   * Hiện tại chỉ cho admin chuyển:
   * Chưa cọc -> Đã cọc.
   *
   * Chưa cho rollback Đã cọc -> Chưa cọc
   * vì đã có dữ liệu payment proof approved.
   */
  if (depositAdminStatus.value === "unpaid") {
    depositAdminStatus.value =
      selectedSummary.value.deposit_remaining <= 0 ? "paid" : "unpaid";

    window.alert("Hiện chưa hỗ trợ chuyển ngược từ Đã cọc về Chưa cọc.");

    return;
  }

  if (selectedSummary.value.deposit_remaining <= 0) {
    return;
  }

  const amount = selectedSummary.value.deposit_remaining;

  const confirmed = window.confirm(
    `Xác nhận khách đã cọc ${formatMoney(amount)}?`,
  );

  if (!confirmed) {
    depositAdminStatus.value = "unpaid";

    return;
  }

  changingDepositStatus.value = true;

  try {
    selectedBooking.value = await adminBookingApi.markDepositPaid(
      selectedBooking.value.id,
    );

    await refreshSelected();

    depositAdminStatus.value = "paid";
  } catch (error) {
    depositAdminStatus.value = "unpaid";

    window.alert(getErrorMessage(error));
  } finally {
    changingDepositStatus.value = false;
  }
};

const openBooking = async (id: number) => {
  showDetail.value = true;
  loadingDetail.value = true;
  selectedBooking.value = null;

  try {
    selectedBooking.value = await adminBookingApi.getOne(id);
    resetActionForms();

    if (canAssignStaff.value) {
      await loadEligibleStaff();
    }
  } catch (error) {
    closeDetail();
    window.alert(getErrorMessage(error));
  } finally {
    loadingDetail.value = false;
  }
};

const refreshSelected = async () => {
  if (!selectedBooking.value) return;

  selectedBooking.value = await adminBookingApi.getOne(
    selectedBooking.value.id,
  );

  resetActionForms();
  await loadBookings();

  if (canAssignStaff.value) {
    await loadEligibleStaff();
  } else {
    eligibleStaff.value = [];
    selectedStaffId.value = null;
  }
};

const approveProof = async (proofId: number) => {
  if (!selectedBooking.value || reviewingProofId.value) return;

  if (!window.confirm("Xác nhận đã nhận đúng khoản tiền trong ảnh này?")) {
    return;
  }

  reviewingProofId.value = proofId;

  try {
    selectedBooking.value = await adminBookingApi.approveProof(proofId);
    await refreshSelected();
  } catch (error) {
    window.alert(getErrorMessage(error));
  } finally {
    reviewingProofId.value = null;
  }
};

const rejectProof = async (proofId: number) => {
  if (!selectedBooking.value || reviewingProofId.value) return;

  const reason = window.prompt(
    "Lý do từ chối ảnh chuyển khoản:",
    "Không tìm thấy giao dịch tương ứng.",
  );

  if (!reason?.trim()) return;

  reviewingProofId.value = proofId;

  try {
    selectedBooking.value = await adminBookingApi.rejectProof(
      proofId,
      reason.trim(),
    );
    await refreshSelected();
  } catch (error) {
    window.alert(getErrorMessage(error));
  } finally {
    reviewingProofId.value = null;
  }
};

const recordManualPayment = async () => {
  if (
    !selectedBooking.value ||
    recordingPayment.value ||
    !manualPayment.amount ||
    manualPayment.amount <= 0
  ) {
    return;
  }

  const message = [
    "Ghi nhận thanh toán thủ công?",
    "",
    `Số tiền: ${formatMoney(manualPayment.amount)}`,
    `Hình thức: ${manualMethodLabel(manualPayment.method)}`,
    "",
    "Khoản tiền này sẽ được tính là ĐÃ XÁC NHẬN ngay lập tức.",
  ].join("\n");

  if (!window.confirm(message)) return;

  recordingPayment.value = true;

  try {
    selectedBooking.value = await adminBookingApi.recordManualPayment(
      selectedBooking.value.id,
      {
        amount: Number(manualPayment.amount),
        method: manualPayment.method,
        note: manualPayment.note || undefined,
      },
    );

    await refreshSelected();
  } catch (error) {
    window.alert(getErrorMessage(error));
  } finally {
    recordingPayment.value = false;
  }
};

const confirmWithDepositWarning = async () => {
  if (!selectedBooking.value || confirming.value) return false;

  const bookingId = selectedBooking.value.id;
  confirming.value = true;

  try {
    selectedBooking.value = await adminBookingApi.confirm(bookingId, false);
    return true;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409 &&
      error.response?.data?.requires_confirmation
    ) {
      const payment = error.response.data.payment;

      const message = [
        "BOOKING CHƯA HOÀN TẤT TIỀN CỌC",
        "",
        `Cọc yêu cầu: ${formatMoney(payment.deposit_amount)}`,
        `Đã xác nhận: ${formatMoney(payment.approved_amount)}`,
        `Còn thiếu: ${formatMoney(payment.deposit_remaining)}`,
        "",
        payment.has_pending_proof
          ? "Khách đã tải ảnh nhưng giao dịch vẫn đang chờ kiểm tra."
          : "Khách chưa có ảnh chuyển khoản đang chờ kiểm tra.",
        "",
        "Bạn vẫn muốn xác nhận booking?",
      ].join("\n");

      if (!window.confirm(message)) return false;

      selectedBooking.value = await adminBookingApi.confirm(bookingId, true);
      return true;
    }

    window.alert(getErrorMessage(error));
    return false;
  } finally {
    confirming.value = false;
  }
};

const changeBookingStatus = async () => {
  if (!selectedBooking.value || !statusTarget.value || changingStatus.value) {
    return;
  }

  if (statusTarget.value === "confirmed") {
    const success = await confirmWithDepositWarning();
    if (success) await refreshSelected();
    return;
  }

  if (statusTarget.value === "cancelled" && !statusReason.value.trim()) {
    window.alert("Vui lòng nhập lý do huỷ booking.");
    return;
  }

  if (
    !window.confirm(
      `Chuyển booking sang “${getStatusLabel(statusTarget.value)}”?`,
    )
  ) {
    return;
  }

  changingStatus.value = true;

  try {
    selectedBooking.value = await adminBookingApi.updateStatus(
      selectedBooking.value.id,
      statusTarget.value,
      statusReason.value || undefined,
    );

    await refreshSelected();
  } catch (error) {
    window.alert(getErrorMessage(error));
  } finally {
    changingStatus.value = false;
  }
};

const loadEligibleStaff = async () => {
  if (!selectedBooking.value || !canAssignStaff.value) {
    eligibleStaff.value = [];
    selectedStaffId.value = null;
    return;
  }

  loadingEligibleStaff.value = true;

  try {
    eligibleStaff.value = await adminBookingApi.getEligibleStaff(
      selectedBooking.value.id,
    );

    selectedStaffId.value =
      primaryAssignment.value?.staff_id ??
      eligibleStaff.value.find((staff) => staff.is_primary)?.id ??
      null;
  } catch (error) {
    eligibleStaff.value = [];
    selectedStaffId.value = null;
    window.alert(getErrorMessage(error));
  } finally {
    loadingEligibleStaff.value = false;
  }
};

const assignPrimaryStaff = async () => {
  if (
    !selectedBooking.value ||
    !canAssignStaff.value ||
    !selectedStaffId.value ||
    assigningStaff.value
  ) {
    return;
  }

  const oldName = primaryAssignment.value?.staff?.user?.name;
  const newStaff = eligibleStaff.value.find(
    (staff) => staff.id === selectedStaffId.value,
  );

  if (
    oldName &&
    newStaff &&
    primaryAssignment.value?.staff_id !== newStaff.id &&
    !window.confirm(
      `Đổi Photo phụ trách từ “${oldName}” sang “${newStaff.user.name}”?\n\nPhoto cũ sẽ được giải phóng khỏi lịch này.`,
    )
  ) {
    return;
  }

  assigningStaff.value = true;

  try {
    selectedBooking.value = await adminBookingApi.assignPrimary(
      selectedBooking.value.id,
      selectedStaffId.value,
    );

    await refreshSelected();
  } catch (error) {
    window.alert(getErrorMessage(error));
  } finally {
    assigningStaff.value = false;
  }
};

const closeDetail = () => {
  showDetail.value = false;
  selectedBooking.value = null;
  eligibleStaff.value = [];
  selectedStaffId.value = null;
  statusTarget.value = "";
  statusReason.value = "";
};

const openCreateBooking = () => {
  showDetail.value = false;

  showCreateBooking.value = true;
};

const closeCreateBooking = () => {
  showCreateBooking.value = false;
};

const handleBookingCreated = async () => {
  pagination.currentPage = 1;

  await loadBookings();
};

onMounted(loadBookings);
</script>

<style scoped>
.page {
  display: grid;
  gap: 22px;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
}
.eyebrow {
  color: #969a91;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}
.page-header h1 {
  margin: 7px 0 6px;
  font-size: 30px;
}
.page-header p {
  margin: 0;
  color: #858a80;
  font-size: 13px;
}
.header-stats {
  display: flex;
  gap: 8px;
}
.header-stats > div {
  min-width: 100px;
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid #e2e3de;
  border-radius: 11px;
  background: #fff;
}
.header-stats span {
  color: #8c9087;
  font-size: 10px;
}
.header-stats strong {
  font-size: 15px;
}
.filters-card {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr auto;
  gap: 9px;
  padding: 12px;
  border: 1px solid #e2e3de;
  border-radius: 13px;
  background: #fff;
}
.filters-card input,
.filters-card select,
.assignment-controls select,
.status-select,
.manual-fields input,
.manual-fields select,
.manual-payment-box > input,
.operation-card textarea {
  min-height: 40px;
  box-sizing: border-box;
  padding: 0 11px;
  border: 1px solid #dcddd7;
  border-radius: 9px;
  outline: none;
  background: #fff;
  font: inherit;
  font-size: 12px;
}
.operation-card textarea {
  width: 100%;
  padding: 10px 11px;
  resize: vertical;
}
.content-card {
  overflow: hidden;
  border: 1px solid #e1e2dd;
  border-radius: 14px;
  background: #fff;
}
.table-wrapper {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  padding: 12px 14px;
  background: #fafaf8;
  color: #858a80;
  font-size: 10px;
  text-align: left;
  white-space: nowrap;
}
td {
  padding: 14px;
  border-top: 1px solid #eeeeea;
  font-size: 12px;
  vertical-align: middle;
}
.stack,
.primary-staff-cell {
  display: grid;
  gap: 4px;
}
.stack strong,
.primary-staff-cell strong {
  font-size: 12px;
}
.stack span,
.primary-staff-cell span,
.muted {
  color: #8d9188;
  font-size: 10px;
}
.deposit-text {
  width: fit-content;
  font-weight: 750;
}
.status-badge,
.deposit-badge,
.proof-status {
  display: inline-flex;
  width: fit-content;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}
.status-badge {
  background: #efefeb;
}
.status-pending,
.deposit-pending_review,
.proof-pending {
  background: #fff3d8;
  color: #8c6c1e;
}
.status-confirmed,
.deposit-paid,
.proof-approved {
  background: #e8f3e9;
  color: #467051;
}
.status-in_progress {
  background: #e7eef8;
  color: #4c6388;
}
.status-completed {
  background: #e8f3e9;
  color: #467051;
}
.status-cancelled,
.status-no_show,
.proof-rejected {
  background: #f8e8e8;
  color: #974f4f;
}
.deposit-unpaid,
.deposit-partially_paid {
  background: #f8e9e2;
  color: #985a3d;
}
.deposit-not_required {
  background: #eeeeea;
  color: #666b62;
}
.view-button,
.secondary-button,
.pagination button {
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid #dbdcd6;
  border-radius: 8px;
  background: #fff;
  font-size: 11px;
  cursor: pointer;
}
.state {
  padding: 45px 20px;
  font-size: 13px;
  text-align: center;
}
.state.error {
  color: #925050;
}
.state p {
  margin: 6px 0 12px;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  border-top: 1px solid #eeeeea;
  font-size: 11px;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  background: rgba(20, 21, 18, 0.35);
}
.drawer {
  width: min(760px, 100%);
  height: 100vh;
  overflow-y: auto;
  background: #f6f6f3;
  box-shadow: -15px 0 50px rgba(20, 20, 18, 0.12);
}
.drawer-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #e1e2dd;
  background: #fff;
}
.drawer-header span {
  color: #969a91;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.4px;
}
.drawer-header h2 {
  margin: 4px 0 0;
  font-size: 21px;
}
.close-button {
  width: 36px;
  height: 36px;
  border: 1px solid #dedfd9;
  border-radius: 9px;
  background: #fff;
  font-size: 21px;
  cursor: pointer;
}
.drawer-content {
  display: grid;
  gap: 12px;
  padding: 18px;
}
.detail-status {
  display: flex;
  gap: 8px;
}
.detail-section,
.operation-card {
  padding: 18px;
  border: 1px solid #e0e1dc;
  border-radius: 13px;
  background: #fff;
}
.detail-section h3 {
  margin: 0 0 14px;
  font-size: 15px;
}
.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 14px;
}
.section-title-row h3 {
  margin: 0;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.detail-grid > div {
  display: grid;
  gap: 4px;
  padding: 11px;
  border-radius: 9px;
  background: #f8f8f5;
}
.detail-grid span,
.price-list span {
  color: #8d9188;
  font-size: 10px;
}
.detail-grid strong,
.price-list strong {
  font-size: 12px;
}
.price-list {
  display: grid;
  gap: 9px;
}
.price-list > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}
.price-total {
  margin-top: 4px;
  padding-top: 11px;
  border-top: 1px solid #e4e5df;
}
.price-total strong {
  font-size: 17px;
}
.paid-money {
  color: #477451;
}
.manual-payment-box {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid #dedfd9;
  border-radius: 11px;
  background: #fafaf8;
}
.manual-copy {
  display: grid;
  gap: 3px;
}
.manual-copy strong {
  font-size: 13px;
}
.manual-copy span {
  color: #83877e;
  font-size: 10px;
  line-height: 1.5;
}
.manual-fields {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 8px;
}
.manual-payment-button,
.approve-button,
.reject-button,
.confirm-booking-button,
.status-update-button {
  min-height: 38px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}
.manual-payment-button,
.approve-button,
.confirm-booking-button,
.status-update-button {
  border: 1px solid #181916;
  background: #181916;
  color: #fff;
}
.reject-button {
  border: 1px solid #edcccc;
  background: #fff2f2;
  color: #984d4d;
}
.proof-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e6e7e1;
}
.proof-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 14px;
  padding: 12px;
  border: 1px solid #e2e3dd;
  border-radius: 11px;
}
.proof-card img {
  width: 180px;
  height: 135px;
  display: block;
  object-fit: cover;
  border-radius: 9px;
}
.manual-proof-icon {
  width: 180px;
  min-height: 120px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 6px;
  border-radius: 9px;
  background: #eef5ee;
  color: #4d7657;
}
.manual-proof-icon span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #4d7657;
  color: #fff;
}
.manual-proof-icon strong {
  font-size: 12px;
}
.proof-body {
  min-width: 0;
}
.proof-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.proof-top strong {
  font-size: 14px;
}
.proof-body p {
  margin: 10px 0 0;
  color: #747970;
  font-size: 11px;
  line-height: 1.5;
}
.proof-body .rejection {
  color: #995050;
}
.proof-actions {
  display: flex;
  gap: 7px;
  margin-top: 13px;
}
.no-proof {
  margin-top: 15px;
  padding: 12px;
  border-radius: 9px;
  background: #f7f7f4;
  color: #878b82;
  font-size: 11px;
}
.operations-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.operation-card {
  display: grid;
  align-content: start;
  gap: 12px;
}
.operation-heading {
  display: flex;
  gap: 10px;
}
.operation-number {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #181916;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
}
.operation-heading > div {
  display: grid;
  gap: 3px;
}
.operation-heading strong {
  font-size: 14px;
}
.operation-heading p {
  margin: 0;
  color: #8a8e84;
  font-size: 10px;
  line-height: 1.45;
}
.current-primary,
.current-status-box {
  display: grid;
  gap: 4px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f7f4;
}
.current-primary span,
.current-status-box span {
  color: #8c9087;
  font-size: 9px;
}
.current-primary strong,
.current-status-box strong {
  font-size: 14px;
}
.current-primary small {
  color: #858980;
  font-size: 10px;
}
.operation-empty {
  padding: 12px;
  border-radius: 9px;
  background: #f7f7f4;
  color: #8b8f86;
  font-size: 10px;
}
.assignment-controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
.status-select {
  width: 100%;
}

.deposit-status-select {
  min-height: 30px;
  padding: 0 28px 0 10px;
  border: 0;
  border-radius: 999px;
  outline: none;
  background: #f8e9e2;
  color: #985a3d;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.deposit-status-select:has(option:checked[value="paid"]) {
  background: #e8f3e9;
  color: #467051;
}

.deposit-status-select:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.header-actions {
  display: flex;
  align-items: stretch;
  gap: 9px;
}

.create-booking-button {
  min-height: 100%;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  border: 1px solid #181916;
  border-radius: 11px;
  background: #181916;
  color: #fff;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.create-booking-button span {
  color: inherit;
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 900px) {
  .filters-card,
  .operations-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 650px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .filters-card,
  .detail-grid,
  .proof-card,
  .assignment-controls,
  .operations-grid,
  .manual-fields {
    grid-template-columns: 1fr;
  }
  .proof-card img,
  .manual-proof-icon {
    width: 100%;
    height: auto;
    min-height: 130px;
    max-height: 320px;
  }
}
</style>
