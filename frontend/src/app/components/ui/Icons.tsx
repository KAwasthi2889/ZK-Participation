import React from 'react';
import { PRIMARY, CYAN } from '../../constants';

// SVG COMPONENTS
// ─────────────────────────────────────────────────────────────

export const CipherLogo = ({ size = 36 }: { size?: number }) => (
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

export const DecorativeArcs = ({ className = "" }: { className?: string }) => (
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
