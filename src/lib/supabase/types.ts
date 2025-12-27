export type MaterialStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled"

export type MaterialPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent"

export interface MaterialRequest {
  id: string
  material_name: string
  quantity: number
  unit: string
  status: MaterialStatus
  priority: MaterialPriority
  requested_at: string
  requested_by: string
  notes?: string
}
