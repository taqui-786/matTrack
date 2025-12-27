import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/supabaseClient";
import type { MaterialRequest } from "@/lib/supabase/types";
import { z } from "zod";

const updateMaterialRequestSchema = z.object({
  id: z.string(),
  material_name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
});

type UpdateMaterialRequestInput = z.infer<typeof updateMaterialRequestSchema>;

export function useUpdateMaterialRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: UpdateMaterialRequestInput) => {
      const { error } = await supabaseClient
        .from("material_requests")
        .update(values)
        .eq("id", id);

      if (error) throw error;
    },

    onMutate: async (updatedRequest) => {
      await queryClient.cancelQueries({ queryKey: ["material-requests"] });

      const previousRequests = queryClient.getQueryData<MaterialRequest[]>([
        "material-requests",
      ]);

      queryClient.setQueriesData<MaterialRequest[]>(
        { queryKey: ["material-requests"] },
        (old) => {
          if (!old) return old;
          return old.map((req) =>
            req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
          );
        }
      );

      return { previousRequests };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(
          ["material-requests"],
          context.previousRequests
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["material-requests"] });
    },
  });
}
