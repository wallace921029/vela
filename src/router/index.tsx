import { createBrowserRouter, Navigate } from "react-router";
import RequireAuth from "@/components/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/login",
    lazy: async () => {
      const { default: Login } = await import("@/pages/Auth/Login");
      return { Component: Login };
    },
  },
  {
    path: "/register",
    lazy: async () => {
      const { default: Register } = await import("@/pages/Auth/Register");
      return { Component: Register };
    },
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        lazy: async () => {
          const { default: BaseLayout } = await import("@/layouts/BaseLayout");
          return { Component: BaseLayout };
        },
        children: [
          {
            path: "",
            lazy: async () => {
              const { default: Dashboard } = await import("@/pages/Dashboard/Dashboard.tsx");
              return { Component: Dashboard };
            },
          },
          {
            path: "about",
            lazy: async () => {
              const { default: About } = await import("@/pages/About/About.tsx");
              return { Component: About };
            },
          },
          {
            path: "notes",
            lazy: async () => {
              const { default: Notes } = await import("@/pages/Notes/Notes.tsx");
              return { Component: Notes };
            },
          },
          {
            path: "account",
            lazy: async () => {
              const { default: AccountSettings } = await import("@/pages/Account/AccountSettings.tsx");
              return { Component: AccountSettings };
            },
          },
          {
            path: "system",
            lazy: async () => {
              const { default: SystemSettings } = await import("@/pages/SystemSettings/SystemSettings.tsx");
              return { Component: SystemSettings };
            },
            children: [
              {
                index: true,
                element: <Navigate to="users" replace />,
              },
              {
                path: "users",
                lazy: async () => {
                  const { default: UserManagementPage } = await import("@/pages/SystemSettings/UserManagementPage.tsx");
                  return { Component: UserManagementPage };
                },
              },
              {
                path: "invites",
                lazy: async () => {
                  const { default: InviteCodeManagementPage } = await import("@/pages/SystemSettings/InviteCodeManagementPage.tsx");
                  return { Component: InviteCodeManagementPage };
                },
              },
            ],
          },
        ],
      }
    ],
  },
]);

export default router;
