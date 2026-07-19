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

export const MOCK_CREDENTIALS: CredentialRecord[] = [
  { id: "CR-001", patient: "mn1_4a2b...7c8d", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-01", expiry: "2026-07-01" },
  { id: "CR-002", patient: "mn1_9f1e...3a4b", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-02", expiry: "2026-07-02" },
  { id: "CR-003", patient: "mn1_2c5d...8e9f", trial: "NCT-2024-0038", type: "Observational",   status: "revoked", issuedAt: "2025-06-15", revokedAt: "2025-07-10", expiry: "2026-06-15" },
  { id: "CR-004", patient: "mn1_7e3a...1b2c", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-05", expiry: "2026-07-05" },
  { id: "CR-005", patient: "mn1_8f4b...2c3d", trial: "NCT-2024-0042", type: "Phase III",       status: "active",  issuedAt: "2025-07-08", expiry: "2026-07-08" },
  { id: "CR-006", patient: "mn1_1a9e...6g7h", trial: "NCT-2024-0038", type: "Observational",   status: "revoked", issuedAt: "2025-06-20", revokedAt: "2025-07-12", expiry: "2026-06-20" },
  { id: "CR-007", patient: "mn1_3b7f...9a1c", trial: "NCT-2024-0043", type: "Phase II",        status: "active",  issuedAt: "2025-07-10", expiry: "2026-07-10" },
  { id: "CR-008", patient: "mn1_5c2a...4d8e", trial: "NCT-2024-0042", type: "Phase III",       status: "pending", issuedAt: "2025-07-14", expiry: "2026-07-14" },
];

export const MOCK_VERIFICATIONS: VerificationRecord[] = [
  { id: "VR-001", proofId: "ZKP-9f3a...4b5c", timestamp: "2025-07-15 09:14", purpose: "Insurance Claim",       result: "valid",   disclosed: "Participation only" },
  { id: "VR-002", proofId: "ZKP-4b2c...7d8e", timestamp: "2025-07-14 14:30", purpose: "Research Enrollment",   result: "valid",   disclosed: "Participation only" },
  { id: "VR-003", proofId: "ZKP-7d1e...2f3g", timestamp: "2025-07-13 11:02", purpose: "Benefits Eligibility",  result: "invalid", disclosed: "None" },
  { id: "VR-004", proofId: "ZKP-2e9b...5a1h", timestamp: "2025-07-12 16:45", purpose: "Academic Participation",result: "valid",   disclosed: "Participation only" },
  { id: "VR-005", proofId: "ZKP-6a4f...8c9i", timestamp: "2025-07-11 08:20", purpose: "Insurance Claim",       result: "valid",   disclosed: "Participation only" },
];
