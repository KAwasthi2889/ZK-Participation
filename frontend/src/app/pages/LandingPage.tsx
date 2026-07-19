import React from 'react';
import { motion } from 'motion/react';
import { Lock, Hash, ShieldCheck, RefreshCw, Wallet, Layers, ArrowRight, Building2, CheckCircle } from 'lucide-react';
import { PRIMARY, CYAN, SUCCESS } from '../constants';
import { DecorativeArcs, CipherLogo } from '../components/ui/Icons';
import { GradientText, PrimaryBtn, GhostBtn, Card } from '../components/ui/Primitives';

// LANDING PAGE
// ─────────────────────────────────────────────────────────────

export const LandingPage = ({ onSignIn, onGetStarted }: { onSignIn: () => void; onGetStarted: () => void }) => {
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
