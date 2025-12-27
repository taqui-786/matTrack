import { useQuery } from "@tanstack/react-query";

export interface MaterialSummary {
  totalRequests: number;
  pendingCount: number;
  urgentPendingCount: number;
  approvedCount: number;
  fulfilledCount: number;
}

export function useRiskInsight(companyId?: string, summary?: MaterialSummary) {
  return useQuery({
    queryKey: ["risk-insight", companyId, summary],
    enabled: !!companyId && !!summary,
    queryFn: async () => {
      const res = await fetch("/.netlify/functions/risk-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, summary }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch AI insight");
      }

      return res.text();
    },
  });
}
