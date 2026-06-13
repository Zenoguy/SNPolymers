# Architecture & Security Audit: Caching Policies Assessment
**Project:** S.N. Polymers - Integrated Digital Business Platform (IDBP)  
**Date:** June 13, 2026  
**Status:** Audit Completed - Recommendations Documented

---

## 1. Executive Summary
A comprehensive audit was performed across the **S.N. Polymers IDBP** codebase (frontend and backend) to assess implemented caching strategies. 

**Key Finding:**  
There are **no custom caching policies or mechanisms** implemented in the backend code, database access layer, or client-side API integrations. Every request for projects, reports, and materials initiates a live query to the Supabase database. While this ensures real-time consistency of operational and financial data, the lack of caching strategy exposes the platform to database connection exhaustion and unnecessary compute charges on Render/Supabase.

---

## 2. Backend API Caching Audit

### A. HTTP Caching Headers
* **Default Status:** The backend (`app.js`) utilizes `helmet()` middleware which sets default HTTP headers to secure Express apps.
* **Findings:** No custom `Cache-Control` headers (e.g., `private`, `max-age`, `must-revalidate`) are explicitly declared on any router or controller response.
* **Result:** Client browsers and reverse proxies default to basic heuristic caching, which typically instructs clients not to cache dynamic API responses, or relies entirely on Vercel/Render edge configurations.

### B. Server-Side Data Caching
* **Default Status:** Node.js memory caches, Redis, or in-memory stores (like `node-cache` or `lru-cache`) are **completely absent** from the backend dependencies and logic.
* **Impact:** High-volume read queries (e.g., `/materials/categories` and list views) require full table scans on PostgreSQL via Supabase on every single request.

---

## 3. Database Layer (Supabase) Caching
* **PgBouncer / Supavisor:** Supabase implements connection pooling natively, which mitigates connection overhead but does not cache query result blocks.
* **Query Execution:** Every API call directly touches the underlying PostgreSQL tables, compiling and running the query planning engine dynamically.

---

## 4. Frontend & Client-Side Caching Audit

### A. Axios Client Configuration (`authApi.js`)
* **Findings:** The Axios client wrapper runs without caching interceptors or local storage caching mechanisms.
* **Result:** Re-mounting pages or triggering state changes causes components to repeatedly trigger network requests to the backend for the same static/slow-moving configurations (like material categories).

### B. Static Assets Caching (Vercel Edge)
* **Status:** Built-in Vercel edge caching rules.
* **Behavior:** React production bundles (JS, CSS, HTML, fonts) are heavily cached at Vercel's global Edge CDN, utilizing hashed filenames to invalidate cache blocks on new deployments. This is secure and optimal.

---

## 5. Risk Assessment & Architectural Concerns

### A. Over-Fetching of Slow-Moving Data
Endpoints like `GET /api/materials/categories` query database rows to build an in-memory unique list of categories in JavaScript. Since categories change very rarely, requesting this on every page mount results in wasteful database CPU cycles.

### B. Sensitive Financial Reports Cache Poisoning Risk
Dynamic endpoints containing financial records (`/api/v1/auth/reports`) must **never** be cached by public proxy servers. The current absence of explicit `Cache-Control: no-store, no-cache, must-revalidate` headers means that if proxy server rules are misconfigured or if intermediate CDN layers are introduced, dynamic data could be cached and leaked to unauthorized users.

---

## 6. Recommendations & Mitigation Plan

### 1. Implement Explicit `No-Cache` Headers for Sensitive API Endpoints
Ensure that dynamic API routes explicitly direct proxies and browsers never to cache sensitive project data:
```javascript
// Middleware to prevent caching of dynamic data
function noCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}
app.use('/api/v1/auth', noCache);
```

### 2. Introduce In-Memory Caching for Material Categories
Use a simple in-memory cache (e.g., `lru-cache` or a simple TTL variable cache) for the list of categories since they change infrequently:
```javascript
let categoryCache = null;
let cacheExpiry = 0;

async function getMaterialCategories(req, res) {
  if (categoryCache && Date.now() < cacheExpiry) {
    return res.status(200).json({ success: true, ...categoryCache });
  }
  // Retrieve from DB, set cache with a 10-minute expiry
}
```

### 3. Implement Client-Side React Query or SWR
For the React frontend, consider migrating to a library like **TanStack Query (React Query)** or **SWR**. These libraries cache backend API responses client-side and support stale-while-revalidate states, keeping the UI fast and eliminating duplicate concurrent API queries when navigations happen.
