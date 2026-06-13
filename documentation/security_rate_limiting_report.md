# Security Assessment Report: API Rate Limiting & Database Query Cost Audit
**Project:** S.N. Polymers - Integrated Digital Business Platform (IDBP)  
**Date:** June 13, 2026  
**Status:** Findings Documented & Remediation Plan Proposed

---

## 1. Executive Summary
An in-depth code audit was conducted on the API routes of the S.N. Polymers backend application (`/backend`) to verify rate limiting coverage, determine the underlying algorithms used, and identify potential exposure windows. Additionally, a database query cost review was performed to assess vulnerability to resource exhaustion via expensive query patterns.

**Key Finding:** 
* Rate limiting is **not globally applied** to all API endpoints. 
* It is selectively configured only on authentication endpoints (`/request-otp`, `/link-telegram`, and `/verify-otp`). 
* All other business logic endpoints (projects, fund reports, materials, admin controls, and session logs) lack rate limiting, exposing them to resource exhaustion (DoS) and automated brute-forcing.
* Several database querying endpoints lack pagination, result size caps, or proper database-level aggregate logic, exposing the system to memory exhaustion and database lockups.

---

## 2. Rate Limiting Algorithm Analysis

The system uses `express-rate-limit` (v7.3.1) configured in `backend/src/middleware/rateLimiter.js`.

### The Algorithm: **Fixed Window Counter**
`express-rate-limit` implements a **Fixed Window Counter** algorithm rather than a Leaky Bucket or Token Bucket.

#### How It Works:
1. The timeline is is divided into fixed intervals (configured using `windowMs`).
2. Each client (identified by IP or a custom key, such as `mobileNumber`) is associated with a counter.
3. Every request increments the counter for the current window.
4. If the counter exceeds the maximum allowed threshold (`max`) within that window, subsequent requests are blocked with an HTTP `429 Too Many Requests` status code.
5. Once the current window duration expires, the counter resets back to 0.

#### Algorithm Characteristics & Comparison:
* **Token/Leaky Bucket:** Smooths out traffic spikes by processing requests at a constant average rate, allowing occasional bursts.
* **Fixed Window Counter (Used Here):** Simple and low memory overhead, but can allow a burst of twice the limit if requests are clustered right before and right after the window boundary (the "boundary burst" vulnerability).

---

## 3. Endpoints Audit & Coverage Matrix

| Endpoint Route | Middleware Applied | Rate Limited? | Risk Classification |
| :--- | :--- | :---: | :--- |
| **POST** `/api/v1/auth/request-otp` | `otpRequestLimiter` | **YES** | Low (Rate limited) |
| **POST** `/api/v1/auth/link-telegram` | `otpRequestLimiter` | **YES** | Low (Rate limited) |
| **POST** `/api/v1/auth/verify-otp` | `otpVerifyLimiter` | **YES** | Low (Rate limited) |
| **POST** `/api/v1/auth/refresh` | *None* | **NO** | **MEDIUM** (Session token recycling abuse) |
| **POST** `/api/v1/auth/logout` | `verifyJwt` | **NO** | **LOW** |
| **GET** `/api/v1/auth/me` | `verifyJwt` | **NO** | **LOW** |
| **GET / POST / PATCH / DELETE** `/api/v1/auth/admin/users` | `verifyJwt`, `requireAdmin` | **NO** | **HIGH** (Admin actions, DB load) |
| **GET** `/api/v1/auth/admin/sessions` | `verifyJwt`, `requireAdmin` | **NO** | **MEDIUM** (Large query potential, database logs parsing) |
| **GET / POST / PUT / PATCH** `/api/v1/auth/projects` | `verifyJwt` | **NO** | **MEDIUM** (Resource-intensive database writes) |
| **GET / POST / PUT / DELETE / PATCH** `/api/v1/auth/reports` | `verifyJwt` | **NO** | **MEDIUM** (Financial record modifications) |
| **GET / POST / PUT / PATCH** `/api/materials` | `verifyJwt` | **NO** | **MEDIUM** (Public/Authenticated materials listing) |

---

## 4. Key Security & Operational Gaps

### A. Non-Rate-Limited Auth Token Refresh (`/refresh`)
The `/refresh` token endpoint does not have rate limiting. If an attacker acquires a valid refresh token (or wants to try to fuzz JWT verify structures), they could spam requests to this endpoint, straining the database session verification code.

### B. Lack of Global Safe Default (DoS Vector)
A malicious actor with valid staff credentials (or via an open browser tab) could spawn automated loop queries against `/api/v1/auth/projects` or `/api/v1/auth/reports`. Since these query PostgreSQL records and format JSON responses, this can quickly exhaust connection pools or Render CPU quotas.

