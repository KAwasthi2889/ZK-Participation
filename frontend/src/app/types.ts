export type Role = "sponsor" | "patient" | "verifier";
export type View = "landing" | "auth" | "dashboard";
export type AuthMode = "signin" | "signup";
export type CredStatus = "active" | "revoked" | "pending" | "expired";
export type VerifyResult = "valid" | "invalid" | "revoked" | "expired" | null;
export type StepState = "idle" | "active" | "done";

export interface AuthUser {
  email: string;
  role: Role;
  name: string;
  org?: string;
}

export interface CredentialRecord {
  id: string;
  patient: string;
  trial: string;
  type: string;
  status: CredStatus;
  issuedAt: string;
  revokedAt?: string;
  expiry: string;
}

export interface VerificationRecord {
  id: string;
  proofId: string;
  timestamp: string;
  purpose: string;
  result: "valid" | "invalid" | "revoked";
  disclosed: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
}
