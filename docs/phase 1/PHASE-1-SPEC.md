# PHASE 1 SPEC — Foundation

> **Version 1.0** · Status: Final draft, usable directly · Depends on PRD v1.1, DESIGN SYSTEM v1.1, SECURITY v1.1, TESTING v1.1, AGENTS v1.1.
> **Goal:** a deployable, secure, beautiful public website with accounts, profile/settings, Help/FAQ/Contact, Team page and legal pages. No food features yet.
> **Format:** each story has acceptance criteria (AC) in *Given / When / Then* form. Test IDs show where each is verified.

## 1. Scope
**In:** design system and tokens · landing page with live background · sign-up, email verification, login/logout, forgot/reset password, change password and email · 18+ confirmation · profile and settings (theme, language switcher shell, Reduce animations, notification preferences shell, delete account) · Help Centre · working FAQ · Contact form → admin inbox · "Technical support: Coming soon" · Team page · footer ("Made by The S-QUAD") · legal pages (drafts) · 404/error pages · SEO basics · security headers · CI.
**Out (later phases):** food inventory, listings, map, organisations, admin screens (messages are read through the Supabase dashboard until Phase 4), push/email digests, Bengali and Hindi UI, avatar uploads.
**Requirements covered:** FR-AUTH-1…9, FR-PROF-1, 3 (shell), 4, FR-SITE-1…5, 7…12.

## 2. Routes (all under the locale prefix; English only at launch)
| Route | Access | Purpose |
|-------|--------|---------|
| `/en` | public | Landing |
| `/en/signup`, `/en/login`, `/en/forgot-password`, `/en/reset-password`, `/en/verify-email` | public | Auth |
| `/en/auth/callback` | public | Email-link and OAuth return (exchanges the code, redirects safely) |
| `/en/welcome` | signed in | First-run: confirm 18+, choose area, short intro |
| `/en/home` | signed in + 18+ confirmed | Placeholder dashboard ("Your kitchen is coming soon") |
| `/en/available` | public | "Coming soon" page for Available Food, with link to FAQ |
| `/en/profile`, `/en/settings`, `/en/settings/security` | signed in | Profile, preferences, password/email, delete account |
| `/en/help`, `/en/help/[section]` | public | Help Centre |
| `/en/faq` | public | FAQ |
| `/en/contact` | public | Contact form and support card |
| `/en/team` | public | Team page |
| `/en/legal/terms`, `/en/legal/privacy`, `/en/legal/food-safety`, `/en/legal/guidelines` | public | Legal drafts |
| `/api/health`, `/api/contact` | public | Health check; contact form |
`app/` pages send `noindex`; public pages are indexed; `/admin` does not exist yet and returns the standard 404.

## 3. User Stories and Acceptance Criteria

### US-P1-01 Sign up
| AC | Given / When / Then | Tests |
|----|--------------------|-------|
| 01.1 | Given I am on Sign up, when I enter a name (2–60 chars), email, password (8–128 chars), choose Member/Business/Organisation, tick "I am 18 or older" and "I accept the Terms and Privacy Policy", and pass the Turnstile check, then I see "Check your email" and a verification email is sent. | TC-AUTH-001 |
| 01.2 | Given the email is already registered, when I submit, then I see the **same** "Check your email" screen (no hint that the account exists). | TC-AUTH-003 |
| 01.3 | Given the password is shorter than 8 or longer than 128, then I see the inline error and nothing is sent. | TC-AUTH-002 |
| 01.4 | Given the 18+ or Terms box is unticked, then submission is blocked with a message. | TC-AUTH-017 |
| 01.5 | Given Turnstile fails, then I see "We couldn't confirm you're human. Please try again." | TC-AUTH-013 |
| 01.6 | Given I choose Organisation, then a note explains "You'll apply for verification after you sign in." | — |
| 01.7 | Given more than 6 sign-up attempts from one network in an hour, then I see "Too many attempts. Please try again later." with no further processing. | TC-SEC-018 |
| 01.8 | Given I am not yet verified, then I cannot reach signed-in pages. | TC-AUTH-004 |

