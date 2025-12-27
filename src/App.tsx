import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import LandingPage from "./pages/landing";
import MaterialRequests from "./pages/MaterialRequests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthMiddleware } from "./components/auth/AuthMiddleware";

export function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AuthMiddleware mode="public">
                <LandingPage />
              </AuthMiddleware>
            }
          />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route
            path="/material-requests"
            element={
              <AuthMiddleware mode="protected">
                <MaterialRequests />
              </AuthMiddleware>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
