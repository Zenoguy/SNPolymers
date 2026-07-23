# SN Polymers ERP — Frontend Engineering Guidelines

This document outlines the mandatory frontend engineering standards, architectural principles, and component design rules for the **SN Polymers ERP** application. All developers and AI coding agents must adhere strictly to these rules.

---

## 1. Core Architectural Philosophy

### 1.1 Zero Ad-Hoc Components Policy
- **Never duplicate UI primitives**: Page components (`src/pages/*`) must **NEVER** write ad-hoc pagination controls, custom loading spinners, raw modal backdrop overlays, or manual table header elements inline.
- **Single Source of Truth**: All primitive UI components must be imported directly from `src/components/ui/` (e.g., `<Pagination />`, `<SkeletonTable />`, `<Modal />`, `<Button />`, `<Badge />`, `<Input />`).
- **Refactoring Requirement**: If an ad-hoc pattern is discovered in any page file, it must be refactored to use the centralized UI library immediately.

### 1.2 Non-Destructive Refactoring & Scope Discipline
- **Preserve Existing Functionality**: Adding a new feature or refining a style must **NEVER** break, strip away, or alter unrelated components or global design tokens.
- **Isolated CSS Scope**: Never use aggressive, sweeping CSS overrides (such as `body.light nav { ... !important }`) that accidentally target nested elements inside persistent containers like `<Sidebar />`, `<Header />`, or `<Modal />`.
- **Theme Equivalence**: Modifications to Dark Mode must have matching, fully readable counterparts in Light Mode without sacrificing backdrop blur or text contrast.

---

## 2. Component Hierarchy & Directory Structure

```
src/
├── api/                  # API service modules (Axios calls & React Query logic)
├── components/
│   ├── ui/               # Centralized Primitive UI Components ONLY
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── TextArea.jsx
│   │   ├── Select.jsx
│   │   ├── Checkbox.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Pagination.jsx
│   │   └── index.js      # Central export hub for all UI components
│   ├── AuthContext.jsx   # Global Authentication & Session State
│   ├── ThemeContext.jsx  # Theme Switcher & Background Preset Manager
│   ├── ModalContext.jsx  # Global Modal Overlay State (Hides Dock when active)
│   ├── ProtectedRoute.jsx
│   └── Sidebar.jsx       # Responsive Glassmorphic Drawer & Dock Navigation
├── pages/                # High-level domain pages (Consumes src/components/ui)
├── index.css             # Tailwind Directives & Core Design Tokens
└── main.jsx
```

---

## 3. Component Development Rules

### 3.1 UI Component Exports & Imports
All UI primitives must be exported from `src/components/ui/index.js` and imported as named imports:
```javascript
// ✅ CORRECT
import { Button, Input, Modal, Table, SkeletonTable, Pagination } from '../components/ui';

// ❌ INCORRECT - Avoid direct pathing or duplicating markup
import Button from '../components/ui/Button';
```

### 3.2 Pagination Implementation Standard
All paginated data tables must use the `<Pagination />` primitive:
```javascript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  maxVisible={5}              // Maximum visible page number buttons (sliding window)
  showLabel={true}            // Optional "Page X of Y" textual indicator
  totalRecords={totalCount}   // Optional total record count label
/>
```
- **Rule**: Never construct manual `Array.from({ length: totalPages })` mapping loops inside page files.

### 3.3 Skeleton Loading Standard
Raw CSS spinner divs (`animate-spin`) are strictly prohibited for data loading states. Always use the skeleton loading suite:
- **Tables**: `<SkeletonTable rows={6} cols={8} />`
- **Cards & Checklists**: `<SkeletonCard />`
- **Full Views / Auth Checks**: `<SkeletonPage />`

---

## 4. State Management & Data Fetching

1. **Server State**: Managed exclusively via `@tanstack/react-query` (`useQuery`, `useMutation`).
   - Use descriptive `queryKey` arrays (e.g., `['requisitions']`, `['projects']`).
   - Always invalidate queries (`queryClient.invalidateQueries`) after successful mutations.
2. **Global Client State**: Restricted to Context Providers (`AuthContext`, `ThemeContext`, `ModalContext`).
3. **Local Component State**: Restricted strictly to component-specific UI interactions (e.g., modal visibility `isOpen`, search filter inputs, active tab states).

---

## 5. CSS & Styling Rules

### 5.1 Inline CSS Restriction
- **No Hardcoded Inline Styles**: Do not use `style={{ background: '#123', color: '#fff' }}` inside React JSX.
- **Allowed Exception**: Inline styles are permitted only for dynamic, calculated values (e.g., dynamic chart dimensions, progress bar percentage widths).

### 5.2 Tailwind & Utility Class Scoping
- Combine Tailwind utility classes for layout, flexbox, grid, spacing, and sizing.
- Use predefined global utility classes (`.glass-panel`, `.glass-input`, `.glass-nav`, `.glass-card-hover`) defined in `src/index.css` for background glassmorphism.

---

## 6. Pre-Commit & Verification Checklist

Before completing any feature or bugfix turn:
1. **Production Build**: Execute `npm run build` inside `frontend/` to ensure zero compilation or syntax errors.
2. **Responsive & Drawer Check**: Verify that `<Sidebar />` operates cleanly on both desktop (`md:flex`) and mobile drawer view (`md:hidden`).
3. **Dual Theme Verification**: Toggle between Dark Mode and Light Mode to verify text contrast, badge legibility, and translucent glass aesthetics.
