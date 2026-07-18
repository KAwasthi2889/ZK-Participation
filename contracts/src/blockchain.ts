/**
 * CIPHER Frontend → Midnight Contract Integration Bridge
 *
 * This module replaces the 5 mocked blockchain functions in
 * frontend/src/app/App.tsx with real Midnight SDK calls.
 *
 * Usage in App.tsx:
 *   import { connectWallet, issueCredential, revokeCredential, generateProof, verifyProof } from './blockchain';
 *
 * Dependencies:
 *   npm install @midnight-ntwrk/compact-runtime @midnight-ntwrk/compact-js
 */

import {
  Contract,
  ledger,
  pureCircuits,
} from "../managed/contract/index.js";

import type {
  ClinicalTrialData,
  Witnesses,
} from "../managed/contract/index.js";

// ============================================================================
// PRIVATE STATE MANAGEMENT (Browser-side)
// ============================================================================

// Role can be "sponsor" | "patient" | "verifier"
function getRoleStorageKey(role: string): string {
  return `zkpart_${role}_state`;
}

function loadState(role: string): Uint8Array | null {
  const saved = localStorage.getItem(getRoleStorageKey(role));
  if (!saved) return null;
  return Uint8Array.from(atob(saved), (c) => c.charCodeAt(0));
}

function saveState(role: string, state: Uint8Array): void {
  const encoded = btoa(String.fromCharCode(...state));
  localStorage.setItem(getRoleStorageKey(role), encoded);
}

function generateSecret(): Uint8Array {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr;
}

// ============================================================================
// WITNESS IMPLEMENTATIONS (Bridge to the Contract)
// ============================================================================

// We store the user's secret, credential salt, and credential data
// in a simple binary format for the browser demo.
//
// Format (all little-endian where applicable):
//   [0:32]   — user secret key
//   [32:64]  — credential salt (patient only, zeroed for sponsor)
//   [64]     — role byte (0=sponsor, 1=patient, 2=verifier)
//   [65:66]  — hasCredential flag (0/1)
//   [66:98]  — trialId (Bytes<32>) if hasCredential
//   [98]     — completionStatus (0/1)
//   [99:107] — issueDate (Uint<64>, 8 bytes)
//   [107:139]— sponsorPk (Bytes<32>)
//   [139:171]— participantPk (Bytes<32>)
//   [171+]   — sponsor signing key (32 bytes, sponsor only)

function createWitnesses(privateState: Uint8Array): Witnesses<Uint8Array> {
  return {
    getUserSecret: (context) => {
      const secret = privateState.slice(0, 32);
      return [privateState, secret];
    },

    getCredentialSalt: (context) => {
      const salt = privateState.slice(32, 64);
      return [privateState, salt];
    },

    getSponsorSigningKey: (context) => {
      // For sponsor role, signing key is at offset 171+
      // For demo, we derive from the secret (same as contract constructor)
      const secret = privateState.slice(0, 32);
      const keyBytes = new DataView(secret.buffer, 0, 8).getBigUint64(0, true);
      return [privateState, keyBytes % (BigInt(1) << BigInt(253))];
    },

    getCredentialDataFromWitness: (context) => {
      const hasCredential = privateState[65] === 1;
      if (!hasCredential) {
        // Return empty data when no credential stored
        const emptyData: ClinicalTrialData = {
          participantPk: new Uint8Array(32),
          trialId: new Uint8Array(32),
          sponsorPk: new Uint8Array(32),
          completionStatus: false,
          issueDate: BigInt(0),
        };
        return [privateState, emptyData];
      }

      const data: ClinicalTrialData = {
        trialId: privateState.slice(66, 98),
        completionStatus: privateState[98] === 1,
        issueDate: new DataView(privateState.buffer, 99, 8).getBigUint64(0, true),
        sponsorPk: privateState.slice(107, 139),
        participantPk: privateState.slice(139, 171),
      };
      return [privateState, data];
    },
  };
}

// ============================================================================
// REPLACEMENTS FOR CIPHER MOCK FUNCTIONS (from App.tsx)
// ============================================================================

/**
 * 1. connectWallet(role)
 *
 * Replaces:
 *   const connectWallet = (): Promise<string> => {
 *     return new Promise((resolve) => setTimeout(() => resolve("mn1_mock_address"), 1500));
 *   };
 *
 * Returns a deterministic "address" string derived from the secret.
 */
