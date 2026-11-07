export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    registerProvider: "/auth/register/provider",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  creativeSpaces: "/creative-spaces",
  equipment: "/equipment",
  reservations: "/reservations",
  packages: "/packages",
  users: "/users",
  reports: "/reports",
  admin: {
    auth: {
      login: "/auth/login",
    },
    dashboard: "/admin/dashboard",
    bookings: "/admin/bookings",
    providers: "/admin/providers",
    users: "/admin/users",
    spaces: "/admin/spaces",
  },
  provider: {
    profile: "/provider/profile",
    spaces: "/provider/spaces",
    bookings: "/provider/bookings",
  },
} as const;
