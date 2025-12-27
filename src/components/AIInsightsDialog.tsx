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
import { useCompletion } from "@ai-sdk/react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, Sparkles } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { supabaseClient } from "@/lib/supabase/supabaseClient";

interface MaterialSummary {
  totalRequests: number;
  pendingCount: number;
  urgentPendingCount: number;
  approvedCount: number;
  fulfilledCount: number;
}

export function AIInsightsDialog({ haveData = false }: { haveData: boolean }) {
  const [open, setOpen] = useState(false);
  const { completion, complete, isLoading, error } = useCompletion({
    api: "/.netlify/functions/risk-insight",
  });

  const [fetched, setFetched] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !fetched && haveData) {
      fetchDataAndGenerate();
    } else if (!isOpen) {
    }
  };

  const fetchDataAndGenerate = async () => {
    try {
      setFetched(true); // Prevent multi-trigger
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
          const newSummary: MaterialSummary = {
            totalRequests: requests.length,
            pendingCount: requests.filter((r) => r.status === "pending").length,
            urgentPendingCount: requests.filter(
              (r) => r.status === "pending" && r.priority === "urgent"
            ).length,
            approvedCount: requests.filter((r) => r.status === "approved")
              .length,
            fulfilledCount: requests.filter((r) => r.status === "fulfilled")
              .length,
          };

          // Trigger streaming generation
          await complete("", {
            body: { companyId, summary: newSummary },
          });
        }
      }
    } catch (err) {
      console.error("Error fetching data for insights:", err);
      // setFetched(false); // maybe allow retry?
    }
  };
  console.log(completion);

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
          {!haveData ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-4">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={24}
                  className="text-slate-400"
                />
              </div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                No Data Available
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Add some material requests to generate AI-powered risk insights
                for your procurement process.
              </p>
            </div>
          ) : (
            <>
              {isLoading && !completion && (
                <div className="space-y-4">
                  {/* Loading skeleton - only show when starting and no content yet */}
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

              {error && (
                <Alert variant="destructive">
                  <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                  <AlertDescription>
                    {error instanceof Error
                      ? error.message
                      : "Failed to fetch AI insights. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Show completion even while loading (streaming) */}
              {completion && (
                <div className="bg-muted dark:bg-muted/50 rounded-xl p-6 border ">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-table:text-sm">
                    <ReactMarkdown>{completion}</ReactMarkdown>
                  </div>
                  {isLoading && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                      <HugeiconsIcon
                        icon={Sparkles}
                        size={12}
                        className="animate-pulse"
                      />
                      Generating insights...
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
