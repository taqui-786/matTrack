import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase/supabaseClient";
import type { MaterialRequest, MaterialStatus } from "@/lib/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StatusUpdateDialogProps {
  request: MaterialRequest;
}

const statusLabels: Record<MaterialStatus, string> = {
  pending: "mark as Pending",
  approved: "approve",
  rejected: "reject",
  fulfilled: "mark as Fulfilled",
};

export function StatusUpdateDialog({ request }: StatusUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<MaterialStatus>(request.status);
  const queryClient = useQueryClient();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setNewStatus(request.status);
    }
    setOpen(isOpen);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async (status: MaterialStatus) => {
      const { error } = await supabaseClient
        .from("material_requests")
        .update({ status })
        .eq("id", request.id);

      if (error) throw error;
    },

    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ["material-requests"] });

      const previousRequests = queryClient.getQueryData(["material-requests"]);
      queryClient.setQueriesData<MaterialRequest[]>(
        { queryKey: ["material-requests"] },
        (old) => {
          if (!old) return old;
          return old.map((req) =>
            req.id === request.id ? { ...req, status: newStatus } : req
          );
        }
      );

      return { previousRequests };
    },

    onError: (error: Error, _newStatus, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(
          ["material-requests"],
          context.previousRequests
        );
      }
      toast.error(`Failed to update status: ${error.message}`);
    },
    onSuccess: (_data, newStatus) => {
      toast.success(`Request ${statusLabels[newStatus]}d successfully`);
      setOpen(false);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["material-requests"] });
    },
  });

  const handleUpdate = () => {
    if (newStatus === request.status) {
      setOpen(false);
      return;
    }
    updateStatusMutation.mutate(newStatus);
  };

  const hasStatusChanged = newStatus !== request.status;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Request Status</DialogTitle>
          <DialogDescription>
            Change the status of "{request.material_name}" request
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Status:{" "}
              <span className="text-slate-600">{request.status}</span>
            </label>
            <Select
            
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as MaterialStatus)}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="max-w-[200px] w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasStatusChanged && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-900">
                Are you sure you want to{" "}
                <strong>{statusLabels[newStatus]}</strong> this request?
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateStatusMutation.isPending || !hasStatusChanged}
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
