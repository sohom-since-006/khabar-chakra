# SECURITY — Khabar Chakra (খাবার চক্র)

> **Version 1.1** · Status: **Final draft, usable directly** · Supersedes v1.0.
> Depends on PRD v1.1, TRD v1.1, BACKEND SCHEMA v1.1, ARCHITECTURE v1.1, TESTING v1.1. Binding decisions: AGENTS.md §2.
> This is an engineering document, **not legal advice.** Terms, Privacy Policy, takedown procedures and data-protection duties must be reviewed by a qualified person before public launch (§17).
> **Decided:** 18+ only · jobs as private web-app routes · Supabase Mumbai · four admins · two-admin rule mandatory · repository public later.

## 0. What changed since v1.0
Assumptions became decisions · two-admin rule is **mandatory** · framework security-release policy added (Next.js had critical vulnerabilities fixed on 25 August 2026) · CSP and headers shown as tables · code removed · schema updates marked as already included in BACKEND SCHEMA v1.1 · open items trimmed.

## 1. Principles
| # | Principle |
|---|-----------|
| S1 | **The database is the final gate:** rules that protect people live in access rules and privileged functions, never only in the UI. |
| S2 | **Least data, shortest time:** collect what a feature needs, hide it by default, delete on schedule. |
| S3 | **Deny by default:** no policy means no access. |
| S4 | **Never trust the client:** validate server-side; treat uploads, AI/OCR output and user text as hostile. |
| S5 | **The same answer for every "no":** errors never reveal that an account, listing, contact or admin page exists. |
| S6 | **Assume the repository is public:** no secrets, admin identities or real data in code, history, fixtures or docs. |
| S7 | **Make abuse expensive and visible:** limits, quotas, bot checks, audit logs, alerts. |
| S8 | **Fail safe:** if a protection service is down, sensitive actions stop; harmless reads continue. |
| S9 | **Zero-cost security:** free tiers and open source only. |
| S10 | **Patch fast:** framework and dependency security releases are applied within 48 hours. |

## 2. Assets and Classification
| Class | Data | Who may see it |
|-------|------|----------------|
| **Critical** | Passwords (hashed by the auth service), session and refresh tokens, service-role key, push private key, cron secret, database URL, email/API keys | Nobody in the app; platform owners only |
| **Restricted** | Organisation **documents**; **exact locations**; **contact numbers/emails**; pickup codes; nutrition profile; push subscriptions | Owner; admins (documents); others only per the reveal rules |
| **Confidential** | Account email, name, profile phone, inventory, listings, reports, contact-form messages, audit log | Owner; admins where needed |
| **Internal** | Feature flags, shelf-life tables, drafts | Admins |
| **Public** | Published FAQ, help, waste guide, recipes, badge status, aggregate counters | Everyone |

