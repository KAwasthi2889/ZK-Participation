# Full-Stack Integration & Deployment (Person 3)

## Your Mission
You're the systems engineer responsible for making the project work as one cohesive application.

### Architecture
Design how the frontend communicates with the Midnight contract.
Document the flow:
- Sponsor -> Issue Credential -> Midnight Contract -> Confidential Credential Stored
- Patient -> Generate Proof -> Midnight Contract -> Zero-Knowledge Proof
- Verifier -> Verify Proof -> Proof Valid / Invalid

### Integration
Work closely with both teammates to connect the UI to the contract.
As soon as one contract function is ready, integrate it immediately rather than waiting for the entire contract to be finished.

### Deployment
Own everything related to making the demo accessible:
- Repository setup
- Environment configuration
- Hosting
- Build pipeline
- Deployment
- Demo stability

### Documentation
Prepare:
- README
- Architecture diagram
- Demo script
- Setup instructions

### Testing
Verify that the complete flow works:
1. Sponsor issues a credential.
2. Patient generates a proof.
3. Verifier successfully validates the proof.

## 30-Hour Timeline
- **Phase 1: Setup & Architecture (Hours 0 - 5)**: Set up Git repository, configure CI/CD pipelines, research Midnight SDK frontend integration patterns.
- **Phase 2: Core Development (Hours 5 - 15)**: Start integrating the frontend with the smart contract using the Midnight SDK. Assist frontend teammate with state management.
- **Phase 3: Integration & Testnet (Hours 15 - 22)**: Complete end-to-end integration (Frontend -> Midnight SDK -> Testnet Contract). Ensure the full flow works seamlessly.
- **Phase 4: Polish & Deployment (Hours 22 - 27)**: Deploy the static frontend to hosting (e.g., Vercel, Netlify), ensure the live site connects to the testnet successfully.
- **Phase 5: Demo Prep & Buffer (Hours 27 - 30)**: End-to-end walkthrough, record demo video, write submission materials, buffer for unexpected bugs.
