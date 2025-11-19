// registration.model.ts

export type Gender = "" | "Male" | "Female";
export type PhoneType = "" | "Smart Phone" | "Basic Phone";
export type CandidateStatus = "Active" | "Inactive"; // If backend uses Inactive

export interface CandidateRegistration {
  id?: string;
  name: string;
  contact: string;
  gender: Gender;
  business_type: string[];
  pin_code: string;
  udyam_certificate: boolean;
  phone_type: PhoneType;
  state?: string;
  district?: string;
  taluk?: string;
  status?: CandidateStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CandidateRegistrationModel extends CandidateRegistration {}
