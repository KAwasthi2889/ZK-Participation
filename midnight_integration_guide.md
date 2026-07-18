# Midnight SDK Integration Guide

As the integration lead (Person 3), your job is to bridge the React frontend with the Midnight smart contract. You don't need the final contract to start preparing the integration layer.

## 1. Required Packages
When the frontend is ready, you will need to install the Midnight SDK packages. *(Note: Exact package names depend on the current Midnight testnet release, but they typically revolve around the DApp connector and Midnight JS)*.

## 2. Connecting the Wallet
Before any contract interaction, the user (Sponsor, Patient, or Verifier) must connect their Midnight-compatible wallet (like the Lace wallet with Midnight features enabled).

```javascript
// Conceptual Example: Connecting the Wallet
export async function connectWallet() {
  // The wallet injects an API into the browser window
  if (typeof window !== 'undefined' && window.midnight) {
    try {
      // Prompt the user to connect
      const walletApi = await window.midnight.enable();
      console.log("Wallet connected!");
      return walletApi;
    } catch (error) {
      console.error("User rejected the request or error occurred", error);
    }
  } else {
    console.error("Midnight wallet not found. Please install a compatible wallet.");
  }
}
```

## 3. Creating a React Context
To make things easy for Person 1 (Frontend), you should build a React Context (e.g., `MidnightContext`) that handles the wallet connection state. This way, Person 1 can simply use a hook like `const { connect, walletApi, isConnected } = useMidnight();` in their buttons.

## 4. Contract Interactions
Once Person 2 (Blockchain) compiles and deploys the smart contract, they must provide you with two things:
1. The **Deployed Contract Address**.
2. The **Compiled TypeScript interface** of the contract (Midnight tools compile the smart contract into Typescript functions).

You will import the compiled contract and use the `walletApi` to invoke the functions.

### A. Issue Credential (Sponsor)
```javascript
async function handleIssueCredential(walletApi, participantAddress) {
  // 1. Initialize the contract interface at the deployed address
  const contract = await MidnightContract.at(CONTRACT_ADDRESS, walletApi);
  
  // 2. Call the issue function (prompts the Sponsor's wallet to sign the transaction)
  const tx = await contract.issueCredential({
     participant: participantAddress,
     trialId: "TRIAL-123"
  });
  
  await tx.wait();
  console.log("Credential issued securely in confidential state!");
}
```

### B. Generate Proof (Patient)
```javascript
async function handleGenerateProof(walletApi) {
  const contract = await MidnightContract.at(CONTRACT_ADDRESS, walletApi);
  
  // This operation happens locally in the wallet/browser environment. 
  // It generates a ZK proof that the patient owns the credential without revealing the credential itself.
  const proof = await contract.generateProof();
  return proof;
}
```

### C. Verify Proof (Verifier)
```javascript
async function handleVerifyProof(walletApi, proof) {
  const contract = await MidnightContract.at(CONTRACT_ADDRESS, walletApi);
  
  // The verifier submits the generated proof to the network to check its mathematical validity
  const isValid = await contract.verifyProof(proof);
  return isValid; // returns true or false
}
```

## Your Immediate Next Steps:
1. **Set up the Wallet Provider:** Create a basic `WalletProvider.tsx` wrapper for the React app that implements the `connectWallet` function. 
2. **Define Dummy Functions:** Create a file called `midnightApi.ts`. Put the dummy functions (like the ones above) inside it. Person 1 can import these dummy functions and hook them up to their UI buttons right now. 
3. **Swap in the Real Contract:** When Person 2 finishes the actual contract, you just swap out the dummy logic inside `midnightApi.ts` with the real SDK calls. Person 1's frontend code won't need to change at all!
