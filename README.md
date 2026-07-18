# CIPHER

<div align="center">
  <img src="src/imports/CIPHER_Final_Logo.png" alt="CIPHER Logo" width="120" />

  <h3>Confidential Issuance of Participation Credentials for Healthcare Eligibility & Research</h3>

  <p><strong>Prove Participation. Reveal Nothing.</strong></p>

  <p>
    A privacy-preserving decentralized application built on Midnight that enables patients to cryptographically prove clinical trial participation using Zero-Knowledge Proofs — without revealing identity, medical condition, hospital, or any private health information.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Midnight-Hackathon-3B5BFF?style=flat-square" alt="Midnight Hackathon" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite 6" />
  </p>
</div>

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Key Features](#2-key-features)
3. [Screenshots](#3-screenshots)
4. [Technology Stack](#4-technology-stack)
5. [Folder Structure](#5-folder-structure)
6. [Component Documentation](#6-component-documentation)
7. [Application Architecture](#7-application-architecture)
8. [User Roles](#8-user-roles)
9. [Demo Flow](#9-demo-flow)
10. [Getting Started](#10-getting-started)
11. [Environment Variables](#11-environment-variables)
12. [Project Scripts](#12-project-scripts)
13. [Design System](#13-design-system)
14. [Routing](#14-routing)
15. [Current Project Status](#15-current-project-status)
16. [Future Enhancements](#16-future-enhancements)
17. [Team](#17-team)
18. [License](#18-license)

---

## 1. Problem Statement

### The Challenge

Today, proving clinical trial participation requires sharing sensitive medical records. A patient applying for insurance benefits, enrolling in follow-up research, or qualifying for academic studies must expose:

- **Their identity** — name, address, national ID
- **Their medical condition** — diagnosis, disease history
- **Their hospital** — treating institution and physicians
- **Trial details** — specific drug, treatment protocol, outcomes
- **Personal health information** protected under HIPAA and GDPR

This creates a fundamental privacy paradox: **to prove you participated, you must reveal everything you want to keep private.**

### Why This Is a Real Problem

- Insurance companies can discriminate based on disclosed conditions
- Research datasets leak when credentials are shared broadly
- Patients avoid trials because they fear their data will be exposed
- Verifiers receive far more information than they need — creating liability
- There is no standard cryptographic mechanism for minimal-disclosure health credentials

### How CIPHER Solves It

CIPHER uses **Zero-Knowledge Proofs on Midnight's confidential blockchain** to separate the *fact of participation* from the *details of participation*.

A patient generates a cryptographic proof that answers exactly one question:

> "Did this person participate in an approved clinical trial?"

The answer is **yes** or **no** — and nothing else is ever disclosed. No identity. No condition. No hospital. No trial details. The proof is mathematically verifiable without any underlying data being revealed.

---

## 2. Key Features

### ✅ Implemented

| Feature | Description |
|---|---|
| **Responsive Landing Page** | Full-page marketing site with hero, How It Works, Why CIPHER, Features, and Technology sections |
| **Role-Based Authentication** | Sign-in / sign-up flow with three distinct roles: Sponsor, Patient, Verifier |
| **Demo Credential System** | Pre-filled demo accounts for instant hackathon judging |
| **Sponsor Dashboard** | Administrative control center with stats, issue form, revoke form, and history table |
| **Patient Dashboard** | Credential viewer, 4-step proof generation flow, and activity timeline |
| **Verifier Dashboard** | 3-panel verification UI with animated step-by-step verification process |
| **Wallet Connection UI** | Connect wallet button with loading states and address display (mock) |
| **Credential Issuance UI** | Form with wallet address, trial ID, credential type, and expiration date |
| **Credential Revocation UI** | Search, status filter, reason selection, and confirmation modal |
| **Credential History Table** | Paginated, searchable, filterable data table with 8 mock records |
| **4-Step Proof Generation** | Select Credential → Choose Purpose → Generate Proof → Download & Share |
| **ZK Proof Animation** | Animated concentric arcs during proof computation |
| **Proof Display & Export** | Read-only code block with Copy, Download JSON, and QR Code actions |
| **Verification Stepper** | 5-step animated verification process (Receiving → Signature → ZK → Revocation → Complete) |
| **Verification Result Panel** | Privacy breakdown showing what was and was not disclosed |
| **Verification History Table** | Paginated history with search, filter, and result badges |
| **Activity Timeline** | Chronological event log for patient credential activity |
| **Settings Panel** | Toggle controls for notification and privacy preferences |
| **Toast Notifications** | Success, error, and loading toasts via Sonner |
| **Confirmation Modal** | Destructive action confirmation dialogs |
| **Status Badges** | Active / Revoked / Pending / Expired / Valid / Invalid visual indicators |
| **Responsive Layout** | Full desktop and mobile support with collapsible sidebar |
| **CIPHER SVG Logo** | Programmatic SVG rendering of the three-arc logo at any size |

### 🚧 In Progress (Mock / Placeholder)

| Feature | Status |
|---|---|
| **Midnight Wallet Integration** | UI complete; `connectWallet()` returns a mock address after 1.5s |
| **Credential Issuance On-Chain** | UI complete; `issueCredential()` is a 2s timeout stub |
| **Credential Revocation On-Chain** | UI complete; `revokeCredential()` is a 1.5s timeout stub |
| **ZK Proof Generation** | UI and animation complete; `generateProof()` returns a mock proof JSON |
| **On-Chain Proof Verification** | UI complete; `verifyProof()` validates by checking for `zkp_v1` prefix |

### ⏳ Planned

| Feature | Notes |
|---|---|
| Real Midnight SDK integration | Replace all stub functions with actual Midnight contract calls |
| Production RBAC | Server-side role validation; JWT or wallet-based sessions |
| Credential revocation registry | On-chain registry queryable during verification |
| Audit logging | Immutable log of all credential and proof events |
| QR code generation | Scannable QR for mobile proof sharing |
| Multi-language support | i18n for international clinical trial use |
| End-to-end testing | Playwright or Cypress test suite |
| CI/CD pipeline | Automated build, lint, and test on push |

---

## 3. Screenshots

> Screenshots will be added after the hackathon demo recording.

```
docs/
├── landing-page.png
├── auth-page.png
├── sponsor-dashboard.png
├── sponsor-issue-credential.png
├── sponsor-history-table.png
├── patient-dashboard.png
├── patient-proof-generation.png
├── verifier-dashboard.png
└── verifier-result-panel.png
```

---

## 4. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI component framework |
| TypeScript | 5.x | Type safety across the entire codebase |
| Vite | 6.3.5 | Build tool and development server |
| Tailwind CSS | 4.1.12 | Utility-first styling with custom design tokens |
| Motion (`motion/react`) | 12.23.24 | Component entrance and interaction animations |
| Sonner | 2.0.3 | Toast notification system |
| Lucide React | 0.487.0 | Icon library |

### UI Component Primitives

| Package | Purpose |
|---|---|
| `@radix-ui/*` (27 packages) | Accessible headless UI primitives (Dialog, Tabs, Select, etc.) |
| `class-variance-authority` | Component variant management |
| `tailwind-merge` | Conditional Tailwind class merging |
| `clsx` | Conditional class name utility |

### Fonts (Google Fonts)

| Font | Usage |
|---|---|
| **Manrope** | Display headings, brand marks, stat numbers |
| **DM Sans** | Body text, labels, UI copy |
| **JetBrains Mono** | Proof JSON code blocks, wallet addresses |

### Blockchain (Planned)

| Technology | Role |
|---|---|
| Midnight | Privacy-first blockchain with confidential smart contracts |
| Zero-Knowledge Proofs | Midnight's ZK proving system for credential verification |
| Confidential Smart Contracts | On-chain state encryption for credential storage |

---

## 5. Folder Structure

```
/workspaces/default/code/
│
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Root component — all pages and dashboards
│   │   └── components/
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx   # Image component with error fallback
│   │       └── ui/                   # Radix UI + shadcn component wrappers
│   │           ├── accordion.tsx
│   │           ├── alert-dialog.tsx
│   │           ├── badge.tsx
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── dialog.tsx
│   │           ├── input.tsx
│   │           ├── select.tsx
│   │           ├── table.tsx
│   │           ├── tabs.tsx
│   │           └── ... (27 total)
│   │
│   ├── styles/
│   │   ├── fonts.css                 # Google Fonts @import declarations
│   │   ├── globals.css               # Global base styles
│   │   ├── index.css                 # Tailwind entry point + @theme inline mappings
│   │   ├── tailwind.css              # Tailwind directives
│   │   └── theme.css                 # CIPHER design tokens (colors, radius, fonts)
│   │
│   └── imports/
│       ├── CIPHER_Final_Logo.png     # Official CIPHER logo asset
│       └── pasted_text/              # Prompt and requirements documents
│           ├── master-frontend-prompt.md
│           ├── cipher-ui-ux-redesign.md
│           └── readme-generator.md
│
├── guidelines/
│   └── Guidelines.md                 # Design system guidelines (generated)
│
├── package.json                      # Dependencies and scripts
├── pnpm-lock.yaml                    # Lockfile (pnpm)
├── vite.config.ts                    # Vite configuration
├── postcss.config.mjs                # PostCSS configuration
└── README.md                         # This file
```

### Directory Purpose Summary

| Directory | Purpose |
|---|---|
| `src/app/` | Root application component and all page/dashboard logic |
| `src/app/components/ui/` | Reusable Radix UI + shadcn component wrappers |
| `src/app/components/figma/` | Utilities for Figma-imported assets |
| `src/styles/` | Design tokens, Tailwind configuration, font imports |
| `src/imports/` | Logo asset and project requirement documents |
| `guidelines/` | Auto-generated design system documentation |

---

## 6. Component Documentation

All components currently live in `src/app/App.tsx` as a single-file architecture optimized for hackathon iteration speed. Below are the major logical components.

---

### `CipherLogo`

**Purpose:** Renders the official CIPHER logo as a programmatic SVG at any size.

**Responsibilities:**
- Draws three concentric C-shaped arcs using SVG path commands
- Applies the brand gradient (deep blue → royal blue → bright cyan)
- Renders the selective-disclosure accent mark
- Scales cleanly from 18px (sidebar) to 120px+ (hero)

**Props:** `size?: number` (default: 36)

---

### `Navbar`

**Purpose:** Fixed top navigation bar present across all views.

**Responsibilities:**
- Renders the CIPHER logo and wordmark
- Shows contextual nav links (landing) or user info + sign-out (dashboard)
- Collapses to a hamburger menu on mobile
- Maintains glassmorphism blur effect over page content

**Props:** `user`, `onSignIn`, `onGetStarted`, `onLogout`, `onNavigate`

---

### `LandingPage`

**Purpose:** Full-page marketing site for unauthenticated users.

**Responsibilities:**
- Hero section with animated gradient headline and CTA buttons
- "How It Works" 3-step flow (Sponsor → Patient → Verifier)
- "Why CIPHER" privacy value proposition section
- Features grid (6 capability cards)
- Technology stack cards
- CTA banner and footer
- Decorative large SVG arcs as background visual elements

---

### `AuthPage`

**Purpose:** Combined sign-in and sign-up page with role selection.

**Responsibilities:**
- Toggle between Sign In and Create Account modes
- Role selector (Sponsor / Patient / Verifier) for new accounts
- Password show/hide toggle
- Demo credentials panel with one-click auto-fill
- Calls `onSuccess(user)` to route into the appropriate dashboard

---

### `DashboardLayout`

**Purpose:** Shared layout shell for all three role dashboards.

**Responsibilities:**
- Sticky sidebar navigation with user info, nav items, and CIPHER branding
- `h-[calc(100vh-64px)]` sticky sidebar prevents content clipping on any viewport
- Mobile hamburger + overlay sidebar
- Accepts `navItems`, `activeTab`, and `onTabChange` for role-specific navigation
- Renders `children` in the scrollable main content area

**Props:** `user`, `navItems`, `activeTab`, `onTabChange`, `children`

---

### `SponsorDashboard`

**Purpose:** Administrative control center for credential issuance and management.

**Tabs:**
| Tab | Description |
|---|---|
| Dashboard | Stats overview + recent activity + quick actions |
| Issue Credential | Form: wallet address, trial ID, credential type, expiration |
| Revoke Credential | Search, status filter, reason selector, confirmation modal |
| Credential History | Paginated + searchable + filterable data table (8 mock records, 5/page) |
| Settings | Notification and privacy preference toggles |

**Mock Blockchain Calls:** `connectWallet()`, `issueCredential()`, `revokeCredential()`

---

### `PatientDashboard`

**Purpose:** Patient-facing interface for viewing credentials and generating ZK proofs.

**Tabs:**
| Tab | Description |
|---|---|
| Dashboard | Stats cards + credential summary + activity preview |
| My Credentials | Credential cards with type, status, trial, sponsor, privacy level |
| Generate Proof | 4-step guided flow (see below) |
| Activity | Chronological event timeline |
| Settings | Notification and privacy preference toggles |

**4-Step Proof Flow:**
1. **Select Credential** — Choose from active credential cards
2. **Choose Purpose** — Insurance Claim / Research Enrollment / Benefits / Academic
3. **Generate Proof** — Animated spinning arcs + `generateProof()` call
4. **Download & Share** — Copy JSON / Download JSON / QR Code (WIP)

---

### `VerifierDashboard`

**Purpose:** Proof verification interface for insurers, researchers, and institutions.

**Tabs:**
| Tab | Description |
|---|---|
| Dashboard | Stats + recent verifications + privacy guarantee summary |
| Verify Proof | 3-panel layout (Input / Stepper / Result) |
| Verification History | Paginated + searchable + filterable table |
| Settings | Notification and privacy preference toggles |

**3-Panel Verify UI:**
- **Left:** Paste proof JSON or upload `.json` file
- **Center:** 5-step animated stepper (Receiving → Signature → ZK → Revocation → Complete)
- **Right:** Result badge (Valid / Invalid) + privacy disclosure breakdown

---

### `SettingsPanel`

**Purpose:** Shared settings UI reused across all three dashboards.

**Responsibilities:**
- Notification preferences toggles (email, proof alerts, weekly digest)
- Privacy settings toggles (never store proofs, anonymous analytics)
- Non-functional in current demo build (visual state only)

---

### Primitive Components

| Component | Description |
|---|---|
| `PrimaryBtn` | Gradient CTA button with loading spinner |
| `GhostBtn` | Outlined secondary button |
| `Card` | Rounded surface card with optional glow shadow |
| `StatCard` | Metric card with icon, value, and label |
| `StatusBadge` | Colored pill badge for Active / Revoked / Valid / Invalid / Pending |
| `InputField` | Labeled text input with optional monospace mode |
| `SelectField` | Labeled select dropdown with custom chevron |
| `GradientText` | Blue-to-cyan gradient text span |
| `ConfirmModal` | Full-screen confirmation dialog with cancel/confirm |
| `DecorativeArcs` | Full-SVG background decoration using the CIPHER logo motif |

---

## 7. Application Architecture

### View State Machine

CIPHER uses React `useState` for top-level view routing — no URL router is used in the current build, enabling zero-config deployment as a static SPA.

```
App (root state: view, user)
│
├── view = "landing"
│     └── LandingPage
│           └── CTAs → setAuthMode + setView("auth")
│
├── view = "auth"
│     └── AuthPage
│           └── onSuccess(user) → setUser + setView("dashboard")
│
└── view = "dashboard"
      ├── user.role === "sponsor"  → SponsorDashboard
      ├── user.role === "patient"  → PatientDashboard
      └── user.role === "verifier" → VerifierDashboard
```

### Midnight Integration Points

Each blockchain operation has a dedicated stub function. Replace the function body with the actual Midnight SDK call when the integration is ready:

```typescript
// src/app/App.tsx

const connectWallet   = (): Promise<string>  => { /* TODO: Midnight wallet SDK */ }
const issueCredential = (...): Promise<bool> => { /* TODO: Midnight contract call */ }
const revokeCredential= (...): Promise<bool> => { /* TODO: Midnight contract call */ }
const generateProof   = (): Promise<string>  => { /* TODO: Midnight ZK proving system */ }
const verifyProof     = (...): Promise<...>  => { /* TODO: Midnight verification contract */ }
```

### Data Flow for Proof Verification

```
Patient Wallet
    │
    │  (encrypted credential stored on Midnight)
    ▼
Patient Dashboard → generateProof()
    │
    │  ZK proof JSON (no private data)
    ▼
Verifier Dashboard → verifyProof(proof)
    │
    │  submits to Midnight verification contract
    ▼
Midnight Smart Contract
    │
    │  returns: valid | invalid
    ▼
Verifier sees: "Valid Clinical Trial Participant"
               Identity: Hidden
               Condition: Hidden
               Trial Details: Hidden
```

---

## 8. User Roles

### Sponsor

**Examples:** Hospitals, pharmaceutical companies, research institutions

**Responsibilities:**
- Issue cryptographic credentials to patient wallets
- Revoke credentials when trial status changes
- Monitor all issued and revoked credentials

**Dashboard Features:**
- Stats: Credentials Issued / Active / Revoked / Active Trials
- Issue Credential form (wallet address, trial ID, type, expiry)
- Revoke Credential with reason selection and confirmation
- Credential History table with search, filter, pagination

**Demo Account:**
```
Email:    sponsor@cipher.com
Password: Sponsor123
```

---

### Patient

**Responsibilities:**
- Connect Midnight wallet to receive credentials
- View credential status
- Generate Zero-Knowledge Proofs from credentials
- Share proofs with verifiers

**Dashboard Features:**
- Credential cards with full metadata
- 4-step guided proof generation flow
- Proof export (JSON download, clipboard copy)
- Activity timeline of all credential events

**Demo Account:**
```
Email:    patient@cipher.com
Password: Patient123
```

---

### Verifier

**Examples:** Insurance companies, universities, government agencies, research organizations

**Responsibilities:**
- Receive proof JSON from patients
- Submit proofs to the Midnight verification contract
- Record verification outcomes

**Dashboard Features:**
- 3-panel verification UI (input / animated stepper / result)
- Result panel with explicit privacy disclosure breakdown
- Verification History table with search and filter

**Demo Account:**
```
Email:    verifier@cipher.com
Password: Verifier123
```

---

## 9. Demo Flow

The full hackathon demo can be completed in under 2 minutes.

### Step-by-Step

**1. Sign In as Sponsor**
- Navigate to the app → click **Get Started** or **Sign In**
- Click the **Sponsor** demo account to auto-fill → **Sign In**
- Connect wallet (mock: resolves in ~1.5s)

**2. Issue a Credential**
- Go to **Issue Credential** tab
- Enter any wallet address (e.g. `mn1_0x1234...abcd`)
- Set Trial ID: `NCT-2024-0041`, Type: `Clinical Trial`
- Click **Issue Credential** — watch the toast and history update

**3. Sign In as Patient**
- Sign out → Sign In → click **Patient** demo account
- Connect wallet

**4. Generate a Proof**
- Go to **Generate Proof** tab
- **Step 1:** Select a credential
- **Step 2:** Choose `Insurance Claim` as purpose
- **Step 3:** Click **Generate Proof** — watch the animated arcs
- **Step 4:** Copy or download the proof JSON

**5. Sign In as Verifier**
- Sign out → Sign In → click **Verifier** demo account

**6. Verify the Proof**
- Go to **Verify Proof** tab
- Paste the proof JSON into the input panel
- Click **Verify Proof** — watch the 5-step stepper animate
- See the result: **Valid Clinical Trial Participant**
- Observe: Identity / Condition / Hospital / Trial Details all marked **Hidden**

### What This Demonstrates
- The complete CIPHER privacy guarantee end-to-end
- That a verifier can confirm participation without accessing any sensitive data
- That Zero-Knowledge Proofs enable selective disclosure at the cryptographic level

---

## 10. Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm (recommended) or npm

### Installation

```bash
git clone <repository-url>
cd cipher
pnpm install
```

### Development Server

```bash
pnpm run build   # build only (see note below)
```

> **Note:** This project is currently configured as a Figma Make project and uses Vite's build command. For local development preview, run `pnpm run build` and serve the `dist/` folder, or use `vite preview` directly:

```bash
npx vite build && npx vite preview
```

### Open in Browser

```
http://localhost:4173
```

---

## 11. Environment Variables

No environment variables are currently required. The application runs fully client-side with mock blockchain functions.

When Midnight integration is added, the following variables will be needed:

```env
# Future — not yet implemented
VITE_MIDNIGHT_RPC=
VITE_MIDNIGHT_CONTRACT_ADDRESS=
VITE_MIDNIGHT_PROVER_URL=
VITE_API_URL=
```

---

## 12. Project Scripts

Extracted from `package.json`:

| Script | Command | Description |
|---|---|---|
| Build | `pnpm run build` | Compiles TypeScript and bundles with Vite for production |

> Additional scripts (dev server, lint, test, preview) can be added to `package.json` as the project grows.

---

## 13. Design System

All design tokens are defined in `src/styles/theme.css` and consumed via Tailwind CSS 4 custom properties.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--background` | `#0B132B` | Page background — deep navy |
| `--foreground` | `#e2eaf8` | Default text |
| `--card` | `#101c3d` | Card and panel surfaces |
| `--primary` | `#3B5BFF` | Primary buttons, active nav, brand blue |
| `--accent` | `#4FCBFF` | Bright cyan — ZK proof / verification / innovation |
| `--secondary` | `#132040` | Subdued surfaces, input backgrounds |
| `--muted-foreground` | `#5e6e9e` | Labels, captions, placeholder text |
| `--border` | `rgba(59,91,255,0.18)` | Hairline borders |
| `--destructive` | `#E03550` | Errors, revoked credentials |
| `--sidebar` | `#090f24` | Sidebar background |

### Brand Gradient

```css
linear-gradient(135deg, #3B5BFF 0%, #4A63FF 50%, #4FCBFF 100%)
```

Symbolizes: **Private Data → Encrypted Credential → Verified Proof**

### Semantic Colors (not tokens — used inline)

| Constant | Value | Usage |
|---|---|---|
| `SUCCESS` | `#22C55E` | Active credentials, verified proofs, success states |
| `DANGER` | `#E03550` | Revoked credentials, invalid proofs, errors |

### Typography

| Font | Weight | Usage |
|---|---|---|
| **Manrope** | 600–800 | Headings (h1–h4), stat numbers, section titles |
| **DM Sans** | 300–600 | Body text, UI labels, descriptions |
| **JetBrains Mono** | 400–500 | Proof JSON, wallet addresses, credential IDs |

### Border Radius

| Token | Value |
|---|---|
| `--radius` | `0.875rem` (14px) |
| `--radius-sm` | `0.625rem` (10px) |
| `--radius-md` | `0.75rem` (12px) |
| `--radius-lg` | `0.875rem` (14px) |
| `--radius-xl` | `1.125rem` (18px) |

Card components use `rounded-2xl` (16px) for a premium enterprise feel.

### Shadows

- **Cards (default):** `0 1px 0 rgba(255,255,255,0.03) inset`
- **Cards (glow):** `0 0 40px rgba(59,91,255,0.10), 0 1px 0 rgba(255,255,255,0.03) inset`
- **Verification result (valid):** `0 0 32px rgba(34,197,94,0.25)`

### Animations

| Animation | Duration | Usage |
|---|---|---|
| Component entrance | 250ms ease | All tab panel switches |
| Proof generation arcs | 1.5–3s linear infinite | ZK proof computing state |
| Step indicator | 550ms per step | Verification stepper |
| Modal entrance | 180ms ease | Confirmation dialogs |
| Hover transitions | 200ms | Buttons, cards, nav items |

### Dark Mode

The application is permanently dark-themed. `--background: #0B132B` is set in `:root`. A `.dark` CSS block is maintained for forward compatibility with system theme detection.

---

## 14. Routing

The current build uses **React state-based navigation** (no URL router). Views are controlled by a `view` state variable in the root `App` component.

| State Value | Description | Access |
|---|---|---|
| `"landing"` | Marketing landing page | Public |
| `"auth"` | Sign In / Create Account | Public |
| `"dashboard"` (role: sponsor) | Sponsor administrative dashboard | Sponsor |
| `"dashboard"` (role: patient) | Patient credential and proof dashboard | Patient |
| `"dashboard"` (role: verifier) | Verifier proof submission dashboard | Verifier |

### Dashboard Tabs (Sponsor)

| Tab ID | Label |
|---|---|
| `dashboard` | Dashboard overview |
| `issue` | Issue Credential |
| `revoke` | Revoke Credential |
| `history` | Credential History |
| `settings` | Settings |

### Dashboard Tabs (Patient)

| Tab ID | Label |
|---|---|
| `dashboard` | Dashboard overview |
| `credentials` | My Credentials |
| `proof` | Generate Proof |
| `activity` | Activity |
| `settings` | Settings |

### Dashboard Tabs (Verifier)

| Tab ID | Label |
|---|---|
| `dashboard` | Dashboard overview |
| `verify` | Verify Proof |
| `history` | Verification History |
| `settings` | Settings |

> **Planned:** Migrate to `react-router` v7 (already installed) for URL-based routing, enabling deep linking and browser history support.

---

## 15. Current Project Status

| Feature | Status |
|---|---|
| Landing Page | ✅ Complete |
| Authentication (demo) | ✅ Complete |
| Role-Based Dashboard Routing | ✅ Complete |
| Sponsor Dashboard | ✅ Complete |
| Patient Dashboard | ✅ Complete |
| Verifier Dashboard | ✅ Complete |
| CIPHER SVG Logo | ✅ Complete |
| Design System / Tokens | ✅ Complete |
| Responsive Layout | ✅ Complete |
| Toast Notifications | ✅ Complete |
| Confirmation Modals | ✅ Complete |
| Data Tables (paginated) | ✅ Complete |
| 4-Step Proof Flow UI | ✅ Complete |
| ZK Stepper Animation | ✅ Complete |
| Settings Panel | ✅ Complete (non-functional) |
| Midnight Wallet Integration | 🚧 Mock only |
| Credential Issuance On-Chain | 🚧 Mock only |
| Credential Revocation On-Chain | 🚧 Mock only |
| ZK Proof Generation | 🚧 Mock only |
| On-Chain Proof Verification | 🚧 Mock only |
| QR Code Generation | 🚧 Button present, not implemented |
| URL-Based Routing | ⏳ Planned |
| Real Auth / Session Management | ⏳ Planned |
| Deployment | ⏳ Planned |

**Legend:** ✅ Complete &nbsp;&nbsp; 🚧 Work in Progress &nbsp;&nbsp; ⏳ Planned

---

## 16. Future Enhancements

| Enhancement | Priority | Notes |
|---|---|---|
| Real Midnight SDK integration | High | Replace all 5 stub functions in `App.tsx` |
| URL-based routing | High | Migrate to `react-router` v7 (already in `package.json`) |
| Production authentication | High | Wallet-signature auth or JWT session |
| Credential revocation registry | High | On-chain registry checked during verification |
| QR code generation | Medium | `qrcode` or `qrcode.react` library |
| Multi-file component architecture | Medium | Split `App.tsx` into `/pages`, `/components`, `/hooks`, `/services` |
| Audit log | Medium | Tamper-proof log of all credential and proof events |
| Real-time credential status | Medium | Websocket or polling for on-chain status changes |
| Accessibility (WCAG 2.1 AA) | Medium | Full keyboard navigation, screen reader support |
| Multi-language support | Low | i18n for international clinical trial contexts |
| End-to-end test suite | Low | Playwright covering the full demo flow |
| CI/CD pipeline | Low | GitHub Actions for lint, build, and deploy |

---

## 17. Team

| Role | Contributor |
|---|---|
| Frontend Developer | — |
| Blockchain / Midnight Developer | — |
| Smart Contract Developer | — |
| Product / Design | — |

---

## 18. License

License TBD. All rights reserved pending hackathon submission review.

---

<div align="center">
  <p>Built with ❤️ for the <strong>Midnight Hackathon</strong></p>
  <p><em>"You can prove something important without revealing anything private."</em></p>
  <br />
  <img src="src/imports/CIPHER_Final_Logo.png" alt="CIPHER" width="48" />
</div>