### US-P1-02 Verify email
| 02.1 | Given I click the link in the email, when it is valid, then I land on `/en/welcome` signed in. | TC-AUTH-005 |
|---|---|---|
| 02.2 | Given the link is used twice or expired, then I see `/en/verify-email` with "This link has expired" and a **Resend** button. | TC-AUTH-005 |
| 02.3 | Given I press Resend, then the button is disabled for 60 seconds with a visible countdown. | TC-AUTH-006 |

### US-P1-03 Log in and out
| 03.1 | Given correct email and password and a verified email, then I reach `/en/home` (or a safe `next` page on this site). | TC-AUTH-007 |
|---|---|---|
| 03.2 | Given wrong credentials, then I see "Email or password is incorrect." (never saying which). | TC-AUTH-007 |
| 03.3 | Given 5 failures in 15 minutes, then I see "Too many attempts. Please try again in N minutes." | TC-AUTH-007 |
| 03.4 | Given correct credentials but an unverified email, then I see "Please verify your email first" with Resend. | TC-AUTH-004 |
| 03.5 | Given "Stay signed in" (default on), then my session survives closing the browser. | TC-AUTH-008 |
| 03.6 | Given I choose "Log out of all devices", then every other session ends. | TC-AUTH-008 |
| 03.7 | Given a `next` value pointing to another website, then it is ignored and I go to `/en/home`. | TC-AUTH-016 |
| 03.8 | Given my access token is about to expire, when I keep browsing, then I stay signed in (the proxy refreshes the session). | TC-AUTH-018 |

### US-P1-04 Forgot, reset and change password
| 04.1 | Given I enter any email on Forgot password, then I always see "If that email has an account, we've sent a link." | TC-AUTH-009 |
|---|---|---|
| 04.2 | Given I open the reset link, then I can set a new password (8–128 chars); the link works once and expires within 1 hour; afterwards **all other sessions end** and I see a confirmation. | TC-AUTH-009 |
| 04.3 | Given I am signed in and open Security, when I change my password, then I must enter my current password first; success ends other sessions and shows a notice. | TC-AUTH-010 |

### US-P1-05 Change email
| 05.1 | Given I enter a new email in Security, then a confirmation goes to the new address and the old email stays active until I confirm; I see "Check your new email." | TC-AUTH-011 |
|---|---|---|

### US-P1-06 Confirm 18+ (first run and Google users)
| 06.1 | Given my profile has no age confirmation, then every signed-in page redirects to `/en/welcome` until I tick "I am 18 or older". | TC-AUTH-017 |
|---|---|---|
| 06.2 | Given I confirm, then the time is stored (no birth date) and I continue to `/en/home`. | TC-AUTH-017 |

### US-P1-07 Profile and settings
| 07.1 | Given I edit display name, phone (optional, valid format), city and area label, household size (1–50), then changes save and a success toast shows. | TC-PROF-001 |
|---|---|---|
| 07.2 | Given I look at what others can see, then a plain-language panel says "Your phone is never shown publicly." | TC-PROF-001 |
| 07.3 | Given I change theme (System/Light/Dark) or "Reduce animations", then it applies immediately, persists after reload and is saved to my profile. | TC-PROF-003 |
| 07.4 | Given I open Language, then English is selected and Bengali and Hindi are shown as "Coming soon" (disabled). | TC-I18N-002 |
| 07.5 | Given I open Notifications, then "In-app" is on; Push and Email digest are disabled with "Coming soon". | — |
| 07.6 | Given I choose Delete account, then I must re-enter my password and confirm; my account is hidden immediately, I am signed out, and I see "Your account will be permanently deleted within 30 days." | TC-AUTH-014 |