### C. Development Mode Relaxations
In `rateLimiter.js`:
* `otpRequestLimiter` allows **100 requests** per 15 mins in development.
* `otpVerifyLimiter` allows **500 requests** per 5 mins in development.
While useful for local testing, developers must ensure the `NODE_ENV` environment variable is strictly set to `'production'` in staging/production deployments to prevent these bypasses.

---

## 5. Database Query Cost Review

Optimizing backend query performance is often a more effective safeguard against server crashes than rate limiting alone. Below is an audit of database query patterns and execution costs:

### A. Is Pagination Enforced?
* **Projects (`/projects`):** **No.** `getProjects` fetches all project master records from the `projects_master` table using `.select('*')` without any pagination or offset controls.
* **Fund Reports (`/reports`):** **No.** `getReports` queries the entire active set of reports with database joins and returns the full list in one response.
* **Materials (`/materials`):** **Partially.** While the controller reads request query parameters (`page` and `limit`) to apply `.range(offset, offset + limit - 1)`, it **does not enforce a maximum cap** on the `limit` query parameter. A client can supply `?limit=1000000` to fetch the entire database table in a single request, bypassing pagination checks.

### B. Are Query Result Sizes Capped?
* **No.** There are no hard-coded safety limits on result sizes in the backend controllers. If the datasets grow over several years of company operations, full table scans on routes like `getProjects` or `getReports` will degrade API response times and consume significant bandwidth.

### C. Are Export Endpoints Protected?
* **No.** There are no dedicated `/export` endpoints. Instead, the frontend fetches the full unpaginated datasets directly from the standard `GET /projects` and `GET /reports` routes, utilizing the absence of API pagination to load all records into browser memory for local rendering.

### D. Are there N+1 Query Issues?
* **Yes (High Risk):** In `admin.controller.js` -> `getUsers`:
  ```javascript
  const { data: users } = await supabase.from('authorised_users').select('*');
  const { data: sessions } = await supabase.from('sessions').select('user_id, login_at');
  
  const userLoginStats = users.map(user => {
    const userSessions = sessions.filter(s => s.user_id === user.id);
    return { ...user, session_count: userSessions.length };
  });
  ```
  Instead of utilizing PostgreSQL database-level aggregates (`COUNT`, `MAX`), the code pulls **every row** in the `sessions` table and **every row** in the `authorised_users` table directly into Node.js application memory, then performs an O(N * M) nested lookup in JavaScript. As the database grows to thousands of audit sessions, this query will lock up the single-threaded Node.js event loop, resulting in timeouts or out-of-memory server crashes.

### E. Are there Large Joins?
* **Yes:** `getReports` performs a live, multi-column join from the `fund_reports` table to the `projects_master` table:
  ```javascript
  supabase.from('fund_reports').select('*, projects_master(...)')
  ```
  Since this join operates on the entire table without pagination, database CPU consumption scales linearly with dataset growth.

---

## 6. Mitigation & Recommendations

1. **Implement a Global Rate Limiter:**  
   Introduce a loose, general-purpose rate limiter across all routes (e.g., 100 requests per minute per IP) to guard against brute-force crawlers or runaway client-side loops:
   ```javascript
   const globalLimiter = rateLimit({
     windowMs: 1 * 60 * 1000, // 1 minute
     max: 100, // Limit each IP to 100 requests per minute
     message: { success: false, message: 'Too many requests. Please try again later.' }
   });
   app.use(globalLimiter); // Apply globally in app.js
   ```

2. **Secure the Token Refresh Route:**  
   Apply a specific rate limiter on `/api/v1/auth/refresh` to prevent JWT verification spam.

3. **Verify Reverse Proxy Configurations:**  
   Ensure that the reverse proxy (Render / Cloudflare) sets the `X-Forwarded-For` header correctly, as `app.set('trust proxy', 1)` is enabled in `app.js` and `express-rate-limit` relies on this to determine the correct user IP.

4. **Refactor In-Memory Aggregates (N+1 Mitigations):**  
   Refactor `getUsers` to run aggregate operations inside PostgreSQL. Leverage database grouping or a View instead of pulling logs into JavaScript memory:
   ```javascript
   // Recommended database-side aggregate
   const { data } = await supabase.rpc('get_users_with_login_stats');
   ```

5. **Enforce Hard Pagination Caps:**  
   Apply default limits (e.g., 50 records) and a strict maximum ceiling (e.g., `Math.min(limit, 100)`) on pagination inputs for `/materials`, and implement pagination on `/projects` and `/reports` routes.