## 3. Threat Model
**Actors:** anonymous visitor · malicious member or scraper · harasser or stalker · fake organisation · bad-faith food donor · rogue or careless admin · attacker who compromises an admin or team account · supply-chain attacker (dependencies, GitHub Actions, AI-agent prompt injection) · bots and spammers · reader of the public repository.
| ID | Threat | Main controls | Tests |
|----|--------|---------------|-------|
| T-01 | Scraping phone numbers/locations | Reveal function only; verified email; window check; quotas; audit; contacts never in pages/JSON/Realtime/email/push; Turnstile on heavy use; new-account throttle | TC-PRIV-010…037 |
| T-02 | Stalking or harassment of donors | Approximate location option; contacts hidden after the window; block/report; fast suspension; no live tracking | TC-PRIV-007, 036 |
| T-03 | Contact/location leak via a bug | Access rules on every table; deny by default; revoked default function grants; automated matrix test | TESTING §7.2 |
| T-04 | Triangulating a hidden location | Distances and sorting use the public pin only; fixed per-listing offset | TC-PRIV-033, 038 |
| T-05 | Fake organisation gets a badge | Mandatory document review, registry checks, phone call, re-verification, two-admin rule for authorities and revocations, badge only from database status | TC-NGO, BADGE, ADMIN |
| T-06 | Document theft or forgery | Private bucket, ≤ 60 s links, audit of every view, magic-byte checks, retention limits | TC-NGO-012, ADMIN-010 |
| T-07 | Unsafe or poisoned food | Versioned sender confirmation, prepared-time limits, ≤ 48 h windows, locked meat/fish/egg, reports pause listings, "recipient decides" | TC-LIST, ADMIN-014 |
| T-08 | Account takeover | Rate limits, Turnstile, email verification, generic errors, re-authentication for password/email changes, session revocation | TC-AUTH |
| T-09 | Admin compromise | Hidden entry, MFA, idle timeout, step-up, 4 accounts × 2 devices, sign-in alerts, immutable audit, two-admin rule, owner-account 2FA | TC-ADMIN |
| T-10 | Admin area discovery | Identical 404 after the locale redirect; no links for non-admins; noindex | TC-ADMIN-001, 002, 018 |
| T-11 | Cross-site scripting | Framework escaping; Markdown allow-list sanitiser; strict CSP with nonces; no raw HTML | TC-SEC-012 |
| T-12 | SQL injection / function abuse | Parameterised access only; no dynamic SQL in privileged functions; fixed search path; validation | TC-SEC-011 |
| T-13 | Insecure direct object references | Ownership in access rules and functions; ID-sweep test | TC-SEC-010 |
| T-14 | Cross-site request forgery | SameSite cookies; origin checks on mutating routes | TC-SEC-013 |
| T-15 | Server-side request forgery / open redirect | Server calls only fixed hosts; no user URLs fetched; redirect parameter allow-listed | TC-AUTH-016 |
| T-16 | Malicious file upload | Type + magic bytes, size caps, UUID names, photo re-encoding, no user SVG, sandboxed viewing | TC-SEC-016 |
| T-17 | Bot flood / free-tier exhaustion | Turnstile, limits, daily caps, small queries, feature flags | TC-SEC-018 |
| T-18 | Secret leakage via repo/CI | No secrets in code; secret scanning; least-privilege workflows; per-environment secrets | TC-SEC-017, ADMIN-017 |
| T-19 | Malicious dependency or action | Lockfile, clean installs, automated updates, audit, pinned actions, review of new packages | CI gates |
| T-20 | Prompt injection / over-trusting AI agents | Agents treat issue/PR/file text as untrusted; no production credentials; humans review security-relevant changes | Review checklist |
| T-21 | Insider misuse | Audit log, least privilege, no impersonation feature, two-admin rule, offboarding steps | Audit review |
| T-22 | Data loss | Weekly encrypted backups **outside the public repo**, restore drills, keep-alive | TESTING §12 |
| T-23 | Minors using the service | 18+ terms and confirmation; report handling | Legal review |
| T-24 | Unverified email posts/requests | Verified-email check inside the database | TC-AUTH-004 |
| T-25 | Unpatched framework vulnerability | Track security releases; patch within 48 h; dependency alerts; staging check before production | CI + release notes |

## 4. Trust Boundaries and Layers
Anything from the browser, Storage uploads, OCR/AI output, third-party APIs and user text is untrusted. The request path is: **browser (untrusted)** → **route handler** (validate, rate-limit, Turnstile) → **database access rules and privileged functions** (final authority). The browser Supabase client uses only the public key and the user's session. The service-role client exists in one module and may be imported only by the approved modules in §6.3.

