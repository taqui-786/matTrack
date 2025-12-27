import { useQuery } from "@tanstack/react-query"
import { supabaseClient } from "@/lib/supabase/supabaseClient"

export function useMaterialRequests(status?: string) {
  return useQuery({
    queryKey: ["material-requests", status],
    queryFn: async () => {
      let query = supabaseClient
        .from("material_requests")
        .select("*")
        .order("requested_at", { ascending: false })

      if (status && status !== "all") {
        query = query.eq("status", status)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
