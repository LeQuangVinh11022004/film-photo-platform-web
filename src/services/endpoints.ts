export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    google: "/auth/google",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  creativeSpaces: "/creative-spaces",
  equipment: "/equipment",
  reservations: "/reservations",
  packages: "/packages",
  users: "/users",
  adminContent: "/admin/content",
  reports: "/reports",
  adminNotifications: "/admin/notifications",
} as const;
