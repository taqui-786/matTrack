import { useMutation } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/supabaseClient";
import { z } from "zod";

const materialRequestSchema = z.object({
  material_name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
});

type MaterialRequestInput = z.infer<typeof materialRequestSchema>;

export function useCreateMaterialRequest() {
  return useMutation({
    mutationFn: async (values: MaterialRequestInput) => {
      const user = (await supabaseClient.auth.getUser()).data.user;

      if (!user) {
        throw new Error("User not authenticated");
      }
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError || !profile?.company_id) {
        throw new Error("Profile or company not found");
      }
      const { error } = await supabaseClient.from("material_requests").insert({
        ...values,
        requested_by: user.id,
        status: "pending",
        company_id: profile.company_id,
      });

      if (error) throw error;
    },
  });
}
