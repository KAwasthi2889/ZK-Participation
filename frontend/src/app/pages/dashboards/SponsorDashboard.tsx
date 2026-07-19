import React, { useState } from 'react';
import { LayoutDashboard, FileText, XCircle, History, Settings, Search, Copy, CheckCircle2, AlertTriangle, Shield, CheckCircle, Wallet, ChevronRight, Lock, Filter, ChevronDown, ChevronLeft, Activity } from 'lucide-react';
import { AuthUser, NavItem, CredentialRecord, CredStatus } from '../../types';
import { PRIMARY, CYAN, SUCCESS, DANGER, MOCK_CREDENTIALS } from '../../constants';
import { Card, StatCard, InputField, SelectField, PrimaryBtn, GhostBtn, StatusBadge, ConfirmModal } from '../../components/ui/Primitives';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { connectWallet, issueCredential, revokeCredential } from '../../services/blockchain';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className={`w-10 h-5 rounded-full relative transition-colors ${on ? 'bg-primary' : 'bg-secondary border border-border'}`}>
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
  </button>
);

// SETTINGS PANEL (shared placeholder)
// ─────────────────────────────────────────────────────────────

const SettingsPanel = () => {
  const [notifs, setNotifs]   = useState({ email: true, proof: true, weekly: false });
  const [privacy, setPrivacy] = useState({ neverStore: true, anon: true });

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="relative w-10 h-5.5 rounded-full transition-colors shrink-0"
      style={{ background: on ? PRIMARY : "rgba(255,255,255,0.12)", height: 22, width: 40 }}>
      <span className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all" style={{ left: on ? 20 : 3 }} />
    </button>
  );

  return (
    <div className="space-y-5 max-w-lg">
      <Card className="p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: "Email notifications", sub: "Receive alerts to your registered email", key: "email" as const },
            { label: "Proof generation alerts", sub: "Notify when a proof is generated or used", key: "proof" as const },
            { label: "Weekly summary", sub: "Weekly digest of credential activity", key: "weekly" as const },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
              <Toggle on={notifs[item.key]} onToggle={() => setNotifs((p) => ({ ...p, [item.key]: !p[item.key] }))} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { label: "Never store proof data", sub: "Proofs are ephemeral and never cached server-side", key: "neverStore" as const },
            { label: "Anonymous analytics only", sub: "No personally identifiable data in telemetry", key: "anon" as const },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
              <Toggle on={privacy[item.key]} onToggle={() => setPrivacy((p) => ({ ...p, [item.key]: !p[item.key] }))} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SPONSOR DASHBOARD
// ─────────────────────────────────────────────────────────────

export const SponsorDashboard = ({ user }: { user: AuthUser }) => {
  const [tab, setTab]                     = useState("dashboard");
  const [wallet, setWallet]               = useState("");
  const [connecting, setConnecting]       = useState(false);

  // Issue state
  const [recipientAddr, setRecipientAddr] = useState("");
  const [trialId, setTrialId]             = useState("");
  const [credType, setCredType]           = useState("Clinical Trial");
  const [expiry, setExpiry]               = useState("");
  const [issuing, setIssuing]             = useState(false);

  // Revoke state
  const [revokeSearch, setRevokeSearch]   = useState("");
  const [revokeStatus, setRevokeStatus]   = useState<CredStatus | "">("");
  const [revokeReason, setRevokeReason]   = useState("");
  const [revoking, setRevoking]           = useState(false);
  const [showRevoke, setShowRevoke]       = useState(false);

  // History table state
  const [histSearch, setHistSearch]       = useState("");
  const [histStatus, setHistStatus]       = useState("all");
  const [histPage, setHistPage]           = useState(1);
  const PAGE_SIZE = 5;

  const [creds, setCreds]                 = useState<CredentialRecord[]>(MOCK_CREDENTIALS);

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard",          icon: LayoutDashboard },
    { id: "issue",     label: "Issue Credential",   icon: FileText         },
    { id: "revoke",    label: "Revoke Credential",  icon: XCircle          },
    { id: "history",   label: "Credential History", icon: History          },
    { id: "settings",  label: "Settings",            icon: Settings         },
  ];

  const handleConnect = async () => {
    setConnecting(true);
    const id = toast.loading("Connecting wallet...");
    try { const a = await connectWallet(); setWallet(a); toast.success("Wallet connected!", { id }); }
    catch { toast.error("Connection failed", { id }); }
    finally { setConnecting(false); }
  };

  /** Issue credential on-chain */
  const handleIssue = async () => {
    if (!recipientAddr.trim()) { toast.error("Enter a participant wallet address"); return; }
    if (!wallet) { toast.error("Connect your wallet first"); return; }
    setIssuing(true);
    const id = toast.loading("Issuing credential on Midnight...");
    try {
      await issueCredential(recipientAddr, trialId, credType);
      const newCred: CredentialRecord = {
        id: `CR-${String(creds.length + 1).padStart(3, "0")}`,
        patient: recipientAddr, trial: trialId || "NCT-UNASSIGNED",
        type: credType, status: "active",
        issuedAt: new Date().toISOString().split("T")[0],
        expiry: expiry || new Date(Date.now() + 365 * 864e5).toISOString().split("T")[0],
      };
      setCreds((p) => [newCred, ...p]);
      toast.success("Credential issued successfully!", { id });
      setRecipientAddr(""); setTrialId(""); setExpiry("");
    } catch { toast.error("Failed to issue credential", { id }); }
    finally { setIssuing(false); }
  };

  /** Revoke credential on-chain */
  const handleRevoke = async () => {
    setShowRevoke(false);
    setRevoking(true);
    const id = toast.loading("Revoking credential on Midnight...");
    try {
      await revokeCredential(revokeSearch);
      setCreds((p) => p.map((c) => c.patient === revokeSearch || c.id === revokeSearch ? { ...c, status: "revoked" as const, revokedAt: new Date().toISOString().split("T")[0] } : c));
      toast.success("Credential revoked.", { id });
      setRevokeSearch(""); setRevokeReason(""); setRevokeStatus("");
    } catch { toast.error("Failed to revoke credential", { id }); }
    finally { setRevoking(false); }
  };

  // Filtered + paginated history
  const filtered = creds.filter((c) => {
    const q = histSearch.toLowerCase();
    const matchQ = !q || c.id.toLowerCase().includes(q) || c.patient.toLowerCase().includes(q) || c.trial.toLowerCase().includes(q);
    const matchS = histStatus === "all" || c.status === histStatus;
    return matchQ && matchS;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((histPage - 1) * PAGE_SIZE, histPage * PAGE_SIZE);

  const stats = [
    { label: "Credentials Issued",  value: creds.length,                                  icon: FileText,    color: PRIMARY },
    { label: "Active",              value: creds.filter((c) => c.status === "active").length,  icon: CheckCircle, color: SUCCESS },
    { label: "Revoked",             value: creds.filter((c) => c.status === "revoked").length, icon: XCircle,     color: DANGER  },
    { label: "Active Trials",       value: [...new Set(creds.filter((c) => c.status === "active").map((c) => c.trial))].length, icon: Activity, color: CYAN },
  ];

  return (
    <DashboardLayout user={user} navItems={navItems} activeTab={tab} onTabChange={setTab}>
      {/* Wallet bar */}
      {!wallet ? (
        <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/40">
          <div className="flex items-center gap-3 min-w-0"><Wallet size={15} className="text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground truncate">Connect your Midnight wallet to issue or revoke credentials.</p>
          </div>
          <PrimaryBtn onClick={handleConnect} loading={connecting} className="shrink-0 py-2">Connect Wallet</PrimaryBtn>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 p-3.5 rounded-xl border border-border bg-secondary/40">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: SUCCESS }} />
          <p className="text-xs text-muted-foreground">Wallet connected</p>
          <code className="text-xs font-mono text-foreground">{wallet}</code>
        </div>
      )}

      {/* Dashboard overview */}
      {tab === "dashboard" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Recent Activity</h3>
              <div className="space-y-3">
                {creds.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.status === "active" ? SUCCESS : DANGER }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.id} · {c.trial}</p>
                      <p className="text-[11px] text-muted-foreground">{c.issuedAt}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Quick Actions</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Issue new credential",  sub: "Add participant to a trial",  action: () => setTab("issue"),   icon: FileText  },
                  { label: "Revoke a credential",   sub: "Invalidate participant access",action: () => setTab("revoke"),  icon: XCircle   },
                  { label: "View credential history",sub: "Browse all issued credentials",action: () => setTab("history"), icon: History   },
                ].map((a) => (
                  <button key={a.label} onClick={a.action}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary transition-all text-left group">
                    <a.icon size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <div className="min-w-0"><p className="text-sm font-medium truncate">{a.label}</p><p className="text-xs text-muted-foreground truncate">{a.sub}</p></div>
                    <ChevronRight size={14} className="text-muted-foreground ml-auto shrink-0" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Issue credential */}
      {tab === "issue" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-lg">
          <Card className="p-6" glow>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}30` }}>
                <FileText size={15} className="text-primary" />
              </div>
              <div><h2 className="text-base font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Issue Credential</h2>
                <p className="text-xs text-muted-foreground">Bind clinical trial participation to a patient wallet</p>
              </div>
            </div>
            <div className="space-y-4">
              <InputField label="Patient Wallet Address" value={recipientAddr} onChange={setRecipientAddr} placeholder="mn1_0x7f3a..." required mono />
              <InputField label="Trial ID" value={trialId} onChange={setTrialId} placeholder="NCT-2024-0041" />
              <SelectField label="Credential Type" value={credType} onChange={setCredType}
                options={["Clinical Trial","Phase II","Phase III","Observational","Expanded Access"].map((v) => ({ value: v, label: v }))} />
              <InputField label="Expiration Date (optional)" type="date" value={expiry} onChange={setExpiry} />
              <div className="pt-2 flex gap-3">
                <PrimaryBtn onClick={handleIssue} loading={issuing} disabled={!wallet} className="flex-1 justify-center py-3">Issue Credential</PrimaryBtn>
              </div>
              {!wallet && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><AlertTriangle size={11} /> Connect wallet to enable issuance</p>}
            </div>
          </Card>
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl border border-border bg-primary/5">
            <Lock size={13} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Credentials are stored as encrypted state on Midnight. The participant's identity and medical details remain private — only the cryptographic commitment is written on-chain.
            </p>
          </div>
        </motion.div>
      )}

      {/* Revoke credential */}
      {tab === "revoke" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-lg">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${DANGER}12`, border: `1px solid ${DANGER}25` }}>
                <XCircle size={15} style={{ color: DANGER }} />
              </div>
              <div><h2 className="text-base font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Revoke Credential</h2>
                <p className="text-xs text-muted-foreground">Invalidate a participant's credential on-chain</p>
              </div>
            </div>
            <div className="space-y-4">
              <InputField label="Search Credential (ID or Wallet Address)" value={revokeSearch} onChange={setRevokeSearch} placeholder="CR-001 or mn1_0x..." mono />
              <SelectField label="Credential Status" value={revokeStatus} onChange={(v) => setRevokeStatus(v as CredStatus)}
                options={[{ value: "", label: "— Any status —" }, ...["active","pending","expired"].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))]} />
              <SelectField label="Reason for Revocation" value={revokeReason} onChange={setRevokeReason}
                options={[
                  { value: "", label: "— Select reason —" },
                  { value: "trial_ended", label: "Trial Concluded" },
                  { value: "participant_withdrew", label: "Participant Withdrew" },
                  { value: "protocol_violation", label: "Protocol Violation" },
                  { value: "administrative", label: "Administrative" },
                  { value: "other", label: "Other" },
                ]} />
              <div className="pt-1">
                <button onClick={() => revokeSearch.trim() ? setShowRevoke(true) : toast.error("Enter a credential ID or wallet address")}
                  disabled={!wallet || revoking}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: DANGER }}>
                  {revoking && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                  Confirm Revoke
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Credential history */}
      {tab === "history" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={histSearch} onChange={(e) => { setHistSearch(e.target.value); setHistPage(1); }} placeholder="Search by ID, patient, or trial..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-input-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <div className="relative">
              <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select value={histStatus} onChange={(e) => { setHistStatus(e.target.value); setHistPage(1); }}
                className="pl-9 pr-8 py-2.5 rounded-xl bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none transition-all">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="border-b border-border" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <tr>
                    {["Credential ID","Patient","Trial","Type","Status","Issue Date","Revoked Date","Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No credentials found.</td></tr>
                  )}
                  {pageRows.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{c.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.patient}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{c.trial}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.type}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.issuedAt}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.revokedAt ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {c.status === "active" && (
                          <button onClick={() => { setRevokeSearch(c.id); setTab("revoke"); }}
                            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                            <XCircle size={11} /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{filtered.length} credential{filtered.length !== 1 ? "s" : ""}</p>
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

      {showRevoke && (
        <ConfirmModal title="Revoke Credential" desc={`This will permanently invalidate the credential for "${revokeSearch}". Any proofs generated from it will fail verification.`}
          confirmLabel="Revoke" onConfirm={handleRevoke} onCancel={() => setShowRevoke(false)} danger />
      )}
    </DashboardLayout>
  );
};
