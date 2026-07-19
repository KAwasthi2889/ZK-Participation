import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, Key, Activity, Settings, Copy, CheckCircle2, FileText, ShieldCheck, Download, ScanLine, Wallet, ArrowRight, ChevronLeft, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { AuthUser, NavItem, CredentialRecord } from '../../types';
import { PRIMARY, CYAN, SUCCESS, DANGER } from '../../constants';
import { Card, StatCard, PrimaryBtn, GhostBtn, StatusBadge, SelectField, SettingsPanel } from '../../components/ui/Primitives';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { connectWallet, generateProof } from '../../services/blockchain';
import { toast } from 'sonner';
import { motion } from 'motion/react';

// PATIENT DASHBOARD
// ─────────────────────────────────────────────────────────────

const PROOF_PURPOSES = [
  { id: "insurance", label: "Insurance Claim", desc: "Submit proof for insurance eligibility or reimbursement" },
  { id: "research",  label: "Research Enrollment", desc: "Enroll in a follow-up research programme" },
  { id: "benefits",  label: "Benefits Eligibility", desc: "Qualify for trial participant benefits" },
  { id: "academic",  label: "Academic Participation", desc: "Academic study or publication verification" },
];

export const PatientDashboard = ({ user }: { user: AuthUser }) => {
  const [tab, setTab]             = useState("dashboard");
  const [wallet, setWallet]       = useState("");
  const [connecting, setConnecting] = useState(false);

  // 4-step proof flow
  const [proofStep, setProofStep]     = useState(0);
  const [selectedCred, setSelectedCred] = useState<CredentialRecord | null>(null);
  const [purpose, setPurpose]         = useState("");
  const [generating, setGenerating]   = useState(false);
  const [proof, setProof]             = useState("");

  const [patientCreds, setPatientCreds] = useState<CredentialRecord[]>([]);

  useEffect(() => {
    try {
      const state = localStorage.getItem("cipher_midnight_state");
      if (state) {
        const parsed = JSON.parse(state);
        if (parsed.hasCredential && parsed.trialId) {
          const type = parsed.completionStatus ? "Completion" : "Enrollment";
          const dateStr = new Date(parsed.issueDate * 1000).toISOString().split("T")[0];
          const newCred: CredentialRecord = {
            id: `CR-00${patientCreds.length + 1}`,
            patient: "mn1_" + parsed.participantPk.slice(0, 8) + "...xxxx",
            trial: parsed.trialId,
            type: type,
            status: "active",
            issuedAt: dateStr,
            expiry: new Date(parsed.issueDate * 1000 + 365 * 86400000).toISOString().split("T")[0],
          };
          
          // Only add if not already added to prevent infinite loop/duplicates
          setPatientCreds(prev => {
            if (!prev.find(c => c.trial === parsed.trialId && c.issuedAt === dateStr)) {
              return [newCred, ...prev];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }, []);

  const activity: any[] = [];

  const navItems: NavItem[] = [
    { id: "dashboard",  label: "Dashboard",      icon: LayoutDashboard },
    { id: "credentials",label: "My Credentials", icon: Shield          },
    { id: "proof",      label: "Generate Proof", icon: Key             },
    { id: "activity",   label: "Activity",        icon: Activity        },
    { id: "settings",   label: "Settings",        icon: Settings        },
  ];

  const handleConnect = async () => {
    setConnecting(true);
    const id = toast.loading("Connecting wallet...");
    try { const a = await connectWallet(user.role); setWallet(a); toast.success("Wallet connected!", { id }); }
    catch { toast.error("Connection failed", { id }); }
    finally { setConnecting(false); }
  };

  /** Generate Zero-Knowledge Proof from selected credential */
  const handleGenerate = async () => {
    setGenerating(true);
    const id = toast.loading("Computing zero-knowledge proof...");
    try { const p = await generateProof(); setProof(p); setProofStep(3); toast.success("Proof generated!", { id }); }
    catch { toast.error("Failed to generate proof", { id }); }
    finally { setGenerating(false); }
  };

  const copyProof = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = proof;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy — please select and copy manually");
    }
  };
  const downloadProof = () => {
    const blob = new Blob([proof], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `cipher-proof-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    toast.success("Proof downloaded");
  };

  const stepLabels = ["Select Credential", "Choose Purpose", "Generate Proof", "Download & Share"];

  return (
    <DashboardLayout user={user} navItems={navItems} activeTab={tab} onTabChange={setTab}>
      {/* Wallet bar */}
      {!wallet ? (
        <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/40">
          <div className="flex items-center gap-3 min-w-0"><Wallet size={15} className="text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground truncate">Connect wallet to view credentials and generate proofs.</p>
          </div>
          <PrimaryBtn onClick={handleConnect} loading={connecting} className="shrink-0 py-2">Connect Wallet</PrimaryBtn>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 p-3.5 rounded-xl border border-border bg-secondary/40">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SUCCESS }} />
          <code className="text-xs font-mono text-foreground">{wallet}</code>
        </div>
      )}

      {/* Dashboard overview */}
      {tab === "dashboard" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Active Credentials" value={patientCreds.filter((c) => c.status === "active").length} icon={Shield}    color={SUCCESS} />
            <StatCard label="Proofs Generated"   value={3}                                                        icon={Key}        color={PRIMARY} />
            <StatCard label="Verifications"      value={3}                                                        icon={ShieldCheck} color={CYAN}   />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Your Credentials</h3>
              {patientCreds.map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}25` }}>
                    <Shield size={13} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{c.trial} · {c.type}</p>
                    <p className="text-[11px] text-muted-foreground">Issued {c.issuedAt}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Recent Activity</h3>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px border-l border-dashed border-border" />
                <div className="space-y-4">
                  {activity.map((a, i) => (
                    <div key={i} className="relative flex items-center gap-3 pl-8">
                      <div className="absolute left-0 w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>
                        <a.icon size={12} style={{ color: a.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{a.label}</p>
                        <p className="text-[11px] text-muted-foreground">{a.sub} · {a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          <PrimaryBtn onClick={() => setTab("proof")} className="justify-center py-3 max-w-xs">
            Generate Proof <ArrowRight size={15} />
          </PrimaryBtn>
        </motion.div>
      )}

      {/* My Credentials */}
      {tab === "credentials" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {patientCreds.map((c) => (
              <Card key={c.id} className="p-5" glow={c.status === "active"}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}25` }}>
                      <Shield size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{c.type}</p>
                      <p className="text-[11px] text-muted-foreground">{c.id}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    { label: "Trial",         value: c.trial },
                    { label: "Issued",        value: c.issuedAt },
                    { label: "Expires",       value: c.expiry },
                    { label: "Sponsor",       value: "Meridian Research" },
                    { label: "Privacy Level", value: "Zero-Knowledge" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-medium ${row.label === "Privacy Level" ? "text-[#4FCBFF]" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {c.status === "active" && (
                  <PrimaryBtn onClick={() => { setSelectedCred(c); setTab("proof"); setProofStep(0); }} className="w-full justify-center py-2.5 text-xs">
                    Generate Proof
                  </PrimaryBtn>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Generate Proof — 4-step flow */}
      {tab === "proof" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
            {stepLabels.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{ background: i < proofStep ? SUCCESS : i === proofStep ? PRIMARY : "rgba(255,255,255,0.08)", color: i <= proofStep ? "#fff" : "#5e6e9e", border: i === proofStep ? `2px solid ${PRIMARY}` : "none" }}>
                    {i < proofStep ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: i === proofStep ? "#e2eaf8" : i < proofStep ? SUCCESS : "#5e6e9e" }}>{s}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="flex-1 h-px mx-2 transition-colors" style={{ background: i < proofStep ? SUCCESS : "rgba(255,255,255,0.08)", minWidth: 24 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Select Credential */}
          {proofStep === 0 && (
            <Card className="p-6" glow>
              <h2 className="text-base font-bold mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Select Credential</h2>
              <p className="text-xs text-muted-foreground mb-5">Choose which credential to generate a proof from.</p>
              <div className="space-y-3">
                {patientCreds.filter((c) => c.status === "active").map((c) => (
                  <button key={c.id} onClick={() => setSelectedCred(c)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selectedCred?.id === c.id ? "border-primary bg-primary/8" : "border-border hover:border-primary/40 hover:bg-secondary"}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}25` }}>
                      <Shield size={15} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{c.type} · {c.trial}</p>
                      <p className="text-xs text-muted-foreground">Issued {c.issuedAt} · Expires {c.expiry}</p>
                    </div>
                    {selectedCred?.id === c.id && <CheckCircle2 size={16} style={{ color: PRIMARY }} className="shrink-0" />}
                  </button>
                ))}
              </div>
              <PrimaryBtn onClick={() => selectedCred ? setProofStep(1) : toast.error("Select a credential")} disabled={!selectedCred} className="w-full justify-center py-3 mt-5">
                Continue <ArrowRight size={15} />
              </PrimaryBtn>
            </Card>
          )}

          {/* Step 1: Choose Purpose */}
          {proofStep === 1 && (
            <Card className="p-6">
              <h2 className="text-base font-bold mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Choose Proof Purpose</h2>
              <p className="text-xs text-muted-foreground mb-5">The purpose is included in the proof — it does not reveal any medical data.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROOF_PURPOSES.map((p) => (
                  <button key={p.id} onClick={() => setPurpose(p.id)}
                    className={`flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all ${purpose === p.id ? "border-primary bg-primary/8" : "border-border hover:border-primary/40 hover:bg-secondary"}`}>
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm font-semibold">{p.label}</p>
                      {purpose === p.id && <CheckCircle2 size={14} style={{ color: PRIMARY }} />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <GhostBtn onClick={() => setProofStep(0)} className="flex-1 justify-center"><ChevronLeft size={14} /> Back</GhostBtn>
                <PrimaryBtn onClick={() => purpose ? setProofStep(2) : toast.error("Select a purpose")} disabled={!purpose} className="flex-1 justify-center">
                  Continue <ArrowRight size={15} />
                </PrimaryBtn>
              </div>
            </Card>
          )}

          {/* Step 2: Generate */}
          {proofStep === 2 && (
            <Card className="p-6">
              <h2 className="text-base font-bold mb-1" style={{ fontFamily: "Manrope, sans-serif" }}>Generate Zero-Knowledge Proof</h2>
              <p className="text-xs text-muted-foreground mb-5">Your proof will confirm participation — and reveal nothing else.</p>
              <div className="flex gap-4 mb-5 p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Credential</span><span className="font-medium">{selectedCred?.trial} · {selectedCred?.type}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Purpose</span><span className="font-medium">{PROOF_PURPOSES.find((p) => p.id === purpose)?.label}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Identity revealed</span><span className="font-bold" style={{ color: DANGER }}>None</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Medical data revealed</span><span className="font-bold" style={{ color: DANGER }}>None</span></div>
                </div>
              </div>
              {generating && (
                <div className="flex flex-col items-center py-8 gap-5">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 100 100" fill="none" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s" }}>
                      <path d="M 84.6 30 A 40 40 0 1 1 84.6 70" stroke={PRIMARY} strokeWidth="7" fill="none" strokeLinecap="round" />
                    </svg>
                    <svg viewBox="0 0 100 100" fill="none" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }}>
                      <path d="M 74.2 36 A 28 28 0 1 1 74.2 64" stroke="#4A63FF" strokeWidth="6" fill="none" strokeLinecap="round" />
                    </svg>
                    <svg viewBox="0 0 100 100" fill="none" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "1.5s" }}>
                      <path d="M 63.9 42 A 16 16 0 1 1 63.9 58" stroke={CYAN} strokeWidth="5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Computing zero-knowledge witness...</p>
                </div>
              )}
              {!generating && (
                <div className="flex gap-3">
                  <GhostBtn onClick={() => setProofStep(1)} className="flex-1 justify-center"><ChevronLeft size={14} /> Back</GhostBtn>
                  <PrimaryBtn onClick={handleGenerate} disabled={!wallet} className="flex-1 justify-center py-3">
                    Generate Proof
                  </PrimaryBtn>
                </div>
              )}
              {!wallet && <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2"><AlertTriangle size={11} /> Connect wallet to generate proof</p>}
            </Card>
          )}

          {/* Step 3: Share */}
          {proofStep === 3 && proof && (
            <Card className="p-6" glow>
              <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-border" style={{ background: `${SUCCESS}0a`, borderColor: `${SUCCESS}25` }}>
                <CheckCircle size={18} style={{ color: SUCCESS }} className="shrink-0" />
                <div><p className="text-sm font-semibold" style={{ color: SUCCESS }}>Proof generated successfully</p>
                  <p className="text-xs text-muted-foreground">Share this proof with any verifier. No private data is included.</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Zero-Knowledge Proof</p>
                  <div className="flex gap-2">
                    <button onClick={copyProof} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-all">
                      <Copy size={11} /> Copy
                    </button>
                    <button onClick={downloadProof} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-all">
                      <Download size={11} /> Download JSON
                    </button>
                    <button onClick={() => toast.info("QR generation coming in v2")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-all">
                      <ScanLine size={11} /> QR Code
                    </button>
                  </div>
                </div>
                <pre className="w-full overflow-x-auto rounded-xl p-4 text-[11px] leading-relaxed border border-border"
                  style={{ background: "#05091a", fontFamily: "'JetBrains Mono', monospace", color: CYAN, maxHeight: 220, overflowY: "auto" }}>
                  {proof}
                </pre>
              </div>
              <button onClick={() => { setProof(""); setProofStep(0); setSelectedCred(null); setPurpose(""); }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw size={11} /> Generate another proof
              </button>
            </Card>
          )}
        </motion.div>
      )}

      {/* Activity timeline */}
      {tab === "activity" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-lg">
          <Card className="p-6">
            <h2 className="text-base font-bold mb-5" style={{ fontFamily: "Manrope, sans-serif" }}>Recent Activity</h2>
            <div className="relative">
              <div className="absolute left-3.5 top-4 bottom-4 w-px" style={{ background: "rgba(59,91,255,0.2)" }} />
              <div className="space-y-5">
                {[
                  { icon: FileText,    color: PRIMARY,  label: "Credential Issued",   sub: "NCT-2024-0041 · Clinical Trial",    time: "Jul 2, 2025 · 14:10" },
                  { icon: FileText,    color: PRIMARY,  label: "Credential Issued",   sub: "NCT-2024-0042 · Phase III",          time: "Jul 8, 2025 · 09:00" },
                  { icon: Key,         color: CYAN,     label: "Proof Generated",     sub: "Insurance Claim · ZKP-9f3a...4b5c", time: "Jul 10, 2025 · 11:30"},
                  { icon: ShieldCheck, color: SUCCESS,  label: "Proof Verified",      sub: "Prism Analytics",                    time: "Jul 10, 2025 · 11:31"},
                  { icon: Key,         color: CYAN,     label: "Proof Generated",     sub: "Research Enrollment · ZKP-4b2c...", time: "Jul 14, 2025 · 14:00"},
                  { icon: ShieldCheck, color: SUCCESS,  label: "Proof Verified",      sub: "University Research Board",          time: "Jul 14, 2025 · 14:02"},
                ].map((a, i) => (
                  <div key={i} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-0 w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${a.color}18`, border: `1px solid ${a.color}30` }}>
                      <a.icon size={12} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.sub}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {tab === "settings" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><SettingsPanel /></motion.div>}
    </DashboardLayout>
  );
};
