import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ShieldCheck, Shield, History, Settings, CheckCircle2, XCircle, Search, Filter, Upload, Key, Fingerprint, CheckCircle, ArrowRight, Lock, ChevronDown, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { AuthUser, NavItem, VerificationRecord, StepState, VerifyResult } from '../../types';
import { PRIMARY, CYAN, SUCCESS, DANGER, MOCK_VERIFICATIONS } from '../../constants';
import { Card, StatCard, PrimaryBtn, GhostBtn, StatusBadge, SettingsPanel } from '../../components/ui/Primitives';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { verifyProof, delay } from '../../services/blockchain';
import { toast } from 'sonner';
import { motion } from 'motion/react';

// VERIFIER DASHBOARD
// 3-panel: Input | Animated Stepper | Result
// ─────────────────────────────────────────────────────────────

const VERIFY_STEPS = [
  { label: "Receiving Proof",             icon: Upload    },
  { label: "Checking Signature",          icon: Fingerprint},
  { label: "Validating ZK Proof",         icon: Key       },
  { label: "Checking Revocation Registry",icon: Shield    },
  { label: "Verification Complete",       icon: ShieldCheck},
];

export const VerifierDashboard = ({ user }: { user: AuthUser }) => {
  const [tab, setTab]                   = useState("dashboard");
  const [proofInput, setProofInput]     = useState("");
  const [verifying, setVerifying]       = useState(false);
  const [stepStates, setStepStates] = useState<StepState[]>(Array(5).fill("idle"));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setProofInput(ev.target.result as string);
        setResult(null);
        setStepStates(Array(5).fill("idle"));
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if cleared
    e.target.value = '';
  };
  const [result, setResult]             = useState<VerifyResult>(null);

  // History table
  const [histSearch, setHistSearch]     = useState("");
  const [histFilter, setHistFilter]     = useState("all");
  const [histPage, setHistPage]         = useState(1);
  const PAGE_SIZE = 5;

  const [verifications, setVerifications] = useState<VerificationRecord[]>(MOCK_VERIFICATIONS);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard",           icon: LayoutDashboard },
    { id: "verify",    label: "Verify Proof",        icon: ShieldCheck     },
    { id: "history",   label: "Verification History",icon: History         },
    { id: "settings",  label: "Settings",             icon: Settings        },
  ];

  /**
   * handleVerify()
   * Runs 5 sequential verification steps with visual animation,
   * then calls the Midnight verification contract.
   */
  const handleVerify = async () => {
    if (!proofInput.trim()) { toast.error("Paste a proof to verify"); return; }
    setVerifying(true); setResult(null);
    setStepStates(Array(5).fill("idle"));

    // Animate each step sequentially
    for (let i = 0; i < VERIFY_STEPS.length; i++) {
      setStepStates((p) => p.map((s, idx) => idx === i ? "active" : s));
      await delay(550);
      setStepStates((p) => p.map((s, idx) => idx === i ? "done" : s));
      await delay(80);
    }

    const outcome = await verifyProof(proofInput);
    setResult(outcome);

    if (outcome === "valid") {
      toast.success("Proof verified — valid participant");
      const rec: VerificationRecord = {
        id: `VR-${String(verifications.length + 1).padStart(3, "0")}`,
        proofId: `ZKP-${Math.random().toString(36).slice(2, 10)}...`,
        timestamp: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        purpose: "Manual Verification",
        result: "valid",
        disclosed: "Participation only",
      };
      setVerifications((p) => [rec, ...p]);
    } else {
      toast.error("Proof is invalid");
    }
    setVerifying(false);
  };

  const clearVerify = () => { setProofInput(""); setResult(null); setStepStates(Array(5).fill("idle")); };

  // Filtered history
  const filtered = verifications.filter((v) => {
    const q = histSearch.toLowerCase();
    const mQ = !q || v.proofId.includes(q) || v.purpose.toLowerCase().includes(q);
    const mF = histFilter === "all" || v.result === histFilter;
    return mQ && mF;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((histPage - 1) * PAGE_SIZE, histPage * PAGE_SIZE);

  const verifiedCount = verifications.filter((v) => v.result === "valid").length;

  return (
    <DashboardLayout user={user} navItems={navItems} activeTab={tab} onTabChange={setTab}>
      {/* Dashboard overview */}
      {tab === "dashboard" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Verified"    value={verifications.length} icon={Activity}    color={PRIMARY} />
            <StatCard label="Valid Proofs"       value={verifiedCount}        icon={ShieldCheck} color={SUCCESS} />
            <StatCard label="Invalid / Rejected" value={verifications.length - verifiedCount} icon={XCircle} color={DANGER} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Recent Verifications</h3>
              <div className="space-y-2.5">
                {verifications.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <StatusBadge status={v.result} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{v.purpose}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{v.proofId}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{v.timestamp.split(",")[0]}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Privacy Guarantee</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">As a verifier you learn only: this person participated in an approved clinical trial. No personal data is disclosed.</p>
              {[
                { label: "Identity",          hidden: true },
                { label: "Medical Condition", hidden: true },
                { label: "Hospital",          hidden: true },
                { label: "Trial Details",     hidden: true },
                { label: "Participation",     hidden: false },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  {row.hidden ? <span className="font-semibold" style={{ color: DANGER }}>Hidden</span>
                              : <span className="font-semibold flex items-center gap-1" style={{ color: SUCCESS }}><CheckCircle size={11} /> Revealed</span>}
                </div>
              ))}
              <PrimaryBtn onClick={() => setTab("verify")} className="w-full justify-center py-2.5 mt-4 text-xs">
                Verify a Proof <ArrowRight size={13} />
              </PrimaryBtn>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Verify Proof — 3-panel layout */}
      {tab === "verify" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Panel 1 — Input */}
            <Card className="p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-sm mb-0.5" style={{ fontFamily: "Manrope, sans-serif" }}>Submit Proof</h3>
                <p className="text-xs text-muted-foreground">Paste a patient's ZK proof to verify on Midnight.</p>
              </div>
              {/* Upload option */}
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-secondary transition-all text-xs text-muted-foreground">
                <Upload size={13} /> Upload proof file (.json)
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
              </div>
              <textarea value={proofInput} onChange={(e) => { setProofInput(e.target.value); setResult(null); setStepStates(Array(5).fill("idle")); }}
                placeholder={`Paste proof JSON here...\n\n{\n  "proof": "zkp_v1_0x...",\n  "verified_claims": [...]\n}`}
                rows={9} className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all resize-none"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              <div className="flex gap-2">
                <PrimaryBtn onClick={handleVerify} loading={verifying} disabled={!proofInput.trim()} className="flex-1 justify-center py-2.5 text-sm">
                  Verify Proof
                </PrimaryBtn>
                {(result !== null || proofInput) && (
                  <button onClick={clearVerify} className="px-3 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-xs text-muted-foreground">
                    Clear
                  </button>
                )}
              </div>
            </Card>

            {/* Panel 2 — Stepper */}
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>Verification Process</h3>
              <div className="relative">
                <div className="absolute left-3.5 top-4 bottom-4 w-px" style={{ background: "rgba(59,91,255,0.2)" }} />
                <div className="space-y-4">
                  {VERIFY_STEPS.map((s, i) => {
                    const st = stepStates[i];
                    const color = st === "done" ? SUCCESS : st === "active" ? PRIMARY : "#2a3a6a";
                    return (
                      <div key={s.label} className="relative flex items-center gap-4 pl-8">
                        <div className="absolute left-0 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                          style={{ background: `${color}20`, border: `2px solid ${color}` }}>
                          {st === "done" ? <CheckCircle2 size={13} style={{ color }} /> :
                           st === "active" ? <svg className="animate-spin h-3 w-3" style={{ color }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                           : <s.icon size={12} style={{ color }} />}
                        </div>
                        <p className="text-sm transition-colors duration-300" style={{ color: st === "idle" ? "#3a4a6e" : st === "active" ? "#e2eaf8" : SUCCESS }}>
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {!verifying && stepStates.every((s) => s === "idle") && (
                <p className="text-xs text-muted-foreground mt-5 text-center">Submit a proof to begin verification.</p>
              )}
            </Card>

            {/* Panel 3 — Result */}
            <Card className="p-5 flex flex-col">
              <h3 className="font-bold text-sm mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>Verification Result</h3>
              {result === null && !verifying && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(59,91,255,0.1)", border: "1px solid rgba(59,91,255,0.2)" }}>
                    <ShieldCheck size={28} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Result will appear here after verification.</p>
                </div>
              )}
              {verifying && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-3">
                  <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24" style={{ color: PRIMARY }}>
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Verifying on Midnight...</p>
                </div>
              )}
              {result === "valid" && !verifying && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col gap-4">
                  <div className="flex flex-col items-center py-5 gap-3 rounded-xl border" style={{ background: `${SUCCESS}08`, borderColor: `${SUCCESS}22` }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${SUCCESS}15`, boxShadow: `0 0 32px ${SUCCESS}25`, border: `1px solid ${SUCCESS}30` }}>
                      <ShieldCheck size={28} style={{ color: SUCCESS }} />
                    </div>
                    <p className="text-base font-extrabold text-center" style={{ fontFamily: "Manrope, sans-serif", color: SUCCESS }}>Valid Clinical Trial Participant</p>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Trial Participation Verified", ok: true },
                      { label: "Credential Active",            ok: true },
                      { label: "Signature Valid",              ok: true },
                      { label: "Privacy Preserved",            ok: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2 text-xs">
                        <CheckCircle size={12} style={{ color: SUCCESS }} />
                        <span style={{ color: SUCCESS }}>{row.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Not Disclosed</p>
                    {["Patient Identity","Medical Condition","Hospital","Trial Details"].map((lbl) => (
                      <div key={lbl} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock size={10} /><span>{lbl}: <span className="font-semibold">Hidden</span></span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {result === "invalid" && !verifying && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-col items-center py-8 gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${DANGER}10`, boxShadow: `0 0 24px ${DANGER}15`, border: `1px solid ${DANGER}25` }}>
                    <XCircle size={28} style={{ color: DANGER }} />
                  </div>
                  <p className="text-base font-extrabold" style={{ fontFamily: "Manrope, sans-serif", color: DANGER }}>Invalid Proof</p>
                  <p className="text-xs text-muted-foreground text-center">This proof could not be verified. It may be malformed, expired, or from a revoked credential.</p>
                </motion.div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {/* Verification history */}
      {tab === "history" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={histSearch} onChange={(e) => { setHistSearch(e.target.value); setHistPage(1); }} placeholder="Search by proof ID or purpose..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-input-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <div className="relative">
              <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select value={histFilter} onChange={(e) => { setHistFilter(e.target.value); setHistPage(1); }}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none transition-all">
                <option value="all">All Results</option>
                <option value="valid">Valid</option>
                <option value="invalid">Invalid</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <tr>
                    {["Timestamp","Proof ID","Purpose","Result","Disclosed","Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No verifications found.</td></tr>
                  )}
                  {pageRows.map((v) => (
                    <tr key={v.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{v.timestamp}</td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{v.proofId}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{v.purpose}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={v.result} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{v.disclosed}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={v.result} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{filtered.length} verification{filtered.length !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setHistPage((p) => Math.max(1, p - 1))} disabled={histPage === 1}
                  className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
                  <ChevronLeft size={13} />
                </button>
                <span className="text-xs text-muted-foreground">{histPage} / {totalPages}</span>
                <button onClick={() => setHistPage((p) => Math.min(totalPages, p + 1))} disabled={histPage === totalPages}
                  className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {tab === "settings" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><SettingsPanel /></motion.div>}
    </DashboardLayout>
  );
};
