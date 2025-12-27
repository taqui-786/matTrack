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
import { toast } from "sonner";

const schema = z.object({
  material_name: z.string().min(1, "Material name is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
});

type MaterialRequestFormData = z.infer<typeof schema>;

export function CreateMaterialRequestDialog() {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();
  const createMaterialRequest = useCreateMaterialRequest();

  const form = useForm<MaterialRequestFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      material_name: "",
      quantity: 0,
      unit: "",
      priority: "medium",
      notes: "",
    },
  });

  const onSubmit = async (values: MaterialRequestFormData) => {
    try {
      await createMaterialRequest.mutateAsync(values);

      toast("Success", {
        description: "Material request created successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["material-requests"] });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating material request:", error);
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create material request",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Request</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Material Request</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new material request
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                disabled={createMaterialRequest.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMaterialRequest.isPending}>
                {createMaterialRequest.isPending ? "Creating..." : "Submit"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
