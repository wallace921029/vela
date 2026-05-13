import "./index.css";
import { createRoot } from "react-dom/client";
import '@/i18n';
import { RouterProvider } from "react-router";
import router from "./router/index.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>,
);
