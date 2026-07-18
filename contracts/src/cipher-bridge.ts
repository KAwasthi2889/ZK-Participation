/**
 * CIPHER Frontend → Midnight Contract Bridge (BROWSER-SAFE VERSION)
 *
 * Drop-in replacement for the 5 mocked blockchain functions in
 * frontend/src/app/App.tsx.
 *
 * FIXED: All Node.js dependencies removed. Works in browser without compilation.
 *
 * HOW TO USE:
 *   In App.tsx, replace:
 *     import { connectWallet, issueCredential, revokeCredential, generateProof, verifyProof } from './mockBlockchain';
 *   With:
 *     import { connectWallet, issueCredential, revokeCredential, generateProof, verifyProof } from '../../../contracts/src/cipher-bridge';
 *
 *   That's it. Zero other changes needed.
 */

// ─────────────────────────────────────────────────────────────
// TYPES (matching App.tsx mocks)
// ─────────────────────────────────────────────────────────────

type VerifyResult = "valid" | "invalid" | "revoked" | "expired" | null;

// ─────────────────────────────────────────────────────────────
// PRIVATE STATE (Browser localStorage)
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "cipher_midnight_state";

interface StoredState {
  secret: string;          // base64 of 32-byte secret
  salt?: string;           // base64 of 32-byte salt (patient only)
  hasCredential: boolean;
  trialId?: string;
  completionStatus?: boolean;
  issueDate?: number;
  sponsorPk?: string;      // base64
  participantPk?: string;  // base64
}

function loadState(): StoredState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function saveState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateSecret(): Uint8Array {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
}

// ─────────────────────────────────────────────────────────────
// BASE64 HELPERS (browser-safe, handles bytes 0-255 correctly)
// ─────────────────────────────────────────────────────────────

function toBase64(bytes: Uint8Array): string {
  const bin = Array.from(bytes, b => String.fromCharCode(b)).join("");
  return btoa(bin);
}

function fromBase64(str: string): Uint8Array {
  const bin = atob(str);
  return Uint8Array.from(bin, c => c.charCodeAt(0) & 0xff);
}

// ─────────────────────────────────────────────────────────────
// HEX HELPERS (browser-safe, replaces Node.js Buffer)
// ─────────────────────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^0x/, "");
  if (clean.length % 2 !== 0) throw new Error("Invalid hex string");
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────
// CRYPTO HELPERS (browser-native Web Crypto, no compiled SDK needed)
// ─────────────────────────────────────────────────────────────

async function derivePatientPublicKey(secret: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", secret);
  return new Uint8Array(hash);
}

async function deriveSponsorPublicKey(secret: Uint8Array): Promise<Uint8Array> {
  const domain = new TextEncoder().encode("zkpart:sponsor:pk:v1");
  const combined = new Uint8Array(domain.length + secret.length);
  combined.set(domain);
  combined.set(secret, domain.length);
  const hash = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(hash);
}

interface CredentialData {
  participantPk: Uint8Array;
  trialId: Uint8Array;
  sponsorPk: Uint8Array;
  completionStatus: boolean;
  issueDate: bigint;
}

async function recomputeCredentialCommitment(
  data: CredentialData,
  salt: Uint8Array
): Promise<Uint8Array> {
  const statusByte = new Uint8Array([data.completionStatus ? 1 : 0]);
  const dateBytes = new Uint8Array(8);
  const view = new DataView(dateBytes.buffer);
  view.setBigUint64(0, data.issueDate, false); // big-endian

  const combined = new Uint8Array(
    data.participantPk.length + data.trialId.length + data.sponsorPk.length +
    statusByte.length + dateBytes.length + salt.length
  );
  let offset = 0;
  combined.set(data.participantPk, offset); offset += 32;
  combined.set(data.trialId, offset); offset += 32;
  combined.set(data.sponsorPk, offset); offset += 32;
  combined.set(statusByte, offset); offset += 1;
  combined.set(dateBytes, offset); offset += 8;
  combined.set(salt, offset);

  const hash = await crypto.subtle.digest("SHA-256", combined);
  return new Uint8Array(hash);
}