### US-P1-08 Landing page
| 08.1 | Given I open `/en`, then I see in order: hero, the loop (Scan → Track → Rescue → Recycle), events, how sharing works, verified partners (hidden until real ones exist), waste and recipes teasers, impact counters ("We're just getting started" until real data exists), install-as-app note, FAQ preview (five questions), final call-to-action, footer. | TC-SITE |
|---|---|---|
| 08.2 | Given I click **Start free**, then I go to Sign up; **See food near me** goes to `/en/available` (Coming soon). | — |
| 08.3 | Given I am signed in, then the hero buttons become "Go to my kitchen" and the same secondary button. | — |
| 08.4 | Given a mid-range phone on 4G, then Largest Contentful Paint is ≤ 3.0 s. | TC-PERF-001 |

### US-P1-09 Live background
| 09.1 | Given a capable device on the landing page, then the 3D scene (tier T2) loads **after** the page is usable. | TC-PERF-003 |
|---|---|---|
| 09.2 | Given reduced motion, "Reduce animations", or data saver, then the static illustrated background (T0) shows and **no 3D context is created**. | TC-PERF-004 |
| 09.3 | Given low memory (≤ 2 GB), ≤ 4 CPU cores or no 3D support, then the light animated background (T1) shows. | TC-PERF-004 |
| 09.4 | Given the 3D scene runs below 30 fps (24 on phones) for 2 seconds, then it drops one tier and stays there for the session. | TC-PERF-005 |
| 09.5 | Given the scene is off-screen or the tab is hidden, then rendering pauses. | TC-PERF-006 |
| 09.6 | Given the 3D context is lost, then the page falls back to T1 without an error. | TC-PERF-007 |
| 09.7 | Given any tier, then the background is hidden from screen readers and never sits behind text without an opaque card. | TC-A11Y-005 |

### US-P1-10 Help Centre
| 10.1 | Given I open Help, then I see sections: Getting started, Kitchen inventory, Smart freshness, Recipe rescue, Waste guide, Troubleshooting. | TC-HELP-006 |
|---|---|---|
| 10.2 | Given I open the Food safety section, then it states "Khabar Chakra provides algorithmic estimates and shelf-life recommendations based on ICMR-NIN standards. You inspect freshness before eating." | TC-BADGE-007 |

### US-P1-11 FAQ
| 11.1 | Given I open the FAQ, then categories, a search box and "Expand all / Collapse all" are shown; items are grouped by category. | TC-HELP-004 |
|---|---|---|
| 11.2 | Given I click, press Enter or press Space on any question, then it opens (answer visible, `aria-expanded` true) and doing it again closes it. **Every** published item behaves this way. | TC-HELP-001 |
| 11.3 | Given I use the keyboard, then Tab reaches each question in order with a visible focus ring. | TC-HELP-002 |
| 11.4 | Given a link such as `/en/faq#is-it-free`, then that question opens and scrolls into view. | TC-HELP-003 |
| 11.5 | Given I search "password", then only matching questions remain; with no match I see "No results" and a link to Contact. | TC-HELP-004 |
| 11.6 | Given JavaScript is slow or off, then all answers are present in the page's HTML. | TC-HELP-005 |

### US-P1-12 Contact
| 12.1 | Given I fill name (2–80), email, topic (kitchen intelligence, inventory tracking, recipe rescue, technical support, privacy request, other), subject (3–120) and message (10–2000), and pass Turnstile, then I see "Thanks! We've received your message." and the message appears in the admin inbox table. | TC-SITE-001 |
|---|---|---|
| 12.2 | Given I send more than 3 messages in an hour from one network, then I see "Too many messages. Please try again later." | TC-SITE-002 |
| 12.3 | Given the form is used, then **no email is sent to any team address** and no team email or phone appears anywhere on the page. | TC-SITE-001 |
| 12.4 | Given I am signed in, then my name and email are pre-filled (editable). | — |

### US-P1-13 Technical support card
| 13.1 | Given `site_settings.public_contact.tech_support.status` is `coming_soon`, then the card says "Technical support — Coming soon. Until then, please use the contact form." | TC-SITE-003 |
|---|---|---|
| 13.2 | Given the setting changes to real details, then the page shows them without redeploying. | TC-SITE-003 |

