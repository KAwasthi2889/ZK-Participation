import React, { useState } from 'react';
import { Building2, User, ShieldCheck, ChevronRight, EyeOff, Eye } from 'lucide-react';
import { AuthMode, AuthUser, Role } from '../types';
import { DEMO_ACCOUNTS, CYAN } from '../constants';
import { CipherLogo, DecorativeArcs } from '../components/ui/Icons';
import { Card, InputField, PrimaryBtn, GhostBtn } from '../components/ui/Primitives';
import { toast } from 'sonner';
import { delay } from '../services/blockchain';

// AUTH PAGE
// ─────────────────────────────────────────────────────────────

export const AuthPage = ({ mode, onModeChange, onSuccess, onBack }: {
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
