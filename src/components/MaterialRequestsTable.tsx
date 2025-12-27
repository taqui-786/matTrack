import type { MaterialRequest } from "@/lib/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { MaterialRequestDialog } from "./MaterialRequestDialog";

interface MaterialRequestsTableProps {
  data: MaterialRequest[];
  isLoading: boolean;
  isError: boolean;
}

function TableSkeleton() {
  return (
    <TableBody>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export function MaterialRequestsTable({
  data,
  isLoading,
  isError,
}: MaterialRequestsTableProps) {
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">
          Failed to load material requests
        </p>
        <p className="text-slate-600 text-sm mt-2">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Material</TableHead>
            <TableHead className="font-semibold">Qty</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Requested By</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>

        {isLoading ? (
          <TableSkeleton />
        ) : data.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-12 text-slate-500"
              >
                No material requests found
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {data.map((request) => (
              <TableRow key={request.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">
                  {request.material_name}
                </TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell className="text-slate-600">{request.unit}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={request.priority} />
                </TableCell>
                <TableCell className="text-slate-700">
                  {request.requested_by}
                </TableCell>
                <TableCell className="text-slate-600">
                  {new Date(request.requested_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <StatusUpdateDialog request={request} />
                    <MaterialRequestDialog request={request} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