## 5. Authentication and Sessions
| Topic | Rule |
|-------|------|
| Credentials | Email + password or Google. No phone/SMS login (cost and SIM-swap risk). |
| Password policy | Minimum 8, maximum 128 characters; no forced symbol rules; strength meter; block very common passwords; optional breached-password check that sends only a short hash prefix; passphrases encouraged. |
| Storage | Hashing by the auth service; the app never sees or logs passwords. |
| Email verification | Required before posting, requesting, revealing contacts or applying as an organisation. Link life 24 h, single use, resend cooldown 60 s. |
| Login | Generic failures; 5 failures per 15 minutes per IP and account; Turnstile after repeated failures; CAPTCHA enabled in the auth service. |
| Forgot password | Same response always; single-use link ≤ 1 h; other sessions revoked; notification sent. |
| Change password | Needs the current password; other sessions revoked; notice sent. |
| Change email | Confirm on the **new** address (notice to the old) before it takes effect. |
| Sessions | HTTP-only, Secure, SameSite cookies; access token about 1 hour; refresh rotation on; log out of all devices; the server relies on a validated user lookup, never raw cookie contents. |
| Google | Only Google; exact redirect URLs; link by **verified** email only; Google-only accounts can add a password. |
| Enumeration | Signup, login, reset and reveal answers never disclose existence. |
| Deletion | Re-authentication; hidden immediately; hard-deleted after 30 days. |
| Suspension | A suspension timestamp blocks posting, requesting and reveals immediately (checked in functions). |
| **Minimum age** | **18+**, in the Terms and confirmed at signup (time stamp stored, no birth date). |

### 5.1 Admin authentication
Same login page as everyone; **no admin login page.** Requires an admin-table row **and** an MFA (authenticator) session; each admin registers **two** devices. Idle timeout 30 minutes; sensitive actions (open a document, approve, suspend, revoke, change rules) require MFA authentication within the last 5 minutes. Lost device: use the second device; otherwise a database owner resets the factor after verifying the person in real life. Offboarding: remove from the admin table, revoke sessions, remove from Supabase/Vercel/GitHub, rotate shared secrets.

## 6. Authorisation
### 6.1 Rules
1. Row-level access rules on **every** table; each policy has an allow and a deny test.
2. Privileges come from data, not the client: approved organisation (and kind), admin table + MFA; the account type grants nothing.
3. Every privileged function sets a fixed search path, uses qualified names, validates the signed-in user, and has execute revoked from public and anonymous callers then granted only to signed-in users.
4. Never fetch by ID alone; ownership or visibility is checked inside the policy or function.
5. Blocked users cannot see, request or reveal each other's content, in either direction.

### 6.2 Database hardening
Row cap per request (~100) and statement time limit (~8 s) for public roles · disable the GraphQL extension and unused API surface · do not expose internal auth/storage schemas through custom views · Realtime publishes only notifications, listings, listing requests and emergency requests · database password only in secrets; direct database URL only for migrations and backups.

### 6.3 Approved users of the service-role client
Signed-URL issuer · upload-confirm (magic-byte check) · push/email dispatcher (internal job route) · audit writer · contact-form insert · admin session-start · retention and maintenance scripts. Adding to this list needs a security note in the pull request.

## 7. Application Security Controls
| Area | Control |
|------|---------|
| Input validation | Shared schemas validated **server-side** on every route; length caps; enumerations |
| Output / XSS | No raw user HTML; Markdown sanitised with an allow-list; no inline handlers |
| Free-text hygiene | Titles, descriptions and access notes **reject or mask phone numbers and emails** ("Use the contact field so it stays protected") |
| CSRF | SameSite cookies; origin checks on mutating routes; no state change on GET |
| SSRF | Server calls only fixed hosts (product database, geocoder, Overpass); responses size- and time-limited |
| Open redirect | Redirect parameters limited to same-site paths |
| Rate limiting | Limits per TRD §7.3; fail **closed** for auth, contact, reveal, publish, request; open for harmless reads |
| Bot protection | Turnstile on signup, login after failures, contact form, and after heavy reveal use |
| Clickjacking | No framing allowed |
| Third-party scripts | Only Turnstile and Sentry; OCR, AI models and 3D assets are **self-hosted** |
| Errors | Stable codes; no stack traces or SQL errors to clients |
| Logging | Structured, request IDs; redact phone, email, address, document names/content, tokens, codes |
| Caching | `no-store` on reveal responses, documents, pickup codes, auth, admin; the service worker never caches them |
| Search engines | Available Food and listing pages require login and send noindex; robots lists only public pages |
| Internal job routes | POST only; no cookies; constant-time secret check; batches ≤ 500; idempotent; never linked; secret rotated every 6 months |

