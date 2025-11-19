// src/helpers/business.model.ts

export interface BusinessModel {
  id?: string;                          // For responses
  candidate_id: string;                 // UUID
  customers_before?: number | null;
  customers_after?: number | null;
  income_before?: number | null;
  income_after?: number | null;
  created_at?: string;                  // ISO format (for GET only)
}
