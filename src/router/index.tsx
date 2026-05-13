import { createBrowserRouter } from "react-router";
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
        ],
      }
    ],
  },
]);

export default router;