### 7.1 Uploads
| Asset | Controls |
|-------|----------|
| Listing / food photos | Re-encoded on the device (WebP, no location data, ≤ 300 KB, 1–4 per listing); signed upload URL; confirm route re-checks magic bytes and size; random UUID paths |
| Organisation documents | Private bucket; PDF/JPEG/PNG ≤ 5 MB; signed upload URL; confirm route verifies magic bytes and deletes invalid files; viewing only via ≤ 60 s signed links; images shown as images, PDFs rendered by a PDF library in a worker (no embedded browser viewer, no scripts); every open audited |
| Avatars | WebP ≤ 200 KB |
| Forbidden | User-uploaded SVG, HTML, executables, archives |

### 7.2 Headers and Content-Security-Policy (baseline; tune with the real hosts)
| Directive | Allowed |
|-----------|---------|
| default-src | self |
| script-src | self, per-request nonce with strict-dynamic, Cloudflare challenge host (Turnstile) |
| style-src | self, inline styles (needed by the styling and animation libraries) |
| img-src | self, data, blob, the project's Supabase host, the chosen tile provider |
| font-src | self |
| connect-src | self, the Supabase host (HTTPS and WebSocket), Sentry |
| worker-src | self, blob |
| frame-src | Cloudflare challenge host only |
| object-src | none |
| base-uri, form-action | self |
| frame-ancestors | none |
| upgrade-insecure-requests | on |
| Other headers | HSTS (two years, include subdomains; add "preload" only once the domain is final) · X-Content-Type-Options nosniff · Referrer-Policy strict-origin-when-cross-origin · Permissions-Policy: camera and geolocation self only; microphone, payment, USB off · Cross-Origin-Opener-Policy same-origin |
Third-party APIs (product database, geocoder, Overpass) are called **from the server** and cached, so the browser's connect list stays short.

## 8. Privacy by Design
| Topic | Rule |
|-------|------|
| Minimisation | Optional profile fields; phone optional; nutrition data separate and optional; PAN/ID numbers **not stored** as text (only inside private documents) |
| Consent at posting | The sentence states exactly what is visible and until when; accepted text version stored |
| Location | Static pin only; no live tracking; approximate mode adds a fixed per-listing offset (~100–200 m); distances and sorting use the public pin; exact location opens only per rule |
| Photos | Location data stripped on the device; tip not to show house numbers or faces |
| Retention | As BACKEND SCHEMA §20 |
| User rights | Access/export, correction, deletion, withdrawal of consent, a way to raise a privacy complaint |
| Analytics | Cookie-less, aggregate; no tracking of food contents tied to identity; no ads or data sale |
| Cookies/storage | Only essential (session) and preferences (theme, language, motion) |
| Processors | Supabase, Vercel, Resend or Brevo, Upstash, Cloudflare Turnstile, Sentry — listed in the Privacy Policy; Supabase region **Mumbai** |
| Children | Service is 18+; reports of minors lead to suspension and deletion |

## 9. Contact, Location and Safety Controls
1. The reveal function checks in order: signed in → email verified → not suspended → subject live inside its window → visibility rule (or approved request) → not blocked → quotas.
2. **Quotas (configurable):** ≤ 30 reveals/hour/user · ≤ 3 reveals of the same contact/day · accounts under 24 h old ≤ 5/day · Turnstile after 10/hour.
3. **No side channels:** contacts never in listing JSON, URLs, push, email, Realtime, logs, error messages or caches.
4. **Window end** is enforced at read time by the function itself; the expiry job only tidies state.
5. **Pickup code:** 6 digits, 5 attempts then lock, expires an hour after the window, donor notified of failed attempts, recipient can never read it.
6. **Safety guidance at pickup:** meet in a public or well-lit place, tell someone, trust your instincts, never pay or share OTPs; event venues preferred for large pickups.
7. **Block and report** on every listing and profile; three distinct reports pause a listing pending review.
8. **Moderation targets:** urgent reports (unsafe food, threats, minors, harassment) first, first response within 24 h; immediate suspension when risk is credible.
9. **Honest copy:** the app never says food is "safe" or "checked"; the badge says documents were reviewed.

