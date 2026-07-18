#!/usr/bin/env node
/**
 * Issue a demo credential to a patient on the Midnight devnet.
 *
 * Usage:
 *   node scripts/issue-demo-credential.js \
 *     --contract <CONTRACT_ADDRESS> \
 *     --patient <PATIENT_ADDRESS> \
 *     --trial "NCT-2024-0041" \
 *     --status completed \
 *     --date 1750000000
 */

import { readFileSync } from "fs";

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const contractAddress = getArg("--contract");
const patientAddress = getArg("--patient");
const trialId = getArg("--trial") || "NCT-2024-0041";
const completionStatus = getArg("--status") === "completed";
const issueDate = BigInt(getArg("--date") || Math.floor(Date.now() / 1000));

if (!contractAddress || !patientAddress) {
  console.error("Usage: node issue-demo-credential.js --contract <addr> --patient <addr> [--trial <id>] [--status completed|enrolled] [--date <timestamp>]");
  process.exit(1);
}

console.log("ZK-Participation Demo Credential Issuance");
console.log("==========================================");
console.log(`Contract:     ${contractAddress}`);
console.log(`Patient:      ${patientAddress}`);
console.log(`Trial ID:     ${trialId}`);
console.log(`Status:       ${completionStatus ? "completed" : "enrolled"}`);
console.log(`Issue Date:   ${issueDate} (${new Date(Number(issueDate) * 1000).toISOString()})`);
console.log("");

// TODO: Load compiled contract SDK and call issueCredential
// const { Contract } = await import("../managed/ClinicalTrialCredential/contract/index.js");
// const contract = new Contract(contractAddress, ...);
// const tx = await contract.issueCredential(patientPk, trialIdBytes, completionStatus, issueDate);
// console.log(`✅ Credential issued. Tx hash: ${tx.hash}`);

console.log("ℹ️  This is a template script. After running `npm run compile`, uncomment");
console.log("   the contract SDK import above to execute a real issuance transaction.");
console.log("");
console.log("Next steps:");
console.log("  1. npm run compile");
console.log("  2. Ensure devnet is running (docker compose up -d midnight-devnet)");
console.log("  3. Update this script with wallet + provider configuration");
console.log("  4. node scripts/issue-demo-credential.js --contract <addr> --patient <addr>");
