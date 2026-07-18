import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  credentialData_0: Uint8Array,
                  secret_0: Uint8Array,
                  issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   credentialData_0: Uint8Array,
                   secret_0: Uint8Array,
                   issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyProof(context: __compactRuntime.CircuitContext<PS>,
              credentialData_0: Uint8Array,
              secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  credentialData_0: Uint8Array,
                  secret_0: Uint8Array,
                  issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   credentialData_0: Uint8Array,
                   secret_0: Uint8Array,
                   issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyProof(context: __compactRuntime.CircuitContext<PS>,
              credentialData_0: Uint8Array,
              secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  registerIssuer(context: __compactRuntime.CircuitContext<PS>,
                 issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  credentialData_0: Uint8Array,
                  secret_0: Uint8Array,
                  issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   credentialData_0: Uint8Array,
                   secret_0: Uint8Array,
                   issuerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  verifyProof(context: __compactRuntime.CircuitContext<PS>,
              credentialData_0: Uint8Array,
              secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  issuers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  credentialCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  revokedCredentials: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
