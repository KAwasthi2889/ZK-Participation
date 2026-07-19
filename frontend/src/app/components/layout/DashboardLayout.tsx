import React, { useState } from 'react';
import { AuthUser, NavItem } from '../../types';
import { PRIMARY, CYAN } from '../../constants';

// DASHBOARD LAYOUT SHELL
// Uses sticky sidebar + scrollable main to prevent any clipping
// ─────────────────────────────────────────────────────────────

interface NavItem { id: string; label: string; icon: React.FC<{size?: number; className?: string}> }

export const DashboardLayout = ({ user, navItems, activeTab, onTabChange, children }: {
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
