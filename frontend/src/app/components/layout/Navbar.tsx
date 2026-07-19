import React, { useState } from 'react';
import { LogOut, ArrowRight, Menu, X, Activity } from 'lucide-react';
import { AuthUser, View } from '../../types';
import { CYAN } from '../../constants';
import { CipherLogo } from '../ui/Icons';
import { PrimaryBtn, GhostBtn } from '../ui/Primitives';

// NAVBAR
// ─────────────────────────────────────────────────────────────

export const Navbar = ({ user, onSignIn, onGetStarted, onLogout, onNavigate }: {
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