### US-P1-14 Team page and footer
| 14.1 | Given I open Team, then I see the team name, college, story and four member cards (name, title, bio) exactly as in §6.7, in plain text, with **no phone, email or social links**. | TC-SITE-005 |
|---|---|---|
| 14.2 | Given any page, then the footer shows Product, Help (FAQ, Help Centre, Contact), Legal links and a language switcher; its last line is "Made by The S-QUAD", where "The S-QUAD" links to the Team page. | TC-SITE-004 |

### US-P1-15 Legal pages
| 15.1 | Given I open a legal page, then I see its draft text and a visible banner "Draft — under legal review" until the team marks it reviewed. | TC-SITE-006 |
|---|---|---|
| 15.2 | Given Sign up and Contact, then Terms and Privacy links open in a new tab and are keyboard reachable. | TC-SITE-006 |

### US-P1-16 System pages and SEO
| 16.1 | Given an unknown address, then a friendly 404 with the mascot, search and links appears; app errors show a friendly error page with "Try again" and a request ID. | — |
|---|---|---|
| 16.2 | Given search engines, then public pages have unique titles, descriptions, canonical links and social images; `robots` and the sitemap list only public pages; app pages are `noindex`. | TC-SITE-007 |

### US-P1-17 Quality bars (every page)
Accessibility: zero serious/critical axe issues in light and dark (TC-A11Y-001) · keyboard-only journeys for sign-up, login, FAQ, contact (TC-A11Y-002) · contrast script green (TC-A11Y-004) · no hard-coded text (TC-I18N-001) · Lighthouse mobile ≥ 80 Performance, ≥ 90 Accessibility/Best Practices/SEO · security headers present (TC-SEC-014).

## 4. Screen Notes
| Screen | Key elements and states |
|--------|-------------------------|
| Sign up | Name, email, password with show/hide and strength hint, account type radio cards, 18+ and Terms checkboxes, Turnstile, submit; states: submitting, error, "Check your email" |
| Login | Email, password, stay-signed-in, forgot link, Google button (hidden until enabled), submit; states: error, locked, unverified |
| Verify email | Message, Resend (with 60 s countdown), "Use a different email" |
| Welcome | Step 1 confirm 18+ · Step 2 area/city (optional) · Step 3 short tour; Skip allowed after step 1 |
| Home (placeholder) | Mascot, "Your kitchen is coming soon", links to Help and FAQ; empty-state pattern |
| Profile / Settings | Sections with save buttons; unsaved-changes warning; toasts |
| Security | Change password, change email, log out of all devices, delete account (danger zone) |
| Help | Section cards with icons; search link to FAQ |
| FAQ | As US-P1-11 |
| Contact | Form on one side, support card and privacy note on the other (stacked on mobile) |
| Team | Hero with team name and story, four cards |
| Legal | Table of contents, draft banner, last-updated date |

## 5. Validation Rules
| Field | Rule | Message |
|-------|------|---------|
| Name | 2–60 chars, trimmed | "Please enter your name (2 to 60 characters)." |
| Email | valid format, ≤ 254 | "Please enter a valid email address." |
| Password | 8–128 chars | "Use 8 to 128 characters. A short phrase works well." |
| Phone | optional; `+` optional then 8–15 digits | "Please enter a valid phone number or leave it empty." |
| Household size | whole number 1–50 | "Enter a number between 1 and 50." |
| Subject | 3–120 | "Please add a short subject." |
| Message | 10–2000 | "Please write at least 10 characters (up to 2000)." |
| Checkboxes | required | "Please confirm to continue." |
Server-side validation repeats every rule; the client shows the same messages.

## 6. Copy Deck (English; all text lives in `messages/en.json`)
### 6.1 Auth
| Key | Text |
|-----|------|
| auth.signup.title | Create your account |
| auth.signup.submit | Create account |
| auth.signup.age | I am 18 or older |
| auth.signup.terms | I accept the Terms and Privacy Policy |
| auth.signup.checkEmail.title | Check your email |
| auth.signup.checkEmail.body | We've sent a link to finish signing up. If you don't see it, check your spam folder. |
| auth.login.title | Welcome back |
| auth.login.error | Email or password is incorrect. |
| auth.login.locked | Too many attempts. Please try again in {minutes} minutes. |
| auth.login.unverified | Please verify your email first. |
| auth.forgot.sent | If that email has an account, we've sent a link. |
| auth.reset.success | Your password is updated. Other devices have been signed out. |
| auth.verify.expired | This link has expired. |
| auth.verify.resend | Send a new link |
| auth.verify.wait | You can send another in {seconds}s |
| common.error.generic | Something went wrong. Please try again. |
| common.error.tooMany | Too many attempts. Please try again later. |
| common.human.failed | We couldn't confirm you're human. Please try again. |

