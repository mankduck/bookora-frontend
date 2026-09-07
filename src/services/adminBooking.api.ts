import api from "@/services/api";

export type ProofStatus = "pending" | "approved" | "rejected";

export interface PaymentProof {
  id: number;
  booking_id: number;
  customer_id: number;
  amount: string | number;
  approved_amount: string | number;
  image_url: string | null;
  is_manual?: boolean;
  manual_method?: "cash" | "bank_transfer" | "other" | null;
  status: ProofStatus;
  customer_note: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  reviewer?: {
    id: number;
    name: string;
  } | null;
}

export interface PaymentSummary {
  total_amount: number;
  deposit_amount: number;
  approved_amount: number;
  deposit_remaining: number;
  remaining_amount: number;
  deposit_status:
    | "not_required"
    | "unpaid"
    | "pending_review"
    | "partially_paid"
    | "paid";
  has_pending_proof: boolean;
  latest_proof_status: ProofStatus | null;
}

export interface AdminBookingItem {
  id: number;
  booking_id: number;
  service_id: number | null;
  service_variant_id: number | null;
  service_name: string;
  variant_name: string | null;
  price: string | number;
  quantity: number;
  duration_minutes: number;
  subtotal: string | number;
}

export interface AdminBookingStaff {
  id: number;
  booking_id: number;
  staff_id: number;
  role: string | null;
  is_primary: boolean;
  assigned_by: number | null;
  assigned_at: string | null;
  staff?: {
    id: number;
    employee_code: string | null;
    position: string | null;
    user?: {
      id: number;
      name: string;
      email: string | null;
      phone: string | null;
    };
  };
}

export interface EligibleStaff {
  id: number;
  employee_code: string | null;
  position: string | null;
  experience_years: number;
  is_primary: boolean;
  user: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  };
  services: {
    id: number;
    name: string;
  }[];
}

export interface AdminBooking {
  id: number;
  booking_code: string;
  customer_id: number | null;
  start_at: string;
  end_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  subtotal: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  deposit_amount: string | number;
  coupon_id: number | null;
  customer_note: string | null;
  internal_note: string | null;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  payment_status: "unpaid" | "partially_paid" | "paid" | "refunded";
  source: string | null;
  confirmed_by: number | null;
  confirmed_at: string | null;
  cancelled_by: number | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  items: AdminBookingItem[];
  staff_assignments?: AdminBookingStaff[];
  staff_assignments_count?: number;
  payment_summary?: PaymentSummary;
  payment_proofs?: PaymentProof[];
  customer?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  coupon?: {
    id: number;
    code: string;
    name: string;
    type: string;
    value: string | number;
  } | null;
}

export interface BookingListResponse {
  current_page: number;
  data: AdminBooking[];
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  next_page_url: string | null;
  prev_page_url: string | null;
}

const adminBookingApi = {
  async getAll(params?: {
    search?: string;
    status?: string;
    payment_status?: string;
    date?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
  }) {
    const response = await api.get("/api/v1/admin/bookings", { params });

    return response.data.data as BookingListResponse;
  },

  async getOne(id: number) {
    const response = await api.get(`/api/v1/admin/bookings/${id}`);

    return response.data.data.booking as AdminBooking;
  },

  async confirm(id: number, force = false) {
    const response = await api.post(`/api/v1/admin/bookings/${id}/confirm`, {
      force,
    });

    return response.data.data.booking as AdminBooking;
  },

  async getEligibleStaff(id: number) {
    const response = await api.get(
      `/api/v1/admin/bookings/${id}/eligible-staff`,
    );

    return response.data.data.staff as EligibleStaff[];
  },

  async assignPrimary(id: number, staffId: number) {
    const response = await api.post(
      `/api/v1/admin/bookings/${id}/assign-primary`,
      { staff_id: staffId },
    );

    return response.data.data.booking as AdminBooking;
  },

  async updateStatus(id: number, status: string, reason?: string) {
    const response = await api.put(`/api/v1/admin/bookings/${id}/status`, {
      status,
      reason: reason || null,
    });

    return response.data.data.booking as AdminBooking;
  },


  async markDepositPaid(bookingId: number) {
    const response = await api.post(
      `/api/v1/admin/bookings/${bookingId}/mark-deposit-paid`,
    );

    return response.data.data.booking as AdminBooking;
  },

  async approveProof(proofId: number) {
    const response = await api.post(
      `/api/v1/admin/payment-proofs/${proofId}/approve`,
    );

    return response.data.data.booking as AdminBooking;
  },

  async rejectProof(proofId: number, reason: string) {
    const response = await api.post(
      `/api/v1/admin/payment-proofs/${proofId}/reject`,
      { reason },
    );

    return response.data.data.booking as AdminBooking;
  },
};

export default adminBookingApi;
