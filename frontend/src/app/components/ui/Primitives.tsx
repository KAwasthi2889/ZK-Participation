import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { SUCCESS, DANGER, PRIMARY, CYAN } from '../../constants';
import { CredStatus } from '../../types';

// PRIMITIVES
// ─────────────────────────────────────────────────────────────

export const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={className} style={{ background: "linear-gradient(135deg,#3B5BFF,#4A63FF,#4FCBFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
    {children}
  </span>
);

export const PrimaryBtn = ({ children, onClick, disabled, loading, className = "", type = "button" }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; className?: string; type?: "button" | "submit";
}) => (
  <button type={type} onClick={onClick} disabled={disabled || loading}
    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    style={{ background: "linear-gradient(135deg,#3B5BFF,#4A63FF)" }}>
    {loading && <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
    {children}
  </button>
);

export const GhostBtn = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button onClick={onClick} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition-all active:scale-[0.98] ${className}`}>
    {children}
  </button>
);

export const Card = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`rounded-2xl border border-border bg-card ${className}`}
    style={glow ? { boxShadow: "0 0 40px rgba(59,91,255,0.1), 0 1px 0 rgba(255,255,255,0.03) inset" } : { boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}>
    {children}
  </div>
);

export const StatusBadge = ({ status }: { status: CredStatus | "valid" | "invalid" }) => {
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

export const InputField = ({ label, type = "text", value, onChange, placeholder, required, mono }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; mono?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full px-4 py-2.5 rounded-xl bg-input-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      style={mono ? { fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem" } : undefined} />
  </div>
);

export const SelectField = ({ label, value, onChange, options }: {
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

export const StatCard = ({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.FC<{size?: number; className?: string}>; color: string }) => (
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

export const ConfirmModal = ({ title, desc, confirmLabel, onConfirm, onCancel, danger }: {
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