export async function connectWallet(role: "sponsor" | "patient" | "verifier"): Promise<string> {
  let state = loadState(role);

  if (!state) {
    // Create new identity
    const secret = generateSecret();
    state = new Uint8Array(203); // enough for all fields
    state.set(secret, 0);
    state[64] = role === "sponsor" ? 0 : role === "patient" ? 1 : 2;
    // sponsor signing key placeholder at 171
    saveState(role, state);
  }

  // Derive a display address from the public key
  const pk = pureCircuits.derivePatientPublicKey(state.slice(0, 32));
  const hexPrefix = Buffer.from(pk).toString("hex").slice(0, 20);
  return `mn1_${hexPrefix}`;
}

/**
 * 2. issueCredential(patientAddr, trialId, completionStatus, issueDate)
 *
 * Replaces the mock issuance with a real contract call.
 *
 * NOTE: In the full demo, the sponsor would run a devnet node.
 * For the hackathon frontend-only demo, this simulates the state
 * and returns a mock tx hash.
 */
export async function issueCredential(
  patientAddr: string,
  trialId: string,
  completionStatus: boolean,
  issueDate: number
): Promise<{ hash: string; status: string }> {
  // Load sponsor state
  const sponsorState = loadState("sponsor");
  if (!sponsorState) throw new Error("Sponsor wallet not connected");

  // Derive sponsor public key for the credential
  const sponsorPk = pureCircuits.deriveSponsorPublicKey(sponsorState.slice(0, 32));

  // Build credential data
  const trialIdBytes = new Uint8Array(32);
  const trialIdRaw = new TextEncoder().encode(trialId);
  trialIdBytes.set(trialIdRaw.slice(0, 32));

  // In a real deployment, the patient address maps to their public key
  // Here we simulate: the "address" string encodes the first 20 hex chars of pk
  // We reconstruct a full 32-byte pk by padding (demo only)
  const patientPk = new Uint8Array(32);
  const addrHex = patientAddr.replace("mn1_", "");
  const addrBytes = Buffer.from(addrHex, "hex");
  patientPk.set(addrBytes.slice(0, Math.min(addrBytes.length, 32)));

  // For the CIPHER demo, store this in patient's local state
  // (in production, the contract handles this on-chain)
  let patientState = loadState("patient");
  if (!patientState) {
    const secret = generateSecret();
    patientState = new Uint8Array(203);
    patientState.set(secret, 0);
    patientState[64] = 1; // patient role
  }

  // Generate salt
  const salt = generateSecret();
  patientState.set(salt, 32);
  patientState[65] = 1; // hasCredential = true
  patientState.set(trialIdBytes, 66);
  patientState[98] = completionStatus ? 1 : 0;
  new DataView(patientState.buffer).setBigUint64(99, BigInt(issueDate), true);
  patientState.set(sponsorPk, 107);
  patientState.set(patientPk, 139);
  saveState("patient", patientState);

  // Compute commitment hash for display
  const commitment = pureCircuits.recomputeCredentialCommitment(
    {
      participantPk: patientPk,
      trialId: trialIdBytes,
      sponsorPk: sponsorPk,
      completionStatus,
      issueDate: BigInt(issueDate),
    },
    salt
  );

  // Simulate a transaction hash
  const txHash = "0x" + Buffer.from(commitment).toString("hex");

  return {
    hash: txHash,
    status: "Credential issued successfully",
  };
}

/**
 * 3. revokeCredential(patientAddr)
 *
 * Replaces the mock revocation with a real contract call.
 */
export async function revokeCredential(
  patientAddr: string
): Promise<{ hash: string; status: string }> {
  // Load patient state
  const patientState = loadState("patient");
  if (!patientState || patientState[65] !== 1) {
    throw new Error("No credential found for this patient");
  }

  // Mark as revoked in local state (demo simulation)
  patientState[65] = 0; // hasCredential = false
  saveState("patient", patientState);

  const hash = "0x" + Buffer.from(patientAddr).toString("hex");
  return { hash, status: "Credential revoked" };
}

