import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "@/lib/supabase/supabaseClient";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

interface AuthMiddlewareProps {
  children: React.ReactNode;
  mode?: "public" | "protected";
}

export function AuthMiddleware({
  children,
  mode = "public",
}: AuthMiddlewareProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (mode === "public") {
          if (session) {
            // Public route (e.g. Landing): If logged in, redirect to dashboard
            navigate("/material-requests", { replace: true });
          }
        } else if (mode === "protected") {
          if (!session) {
            // Protected route (e.g. Dashboard): If NOT logged in, redirect to sign-in
            navigate("/sign-in", { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [navigate, mode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={32}
          className="animate-spin text-primary"
        />
      </div>
    );
  }

  return <>{children}</>;
}
