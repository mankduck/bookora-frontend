import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function useAdminLayout() {
  const auth = useAuthStore();

  const route = useRoute();

  const userInitial = computed(
    () => auth.user?.name?.charAt(0).toUpperCase() ?? "A",
  );

  const pageTitle = computed(() => {
    switch (route.name) {
      case "admin-dashboard":
        return "Dashboard";

      case "admin-service-categories":
        return "Danh mục dịch vụ";

      case "admin-services":
        return "Dịch vụ & Gói";

      case "admin-staff":
        return "Nhân viên";

      case "admin-customers":
        return "Khách hàng";

      case "admin-coupons":
        return "Mã giảm giá";

      case "admin-bookings":
        return "Lịch đặt";

      default:
        return "Bookora";
    }
  });

  return {
    RouterLink,
    RouterView,
    auth,
    userInitial,
    pageTitle,
  };
}