## 10. Verified Badge and Organisation Integrity
- The badge is rendered **only** from the server-verified approved status.
- Required documents per kind come from the required-documents table; approval is **refused** until every required document is opened and marked reviewed.
- Admin checklist (recorded): names and registration numbers match; documents current; address consistent; independent lookup where possible (NGO Darpan ID, FSSAI licence on the public FoSCoS site, official email domains for authorities); a call to a publicly listed number; look-alike names of existing organisations.
- **Two-admin rule (mandatory):** approving a **trusted authority** and **permanently revoking or restoring any badge** need a second, different admin within 72 hours. One admin may **suspend immediately** in an emergency; a second reviews within 24 hours, and an unreviewed suspension raises a reminder.
- Yearly re-verification reminder; suspension removes badge and access immediately.
- Suspected forgery: suspend, preserve evidence, record in the audit log, consider reporting to the relevant authority with legal advice.

## 11. Secrets and Configuration
| Secret | Stored in | Rotation |
|--------|-----------|----------|
| Service-role key, database password | Hosting environment (Production only) | On leak; every 6 months |
| Push private key | Hosting environment | On leak (users resubscribe) |
| Internal cron secret | Hosting environment + Supabase Vault | Every 6 months |
| Turnstile secret, Upstash token, email provider key, Sentry DSN | Hosting environment | On leak; yearly |
| Admin alert email | Hosting environment | When the team inbox changes |
| Backup encryption private key | Offline, held by two owners | Never in the repository |
Rules: environment files are ignored by git and `.env.example` holds names only; `NEXT_PUBLIC_` values are public by definition; **preview deployments use the staging project and non-production keys**; a pre-commit and CI secret scan plus the host's secret scanning and push protection; if a secret leaks, rotate first, then clean history, then review logs; never print secrets in CI logs or paste them into AI tools.

## 12. Platform Checklists
**Supabase:** region Mumbai · access rules on every table; anonymous role has no extra privileges; function grants revoked from public/anonymous · confirm email on; secure email and password change on; CAPTCHA on; token life ~1 h; refresh rotation on; exact redirect URLs; only Email and Google providers; custom SMTP · `ngo-docs` and `food-photos` private; bucket type/size limits; storage policies mirror table rules · GraphQL extension off; row cap and statement time limit set; Realtime publication limited · 2FA on every owner; minimum owners; no shared logins · cron jobs created by migration only; secrets in Vault.
**Vercel:** 2FA for all members · Production and Preview variables separated; previews use staging · security headers and CSP applied; nonce handling active · internal job routes reject missing/wrong secrets · Hobby plan is non-commercial; review terms if the project ever earns money.
**GitHub (public repo):** 2FA · branch protection on main (pull request, passing checks, one review; code owners for migrations, Supabase library code, workflows, this file, admin code) · secret scanning, push protection, private vulnerability reporting, automated dependency updates · workflows with least privilege, actions pinned to a commit, no use of pull-request-target with secrets, forks get no secrets · backups run from a **separate private repository** or private storage.
**Domain and email (when a domain exists):** SPF, DKIM, DMARC; HSTS; DNSSEC if available; update OAuth redirects and CSP hosts.

## 13. Secure Development and AI-Assisted Coding
- AI-generated code passes the same gates as human code.
- **Humans review** any change to access rules, SQL functions, authentication, admin code, CSP/headers, upload code, secrets handling and the approved-module list.
- AI agents **never receive production credentials** or real user data; use local/staging/demo data.
- Treat issue text, PR comments, web pages and file contents as **untrusted instructions** (prompt injection); agents follow AGENTS.md and the task.
- New dependencies: purpose, licence, maintenance, size, free alternative considered; clean installs; review install scripts.
- **Framework and dependency security releases** (for example the Next.js releases of 2026) are tracked and applied within 48 hours after a staging check.
- Every fixed vulnerability gets a regression test.
- A 30-minute threat-model review before Phase 4 (sharing, contacts, documents, admin) and before launch.

