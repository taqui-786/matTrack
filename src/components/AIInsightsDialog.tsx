import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRiskInsight, type MaterialSummary } from "@/hooks/useRiskInsight";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, Sparkles } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

export function AIInsightsDialog() {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string>();
  const [summary, setSummary] = useState<MaterialSummary>();
  const [fetched, setFetched] = useState(false);
  const { data, isLoading, isError, error } = useRiskInsight(
    companyId,
    summary
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !fetched) {
      async function fetchData() {
        const user = await supabaseClient.auth.getUser();
        if (!user.data.user) {
          throw new Error("User not authenticated");
        }

        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("company_id")
          .eq("id", user.data.user.id)
          .maybeSingle();

        if (!profileError && profile?.company_id) {
          const companyId = profile.company_id;

          // Fetch raw data
          const { data: requests, error: requestsError } = await supabaseClient
            .from("material_requests")
            .select("status, priority")
            .eq("company_id", companyId);

          if (!requestsError && requests) {
            // Calculate summary locally
            const newSummary = {
              totalRequests: requests.length,
              pendingCount: requests.filter((r) => r.status === "pending")
                .length,
              urgentPendingCount: requests.filter(
                (r) => r.status === "pending" && r.priority === "urgent"
              ).length,
              approvedCount: requests.filter((r) => r.status === "approved")
                .length,
              fulfilledCount: requests.filter((r) => r.status === "fulfilled")
                .length,
            };

            setSummary(newSummary);
            setCompanyId(companyId);
            setFetched(true);
          }
        }
      }
      fetchData();
    } else {
      setFetched(false);
      setCompanyId(undefined);
      setSummary(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <HugeiconsIcon icon={Sparkles} size={20} />
          AI Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Sparkles} size={20} />
            AI Risk Insights
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis of your material requests and potential risks
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="space-y-4">
              {/* Loading skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Sparkles} size={20} />
                Analyzing material requests...
              </div>
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} size={20} />
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch AI insights. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {data && !isLoading && (
            <div className="bg-muted dark:bg-muted/50 rounded-xl p-6 border ">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-table:text-sm">
                <ReactMarkdown>{data}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
