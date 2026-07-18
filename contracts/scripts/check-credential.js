#!/usr/bin/env node
/**
 * Check if a patient has an active credential on the Midnight devnet.
 *
 * Usage:
 *   node scripts/check-credential.js \
 *     --contract <CONTRACT_ADDRESS> \
 *     --patient <PATIENT_ADDRESS>
 */

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const contractAddress = getArg("--contract");
const patientAddress = getArg("--patient");

if (!contractAddress || !patientAddress) {
  console.error("Usage: node check-credential.js --contract <addr> --patient <addr>");
  process.exit(1);
}

console.log("ZK-Participation Credential Check");
console.log("=================================");
console.log(`Contract:     ${contractAddress}`);
console.log(`Patient:      ${patientAddress}`);
console.log("");

// TODO: Load compiled contract SDK and call hasActiveCredential / getCredentialHash
// const { Contract } = await import("../managed/ClinicalTrialCredential/contract/index.js");
// const contract = new Contract(contractAddress, ...);
// const hasCredential = await contract.hasActiveCredential(patientPk);
// const hash = await contract.getCredentialHash(patientPk);
// console.log(`Active:       ${hasCredential ? "✅ Yes" : "❌ No"}`);
// console.log(`Commitment:   ${hash}`);

console.log("ℹ️  This is a template script. After running `npm run compile`, uncomment");
console.log("   the contract SDK import above to execute real queries.");
console.log("");
console.log("Next steps:");
console.log("  1. npm run compile");
console.log("  2. node scripts/check-credential.js --contract <addr> --patient <addr>");