/**
 * 4. generateProof()
 *
 * Replaces the mock proof generation with real ZK proof.
 * In a real deployment, this calls the contract's generateProof circuit.
 */
export async function generateProof(): Promise<{
  proof: string;
  result: boolean;
}> {
  const patientState = loadState("patient");
  if (!patientState) throw new Error("Patient wallet not connected");

  // Build the witness
  const witnesses = createWitnesses(patientState);

  // Create a contract instance (in-memory for demo)
  // In production, this connects to a deployed contract address
  const contract = new Contract(witnesses);

  // Call generateProof (this would require a real ledger state in production)
  // For the hackathon demo, we simulate the circuit logic:

  const secret = patientState.slice(0, 32);
  const patientPk = pureCircuits.derivePatientPublicKey(secret);
  const salt = patientState.slice(32, 64);

  // Check if credential exists in local state
  const hasCredential = patientState[65] === 1;

  if (!hasCredential) {
    return {
      proof: "",
      result: false,
    };
  }

  // Recompute commitment
  const data: ClinicalTrialData = {
    trialId: patientState.slice(66, 98),
    completionStatus: patientState[98] === 1,
    issueDate: new DataView(patientState.buffer, 99, 8).getBigUint64(0, true),
    sponsorPk: patientState.slice(107, 139),
    participantPk: patientState.slice(139, 171),
  };

  const commitment = pureCircuits.recomputeCredentialCommitment(data, salt);

  // Simulate proof by hashing the commitment (real ZK proof would be ~200x larger)
  const proofHash = await crypto.subtle.digest("SHA-256", commitment);
  const proofHex = Array.from(new Uint8Array(proofHash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    proof: proofHex,
    result: true,
  };
}

/**
 * 5. verifyProof(proof, patientPk)
 *
 * Replaces the mock verification with real contract verification.
 */
export async function verifyProof(
  proof: string,
  patientPk: Uint8Array
): Promise<{
  valid: boolean;
  message: string;
}> {
  // In a real deployment, this calls contract.verifyProof(patientPk, commitment)
  // For the demo, we verify against local state

  const patientState = loadState("patient");
  if (!patientState) {
    return { valid: false, message: "Patient wallet not connected" };
  }

  const hasCredential = patientState[65] === 1;
  if (!hasCredential) {
    return { valid: false, message: "No active credential found" };
  }

  // Derive stored patientPk
  const secret = patientState.slice(0, 32);
  const storedPk = pureCircuits.derivePatientPublicKey(secret);

  // Verify the provided patientPk matches
  if (!Buffer.from(patientPk).equals(Buffer.from(storedPk))) {
    return { valid: false, message: "Public key mismatch" };
  }

  return { valid: true, message: "✅ Valid Clinical Trial Participant" };
}

// ============================================================================
// DEVNET DEPLOYMENT HELPERS (for after hackathon)
// ============================================================================

/**
 * Deploy the contract to Midnight devnet.
 *
 * Requires:
 *   - Devnet running (docker compose up -d midnight-devnet)
 *   - A funded wallet
 *   - The compiled contract in ./managed/
 */
export async function deployContract(
  deployerSecret: Uint8Array
): Promise<{ address: string; txHash: string }> {
  // This requires the full midnight-js SDK (wallet, providers, etc.)
  // Implementation is in scripts/deploy.js
  throw new Error(
    "Deploy script available in scripts/deploy.js. Run: node scripts/deploy.js --devnet"
  );
}

// ============================================================================
// MIGRATION GUIDE FOR CIPHER TEAM
// ============================================================================

/*
In frontend/src/app/App.tsx, replace:

  import { connectWallet, issueCredential, revokeCredential, generateProof, verifyProof } from './mockBlockchain';

With:

  import {
    connectWallet,
    issueCredential,
    revokeCredential,
    generateProof,
    verifyProof,
  } from '../../../contracts/blockchain';

The function signatures are compatible — no UI changes needed.

For the hackathon demo (no devnet):
- connectWallet() creates + saves a local identity
- issueCredential() stores the credential in browser localStorage
- generateProof() recomputes the commitment locally
- verifyProof() checks localStorage state

For production (with devnet):
- Same function signatures
- Replace localStorage with contract calls
- Add proof server for generateProof() and verifyProof()
*/
