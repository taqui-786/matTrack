import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import { MaterialRequestsTable } from "@/components/MaterialRequestsTable";
import { MaterialRequestDialog } from "@/components/MaterialRequestDialog";
import { AIInsightsDialog } from "@/components/AIInsightsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { mkConfig, generateCsv, download } from "export-to-csv";

function MaterialRequests() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("all")
  );
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useMaterialRequests(status);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      // Format data for CSV export
      const csvData = data.map((request) => ({
        Material: request.material_name,
        Quantity: request.quantity,
        Unit: request.unit,
        Status: request.status,
        Priority: request.priority,
        "Requested By": request.requested_by,
        "Requested At": new Date(request.requested_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        ),
        Notes: request.notes || "",
      }));

      // Configure CSV export
      const csvConfig = mkConfig({
        useKeysAsHeaders: true,
        filename: `material-requests-${new Date().toISOString().split("T")[0]}`,
      });

      // Generate and download CSV
      const csv = generateCsv(csvConfig)(csvData);
      download(csvConfig)(csv);
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-primary/10">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6 mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Material Requests
          </h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExporting || !data || data.length === 0}
              className="w-full sm:w-auto"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </>
              )}
            </Button>
            <AIInsightsDialog />
            <MaterialRequestDialog />
          </div>
        </div>

        <MaterialRequestsTable
          data={data || []}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  );
}

export default MaterialRequests;
