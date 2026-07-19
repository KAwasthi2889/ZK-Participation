import { Role, CredentialRecord, VerificationRecord } from './types';

export const PRIMARY   = "#3B5BFF";
export const CYAN      = "#4FCBFF";
export const SUCCESS   = "#22C55E";   // emerald — active / verified / success
export const DANGER    = "#E03550";   // red — revoked / failed / error

export const DEMO_ACCOUNTS = [
  { role: "sponsor"  as Role, email: "sponsor@cipher.com",  password: "Sponsor123",  name: "Dr. Sarah Chen",    org: "Meridian Research Institute" },
  { role: "patient"  as Role, email: "patient@cipher.com",  password: "Patient123",  name: "Alex Morgan",       org: "" },
  { role: "verifier" as Role, email: "verifier@cipher.com", password: "Verifier123", name: "Prism Analytics",   org: "Insurance & Research" },
];

export const MOCK_CREDENTIALS: CredentialRecord[] = [];

export const MOCK_VERIFICATIONS: VerificationRecord[] = [];
