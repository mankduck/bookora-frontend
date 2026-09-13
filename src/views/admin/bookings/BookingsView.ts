import { computed, onMounted, reactive, ref } from "vue";
import axios from "axios";
import adminBookingApi, {
  type AdminBooking,
  type EligibleStaff,
  type PaymentSummary,
} from "@/services/adminBooking.api";
import AdminCreateBookingModal from "@/views/admin/bookings/AdminCreateBookingModal.vue";

export function useBookingsView() {
  const loading = ref(false);

  const loadingDetail = ref(false);

  const confirming = ref(false);

  const loadingEligibleStaff = ref(false);

  const assigningStaff = ref(false);

  const changingStatus = ref(false);

  const recordingPayment = ref(false);

  const reviewingProofId = ref<number | null>(null);

  const markingPaid = ref(false);

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
        { value: "cancelled", label: "Huỷ booking" },
        { value: "no_show", label: "Khách không đến" },
      ];
    }
  
    if (status === "in_progress") {
      if (selectedBooking.value?.payment_status === "paid") {
        return [];
      }
  
      return [
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

  const markPaid = async () => {
    if (!selectedBooking.value || markingPaid.value || changingStatus.value) {
      return;
    }
  
    if (selectedBooking.value.status !== "in_progress") {
      window.alert("Chỉ có thể xác nhận thanh toán khi booking đang thực hiện.");
      return;
    }
  
    const bookingId = selectedBooking.value.id;
    const amount = Number(selectedSummary.value.remaining_amount);
  
    if (
      !window.confirm(
        amount > 0
          ? `Xác nhận khách đã thanh toán đủ ${formatMoney(amount)} còn lại? Booking sẽ tự động chuyển sang Hoàn thành.`
          : "Booking đã thanh toán đủ. Chuyển booking sang Hoàn thành?",
      )
    ) {
      return;
    }
  
    markingPaid.value = true;
  
    try {
      if (amount > 0) {
        selectedBooking.value = await adminBookingApi.markPaid(bookingId);
      }
  
      selectedBooking.value = await adminBookingApi.updateStatus(
        bookingId,
        "completed",
      );
  
      await refreshSelected();
    } catch (error) {
      window.alert(getErrorMessage(error));
      await refreshSelected();
    } finally {
      markingPaid.value = false;
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
  
    if (
      statusTarget.value === "completed" &&
      (selectedBooking.value.payment_status !== "paid" ||
        Number(selectedSummary.value.remaining_amount) > 0)
    ) {
      window.alert(
        "Khách hàng chưa thanh toán đủ. Hãy chuyển trạng thái thanh toán sang “Đã thanh toán” trước.",
      );
  
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

  return {
    ref,
    AdminCreateBookingModal,
    loading,
    loadingDetail,
    loadingEligibleStaff,
    assigningStaff,
    changingStatus,
    reviewingProofId,
    markingPaid,
    eligibleStaff,
    selectedStaffId,
    bookings,
    selectedBooking,
    showDetail,
    errorMessage,
    statusTarget,
    statusReason,
    showCreateBooking,
    depositAdminStatus,
    changingDepositStatus,
    filters,
    pagination,
    selectedSummary,
    selectedDepositStatus,
    selectedDepositLabel,
    primaryAssignment,
    canAssignStaff,
    statusOptions,
    getStatusLabel,
    proofLabel,
    manualMethodLabel,
    getDepositStatus,
    getDepositLabel,
    getPrimaryStaffName,
    getAuxiliaryCount,
    formatDate,
    formatTime,
    formatMoney,
    loadBookings,
    applyFilters,
    resetFilters,
    changePage,
    changeDepositStatus,
    markPaid,
    openBooking,
    approveProof,
    rejectProof,
    changeBookingStatus,
    assignPrimaryStaff,
    closeDetail,
    openCreateBooking,
    closeCreateBooking,
    handleBookingCreated,
  };
}
