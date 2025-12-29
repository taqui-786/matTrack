import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";
import { useCreateMaterialRequest } from "@/hooks/useCreateMaterialRequest";
import { useUpdateMaterialRequest } from "@/hooks/useUpdateMaterialRequest";
import type { MaterialRequest } from "@/lib/supabase/types";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LoaderCircle } from "@hugeicons/core-free-icons";

const schema = z.object({
  material_name: z.string().min(1, "Material name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
});

type MaterialRequestFormData = z.infer<typeof schema>;

interface MaterialRequestDialogProps {
  request?: MaterialRequest;
  trigger?: React.ReactNode;
}

export function MaterialRequestDialog({
  request,
  trigger,
}: MaterialRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const createMutation = useCreateMaterialRequest();
  const updateMutation = useUpdateMaterialRequest();

  const isEditMode = !!request;
  const isPending = isEditMode
    ? updateMutation.isPending
    : createMutation.isPending;

  const {
    formState: { isDirty },
    reset,
    ...form
  } = useForm<MaterialRequestFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      material_name: "",
      quantity: 0,
      unit: "",
      priority: "medium",
      notes: "",
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && request) {
      reset({
        material_name: request.material_name,
        quantity: request.quantity,
        unit: request.unit,
        priority: request.priority,
        notes: request.notes || "",
      });
    } else if (isOpen && !request) {
      reset({
        material_name: "",
        quantity: 0,
        unit: "",
        priority: "medium",
        notes: "",
      });
    }
    setOpen(isOpen);
  };

  const onSubmit = async (values: MaterialRequestFormData) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: request.id,
          ...values,
        });
        toast.success("Material request updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Material request created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["material-requests"] });
      setOpen(false);
    } catch (error) {
      console.error("Error saving material request:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : isEditMode
          ? "Failed to update material request"
          : "Failed to create material request"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ||
          (isEditMode ? (
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button>Create Request</Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Material Request" : "Create Material Request"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update details for "${request.material_name}"`
              : "Fill in the details to create a new material request"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="material_name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="material_name">Material Name</FieldLabel>
                  <Input
                    id="material_name"
                    placeholder="Enter material name"
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="quantity"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="unit"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="unit">Unit</FieldLabel>
                  <Input
                    id="unit"
                    placeholder="e.g., kg, pcs, liters"
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="priority"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="priority">Priority</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="notes">Notes (Optional)</FieldLabel>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or requirements"
                    className="resize-none"
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || (isEditMode && !isDirty)}
              >
                <HugeiconsIcon
                  data-submitting={isPending}
                  icon={LoaderCircle}
                  size={18}
                  className="animate-spin data-[submitting=true]:block data-[submitting=false]:hidden"
                />
                {isPending
                  ? isEditMode
                    ? "Updating"
                    : "Creating"
                  : isEditMode
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