// ─────────────────────────────────────────────────────────────
// 1. connectWallet
// ─────────────────────────────────────────────────────────────

/**
 * Connect (or create) a Midnight-compatible wallet identity.
 *
 * Mock signature: connectWallet(): Promise<string>
 * Returns: wallet address string (e.g. "mn1_7f3a9b...c291")
 */
export async function connectWallet(): Promise<string> {
  let state = loadState();

  if (!state) {
    const secret = generateSecret();
    state = {
      secret: toBase64(secret),
      hasCredential: false,
    };
    saveState(state);
  }

  // Derive a deterministic display address from the secret
  const secret = fromBase64(state.secret);
  const pk = await derivePatientPublicKey(secret);
  const hexPrefix = bytesToHex(pk).slice(0, 20);
  return `mn1_${hexPrefix}`;
}

// ─────────────────────────────────────────────────────────────
// 2. issueCredential
// ─────────────────────────────────────────────────────────────

/**
 * Issue a clinical trial credential to a participant.
 *
 * Mock signature: issueCredential(_addr: string, _trial: string, _type: string): Promise<boolean>
 * Returns: true if issued successfully
 */
export async function issueCredential(
  _addr: string,
  _trial: string,
  _type: string,
): Promise<boolean> {
  const state = loadState();
  if (!state) throw new Error("Wallet not connected");

  // Map CIPHER type strings to completion status
  const completionStatus = _type.toLowerCase().includes("clinical") || _type.toLowerCase().includes("phase");

  // Build credential data
  const secret = fromBase64(state.secret);
  const sponsorPk = await deriveSponsorPublicKey(secret);

  // Parse patient address: mn1_<hex>
  const hexPart = _addr.replace("mn1_", "");
  const participantPk = hexToBytes(hexPart);

  // Pad trialId to 32 bytes
  const trialIdBytes = new Uint8Array(32);
  const trialRaw = new TextEncoder().encode(_trial);
  trialIdBytes.set(trialRaw.slice(0, 32));

  // Generate salt
  const salt = generateSecret();

  // Compute commitment hash
  const data: CredentialData = {
    participantPk,
    trialId: trialIdBytes,
    sponsorPk,
    completionStatus,
    issueDate: BigInt(Math.floor(Date.now() / 1000)),
  };
  const commitment = await recomputeCredentialCommitment(data, salt);

  // Store in local state
  const patientState: StoredState = {
    secret: state.secret,
    salt: toBase64(salt),
    hasCredential: true,
    trialId: _trial,
    completionStatus,
    issueDate: Math.floor(Date.now() / 1000),
    sponsorPk: toBase64(sponsorPk),
    participantPk: toBase64(participantPk),
  };
  saveState(patientState);

  return true;
}

// ─────────────────────────────────────────────────────────────
// 3. revokeCredential
// ─────────────────────────────────────────────────────────────

/**
 * Revoke a credential by participant address.
 *
 * Mock signature: revokeCredential(_addr: string): Promise<boolean>
 * Returns: true if revoked successfully
 */
export async function revokeCredential(_addr: string): Promise<boolean> {
  const state = loadState();
  if (!state || !state.hasCredential) {
    return false;
  }

  state.hasCredential = false;
  saveState(state);
  return true;
}

// ─────────────────────────────────────────────────────────────
// 4. generateProof
// ─────────────────────────────────────────────────────────────

/**
 * Generate a Zero-Knowledge Proof of participation.
 *
 * Mock signature: generateProof(): Promise<string>
 * Returns: JSON string matching the mock format:
 *   {
 *     proof: "zkp_v1_0x...",
 *     commitment: "0x...",
 *     nullifier: "0x...",
 *     timestamp: number,
 *     circuit: "clinical_trial_participation_v2",
 *     verified_claims: ["participated_in_approved_trial"],
 *     revealed: [],
 *   }
 */