### 6.2 Emails (configure in the Supabase dashboard; plain, short, no tracking)
| Email | Subject | Body (placeholders are the dashboard's template variables) |
|-------|---------|------|
| Confirm sign-up | Confirm your Khabar Chakra email | "Welcome to Khabar Chakra! Please confirm your email to finish signing up: {{ .ConfirmationURL }} — If you didn't sign up, you can ignore this message." |
| Reset password | Reset your Khabar Chakra password | "We received a request to reset your password. Use this link within 1 hour: {{ .ConfirmationURL }} — If this wasn't you, you can ignore this message; your password stays the same." |
| Change email | Confirm your new email address | "Please confirm your new email address: {{ .ConfirmationURL }}" |
| Password changed (if the dashboard offers it) | Your password was changed | "Your Khabar Chakra password was changed. If this wasn't you, reset it now and contact us." |
Sign every email "— The Khabar Chakra team". No images beyond a small logo; no tracking links.

### 6.3 Landing
Headline "Good food deserves a *second chance*." (two words in the cursive accent) · sub-headline "Track what's in your domestic kitchen, cook what is about to expire, and eliminate household food waste." · buttons "Start free" and "My Kitchen" · loop cards: Scan "Point your camera at grocery receipts and packaging." · Track "Every item gets a freshness status and a countdown." · Rescue "Turn near-expiry ingredients into complete recipes." · Recycle "Compost food scraps and recycle packaging responsibly." · impact placeholder "Track your household ₹ savings and food rescued." · final call-to-action "Ready to waste less?" · tagline "Track • Cook • Save".

### 6.4 Other screens
| Key | Text |
|-----|------|
| home.title | My Kitchen Almanac |
| home.body | Track domestic freshness, plan meals, and log kitchen outcomes. |
| contact.success | Thanks! We've received your message. |
| contact.support.title | Technical support |
| contact.support.coming | Coming soon. Until then, please use the contact form. |
| contact.privacy | We use your message only to answer you. |
| settings.delete.confirm | Your account will be permanently deleted within 30 days. |
| footer.madeBy | Made by The S-QUAD |
| footer.support | Technical support: Coming soon |
| legal.draft | Draft — under legal review |

### 6.5 FAQ (12 items to seed; Markdown answers)
| Category | Question | Answer |
|----------|----------|--------|
| Getting started | What is Khabar Chakra? | A free domestic food-lifecycle website that helps you track pantry freshness, prevent duplicate grocery purchases, cook recipes from near-expiry ingredients, and sort kitchen waste responsibly. Khabar means food and Chakra means cycle. |
| Getting started | Is it free? | Yes. Khabar Chakra is completely free of charge. |
| Getting started | Who can use it? | You must be 18 or older. |
| Getting started | What's available right now? | You can manage your private pantry, track freshness countdowns, generate zero-waste recipes, and monitor your domestic ₹ savings. |
| Account and password | Why do I need to verify my email? | It helps protect your account and ensures secure login sessions. |
| Account and password | I didn't get the verification email. | Check your spam folder, then use "Send a new link" on the verification page (you can resend every 60 seconds). |
| Account and password | How do I reset my password? | Choose "Forgot password" on the login page and follow the link we email you. For safety, other devices are signed out afterwards. |
| Account and password | How do I change my email or delete my account? | Open Settings → Security. Changing your email needs confirmation on the new address. Deleting your account hides it right away and removes your data within 30 days. |
| Food safety | Does Khabar Chakra check that food is safe? | No. Khabar Chakra provides mathematical shelf life calculations based on ICMR-NIN standards. You inspect smell, texture, and appearance before cooking or eating. |
| Privacy and safety | Is my data private? | Yes. Your pantry, grocery receipts, and inventory are strictly private to your account via Supabase Row-Level Security. Read the Privacy Policy for details. |
| Privacy and safety | How do I make a privacy request? | Use the contact form and choose "Privacy request". |
| Technical support | How can I get technical help? | Technical support details are coming soon. Until then, use the contact form. |
Slugs are the question text in lower-case with hyphens (for example `is-it-free`).

### 6.6 Help article outline (Phase 1 content)
Getting started: create an account, verify email, set up your kitchen profile. Kitchen inventory / Smart freshness / Recipe rescue / Waste guide: how domestic tracking and recipes work with links to the FAQ. Troubleshooting: verification email missing, password reset, signing in on a new device, contacting us.

### 6.7 Team page (use exactly; plain-text names)
**Team name:** The S-QUAD · **College:** Asansol Engineering College · **Story:** "We are students who saw how much good food goes to waste — at home, in hostels and at big family events — and decided to build a free tool to help. Khabar Chakra is our way of closing the food cycle."
| Name | Title | Bio |
|------|-------|-----|
| Sohom Paul | 2nd-Year CSE Student at AEC | Full-Stack Developer & Video Editor. "I'm a CSE student driven by building functional, visually engaging web applications and crafting compelling video content. Combining a foundation in full-stack web development and creative storytelling as a freelance video editor. Just bringing visual polish to every project I build." |
| Snehasish Kundu | 2nd-Year CSE Student at AEC | C Programmer & Emerging Full-Stack Developer. "I'm a CSE student passionate about building functional and practical software projects while continuously exploring web development and emerging technologies. With a foundation in C and an interest in Python, AI, and full-stack development, I enjoy turning ideas into real-world projects and learning something new with every build." |
| Shreyasi Acharya | 2nd-Year CSE Student at AEC | C & Python Programmer, DSA Enthusiast. "I'm a Computer Science student interested in programming, logical problem-solving, and exploring how technology can be used to create useful solutions. I work with C and Python and am developing a strong understanding of Data Structures and Algorithms. I enjoy practicing new programming concepts, working on projects, and continuously improving my technical skills through hands-on learning." |
| Shuvangi Dutta | CSE Student | Emerging UI/UX designer, Dancer, Creative Content Creator. "I'm a CSE student who loves combining technologies. I enjoy expressing myself through creating and crafting things with my own ideas. I'm passionate about working on personal projects as well as collaborating with others on group projects. Always exploring new ideas, creating meaningful Projects, and bringing a creative touch to everything I do." |
No photos, phone numbers, emails or social links. Cards are equal-sized, keyboard-focusable only if they contain links (they do not).

## 7. Edge Cases to Handle
Double-clicking submit (disable while sending) · browser back after sign-out (no private data shown) · opening the verification link in a different browser · password manager autofill · very long names and Bengali/Hindi names (Unicode accepted; no ASCII-only rules) · email with plus sign · clock changes (UTC stored) · Turnstile blocked by a privacy extension (clear message and retry) · slow 3G (skeletons, no layout shift) · JavaScript disabled (FAQ and Help text still readable) · multiple tabs (sign-out in one signs out all within a minute) · refresh during reset (link single-use message) · user changes language while on a form (draft kept) · very small screens (320 px) and 200% zoom.

## 8. Phase 1 Exit Criteria
- [ ] All ACs above pass (automated where listed; the rest by manual script).
- [ ] CI green: lint, types, unit/component, database tests, E2E smoke, axe, Lighthouse, secret scan.
- [ ] Deployed to staging and production on free tiers; keep-alive running.
- [ ] Email verification, reset and change tested end to end on the live site.
- [ ] Security headers verified; Turnstile working; rate limits verified.
- [ ] Legal pages exist (drafts clearly marked); privacy request topic works.
- [ ] Team page, FAQ and Contact reviewed by all four teammates.
- [ ] `docs/VERSIONS.md` records exact installed versions.