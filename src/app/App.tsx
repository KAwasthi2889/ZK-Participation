/**
 * CIPHER — Confidential Issuance of Participation Credentials
 *            for Healthcare Eligibility & Research
 *
 * "Prove Participation. Reveal Nothing."
 *
 * Roles: Sponsor · Patient · Verifier
 * Blockchain: Midnight (Zero-Knowledge Proofs)
 */

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Toaster, toast } from "sonner";
import {
  Shield, Copy, Download, CheckCircle, XCircle, Wallet,
  Eye, EyeOff, Menu, X, LogOut, ArrowRight, Key,
  Building2, Clock, ShieldCheck, Hash, Layers, Activity,
  FileText, RefreshCw, ChevronRight, ChevronLeft, Zap,
  Globe, Lock, User, AlertTriangle, BadgeCheck, Cpu,
  Search, Filter, Settings, BarChart3, ChevronDown,
  LayoutDashboard, History, Bell, AlertCircle, Fingerprint,
  ScanLine, Upload, CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const PRIMARY   = "#3B5BFF";
const CYAN      = "#4FCBFF";
const SUCCESS   = "#22C55E";   // emerald — active / verified / success
const DANGER    = "#E03550";   // red — revoked / failed / error

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type Role = "sponsor" | "patient" | "verifier";
type View = "landing" | "auth" | "dashboard";
type AuthMode = "signin" | "signup";
type CredStatus = "active" | "revoked" | "pending" | "expired";
type VerifyResult = "valid" | "invalid" | "revoked" | "expired" | null;
type StepState = "idle" | "active" | "done";

interface AuthUser {
  email: string;
  role: Role;
  name: string;
  org?: string;
}

interface CredentialRecord {
  id: string;
  patient: string;
  trial: string;
  type: string;
  status: CredStatus;
  issuedAt: string;
  revokedAt?: string;
  expiry: string;
}

interface VerificationRecord {
  id: string;
  proofId: string;
  timestamp: string;
  purpose: string;
  result: "valid" | "invalid";
  disclosed: string;
}

// ─────────────────────────────────────────────────────────────
// DEMO ACCOUNTS
// ─────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { role: "sponsor"  as Role, email: "sponsor@cipher.com",  password: "Sponsor123",  name: "Dr. Sarah Chen",    org: "Meridian Research Institute" },
  { role: "patient"  as Role, email: "patient@cipher.com",  password: "Patient123",  name: "Alex Morgan",       org: "" },
  { role: "verifier" as Role, email: "verifier@cipher.com", password: "Verifier123", name: "Prism Analytics",   org: "Insurance & Research" },
];

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const MOCK_CREDENTIALS: CredentialRecord[] = [
  { id: "CR-001", patient: "mn1_4a2b...7c8d", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-01", expiry: "2026-07-01" },
  { id: "CR-002", patient: "mn1_9f1e...3a4b", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-02", expiry: "2026-07-02" },
  { id: "CR-003", patient: "mn1_2c5d...8e9f", trial: "NCT-2024-0038", type: "Observational",   status: "revoked", issuedAt: "2025-06-15", revokedAt: "2025-07-10", expiry: "2026-06-15" },
  { id: "CR-004", patient: "mn1_7e3a...1b2c", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-05", expiry: "2026-07-05" },
  { id: "CR-005", patient: "mn1_8f4b...2c3d", trial: "NCT-2024-0042", type: "Phase III",       status: "active",  issuedAt: "2025-07-08", expiry: "2026-07-08" },
  { id: "CR-006", patient: "mn1_1a9e...6g7h", trial: "NCT-2024-0038", type: "Observational",   status: "revoked", issuedAt: "2025-06-20", revokedAt: "2025-07-12", expiry: "2026-06-20" },
  { id: "CR-007", patient: "mn1_3b7f...9a1c", trial: "NCT-2024-0043", type: "Phase II",        status: "active",  issuedAt: "2025-07-10", expiry: "2026-07-10" },
  { id: "CR-008", patient: "mn1_5c2a...4d8e", trial: "NCT-2024-0042", type: "Phase III",       status: "pending", issuedAt: "2025-07-14", expiry: "2026-07-14" },
];

const MOCK_VERIFICATIONS: VerificationRecord[] = [
  { id: "VR-001", proofId: "ZKP-9f3a...4b5c", timestamp: "2025-07-15 09:14", purpose: "Insurance Claim",       result: "valid",   disclosed: "Participation only" },
  { id: "VR-002", proofId: "ZKP-4b2c...7d8e", timestamp: "2025-07-14 14:30", purpose: "Research Enrollment",   result: "valid",   disclosed: "Participation only" },
  { id: "VR-003", proofId: "ZKP-7d1e...2f3g", timestamp: "2025-07-13 11:02", purpose: "Benefits Eligibility",  result: "invalid", disclosed: "None" },
  { id: "VR-004", proofId: "ZKP-2e9b...5a1h", timestamp: "2025-07-12 16:45", purpose: "Academic Participation",result: "valid",   disclosed: "Participation only" },
  { id: "VR-005", proofId: "ZKP-6a4f...8c9i", timestamp: "2025-07-11 08:20", purpose: "Insurance Claim",       result: "valid",   disclosed: "Participation only" },
];

// ─────────────────────────────────────────────────────────────
// MOCK BLOCKCHAIN FUNCTIONS — replace bodies with Midnight SDK
// ─────────────────────────────────────────────────────────────

/** Connect to user's Midnight wallet */
const connectWallet = (): Promise<string> =>
  new Promise((r) => setTimeout(() => r("mn1_7f3a9b...c291"), 1500));

/** Issue clinical trial credential on-chain */
const issueCredential = (_addr: string, _trial: string, _type: string): Promise<boolean> =>
  new Promise((r) => setTimeout(() => r(true), 2000));

/** Revoke a credential on-chain */
const revokeCredential = (_addr: string): Promise<boolean> =>
  new Promise((r) => setTimeout(() => r(true), 1500));

/** Generate Zero-Knowledge Proof of participation */
const generateProof = (): Promise<string> =>
  new Promise((r) =>
    setTimeout(() =>
      r(JSON.stringify({
        proof: "zkp_v1_0x4f2a8b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
        commitment: "0x3b5bff4a63ff4fcbff000000000000000000000000000000000001a2b3c",
        nullifier: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a29181716151413121110f0e0d0c",
        timestamp: Date.now(),
        circuit: "clinical_trial_participation_v2",
        verified_claims: ["participated_in_approved_trial"],
        revealed: [],
      }, null, 2)),
    3000));

/** Verify a ZK proof on-chain */
const verifyProof = (proof: string): Promise<VerifyResult> =>
  new Promise((r) =>
    setTimeout(() => r(proof.trim().startsWith("{") && proof.includes("zkp_v1") ? "valid" : "invalid"), 1500));

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────
// SVG COMPONENTS
// ─────────────────────────────────────────────────────────────

const CipherLogo = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="ciphG" x1="85" y1="15" x2="15" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4A63FF" />
        <stop offset="55%" stopColor="#3B5BFF" />
        <stop offset="100%" stopColor="#4FCBFF" />
      </linearGradient>
    </defs>
    <path d="M 84.6 30 A 40 40 0 1 1 84.6 70" stroke="url(#ciphG)" strokeWidth="9"   fill="none" strokeLinecap="round" />
    <path d="M 74.2 36 A 28 28 0 1 1 74.2 64" stroke="url(#ciphG)" strokeWidth="7.5" fill="none" strokeLinecap="round" />
    <path d="M 63.9 42 A 16 16 0 1 1 63.9 58" stroke="url(#ciphG)" strokeWidth="6"   fill="none" strokeLinecap="round" />
    <rect x="77" y="18" width="11" height="4.5" rx="2.25" fill="#4FCBFF" transform="rotate(-38 82.5 20)" />
  </svg>
);

const DecorativeArcs = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="decG" x1="85" y1="15" x2="15" y2="85" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4A63FF" /><stop offset="100%" stopColor="#4FCBFF" />
      </linearGradient>
    </defs>
    <path d="M 84.6 30 A 40 40 0 1 1 84.6 70" stroke="url(#decG)" strokeWidth="4"   fill="none" strokeLinecap="round" />
    <path d="M 74.2 36 A 28 28 0 1 1 74.2 64" stroke="url(#decG)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M 63.9 42 A 16 16 0 1 1 63.9 58" stroke="url(#decG)" strokeWidth="3"   fill="none" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────

const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={className} style={{ background: "linear-gradient(135deg,#3B5BFF,#4A63FF,#4FCBFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
    {children}
  </span>
);

const PrimaryBtn = ({ children, onClick, disabled, loading, className = "", type = "button" }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; className?: string; type?: "button" | "submit";
}) => (
  <button type={type} onClick={onClick} disabled={disabled || loading}
    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    style={{ background: "linear-gradient(135deg,#3B5BFF,#4A63FF)" }}>
    {loading && <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button onClick={onClick} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition-all active:scale-[0.98] ${className}`}>
    {children}
  </button>
);

const Card = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`rounded-2xl border border-border bg-card ${className}`}
    style={glow ? { boxShadow: "0 0 40px rgba(59,91,255,0.1), 0 1px 0 rgba(255,255,255,0.03) inset" } : { boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: CredStatus | "valid" | "invalid" }) => {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    active:  { label: "Active",   color: SUCCESS,  bg: `${SUCCESS}18`  },
    valid:   { label: "Valid",    color: SUCCESS,  bg: `${SUCCESS}18`  },
    pending: { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    revoked: { label: "Revoked",  color: DANGER,   bg: `${DANGER}18`   },
    invalid: { label: "Invalid",  color: DANGER,   bg: `${DANGER}18`   },
    expired: { label: "Expired",  color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  };
  const c = cfg[status] ?? cfg.pending;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ color: c.color, background: c.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  );
};

const InputField = ({ label, type = "text", value, onChange, placeholder, required, mono }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; mono?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      style={mono ? { fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" } : undefined} />
  </div>
);

const SelectField = ({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 pr-9 rounded-xl bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all appearance-none">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.FC<{size?: number; className?: string}>; color: string }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <p className="text-3xl font-extrabold leading-none" style={{ fontFamily: "Manrope, sans-serif" }}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  </Card>
);

const ConfirmModal = ({ title, desc, confirmLabel, onConfirm, onCancel, danger }: {
  title: string; desc: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }}
      className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
      <h3 className="text-base font-bold mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{desc}</p>
      <div className="flex gap-3">
        <GhostBtn onClick={onCancel} className="flex-1">Cancel</GhostBtn>
        <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 ${danger ? "bg-destructive" : ""}`}
          style={!danger ? { background: "linear-gradient(135deg,#3B5BFF,#4A63FF)" } : undefined}>
          {confirmLabel}
        </button>
      </div>
    </motion.div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

const Navbar = ({ user, onSignIn, onGetStarted, onLogout, onNavigate }: {
  user: AuthUser | null; onSignIn: () => void; onGetStarted: () => void; onLogout: () => void; onNavigate: (v: View) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(11,19,43,0.9)", backdropFilter: "blur(20px)", borderColor: "rgba(59,91,255,0.14)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => { onNavigate("landing"); setOpen(false); }} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <CipherLogo size={30} />
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>CIPHER</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {!user ? (
            <>
              {(["How It Works","Why CIPHER","Technology"] as const).map((lbl, i) => (
                <a key={lbl} href={["#how-it-works","#why-cipher","#technology"][i]}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all">{lbl}</a>
              ))}
              <div className="ml-2 flex gap-2">
                <button onClick={onSignIn} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-secondary transition-all">Sign In</button>
                <PrimaryBtn onClick={onGetStarted} className="px-4 py-2">Get Started <ArrowRight size={14} /></PrimaryBtn>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all">Dashboard</button>
              <div className="ml-3 flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/50">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN }} />
                  <span className="text-xs capitalize text-muted-foreground">{user.role}</span>
                  <span className="text-xs font-semibold">{user.name}</span>
                </div>
                <button onClick={onLogout} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Sign out"><LogOut size={15} /></button>
              </div>
            </>
          )}
        </div>
        <button className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-1 border-t border-border pt-3">
          {!user ? (
            <>
              {["#how-it-works","#why-cipher"].map((h, i) => (
                <a key={h} href={h} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg">{["How It Works","Why CIPHER"][i]}</a>
              ))}
              <div className="flex gap-2 pt-2">
                <GhostBtn onClick={() => { onSignIn(); setOpen(false); }} className="flex-1 justify-center">Sign In</GhostBtn>
                <PrimaryBtn onClick={() => { onGetStarted(); setOpen(false); }} className="flex-1 justify-center">Get Started</PrimaryBtn>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { onNavigate("dashboard"); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-secondary rounded-lg"><Activity size={14} /> Dashboard</button>
              <button onClick={() => { onLogout(); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary rounded-lg"><LogOut size={14} /> Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────

const LandingPage = ({ onSignIn, onGetStarted }: { onSignIn: () => void; onGetStarted: () => void }) => {
  const features = [
    { icon: Lock,       title: "Issue Credentials",     desc: "Sponsors bind trial participation to patient wallets on Midnight's confidential ledger." },
    { icon: Hash,       title: "Generate ZK Proof",     desc: "Patients generate proofs that confirm participation and reveal nothing else — cryptographically." },
    { icon: ShieldCheck,title: "Verify Proof",          desc: "Any verifier confirms participation on-chain without accessing identity or medical data." },
    { icon: RefreshCw,  title: "Credential Revocation", desc: "Sponsors can revoke credentials on-chain instantly when trial status changes." },
    { icon: Wallet,     title: "Wallet Integration",    desc: "Non-custodial. Credentials live in your wallet. No third party holds your data." },
    { icon: Layers,     title: "Confidential State",    desc: "All blockchain state is encrypted. Observers learn nothing from the ledger." },
  ];
  const tech = [
    { name: "Midnight",                  desc: "Privacy-first blockchain with confidential smart contracts",   dot: PRIMARY },
    { name: "React + TypeScript",        desc: "Type-safe, component-driven frontend",                         dot: CYAN },
    { name: "Zero-Knowledge Proofs",     desc: "Prove truth without revealing evidence",                       dot: "#4A63FF" },
    { name: "Confidential Contracts",    desc: "Smart contracts whose execution remains private",              dot: "#7c8dff" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[700px] h-[500px] rounded-full" style={{ background: "radial-gradient(ellipse,rgba(59,91,255,0.14) 0%,transparent 70%)" }} />
          <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full" style={{ background: "radial-gradient(ellipse,rgba(79,203,255,0.06) 0%,transparent 70%)" }} />
        </div>
        <DecorativeArcs className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[50vw] max-w-[640px] opacity-[0.065]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: CYAN }} />
              Built on Midnight · Zero-Knowledge Proofs
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6" style={{ fontFamily: "Manrope, sans-serif" }}>
              <GradientText>Prove Participation.</GradientText><br />
              <span className="text-foreground">Reveal Nothing.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }}
              className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Privacy-preserving healthcare credentials powered by Zero-Knowledge Proofs and Midnight. Patients prove clinical trial participation without revealing identity, condition, or any private data.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.22 }} className="flex flex-wrap gap-3">
              <PrimaryBtn onClick={onGetStarted} className="px-6 py-3 text-base">Get Started <ArrowRight size={16} /></PrimaryBtn>
              <GhostBtn onClick={onSignIn} className="px-6 py-3 text-base">Sign In</GhostBtn>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.38 }}
              className="mt-12 flex flex-wrap gap-6 text-xs text-muted-foreground">
              {["End-to-End Encrypted","Non-Custodial","ZK-Native","HIPAA-Ready Architecture"].map((s) => (
                <span key={s} className="flex items-center gap-1.5"><CheckCircle size={12} style={{ color: SUCCESS }} />{s}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,transparent,rgba(59,91,255,0.03) 50%,transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: CYAN }}>The Flow</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>How It Works</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Three steps. Three roles. One privacy guarantee.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num:"01", icon: Building2, role:"Sponsor",  title:"Issue Credential",      desc:"A hospital or research institution issues a cryptographic credential to a participant's wallet on the Midnight blockchain.", color: PRIMARY },
              { num:"02", icon: Wallet,    role:"Patient",  title:"Generate Proof",         desc:"The patient generates a Zero-Knowledge Proof from their credential — confirming participation and nothing else.", color: "#4A63FF" },
              { num:"03", icon: ShieldCheck,role:"Verifier",title:"Verify Participation",  desc:"An insurer, university, or agency verifies the proof on-chain. They learn only: this person participated in an approved trial.", color: CYAN },
            ].map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card className="h-full p-6" glow={i === 1}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                      <s.icon size={17} style={{ color: s.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: s.color }}>{s.role}</p>
                      <h3 className="text-sm font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{s.title}</h3>
                    </div>
                    <span className="ml-auto text-3xl font-extrabold opacity-10 shrink-0" style={{ fontFamily: "Manrope, sans-serif", color: s.color }}>{s.num}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,transparent,rgba(10,16,40,0.7) 30%,rgba(10,16,40,0.7) 70%,transparent)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: CYAN }}>Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Everything privacy demands</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                <Card className="h-full p-6 group hover:border-primary/30 transition-all duration-300 cursor-default">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon size={15} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech */}
      <section id="technology" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: CYAN }}>Stack</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>Built on the right primitives</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {tech.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <Card className="p-5 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 mb-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
                    <h3 className="font-bold text-sm" style={{ fontFamily: "Manrope, sans-serif" }}>{t.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(59,91,255,0.1),rgba(79,203,255,0.05))" }} />
        <div className="absolute inset-0 border-y border-border" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}><GradientText>Ready to prove participation?</GradientText></h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">The privacy-first future of healthcare credentialing. For patients, sponsors, and verifiers.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <PrimaryBtn onClick={onGetStarted} className="px-7 py-3 text-base">Create Account <ArrowRight size={16} /></PrimaryBtn>
            <GhostBtn onClick={onSignIn} className="px-7 py-3 text-base">Sign In</GhostBtn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5"><CipherLogo size={22} /><span className="text-sm font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>CIPHER</span></div>
          <p className="text-xs text-muted-foreground">Confidential Issuance of Participation Credentials for Healthcare Eligibility &amp; Research</p>
          <p className="text-xs text-muted-foreground">Built on <span style={{ color: CYAN }}>Midnight</span></p>
        </div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AUTH PAGE
