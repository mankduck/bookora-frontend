import api from "@/services/api";

export type ProofStatus = "pending" | "approved" | "rejected";

export interface PaymentProof {
  id: number;
  booking_id: number;
  customer_id: number;
  amount: string | number;
  approved_amount: string | number;
  image_path: string;
  image_url: string | null;
  status: ProofStatus;
  customer_note: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
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

export interface BankTransfer {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  transfer_content: string;
  amount: number;
  qr_url: string | null;
}

export interface CustomerBookingItem {
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

export interface CustomerBookingStaff {
  id: number;
  booking_id: number;
  staff_id: number;
  role: string | null;
  is_primary: boolean;
  assigned_by?: number | null;
  assigned_at: string | null;
  staff?: {
    id: number;
    user?: {
      id: number;
      name: string;
    };
  };
}

export interface CustomerBooking {
  id: number;
  booking_code: string;
  customer_id: number | null;
  start_at: string;
  end_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_note: string | null;
  subtotal: string | number;
  discount_amount: string | number;
  total_amount: string | number;
  deposit_amount: string | number;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  payment_status: "unpaid" | "partially_paid" | "paid" | "refunded";
  source?: string | null;
  created_at: string;
  updated_at: string;
  items: CustomerBookingItem[];
  staff_assignments?: CustomerBookingStaff[];
  payment_summary?: PaymentSummary;
  payment_proofs?: PaymentProof[];
  bank_transfer?: BankTransfer;
  coupon?: {
    id: number;
    code: string;
    name: string;
    type: string;
    value: string | number;
  } | null;
}

export interface CustomerBookingList {
  current_page: number;
  data: CustomerBooking[];
  first_page_url?: string | null;
  from: number | null;
  last_page: number;
  last_page_url?: string | null;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to: number | null;
  total: number;
}

const customerBookingApi = {
  async getAll(params?: {
    search?: string;
    status?: string;
    payment_status?: string;
    page?: number;
    per_page?: number;
  }) {
    const response = await api.get("/api/v1/customer/bookings", { params });

    return response.data.data as CustomerBookingList;
  },

  async getOne(id: number) {
    const response = await api.get(`/api/v1/customer/bookings/${id}`);

    return response.data.data.booking as CustomerBooking;
  },

  async uploadPaymentProof(bookingId: number, file: File, note = "") {
    const form = new FormData();

    form.append("image", file, file.name);

    if (note.trim()) {
      form.append("note", note.trim());
    }

    const response = await api.post(
      `/api/v1/customer/bookings/${bookingId}/payment-proof`,
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        timeout: 30000,
      },
    );

    return response.data.data.booking as CustomerBooking;
  },

  async deletePaymentProof(bookingId: number, proofId: number) {
    const response = await api.delete(
      `/api/v1/customer/bookings/${bookingId}/payment-proof/${proofId}`,
    );

    return response.data.data.booking as CustomerBooking;
  },
};

export default customerBookingApi;
