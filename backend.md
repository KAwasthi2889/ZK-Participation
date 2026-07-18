# Blockchain Developer (Person 2)

## Your Mission
Build the confidential smart contract that powers the entire application.

The contract should manage confidential clinical trial credentials.
It should support four operations:
- `issueCredential()`
- `generateProof()`
- `verifyProof()`
- `revokeCredential()`

The contract must ensure:
- Patient identity stays confidential.
- Trial information stays confidential.
- Only authorized issuers can issue credentials.
- Patients can prove they have a valid credential without revealing its contents.
- Revoked credentials no longer produce valid proofs.

You should become familiar with:
- Midnight smart contracts
- Confidential state
- Wallet interactions
- Proof generation and verification
- Contract deployment

## 30-Hour Timeline
- **Phase 1: Setup & Architecture (Hours 0 - 5)**: Set up Midnight local development environment, define the credential data structure, scaffold the smart contract.
- **Phase 2: Core Development (Hours 5 - 15)**: Write smart contract logic for issuing credentials and validating ZK proofs. Write local tests for the contract.
- **Phase 3: Integration & Testnet (Hours 15 - 22)**: Deploy the smart contract to the Midnight Testnet. Troubleshoot any on-chain issues.
- **Phase 4: Polish & Deployment (Hours 22 - 27)**: Assist with edge cases in proof generation and handling on-chain failures.
- **Phase 5: Demo Prep & Buffer (Hours 27 - 30)**: End-to-end walkthrough, record demo video, buffer for unexpected bugs.