// ─────────────────────────────────────────────────────────────

const AuthPage = ({ mode, onModeChange, onSuccess, onBack }: {
  mode: AuthMode; onModeChange: (m: AuthMode) => void; onSuccess: (u: AuthUser) => void; onBack: () => void;
}) => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [name, setName]             = useState("");
  const [role, setRole]             = useState<Role>("patient");
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const roles = [
    { value: "sponsor"  as Role, label: "Sponsor",  icon: Building2, desc: "Issue & revoke credentials" },
    { value: "patient"  as Role, label: "Patient",   icon: User,      desc: "Generate proofs" },
    { value: "verifier" as Role, label: "Verifier",  icon: ShieldCheck,desc: "Verify proofs" },
  ];

  const fill = (a: typeof DEMO_ACCOUNTS[0]) => { setEmail(a.email); setPassword(a.password); setRole(a.role); if (mode === "signup") setName(a.name); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await delay(900);
    if (mode === "signin") {
      const m = DEMO_ACCOUNTS.find((a) => a.email === email.trim() && a.password === password);
      if (m) { toast.success(`Welcome back, ${m.name}!`); onSuccess({ email: m.email, role: m.role, name: m.name, org: m.org }); }
      else { toast.error("Invalid credentials — try a demo account below."); setLoading(false); }
    } else {
      toast.success("Account created!"); onSuccess({ email, role, name: name.trim() || email.split("@")[0] });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full" style={{ background: "radial-gradient(ellipse,rgba(59,91,255,0.1),transparent 70%)" }} />
      </div>
      <DecorativeArcs className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[50vw] max-w-[600px] opacity-[0.05]" />
      <div className="relative w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"><ChevronRight size={12} className="rotate-180" /> Back to home</button>
        <div className="flex items-center gap-2.5 mb-8"><CipherLogo size={26} />
          <div><h1 className="text-lg font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>{mode === "signin" ? "Welcome back" : "Create account"}</h1>
            <p className="text-xs text-muted-foreground">CIPHER · Prove Participation. Reveal Nothing.</p>
          </div>
        </div>
        <Card glow>
          <div className="p-6">
            <div className="flex bg-secondary rounded-xl p-1 mb-5">
              {(["signin","signup"] as AuthMode[]).map((m) => (
                <button key={m} onClick={() => onModeChange(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                  style={mode === m ? { background: "linear-gradient(135deg,#3B5BFF,#4A63FF)" } : undefined}>
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && <InputField label="Full Name" value={name} onChange={setName} placeholder="Dr. Sarah Chen" required />}
              <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@cipher.com" required />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full px-4 py-2.5 pr-11 rounded-xl bg-input-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => (
                      <button key={r.value} type="button" onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${role === r.value ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-secondary"}`}>
                        <r.icon size={15} />{r.label}
                        <span className="text-[10px] font-normal opacity-60 text-center leading-tight">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <PrimaryBtn type="submit" loading={loading} className="w-full justify-center py-3 mt-1">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </PrimaryBtn>
            </form>
          </div>
        </Card>

        {/* Demo panel */}
        <div className="mt-4 rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: CYAN }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: CYAN }}>Demo Credentials Available</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Click any account to auto-fill for hackathon judging.</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button key={a.role} onClick={() => fill(a)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary text-left transition-all group">
                <div><p className="text-xs font-semibold capitalize group-hover:text-foreground">{a.role}</p>
                  <p className="text-[11px] text-muted-foreground">{a.email}</p></div>
                <code className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded group-hover:border-primary/40">{a.password}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD LAYOUT SHELL
// Uses sticky sidebar + scrollable main to prevent any clipping
// ─────────────────────────────────────────────────────────────

interface NavItem { id: string; label: string; icon: React.FC<{size?: number; className?: string}> }

const DashboardLayout = ({ user, navItems, activeTab, onTabChange, children }: {
  user: AuthUser; navItems: NavItem[]; activeTab: string; onTabChange: (id: string) => void; children: React.ReactNode;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roleColor = user.role === "sponsor" ? PRIMARY : user.role === "patient" ? CYAN : "#4A63FF";

  return (
    <div style={{ paddingTop: 64, fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar — sticky so it doesn't scroll with content */}
        <aside
          className={`fixed top-16 left-0 bottom-0 z-40 w-64 flex flex-col border-r border-border overflow-y-auto transition-transform duration-300 md:sticky md:top-16 md:translate-x-0 md:h-[calc(100vh-64px)] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: "var(--sidebar)" }}
        >
          {/* User info */}
          <div className="p-5 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: `linear-gradient(135deg,${roleColor}30,${roleColor}60)`, border: `1px solid ${roleColor}40` }}>
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs capitalize" style={{ color: roleColor }}>{user.role}</p>
              </div>
            </div>
            {user.org && <p className="text-[11px] text-muted-foreground mt-2 truncate">{user.org}</p>}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeTab === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"}`}
                style={activeTab === item.id ? { background: `${roleColor}18`, color: roleColor } : undefined}>
                <item.icon size={15} />{item.label}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-border shrink-0">
            <div className="flex items-center gap-2"><CipherLogo size={18} />
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>CIPHER</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Mobile topbar */}
          <div className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-border md:hidden"
            style={{ background: "rgba(11,19,43,0.95)", backdropFilter: "blur(12px)" }}>
            <button className="p-2 rounded-xl hover:bg-secondary transition-colors" onClick={() => setSidebarOpen(true)}><Menu size={16} /></button>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>{navItems.find((n) => n.id === activeTab)?.label}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <div className="p-5 sm:p-7 max-w-screen-xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
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

const SponsorDashboard = ({ user }: { user: AuthUser }) => {
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

// ─────────────────────────────────────────────────────────────
// PATIENT DASHBOARD
// ─────────────────────────────────────────────────────────────

const PROOF_PURPOSES = [
  { id: "insurance", label: "Insurance Claim", desc: "Submit proof for insurance eligibility or reimbursement" },
  { id: "research",  label: "Research Enrollment", desc: "Enroll in a follow-up research programme" },
  { id: "benefits",  label: "Benefits Eligibility", desc: "Qualify for trial participant benefits" },
  { id: "academic",  label: "Academic Participation", desc: "Academic study or publication verification" },
];

const PatientDashboard = ({ user }: { user: AuthUser }) => {
  const [tab, setTab]             = useState("dashboard");
  const [wallet, setWallet]       = useState("");
  const [connecting, setConnecting] = useState(false);

  // 4-step proof flow
  const [proofStep, setProofStep]     = useState(0);
  const [selectedCred, setSelectedCred] = useState<CredentialRecord | null>(null);
  const [purpose, setPurpose]         = useState("");
  const [generating, setGenerating]   = useState(false);
  const [proof, setProof]             = useState("");

  const patientCreds: CredentialRecord[] = [
    { id: "CR-002", patient: "mn1_9f1e...3a4b", trial: "NCT-2024-0041", type: "Clinical Trial",  status: "active",  issuedAt: "2025-07-02", expiry: "2026-07-02" },
    { id: "CR-005", patient: "mn1_8f4b...2c3d", trial: "NCT-2024-0042", type: "Phase III",       status: "active",  issuedAt: "2025-07-08", expiry: "2026-07-08" },
  ];

  const activity = [
    { icon: FileText,   color: PRIMARY,  label: "Credential Issued",  sub: "NCT-2024-0041", time: "Jul 2, 2025" },
    { icon: Key,        color: CYAN,     label: "Proof Generated",    sub: "Insurance Claim",time: "Jul 10, 2025"},
    { icon: ShieldCheck,color: SUCCESS,  label: "Proof Verified",     sub: "Prism Analytics",time: "Jul 10, 2025"},
    { icon: FileText,   color: PRIMARY,  label: "Credential Issued",  sub: "NCT-2024-0042", time: "Jul 8, 2025" },
  ];

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
    try { const a = await connectWallet(); setWallet(a); toast.success("Wallet connected!", { id }); }
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

// ─────────────────────────────────────────────────────────────
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

const VerifierDashboard = ({ user }: { user: AuthUser }) => {
  const [tab, setTab]                   = useState("dashboard");
  const [proofInput, setProofInput]     = useState("");
  const [verifying, setVerifying]       = useState(false);
  const [stepStates, setStepStates]     = useState<StepState[]>(Array(5).fill("idle"));
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
              <button className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-secondary transition-all text-xs text-muted-foreground">
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

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]         = useState<View>("landing");
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");

  const goSignIn     = useCallback(() => { setAuthMode("signin");  setView("auth"); }, []);
  const goGetStarted = useCallback(() => { setAuthMode("signup");  setView("auth"); }, []);
  const onAuth       = useCallback((u: AuthUser) => { setUser(u); setView("dashboard"); }, []);
  const onLogout     = useCallback(() => { setUser(null); setView("landing"); toast.success("Signed out"); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Toaster position="top-right" toastOptions={{ style: { background: "#101c3d", border: "1px solid rgba(59,91,255,0.22)", color: "#e2eaf8", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" } }} />
      <Navbar user={user} onSignIn={goSignIn} onGetStarted={goGetStarted} onLogout={onLogout} onNavigate={(v) => setView(v)} />

      {view === "landing"   && <LandingPage onSignIn={goSignIn} onGetStarted={goGetStarted} />}
      {view === "auth"      && <AuthPage mode={authMode} onModeChange={setAuthMode} onSuccess={onAuth} onBack={() => setView("landing")} />}
      {view === "dashboard" && user && (
        <>
          {user.role === "sponsor"  && <SponsorDashboard  user={user} />}
          {user.role === "patient"  && <PatientDashboard  user={user} />}
          {user.role === "verifier" && <VerifierDashboard user={user} />}
        </>
      )}
    </div>
  );
}
