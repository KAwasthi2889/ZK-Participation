/**
 * ClinicalTrialCredential Witness Implementations
 *
 * TypeScript witness stubs for the ClinicalTrialCredential.compact contract.
 * These functions bridge the Compact circuit's witness declarations to the
 * prover's local private state (browser IndexedDB, localStorage, or file system).
 *
 * To use with Compact CLI generated code:
 *   import { witnesses } from './ClinicalTrialWitnesses';
 *   const { getUserSecret, getCredentialSalt, getSponsorSigningKey, getCredentialDataFromWitness } = witnesses;
 */

import { WitnessContext } from "@midnight-ntwrk/compact-runtime";

// ============================================================================
// PRIVATE STATE TYPE
// ============================================================================

/**
 * Private state stored per prover (patient or sponsor).
 * In a browser: store in encrypted IndexedDB or localStorage.
 * In CLI/Node: store in ~/.zk-participation/secrets.json (encrypted).
 */
export type CredentialPrivateState = {
  /** The user's 32-byte secret key — the root of all identity derivations */
  readonly secretKey: Uint8Array;

  /** The sponsor's signing secret (Field/bigint) — only set for sponsor role */
  readonly sponsorSigningSecret?: bigint;

  /** Map of patientPk -> { credentialData, salt } for issued credentials */
  readonly issuedCredentials?: Map<string, IssuedCredential>;

  /** The caller's own credential data (patient role) */
  readonly myCredential?: StoredCredential;
};

export type IssuedCredential = {
  credentialData: ClinicalTrialData;
  salt: Uint8Array;
};

export type StoredCredential = {
  data: ClinicalTrialData;
  salt: Uint8Array;
};

// ============================================================================
// DATA TYPES (mirroring Compact structs)
// ============================================================================

export type ClinicalTrialData = {
  participantPk: Uint8Array;   // 32 bytes
  trialId: Uint8Array;         // 32 bytes
  sponsorPk: Uint8Array;       // 32 bytes
  completionStatus: boolean;
  issueDate: bigint;            // Uint<64>
};

export type SchnorrSignature = {
  r: { x: bigint; y: bigint }; // JubjubPoint
  s: bigint;                   // Field
};

export type SignedClinicalCredential = {
  credential: ClinicalTrialData;
  signature: SchnorrSignature;
  pk: { x: bigint; y: bigint }; // JubjubPoint
};

// ============================================================================
// WITNESS IMPLEMENTATIONS
// ============================================================================

export const witnesses = {
  /**
   * Returns the caller's private 32-byte secret key.
   * This is the root secret from which all identities are derived.
   *
   * @param context - WitnessContext providing privateState
   * @returns [updatedPrivateState, secretKey]
   */
  getUserSecret(
    context: WitnessContext<any, CredentialPrivateState>,
  ): [CredentialPrivateState, Uint8Array] {
    if (!context.privateState.secretKey || context.privateState.secretKey.length !== 32) {
      throw new Error(
        "getUserSecret: secretKey is missing or not 32 bytes. " +
        "Ensure private state is initialized with a 32-byte secret."
      );
    }
    return [context.privateState, context.privateState.secretKey];
  },

  /**
   * Returns the random salt for a specific credential commitment.
   * Each credential uses a unique salt. The salt is stored alongside
   * the credential data in the prover's private state.
   *
   * @param context - WitnessContext
   * @returns [updatedPrivateState, salt]
   */
  getCredentialSalt(
    context: WitnessContext<any, CredentialPrivateState>,
  ): [CredentialPrivateState, Uint8Array] {
    // For the patient's own credential
    if (context.privateState.myCredential) {
      return [context.privateState, context.privateState.myCredential.salt];
    }

    // For sponsors issuing a new credential — generate a fresh salt
    const salt = new Uint8Array(32);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(salt);
    } else {
      // Node.js fallback
      const { randomBytes } = require("crypto");
      randomBytes(32).copy(salt);
    }

    return [context.privateState, salt];
  },

  /**
   * Returns the sponsor's signing secret key (as a Field/bigint).
   * Only the sponsor role has this set in private state.
   *
   * @param context - WitnessContext
   * @returns [updatedPrivateState, signingSecret]
   */
  getSponsorSigningKey(
    context: WitnessContext<any, CredentialPrivateState>,
  ): [CredentialPrivateState, bigint] {
    if (!context.privateState.sponsorSigningSecret) {
      throw new Error(
        "getSponsorSigningKey: sponsorSigningSecret is not set. " +
        "Only the sponsor role can call circuits requiring the signing key."
      );
    }
    return [context.privateState, context.privateState.sponsorSigningSecret];
  },

  /**
   * Returns the full credential data from the caller's private state.
   * Used during proof generation to reconstruct the commitment.
   * This data NEVER leaves the prover's machine.
   *
   * @param context - WitnessContext
   * @returns [updatedPrivateState, credentialData]
   */
  getCredentialDataFromWitness(
    context: WitnessContext<any, CredentialPrivateState>,
  ): [CredentialPrivateState, ClinicalTrialData] {
    if (!context.privateState.myCredential) {
      throw new Error(
        "getCredentialDataFromWitness: myCredential is not set. " +
        "The patient must have received a credential before generating proofs."
      );
    }
    return [context.privateState, context.privateState.myCredential.data];
  },
};

// ============================================================================
// PRIVATE STATE INITIALIZATION HELPERS
// ============================================================================

/**
 * Generate a fresh 32-byte secret key for a new user.
 * This secret is the root of all identity — it must be backed up securely.
 */
