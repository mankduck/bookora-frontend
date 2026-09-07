import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
} from 'vue-router'

import {
  useAuthStore,
} from '@/stores/auth'

import PublicLayout
  from '@/layouts/PublicLayout.vue'

import AdminLayout
  from '@/layouts/AdminLayout.vue'

import HomeView
  from '@/views/public/HomeView.vue'

import BookingView
  from '@/views/public/BookingView.vue'

import LoginView
  from '@/views/auth/LoginView.vue'

import RegisterView
  from '@/views/auth/RegisterView.vue'

import AccountBookingsView
  from '@/views/account/AccountBookingsView.vue'

import AccountBookingDetailView
  from '@/views/account/AccountBookingDetailView.vue'

import AccountProfileView
  from '@/views/account/AccountProfileView.vue'

import DashboardView
  from '@/views/admin/DashboardView.vue'

import ServiceCategoriesView
  from '@/views/admin/services/ServiceCategoriesView.vue'

import ServicesView
  from '@/views/admin/services/ServicesView.vue'

import StaffView
  from '@/views/admin/staff/StaffView.vue'

import BookingsView
  from '@/views/admin/bookings/BookingsView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    /*
    |--------------------------------------------------------------------------
    | PUBLIC WEBSITE
    |--------------------------------------------------------------------------
    */

    {
      path: '/',
      component: PublicLayout,

      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },

        /*
        |--------------------------------------------------------------------------
        | CUSTOMER BOOKING
        |--------------------------------------------------------------------------
        */

        {
          path: 'booking',
          name: 'booking',
          component: BookingView,

          meta: {
            requiresAuth: true,
            role: 'customer',
          },
        },

        /*
        |--------------------------------------------------------------------------
        | CUSTOMER ACCOUNT
        |--------------------------------------------------------------------------
        */

        {
          path: 'account/bookings',
          name: 'account-bookings',
          component:
            AccountBookingsView,

          meta: {
            requiresAuth: true,
            role: 'customer',
          },
        },

        {
          path:
            'account/bookings/:id',

          name:
            'account-booking-detail',

          component:
            AccountBookingDetailView,

          meta: {
            requiresAuth: true,
            role: 'customer',
          },
        },

        {
          path: 'account/profile',
          name: 'account-profile',
          component:
            AccountProfileView,

          meta: {
            requiresAuth: true,
            role: 'customer',
          },
        },
      ],
    },

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    {
      path: '/login',
      name: 'login',
      component: LoginView,

      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/register',
      name: 'register',
      component: RegisterView,

      meta: {
        guestOnly: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    {
      path: '/admin',
      component: AdminLayout,

      meta: {
        requiresAuth: true,
        role: 'admin',
      },

      children: [
        {
          path: '',
          redirect:
            '/admin/dashboard',
        },

        {
          path: 'dashboard',
          name:
            'admin-dashboard',
          component:
            DashboardView,
        },

        {
          path:
            'service-categories',

          name:
            'admin-service-categories',

          component:
            ServiceCategoriesView,
        },

        {
          path: 'services',
          name:
            'admin-services',
          component:
            ServicesView,
        },

        {
          path: 'staff',
          name:
            'admin-staff',
          component:
            StaffView,
        },

        /*
        |--------------------------------------------------------------------------
        | ADMIN BOOKINGS
        |--------------------------------------------------------------------------
        */

        {
          path: 'bookings',
          name:
            'admin-bookings',
          component:
            BookingsView,
        },
      ],
    },
  ],
})

/*
|--------------------------------------------------------------------------
| ROLE HELPERS
|--------------------------------------------------------------------------
*/

const userHasRole = (
  auth: ReturnType<
    typeof useAuthStore
  >,
  roleCode: string,
) => {
  return Boolean(
    auth.user?.roles?.some(
      (role) =>
        role.code ===
        roleCode,
    ),
  )
}

const getRoleHome = (
  auth: ReturnType<
    typeof useAuthStore
  >,
) => {
  if (
    userHasRole(
      auth,
      'admin',
    )
  ) {
    return '/admin/dashboard'
  }

  return '/'
}

/*
|--------------------------------------------------------------------------
| LOAD AUTH
|--------------------------------------------------------------------------
*/

const ensureAuthLoaded =
  async (
    auth: ReturnType<
      typeof useAuthStore
    >,
  ) => {
    if (
      auth.initialized ||
      auth.loading
    ) {
      return
    }

    try {
      await auth.fetchMe()
    } catch {
      //
    }
  }

/*
|--------------------------------------------------------------------------
| LOGIN REDIRECT
|--------------------------------------------------------------------------
*/

const buildLoginRedirect = (
  to: RouteLocationNormalized,
) => ({
  name: 'login',

  query: {
    redirect:
      to.fullPath,
  },
})

/*
|--------------------------------------------------------------------------
| GLOBAL GUARD
|--------------------------------------------------------------------------
*/

router.beforeEach(
  async (to) => {
    const auth =
      useAuthStore()

    const needsAuth =
      Boolean(
        to.meta.requiresAuth,
      )

    const guestOnly =
      Boolean(
        to.meta.guestOnly,
      )

    if (
      needsAuth ||
      guestOnly
    ) {
      await ensureAuthLoaded(
        auth,
      )
    }

    /*
    |--------------------------------------------------------------------------
    | PROTECTED ROUTE
    |--------------------------------------------------------------------------
    */

    if (
      needsAuth &&
      !auth.user
    ) {
      return buildLoginRedirect(
        to,
      )
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    if (
      needsAuth &&
      to.meta.role
    ) {
      const requiredRole =
        String(
          to.meta.role,
        )

      if (
        !userHasRole(
          auth,
          requiredRole,
        )
      ) {
        return getRoleHome(
          auth,
        )
      }
    }

    /*
    |--------------------------------------------------------------------------
    | GUEST ONLY
    |--------------------------------------------------------------------------
    */

    if (
      guestOnly &&
      auth.user
    ) {
      return getRoleHome(
        auth,
      )
    }

    return true
  },
)

export default router