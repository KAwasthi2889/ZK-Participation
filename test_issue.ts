import { issueCredential } from './contracts/src/cipher-bridge';
import { connectWallet } from './contracts/src/cipher-bridge';

// Setup node localStorage mock
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
} as any;
const store = new Map();
global.localStorage.getItem = (k) => store.get(k) || null;
global.localStorage.setItem = (k, v) => store.set(k, v);
global.crypto = require('crypto').webcrypto as any;

async function run() {
  await connectWallet("sponsor");
  const ptAddr = await connectWallet("patient");
  console.log("Patient address:", ptAddr);
  try {
    await issueCredential(ptAddr, "TEST-TRIAL", "Phase 1");
    console.log("Success");
  } catch (e) {
    console.error("Error issuing:", e);
  }
}
run();