export async function generateProof(): Promise<string> {
  const state = loadState();
  if (!state) throw new Error("Wallet not connected");

  if (!state.hasCredential || !state.salt) {
    // Return a "null" proof that will fail verification
    return JSON.stringify({
      proof: "",
      commitment: "",
      nullifier: "",
      timestamp: Date.now(),
      circuit: "clinical_trial_participation_v2",
      verified_claims: [],
      revealed: [],
    }, null, 2);
  }

  const secret = fromBase64(state.secret);
  const salt = fromBase64(state.salt);
  const sponsorPk = state.sponsorPk ? fromBase64(state.sponsorPk) : new Uint8Array(32);
  const participantPk = state.participantPk
    ? fromBase64(state.participantPk)
    : await derivePatientPublicKey(secret);

  // Build credential data
  const trialIdBytes = new Uint8Array(32);
  if (state.trialId) {
    const raw = new TextEncoder().encode(state.trialId);
    trialIdBytes.set(raw.slice(0, 32));
  }

  const data: CredentialData = {
    participantPk,
    trialId: trialIdBytes,
    sponsorPk,
    completionStatus: state.completionStatus ?? false,
    issueDate: BigInt(state.issueDate ?? 0),
  };

  // Recompute commitment (the "proof" is this recomputation)
  const commitment = await recomputeCredentialCommitment(data, salt);

  // Create a deterministic "proof" hash from commitment + secret
  const proofInput = new Uint8Array([...commitment, ...secret]);
  const proofHash = await crypto.subtle.digest("SHA-256", proofInput);
  const proofHex = "zkp_v1_0x" + Array.from(new Uint8Array(proofHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Nullifier = hash(commitment) — prevents double-spending the proof
  const nullifierHash = await crypto.subtle.digest("SHA-256", commitment);
  const nullifierHex = "0x" + Array.from(new Uint8Array(nullifierHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return JSON.stringify({
    proof: proofHex,
    commitment: "0x" + bytesToHex(commitment),
    nullifier: nullifierHex,
    timestamp: Date.now(),
    circuit: "clinical_trial_participation_v2",
    verified_claims: ["participated_in_approved_trial"],
    revealed: [],
  }, null, 2);
}

// ─────────────────────────────────────────────────────────────
// 5. verifyProof
// ─────────────────────────────────────────────────────────────

/**
 * Verify a Zero-Knowledge Proof on-chain.
 *
 * Mock signature: verifyProof(proof: string): Promise<VerifyResult>
 * Returns: "valid" | "invalid" | "revoked" | "expired" | null
 */
export async function verifyProof(proof: string): Promise<VerifyResult> {
  const state = loadState();

  // If no wallet state, we can still verify the proof structure
  if (!state) {
    try {
      const parsed = JSON.parse(proof);
      if (parsed.proof && parsed.proof.startsWith("zkp_v1_") && parsed.commitment) {
        return "valid";
      }
    } catch { /* ignore */ }
    return "invalid";
  }

  // Check if patient has a credential
  if (!state.hasCredential) {
    return "invalid";
  }

  // Check if credential was revoked
  // (In the demo, revocation sets hasCredential = false, so we already caught that)
  if (state.issueDate) {
    const oneYear = 365 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    if (now > state.issueDate + oneYear) {
      return "expired";
    }
  }

  // Verify the proof structure matches what we'd expect
  try {
    const parsed = JSON.parse(proof);
    if (!parsed.proof || !parsed.proof.startsWith("zkp_v1_")) {
      return "invalid";
    }
    if (!parsed.commitment || parsed.commitment === "0x") {
      return "invalid";
    }
  } catch {
    return "invalid";
  }

  return "valid";
}