export function generateSecretKey(): Uint8Array {
  const secret = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(secret);
  } else {
    // Node.js fallback
    const { randomBytes } = require("crypto");
    randomBytes(32).copy(secret);
  }
  return secret;
}

/**
 * Generate a random 32-byte salt for credential commitment hiding.
 */
export function generateSalt(): Uint8Array {
  return generateSecretKey(); // Same randomness source
}

/**
 * Create initial private state for a patient.
 */
export function createPatientPrivateState(secretKey: Uint8Array): CredentialPrivateState {
  return { secretKey };
}

/**
 * Create initial private state for a sponsor.
 */
export function createSponsorPrivateState(
  secretKey: Uint8Array,
  sponsorSigningSecret: bigint,
): CredentialPrivateState {
  return {
    secretKey,
    sponsorSigningSecret,
    issuedCredentials: new Map(),
  };
}

/**
 * Store a received credential in the patient's private state.
 * Called after the sponsor issues a credential to this patient.
 */
export function storeCredential(
  state: CredentialPrivateState,
  data: ClinicalTrialData,
  salt: Uint8Array,
): CredentialPrivateState {
  return {
    ...state,
    myCredential: { data, salt },
  };
}

/**
 * Store an issued credential in the sponsor's private state.
 * Called after the sponsor issues a credential to a patient.
 */
export function recordIssuedCredential(
  state: CredentialPrivateState,
  patientPk: Uint8Array,
  data: ClinicalTrialData,
  salt: Uint8Array,
): CredentialPrivateState {
  const issued = new Map(state.issuedCredentials || []);
  issued.set(Buffer.from(patientPk).toString("hex"), { credentialData: data, salt });
  return {
    ...state,
    issuedCredentials: issued,
  };
}

// ============================================================================
// UTILITY: SERIALIZATION (for browser storage or file system)
// ============================================================================

/**
 * Serialize private state to a JSON-safe string.
 * Use with encrypted storage (e.g., AES-256-GCM) before persisting.
 */
export function serializePrivateState(state: CredentialPrivateState): string {
  return JSON.stringify({
    secretKey: Buffer.from(state.secretKey).toString("base64"),
    sponsorSigningSecret: state.sponsorSigningSecret?.toString(),
    myCredential: state.myCredential
      ? {
          data: {
            participantPk: Buffer.from(state.myCredential.data.participantPk).toString("base64"),
            trialId: Buffer.from(state.myCredential.data.trialId).toString("base64"),
            sponsorPk: Buffer.from(state.myCredential.data.sponsorPk).toString("base64"),
            completionStatus: state.myCredential.data.completionStatus,
            issueDate: state.myCredential.data.issueDate.toString(),
          },
          salt: Buffer.from(state.myCredential.salt).toString("base64"),
        }
      : undefined,
  });
}

/**
 * Deserialize private state from a JSON string.
 */
export function deserializePrivateState(json: string): CredentialPrivateState {
  const parsed = JSON.parse(json);
  return {
    secretKey: new Uint8Array(Buffer.from(parsed.secretKey, "base64")),
    sponsorSigningSecret: parsed.sponsorSigningSecret ? BigInt(parsed.sponsorSigningSecret) : undefined,
    myCredential: parsed.myCredential
      ? {
          data: {
            participantPk: new Uint8Array(Buffer.from(parsed.myCredential.data.participantPk, "base64")),
            trialId: new Uint8Array(Buffer.from(parsed.myCredential.data.trialId, "base64")),
            sponsorPk: new Uint8Array(Buffer.from(parsed.myCredential.data.sponsorPk, "base64")),
            completionStatus: parsed.myCredential.data.completionStatus,
            issueDate: BigInt(parsed.myCredential.data.issueDate),
          },
          salt: new Uint8Array(Buffer.from(parsed.myCredential.salt, "base64")),
        }
      : undefined,
  };
}

// ============================================================================
// DERIVATION HELPERS (mirror Compact pure circuits for off-chain use)
// ============================================================================

// Note: These are JavaScript approximations of the Compact `persistentHash`
// and `persistentCommit` functions. For exact off-chain derivation, use the
// Compact CLI-generated pureCircuits or the `@midnight-ntwrk/compact-runtime`
// library's hash utilities.

/**
 * Derive patient public key from secret (JavaScript approximation).
 * Matches `derivePatientPublicKey` in the Compact contract.
 */
export async function derivePatientPublicKeyJS(secret: Uint8Array): Promise<Uint8Array> {
  // Domain separator: "zkpart:patient:pk:v1" padded to 32 bytes
  const domain = new TextEncoder().encode("zkpart:patient:pk:v1");
  const paddedDomain = new Uint8Array(32);
  paddedDomain.set(domain);

  const input = new Uint8Array(64);
  input.set(paddedDomain);
  input.set(secret, 32);

  // Use Web Crypto API for SHA-256 (closest to persistentHash behavior)
  const hash = await crypto.subtle.digest("SHA-256", input);
  return new Uint8Array(hash);
}

/**
 * Derive sponsor public key from secret (JavaScript approximation).
 * Matches `deriveSponsorPublicKey` in the Compact contract.
 */
export async function deriveSponsorPublicKeyJS(secret: Uint8Array): Promise<Uint8Array> {
  const domain = new TextEncoder().encode("zkpart:sponsor:pk:v1");
  const paddedDomain = new Uint8Array(32);
  paddedDomain.set(domain);

  const input = new Uint8Array(64);
  input.set(paddedDomain);
  input.set(secret, 32);

  const hash = await crypto.subtle.digest("SHA-256", input);
  return new Uint8Array(hash);
}
