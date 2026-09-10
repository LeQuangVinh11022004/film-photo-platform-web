export const endpoints = {
  auth: { login: "/auth/login", register: "/auth/register" },
  creativeSpaces: "/creative-spaces",
  equipment: "/equipment",
  reservations: "/reservations",
  packages: "/packages",
  users: "/users",
  reports: "/reports",
} as const;