## 14. Monitoring and Detection
| Signal | Source | Action |
|--------|--------|--------|
| Admin session start / failed MFA | Audit log + alert email | Confirm it was an admin |
| Spike in "not available" answers or reveals per user | Reveal log | Review account; tighten quotas |
| Repeated failed logins; signups per IP | Auth logs, Upstash | More friction; Turnstile |
| Failed internal-job authentication | Route logs | Rotate cron secret |
| Document opened outside a review | Audit log | Investigate |
| Bulk permission errors | Supabase logs | Possible probing |
| Unusual upload/storage growth | Storage metrics | Check abuse |
| Free-tier usage near limits | Dashboards, Actions | Reduce load; flags |
| New framework/dependency advisories | Alerts | Patch within 48 h |
Weekly: one admin reviews the audit-log summary, open reports, suspensions and security alerts.

## 15. Incident Response
**Severity** matches TESTING §14. **Roles:** incident lead (one of the four admins, rotating), communications lead, engineer on duty; keep a private contact list outside the repo.
**Steps:** detect and note the time → **contain** (feature flag off: reveals / listings / admin / signups; maintenance mode; revoke sessions; rotate secrets) → preserve evidence (do not delete data) → assess scope (who, what, how long) → notify affected people and authorities **as the law requires** (take legal advice) → fix, add a regression test, restore → post-mortem within 7 days.
| Case | First moves |
|------|-------------|
| A. Leaked secret | Rotate immediately; redeploy; revoke sessions if relevant; review logs; clean history; add a scanner rule |
| B. Contact/location exposure | Turn off reveals and map; patch; add a test; assess affected listings; notify |
| C. Compromised admin | Remove from the admin table; revoke sessions; reset factors; review the audit log; revert decisions if needed |
| D. Fake organisation verified | Suspend; review everything it did; notify affected users; tighten checks |
| E. Harmful-food report | Pause the listing; contact reporter and donor; advise seeking medical care if anyone is ill; preserve the record; escalate to local authorities where appropriate; consider suspension |
| F. Bot flood / denial of service | Tighten limits and Turnstile; switch off heavy features; wait for free-tier recovery |
| G. Account-takeover wave | Force resets; shorten sessions; require re-verification |
| H. Data loss / project paused | Restore the project or latest encrypted backup; verify access rules and jobs afterwards |
| I. Takedown or legal request | Route to the legal reviewer; respond within required timelines; log the decision |
| J. Critical framework vulnerability | Read the advisory; patch on staging; deploy; check logs for exploitation; rotate secrets if exposure is possible |

## 16. Vulnerability Disclosure
Report privately using GitHub's "Report a vulnerability" on this repository (no public issues). A dedicated security email will be added here and in the site's security-contact file once published. Include what you found, steps to reproduce, impact and any proof; do not access, change or delete other people's data. **We commit to:** acknowledge within 72 hours, triage within 7 days, fix critical issues as fast as possible and others by severity, and credit you if you wish. **In scope:** the web app, API routes, database rules, storage, authentication, admin area, headers. **Out of scope:** denial-of-service testing, spam, social engineering or physical attacks, third-party services (report to them), scanning that degrades free tiers. **Safe harbour:** no action against good-faith research that follows this policy. No monetary bounty.

