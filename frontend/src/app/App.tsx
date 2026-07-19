import React, { useState, useEffect, useCallback } from "react";
import { Toaster } from "sonner";
import { AuthUser, View, AuthMode } from "./types";
import { Navbar } from "./components/layout/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { SponsorDashboard } from "./pages/dashboards/SponsorDashboard";
import { PatientDashboard } from "./pages/dashboards/PatientDashboard";
import { VerifierDashboard } from "./pages/dashboards/VerifierDashboard";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [user, setUser] = useState<AuthUser | null>(null);
  
  // Theme initialization
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleSignIn = useCallback(() => { setAuthMode("signin"); setView("auth"); }, []);
  const handleGetStarted = useCallback(() => { setAuthMode("signup"); setView("auth"); }, []);
  const handleAuthSuccess = useCallback((u: AuthUser) => { setUser(u); setView("dashboard"); }, []);
  const handleLogout = useCallback(() => { setUser(null); setView("landing"); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-center" theme="dark" toastOptions={{
        style: { background: "rgba(11,19,43,0.9)", border: "1px solid rgba(59,91,255,0.2)", backdropFilter: "blur(12px)", color: "#fff", borderRadius: "16px", padding: "16px" },
        className: "shadow-2xl"
      }} />
      <Navbar user={user} onSignIn={handleSignIn} onGetStarted={handleGetStarted} onLogout={handleLogout} onNavigate={setView} />
      <main>
        {view === "landing" && <LandingPage onSignIn={handleSignIn} onGetStarted={handleGetStarted} />}
        {view === "auth" && <AuthPage mode={authMode} onModeChange={setAuthMode} onSuccess={handleAuthSuccess} onBack={() => setView("landing")} />}
        {view === "dashboard" && user && (
          <>
            {user.role === "sponsor" && <SponsorDashboard user={user} />}
            {user.role === "patient" && <PatientDashboard user={user} />}
            {user.role === "verifier" && <VerifierDashboard user={user} />}
          </>
        )}
      </main>
    </div>
  );
}
