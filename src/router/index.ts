import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
} from "vue-router";

import { useAuthStore } from "@/stores/auth";

import PublicLayout from "@/layouts/PublicLayout.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";

import HomeView from "@/views/public/HomeView.vue";
import BookingView from "@/views/public/BookingView.vue";

import LoginView from "@/views/auth/LoginView.vue";
import RegisterView from "@/views/auth/RegisterView.vue";

import AccountBookingsView from "@/views/account/AccountBookingsView.vue";
import AccountBookingDetailView from "@/views/account/AccountBookingDetailView.vue";
import AccountProfileView from "@/views/account/AccountProfileView.vue";

import DashboardView from "@/views/admin/DashboardView.vue";
import ServiceCategoriesView from "@/views/admin/services/ServiceCategoriesView.vue";
import ServicesView from "@/views/admin/services/ServicesView.vue";
import StaffView from "@/views/admin/staff/StaffView.vue";
import BookingsView from "@/views/admin/bookings/BookingsView.vue";
import CustomersView from "@/views/admin/customers/CustomersView.vue";
import CouponsView from "@/views/admin/coupons/CouponsView.vue";
import SettingsView from "@/views/admin/settings/SettingsView.vue";
import PostsView from "@/views/admin/posts/PostsView.vue";
import ReviewsView from "@/views/admin/reviews/ReviewsView.vue";
import HomepageModulesView from "@/views/admin/homepage/HomepageModulesView.vue";
import PostsListView from "@/views/public/posts/PostsListView.vue";
import PostDetailView from "@/views/public/posts/PostDetailView.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: PublicLayout,
      children: [
        {
          path: "",
          name: "home",
          component: HomeView,
        },

        { path: "bai-viet", name: "public-posts", component: PostsListView },
        { path: "bai-viet/:slug", name: "public-post-detail", component: PostDetailView },

        {
          path: "booking",
          name: "booking",
          component: BookingView,
          meta: {
            requiresAuth: true,
            role: "customer",
          },
        },

        {
          path: "account/bookings",
          name: "account-bookings",
          component: AccountBookingsView,
          meta: {
            requiresAuth: true,
            role: "customer",
          },
        },

        {
          path: "account/bookings/:id",
          name: "account-booking-detail",
          component: AccountBookingDetailView,
          meta: {
            requiresAuth: true,
            role: "customer",
          },
        },

        {
          path: "account/profile",
          name: "account-profile",
          component: AccountProfileView,
          meta: {
            requiresAuth: true,
            role: "customer",
          },
        },
      ],
    },

    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: "/admin",
      component: AdminLayout,
      meta: {
        requiresAuth: true,
        role: "admin",
      },

      children: [
        {
          path: "",
          redirect: "/admin/dashboard",
        },

        {
          path: "dashboard",
          name: "admin-dashboard",
          component: DashboardView,
        },

        {
          path: "service-categories",
          name: "admin-service-categories",
          component: ServiceCategoriesView,
        },

        {
          path: "services",
          name: "admin-services",
          component: ServicesView,
        },

        {
          path: "staff",
          name: "admin-staff",
          component: StaffView,
        },

        {
          path: "customers",
          name: "admin-customers",
          component: CustomersView,
        },

        {
          path: "coupons",
          name: "admin-coupons",
          component: CouponsView,
        },

        {
          path: "bookings",
          name: "admin-bookings",
          component: BookingsView,
        },

        { path: "posts", name: "admin-posts", component: PostsView },
        { path: "reviews", name: "admin-reviews", component: ReviewsView },
        { path: "settings", name: "admin-settings", component: SettingsView },
        { path: "homepage", name: "admin-homepage", component: HomepageModulesView },

      ],
    },
  ],
});

const userHasRole = (
  auth: ReturnType<typeof useAuthStore>,
  roleCode: string,
) => {
  return Boolean(auth.user?.roles?.some((role) => role.code === roleCode));
};

const getRoleHome = (auth: ReturnType<typeof useAuthStore>) => {
  if (userHasRole(auth, "admin")) {
    return "/admin/dashboard";
  }

  return "/";
};

const ensureAuthLoaded = async (auth: ReturnType<typeof useAuthStore>) => {
  if (auth.initialized || auth.loading) {
    return;
  }

  try {
    await auth.fetchMe();
  } catch {
    //
  }
};

const buildLoginRedirect = (to: RouteLocationNormalized) => ({
  name: "login",

  query: {
    redirect: to.fullPath,
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  const needsAuth = Boolean(to.meta.requiresAuth);

  const guestOnly = Boolean(to.meta.guestOnly);

  if (needsAuth || guestOnly) {
    await ensureAuthLoaded(auth);
  }

  if (needsAuth && !auth.user) {
    return buildLoginRedirect(to);
  }

  const requiredRole = typeof to.meta.role === "string" ? to.meta.role : null;

  if (needsAuth && requiredRole && !userHasRole(auth, requiredRole)) {
    return getRoleHome(auth);
  }

  if (guestOnly && auth.user) {
    const redirect =
      typeof to.query.redirect === "string" && to.query.redirect.startsWith("/")
        ? to.query.redirect
        : getRoleHome(auth);

    if (
      (redirect.startsWith("/booking") || redirect.startsWith("/account")) &&
      !userHasRole(auth, "customer")
    ) {
      return getRoleHome(auth);
    }

    return redirect;
  }

  return true;
});

export default router;