## 17. Legal and Compliance Notes (needs expert review)
- **Data protection:** align with the principles of India's Digital Personal Data Protection Act — notice and consent, purpose limitation, minimisation, accuracy, storage limitation, security safeguards, breach handling, user rights (access, correction, erasure, grievance) and special care for children (hence 18+). Confirm which obligations apply and when.
- **Intermediary duties:** because users post content, check the IT Act and Intermediary Guidelines for terms, content rules, a grievance contact and takedown timelines.
- **Privacy/grievance contact:** a working channel must exist **before public launch**; "Technical support: coming soon" is not enough. Interim: a *Privacy request* topic on the contact form handled from the admin inbox.
- **Food rules:** have the Terms and food-safety disclaimer reviewed for food donation, FSSAI and liability wording; the platform does not certify food; the recipient decides.
- **Documents we hold** are sensitive: keep retention and access rules exactly as designed.
- **Publish:** Terms of Use, Privacy Policy (processors, region, retention, rights), Food-Safety Disclaimer, Community Guidelines.

## 18. Security Requirements by Phase
| Phase | Must be true before it ships |
|-------|------------------------------|
| 1 Foundation | Auth hardened (§5); access rules on core tables; CSP/headers; secret scanning; environment example file; legal pages drafted; Turnstile on signup/contact; 18+ confirmation; Node/Next.js on latest patched versions |
| 2 Scan & Track | Upload pipeline (§7.1); location-data stripping; self-hosted OCR/models; FSSAI logic enforced server-side; meat/fish/egg listing lock |
| 3 Alerts | Internal job routes secured; idempotent notifications; no personal data in push payloads |
| 4 Share & Community | Reveal function, quotas, window enforcement, pickup code, reports/blocks, document pipeline, admin area (404 parity, MFA, claim, audit), badge integrity, two-admin rule, limited Realtime, threat-model review done |
| 5 Waste & Impact | Idempotent impact ledger; aggregate-only public counters; opt-in leaderboard |
| 6 Launch | Full checklist (§19); ZAP baseline clean; legal review done; backup + restore drill done; incident contacts ready |

## 19. Pre-Launch Checklist
- [ ] Access-rule matrix tests green for **every** table; no function callable by anonymous users unintentionally.
- [ ] Built client bundle contains no service-role key, push private key, cron secret or admin route names.
- [ ] `/admin` gives visitors and normal users the same 404 as unknown URLs; admin menu hidden.
- [ ] Four admins created with MFA on two devices each; sign-in alert verified; two-admin rule exercised on staging.
- [ ] Reveal, window expiry (1 s after end), approximate location and pickup-code tests pass on staging.
- [ ] Organisation documents unreachable by other users; links expire within 60 s.
- [ ] CSP active with no console violations on key pages; Turnstile works under CSP.
- [ ] Rate limits verified on auth, contact, reveal, publish, request.
- [ ] Preview deployments cannot reach production data.
- [ ] Backups run outside the public repo; restore drill done.
- [ ] Owner accounts (Supabase, Vercel, GitHub) have 2FA; member lists reviewed.
- [ ] Framework and dependencies on latest patched versions; no open critical advisories.
- [ ] Privacy/grievance channel live; Terms, Privacy, Food-Safety Disclaimer, Community Guidelines published and reviewed.
- [ ] Vulnerability reporting enabled; incident contact list ready.

## 20. Items Already Reflected in the Other Documents
BACKEND SCHEMA v1.1 contains: suspension and 18+ fields, the privacy-request contact topic, reveal-quota settings, the approvals table, per-kind required documents, free-text hygiene, function-grant rule and the Realtime list. TESTING v1.1 contains the matching test cases. AGENTS v1.1 §2–3 carries the decisions.

## 21. Open Security Items
| ID | Item | Default |
|----|------|---------|
| SEC-1 | Privacy/grievance contact before launch | Contact-form topic + admin inbox |
| SEC-2 | Breached-password check | Optional |
| SEC-3 | Legal review of Terms, Privacy, disclaimers | **Required before launch** |
| SEC-4 | Who owns the Supabase, Vercel and GitHub accounts; who holds the backup key | Team to decide |
*Closed:* minimum age (18+), region (Mumbai), two-admin rule (mandatory), PDF viewing method (PDF library in a worker).

---
*End of SECURITY v1.1.*