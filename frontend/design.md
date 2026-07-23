# SN Polymers ERP — Design System & Visual Specification

This document details the visual identity, design tokens, color palettes, glassmorphism specifications, typography, and component styling guidelines for the **SN Polymers ERP** application.

---

## 1. Aesthetic Identity

The design system combines **Apple-grade Glassmorphism** (translucent frosted panels, dynamic ambient glows, subtle micro-animations) with **Oracle-grade Enterprise Precision** (dense data grids, high contrast typography, monospaced numerical metrics).

### Key Aesthetic Principles
- **Vibrant & Translucent**: Deep layered backgrounds with subtle radial gradients and ambient glow blurs (`blur-3xl`).
- **Tactile Micro-Interactions**: Hover transformations (`translate-y-[-2px]`), subtle glow shadows, and interactive state feedback on cards and buttons.
- **Strict High-Contrast Typography**: Crisp contrast across both Dark and Light themes to guarantee maximum legibility for financial numbers and work order metadata.

---

## 2. Theme Palettes & Color Tokens

### 2.1 Dark Theme Palette (Default)
| Element | Color Code / Value | Description |
| :--- | :--- | :--- |
| **Page Background** | `#050810` | Sleek deep midnight navy |
| **Ambient Radial Glow 1** | `rgba(99, 102, 241, 0.08)` | Top-left indigo ambient light ray |
| **Ambient Radial Glow 2** | `rgba(245, 158, 11, 0.04)` | Bottom-right amber warm accent |
| **Glass Panel Background** | `rgba(15, 23, 42, 0.30)` | 70% translucent dark slate overlay |
| **Glass Border** | `rgba(255, 255, 255, 0.08)` | Thin subtle frosted border |
| **Primary Text** | `#f8fafc` (`slate-50`) | Crisp white text |
| **Secondary Text** | `#94a3b8` (`slate-400`) | Soft muted slate text |
| **Accent Text / Highlights**| `#f59e0b` (`amber-500`) | Warm enterprise amber |

### 2.2 Light Theme Palette
| Element | Color Code / Value | Description |
| :--- | :--- | :--- |
| **Page Background** | `#f8fafc` | Clean soft slate white |
| **Ambient Radial Glow 1** | `rgba(99, 102, 241, 0.08)` | Soft indigo ambient lighting |
| **Ambient Radial Glow 2** | `rgba(245, 158, 11, 0.06)` | Warm amber highlight |
| **Glass Panel Background** | `linear-gradient(135deg, rgba(255,255,255,0.45), rgba(241,245,249,0.35))` | Translucent frosted light glass |
| **Glass Border** | `rgba(255, 255, 255, 0.8)` | Bright subtle outline border |
| **Primary Text** | `#0f172a` (`slate-900`) | Deep slate black text |
| **Secondary Text** | `#475569` (`slate-600`) | High-contrast mid-slate text |
| **Accent Text / Highlights**| `#b45309` (`amber-700`) | High-contrast warm amber brown |

### 2.3 Semantic Status & Role Tokens
- **Amber (`amber-500` / `#f59e0b`)**: Primary brand identity, pending status, active tabs, currency highlights.
- **Emerald (`emerald-500` / `#10b981`)**: Approved requisitions, active projects, positive balances, active sessions.
- **Rose (`rose-500` / `#ef4444`)**: Cancelled items, closed projects, destructive actions, danger alerts.
- **Indigo (`indigo-500` / `#6366f1`)**: Admin role badges, secondary system metrics, analytical twins.

---

## 3. Glassmorphism & Elevation Tokens

### 3.1 `.glass-panel`
Core class for modal containers, main data card sections, and analytics grids.
```css
/* Dark Mode */
.glass-panel {
  background: rgba(15, 23, 42, 0.30);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Light Mode Override */
body.light .glass-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(241, 245, 249, 0.35) 100%) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
}
```

### 3.2 `.glass-nav`
Floating header bar and persistent sidebar drawer.
```css
body.light .glass-nav,
body.light header.glass-nav,
body.light aside.glass-nav {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(248, 250, 252, 0.2) 100%) !important;
  backdrop-filter: blur(16px) saturate(180%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.7) !important;
}
```

### 3.3 `.glass-card-hover`
Interactive cards with elevation on hover.
- **Hover behavior**: `transform: translateY(-2px);`
- **Border glow**: Warm amber tint outline on focus/hover.

---

## 4. Typography & Fonts

### 4.1 Font Families
1. **Primary UI Font (`font-sans`)**: Inter / Outfit / System Sans-Serif. Used for labels, headings, body text, and buttons.
2. **Technical / Monospace Font (`font-mono`)**: JetBrains Mono / System Monospace. Mandatory for:
   - Work Order numbers (`WO-WB_KOL_01`)
   - Estimate IDs (`EST_CAP_40e8dfb0`)
   - Currency amounts (`₹ 1,28,000.00`)
   - Timestamps and dates (`22 Jul 2026, 8:20 pm`)

### 4.2 Type Hierarchy
- **Page Titles**: `text-3xl font-extrabold tracking-tight text-slate-100` (Dark) / `text-slate-900` (Light).
- **Module Kicker**: `text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono`.
- **Card Headers**: `text-sm font-extrabold uppercase tracking-widest`.
- **Table Headers**: `text-[10px] font-black uppercase tracking-widest text-slate-400`.
- **Stat Metric Cards**: `text-3xl font-black tabular-nums`.

---

## 5. Component Styling Specifications

### 5.1 Buttons (`<Button />`)
- **Primary Button**: Amber background (`bg-amber-500 hover:bg-amber-400`), dark text (`text-slate-950 font-extrabold`), subtle amber shadow (`shadow-amber-500/20`).
- **Glass / Secondary Button**: Translucent background (`bg-white/10 hover:bg-white/20`), white/slate text, border (`border-white/15`).
- **Danger Button**: Translucent rose background (`bg-rose-500/20 hover:bg-rose-500`), rose text (`text-rose-300 hover:text-white`).

### 5.2 Form Inputs (`<Input />`, `<Select />`, `<TextArea />`)
- **Glass Inputs**: Semi-transparent dark/light fill, rounded (`rounded-2xl` / `rounded-xl`), smooth border transitions.
- **Focus Indicator**: Amber ring glow (`box-shadow: 0 0 15px rgba(245, 158, 11, 0.15)`).

### 5.3 Pagination Controls (`<Pagination />`)
- Maximum **5 visible page numbers** at a time in a sliding window flanked by `‹ Prev` and `Next ›`.
- Active page button: Solid Amber fill (`bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30`).

### 5.4 Skeleton Loaders (`<SkeletonTable />`, `<SkeletonCard />`)
- Animated pulsing glass placeholders (`animate-pulse bg-white/5 rounded-xl`) matching table rows and metric cards during React Query loading states.
