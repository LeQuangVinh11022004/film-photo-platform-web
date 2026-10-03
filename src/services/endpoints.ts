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
  reports: "/reports",
} as const;
