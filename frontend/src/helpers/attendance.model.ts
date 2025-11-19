// src/models/attendance.model.ts
export interface AttendanceModel {
  id?: string;
  candidate_id: string;
  session_name?: string[];
  attended: boolean;
  date?: string; // 'YYYY-MM-DD'
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}
