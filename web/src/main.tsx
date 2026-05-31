import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { AuthProvider } from "./store/auth/provider.tsx";
import { AppRouter } from "./router/index.tsx";
import { queryClient } from "./queries/client.ts";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </QueryClientProvider>,
);
