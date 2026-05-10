# PUSL3190 — Computing Project

## Final Report Submission

**Coursework Title:** Final Report Submission
**Programme:** BSc (Honours) Software Engineering
**Project Title:** LifeSync — An AI-Powered Platform for Connecting Kidney Patients, Donors, and Doctors
**Student Name:** Samadhi Uluwadge
**Student Reference Number:** [Plymouth Index Number]
**Supervisor:** [Supervisor Name]

---

## Acknowledgement

I would like to express my sincere gratitude to my project supervisor for the continuous guidance, encouragement, and constructive feedback offered throughout the duration of this project. Their experience helped shape both the technical direction and the ethical framing of LifeSync.

I would also like to thank the medical professionals who took the time to discuss the realities of organ matching and patient–donor coordination in Sri Lanka. Their insights into HLA typing, ABO compatibility, and the social challenges surrounding living kidney donation directly influenced the platform's feature set and safeguards.

Finally, I am grateful to the friends, family members, and peer testers who participated in interviews, surveys, and usability sessions, and to everyone whose support made this project possible.

---

## Abstract

This report describes the design, development, and evaluation of LifeSync — a secure, web-based platform that connects kidney patients, prospective living donors, and doctors through an AI-assisted matching workflow. In Sri Lanka, patients in need of a kidney transplant typically rely on word-of-mouth, family networks, or unmoderated social media groups to find a compatible donor. These channels expose patients to fraud, organ trafficking, and emotional exploitation, while doctors have no structured way to verify medical compatibility before clinical workup begins.

LifeSync addresses these gaps by providing a single, trusted environment where patients and donors create medically-relevant profiles, the platform computes a compatibility score based on ABO blood-group rules and HLA typing (A, B, and DR loci with CREG-aware comparison), and matched parties communicate only after a doctor has reviewed and verified them. The system is built on a modern serverless stack (Next.js 16 with the App Router, React 19, TypeScript, and Firebase for authentication, Firestore database, Cloud Storage, and Cloud Messaging), with role-based dashboards for patients, donors, doctors, and administrators.

Development followed an agile, iterative process informed by stakeholder interviews and a structured online survey. Features were delivered in working increments — authentication and roles, then HLA editing and scoring, then matching and requests, then notifications and chat, then verification and admin tooling — with each increment validated against functional and non-functional requirements. Testing combined manual UI walkthroughs, Firebase emulator-driven security-rule tests, and end-to-end role-based scenarios. Evaluation against the original business objectives — reduce time-to-find a matched donor, increase ethical visibility for genuine donors, and give doctors actionable compatibility data — shows that the platform meets its core goals and provides a defensible foundation for clinical pilot deployment.

By reading this report, you will gain a complete picture of the problem space, the design decisions taken, the technical architecture, and the project's strengths and limitations.

---

## Contents

- Chapter One: Introduction
- Chapter Two: Background
- Chapter Three: Literature Review
- Chapter Four: Method of Approach
- Chapter Five: Requirements
- Chapter Six: End Project Report
- Chapter Seven: Project Post-Mortem
- Conclusion
- References
- Appendix

---

# Chapter One: Introduction

## 1.1 Overview

End-stage renal disease (ESRD) is a global health problem and a serious one in Sri Lanka, where Chronic Kidney Disease of Uncertain Aetiology (CKDu) has reached epidemic proportions in the North Central, Uva, and parts of the Eastern provinces. According to the Sri Lanka Ministry of Health, tens of thousands of patients are on long-term dialysis, and the gap between the number of patients waiting for a kidney transplant and the number of donors available is widening every year.

A kidney transplant is the gold-standard treatment for ESRD: it is cheaper than long-term dialysis, dramatically improves quality of life, and extends life expectancy. However, a successful transplant requires more than goodwill — it requires a donor whose ABO blood group is compatible, whose HLA (Human Leukocyte Antigen) profile is reasonably matched, and whose medical history rules out transmissible disease and surgical risk. In Sri Lanka, the deceased-donor programme is small, so most living transplants happen between family members. When no family donor is available, patients are forced to search informally — through Facebook groups, WhatsApp chains, and personal contacts.

This informal search is the problem this project addresses. It is slow, opaque, emotionally draining, and dangerous: it exposes vulnerable patients to scammers, exposes prospective donors to undue pressure, and gives transplant teams no structured way to assess compatibility before scheduling expensive crossmatch tests. There is no single platform in Sri Lanka that lets a patient declare their need, lets a willing donor offer help, lets the platform itself rank candidates by medical compatibility, and lets a doctor review and verify both parties before any contact is made.

LifeSync is built to fill exactly that gap. It is a secure, role-aware web platform where patients, donors, and doctors register, complete medically-relevant profiles, and are matched by a deterministic compatibility algorithm that combines ABO rules with HLA scoring on the A, B, and DR loci. Only verified users see one another, only after a verified match are the parties allowed to chat, and a notification system keeps everyone informed of state changes. The platform does not replace the doctor — it gives the doctor a tool.

By reducing the search from weeks of informal asking to minutes of structured matching, LifeSync aims to shorten the path from diagnosis to transplant, give genuine donors a safe place to volunteer, and bring transparency to a process that is currently dominated by personal connections and luck.

---

# Chapter Two: Background

## 2.1 Problem Definition

The core problem is the absence of a centralised, ethically-governed, technically-rigorous platform that connects kidney patients with willing donors in Sri Lanka.

Concretely, the patient experience today looks like this:

- A patient is told by their nephrologist that they need a transplant.
- Family members are tested first; in many cases none are compatible.
- The patient and their family then turn to social media, friends-of-friends, and informal networks to find a non-related living donor.
- They have no way to filter out incompatible candidates before contacting them.
- They have no way to verify that a person claiming to be a donor is genuine.
- Many encounter people who demand payment for a kidney, which is illegal in Sri Lanka under the Transplantation of Human Tissues Act.
- The process can drag on for months while the patient remains on dialysis.

The donor experience is the mirror image:

- A genuine altruistic donor has no public, trustworthy place to register their willingness.
- They risk being approached by intermediaries who treat the gesture commercially.
- They are not given any feedback about whether they could even be a match for the people who contact them.

The doctor experience is one of frustration:

- Transplant coordinators receive ad-hoc enquiries from patients who have "found a donor on Facebook."
- Each enquiry requires fresh medical workup with no structured prior data.
- There is no upstream filter that catches incompatible pairs before clinical resources are spent.

LifeSync is the missing layer between "I need a kidney" / "I am willing to donate" and "the transplant team is reviewing this case."

## 2.2 Affected Areas

**Directly affected parties:**

- **Kidney patients on the transplant waiting list,** who currently spend months searching informally and are vulnerable to exploitation while still on dialysis.
- **Prospective living donors,** who have no safe and ethical place to volunteer.
- **Transplant doctors and coordinators,** who lack a structured pre-clinical filter.

**Indirectly affected parties:**

- **Patients' families,** who shoulder the emotional and financial cost of the search.
- **Hospitals and the public health system,** which absorb the cost of prolonged dialysis when transplants are delayed.
- **The state regulator,** which has an interest in ensuring that all living donations comply with the Transplantation of Human Tissues Act and are not commercial transactions in disguise.

## 2.3 Objectives

### 2.3.1 Main Objectives

- Provide a single, secure platform that connects kidney patients with verified, compatible living donors.
- Use medically-grounded compatibility scoring (ABO blood-group rules combined with HLA typing on A, B, and DR loci) to rank candidates so the most promising matches surface first.
- Place a doctor in the loop: every patient and every donor must be verified by a doctor before any matching contact is allowed.

### 2.3.2 Sub Objectives

- Reduce the time it takes for a patient to find a candidate donor from weeks or months to a single session.
- Give donors a transparent, ethical channel to volunteer that protects them from commercial pressure.
- Provide doctors with a dashboard that shows verification queues, candidate compatibility, and active match requests.
- Give administrators the tools to remove fraudulent accounts and audit platform activity.
- Comply with the spirit of HIPAA-style data protection and the letter of Sri Lankan health and personal-data law.

---

# Chapter Three: Literature Review

## 3.1 Introduction

This literature review surveys published work and existing systems across three areas relevant to LifeSync: (i) the medical basis for kidney compatibility and why HLA matters, (ii) the global landscape of online donor-matching platforms, and (iii) the technology stack patterns used by modern healthtech web applications. The aim is to ground the design choices made in this project in evidence and to identify the gap that LifeSync fills in the Sri Lankan context.

## 3.2 The Medical Basis for Kidney Donor Matching

Successful kidney transplantation requires three layers of compatibility. The first is **ABO blood group compatibility**, which follows well-known transfusion rules: an O-negative donor is the universal donor, an AB-positive recipient is the universal recipient, and pairs that violate these rules face hyperacute rejection. The second layer is **HLA (Human Leukocyte Antigen) matching**, where the recipient's immune system is tested against the donor's antigens at the A, B, and DR loci; the closer the match, the lower the dose of long-term immunosuppression and the better the long-term graft survival. The third layer is the final **crossmatch test** performed in the laboratory just before transplant, which detects pre-formed antibodies that the upstream matching cannot.

Modern guidelines from the British Transplantation Society and the Kidney Disease: Improving Global Outcomes (KDIGO) work group treat HLA matching as a continuous score rather than a hard pass/fail, and accept the use of CREG (Cross-Reactive Group) equivalences when computing antigen-level mismatches. LifeSync's matching algorithm is consistent with this view: it computes a continuous compatibility score, applies CREG-aware comparison at each locus, and is explicit when typing data is incomplete (the UI flags the score as "HLA pending").

## 3.3 Existing Online Donor-Matching Platforms

Internationally, several platforms exist. The U.S. National Kidney Registry and UK Living Kidney Sharing Schemes operate **paired exchange registries** for incompatible pairs and run sophisticated optimisation to find chains of swaps. Platforms such as MatchingDonors.com offer a directory model where patients post their stories and donors browse them. In India and parts of South Asia, social-media-driven groups dominate.

Each model has trade-offs. The official paired-exchange registries are powerful but operate strictly inside national transplant authorities and do not serve the early "I need a donor at all" use case. The directory model (MatchingDonors-style) fills that gap but does little compatibility filtering and limited identity verification. The social-media model is the most accessible but the least safe.

In Sri Lanka, no platform combines the three properties LifeSync targets: low-friction registration (like social media), structured medical compatibility scoring (like the registries), and doctor-mediated verification (like a hospital programme).

## 3.4 User Behaviour and Trust in Healthtech

Studies on patient adoption of digital health platforms consistently identify three drivers of trust: clear data-handling policies, visible institutional endorsement, and the ability to escalate to a human professional. Platforms that hide their data flows or offer no human escalation see drop-off rates above 60% after the first session. LifeSync's design responds to all three: the privacy notice is shown at registration, every match is reviewed by a doctor before chat is enabled, and the verification badge on profiles makes the institutional layer visible.

## 3.5 Technology Choices in Modern Healthtech

The technology landscape for small-to-medium healthtech projects has converged on a few patterns. Server-rendered React frameworks (Next.js, Remix) are now standard for the front end because they combine SEO-friendly server rendering with the component model and ecosystem of React. For the backend, serverless platforms — particularly Firebase, Supabase, and AWS Amplify — are widely adopted because they provide authentication, a real-time database, file storage, and push notifications under one billing umbrella with strong security-rule primitives.

Firebase in particular is well-suited to projects that need real-time updates (chat, notifications, live verification status) without operating a traditional server. Its security-rules language allows enforcement of role-based access at the database level, which complements rather than replaces application-layer checks. LifeSync uses Firebase Authentication, Firestore (with security rules and composite indexes), Cloud Storage, and Cloud Messaging for exactly these reasons.

## 3.6 Identified Research Gaps

The literature review identified the following gaps that this project addresses:

- No public-facing platform in Sri Lanka offers structured HLA-aware matching for living kidney donation.
- Existing donor-directory platforms abroad either omit doctor-mediated verification or place that verification so deep in the workflow that informal contact happens first.
- Publications on healthtech UX repeatedly call for visible verification cues and easy human escalation, yet most kidney-matching prototypes do not implement either.

## 3.7 Conclusion

The medical literature supports HLA-aware compatibility scoring as the right basis for ranking candidates. The platform literature shows that the directory and registry models each capture one part of the puzzle but not all of it. The healthtech UX literature shows that verification and human escalation are the price of trust. LifeSync's contribution is to combine all three — a low-friction directory front end, a registry-grade compatibility engine, and a doctor-in-the-loop verification model — in a single platform built for the Sri Lankan context.

---

# Chapter Four: Method of Approach

## 4.1 Feasibility Study

### 4.1.1 Introduction

The feasibility study evaluates whether LifeSync can be built and operated within reasonable technical, operational, economic, and legal constraints. Each dimension is examined below.

### 4.1.2 Technical Feasibility

**Frontend.** The client is built with **Next.js 16** (App Router) and **React 19**, written in **TypeScript**, and styled with **Tailwind CSS v4**. Next.js was chosen because its server components allow fast initial page loads on slow Sri Lankan mobile connections while still giving the rich interactivity React is known for. TypeScript catches type errors at compile time, which is particularly valuable for a project that handles medical data shapes (HLA typings, blood groups, role unions). Tailwind v4 with PostCSS keeps the styling lean and consistent across a multi-role UI (patient, donor, doctor, admin).

Routing is handled by the Next.js file-system router. Client-side state is managed primarily through React hooks and Firebase real-time subscriptions; there is no separate global state library, which keeps the bundle small. Image upload from the camera or gallery uses an in-browser `imageResize` utility that down-samples large photos before upload to keep Cloud Storage costs and bandwidth predictable.

**Backend.** LifeSync follows a serverless-first architecture. The "backend" is Firebase: **Firebase Authentication** for sign-up, sign-in, and password reset; **Cloud Firestore** for all structured data (users, requests, chats, notifications, announcements); **Cloud Storage** for profile and report images; **Cloud Messaging** for push notifications. Business rules that must run server-side are expressed declaratively as Firestore Security Rules — for example, "a user can only read a chat document if their UID is in the participants array." Composite indexes are version-controlled in `firestore.indexes.json` so that the query plans are reproducible across environments.

This architecture has three benefits in the project's context: there is no server to provision or pay for during development, scaling is automatic, and the security model is auditable as code.

**Compatibility scoring.** The matching algorithm in `client/lib/matching.ts` is a thin orchestrator that delegates HLA scoring to `client/lib/hla.ts`. The HLA module performs CREG-aware locus-by-locus comparison; the orchestrator combines the result with ABO compatibility into a final score, and falls back to a deterministic seeded score (clearly labelled "provisional") when typing data is incomplete so the UI stays stable.

**AI assistance.** A **Chatbase** chatbot is integrated for general user support (registration help, HLA basics, platform navigation). It is loaded as a deferred script and is non-blocking; the platform functions correctly without it.

### 4.1.3 Operational Feasibility

**Target demographics.** LifeSync serves four distinct user roles, each with different needs:

- **Patients** — typically already in contact with a nephrologist, on dialysis, and motivated to find a donor quickly. The UI prioritises clear status, candidate compatibility, and request progress.
- **Donors** — a smaller, more cautious group. The UI prioritises privacy controls, the ability to learn about HLA without committing, and a clear path to ask a doctor questions.
- **Doctors** — clinicians and transplant coordinators. The UI prioritises queue management: pending verifications, active match requests, and access to medical reports.
- **Administrators** — platform operators who manage user lifecycle, fraud, and announcements. The UI prioritises bulk operations and audit visibility.

**User experience.** The platform is responsive (mobile-first), supports a verified-badge system that makes trust signals visible, and uses real-time subscriptions so that status changes (verification approved, request received, new chat message) appear without a refresh.

**Training and support.** Patients and donors require no training — the flows are deliberately similar to consumer onboarding patterns they already know. Doctors and administrators benefit from a short orientation, but the dashboards follow standard patterns (lists, detail panels, action buttons) so the learning curve is short. The integrated Chatbase assistant covers most one-off questions.

**Reliability.** Because the platform runs on Firebase, the practical reliability ceiling is Firebase's (multi-9s SLA). The application code is structured around the MVC-like Next.js convention (route handlers / page components / lib modules) so that bugs are localised and fixable.

### 4.1.4 Economic Feasibility

The project is built on free or freemium tiers during development and pilot:

| Cost Component | Estimated Cost |
| --- | --- |
| Domain name | USD 10–50 / year |
| Firebase Spark plan (dev) | USD 0 |
| Firebase Blaze plan (pilot) | Pay-as-you-go, expected USD 20–100 / month at pilot scale |
| Cloud Messaging | USD 0 |
| Chatbase chatbot | Free tier sufficient for pilot |
| Vercel hosting (if used) | Free tier sufficient; Pro at USD 20 / month |
| Development tools (VS Code, GitHub) | USD 0 |

Revenue is **not** generated by LifeSync, by design — Sri Lankan law forbids commercial trade in organs, and the platform's credibility depends on it remaining non-commercial. Sustainability comes from grant funding, partnership with a hospital or transplant unit, or absorption into a Ministry of Health programme.

### 4.1.5 Legal Feasibility

LifeSync sits at the intersection of several legal regimes:

- **Transplantation of Human Tissues Act (Sri Lanka).** All transplants must be non-commercial, and donor consent must be free and informed. LifeSync is designed to be a discovery and screening tool only; it never facilitates payment for organs and the chat layer carries explicit terms forbidding commercial offers.
- **Personal Data Protection Act, No. 9 of 2022 (Sri Lanka).** Personal data is collected with explicit consent at registration; users can request export and deletion; data is encrypted in transit (HTTPS) and at rest (Firebase-managed encryption); access is enforced by role.
- **Consumer protection.** A clear privacy policy and terms of service are presented before registration. The verification badge is genuine — a profile is not marked verified unless a doctor has actually approved it.

A future deployment for production use would need formal partnership with a registered medical institution, a designated data protection officer, and explicit ethical approval. The platform is built so that this transition is configuration rather than rewrite.

### 4.1.6 Schedule Feasibility

The project ran in agile sprints over the academic year, with the following high-level phases:

- **Discovery & analysis** — stakeholder interviews, survey, requirements freeze, technology selection.
- **Design** — UI mocks, data model, security rules.
- **Implementation** — sprint-based delivery: auth → profiles → HLA editor → matching → requests → chat → notifications → verification → admin dashboard.
- **Testing & validation** — Firestore rules tests, end-to-end role-based scenarios, manual UAT with peer testers acting as patients, donors, and doctors.
- **Final polish & report** — documentation, demo data seeding scripts, supervisor demo.

A Gantt-style timeline is included in the appendix.

## 4.2 Requirement Gathering

A blend of qualitative and quantitative techniques was used.

### 4.2.1 Semi-Structured Interview with a Nephrology Practitioner

A semi-structured interview was conducted with a clinician familiar with kidney transplantation in Sri Lanka. The guiding questions covered: the typical patient journey from diagnosis to transplant, the data points a transplant team needs before scheduling crossmatch, common sources of fraud in informal donor searches, what a "good" online matching tool would look like from the doctor's perspective, and the ethical guardrails that any such tool must enforce.

**Key takeaways from the interview:**

- HLA typing is rarely available at first visit; the platform must work usefully even without it.
- Doctors will not use a tool that floods them with leads — verification queues must be filterable and prioritisable.
- Any chat or contact channel must carry a visible reminder that commercial offers are illegal.
- Real-time status (verification in progress, match request received, etc.) is more valuable than email notifications, which doctors rarely read inside their hospital workflow.

These insights directly shaped the role-aware verification queue, the "HLA pending" UI state, the ABO-only fallback, and the in-platform notification bell.

### 4.2.2 Online Survey

An online survey was distributed to a convenience sample of approximately 30–50 respondents (vehicle of distribution: messaging apps and social media of the project author). The survey covered demographic background, awareness of kidney disease, attitudes toward online donor platforms, and feature preferences. Headline findings:

- A majority of respondents had heard of someone affected by CKD or in need of dialysis.
- A majority preferred a single dedicated platform over Facebook groups.
- Nearly all respondents rated "doctor verification of donor identity" as essential.
- "AI-assisted matching" was viewed positively but only when accompanied by human medical review.
- Privacy of contact details (only revealing phone numbers after a verified match) was rated more important than UI features.

These findings reinforced the architecture: a verified-only match graph, opt-in contact reveal, and a doctor-in-the-loop verification step.

### 4.2.3 Personal and Family Observation

The project author has direct personal connection to the problem domain through family experience with chronic kidney disease, which informed the empathy-driven aspects of the UI: gentle copy in failure states, clear status indicators, and explicit avoidance of "shopping cart" patterns inappropriate to a medical context.

## 4.3 Methodology Selection

### 4.3.1 What Is Agile?

Agile is an iterative, feedback-driven approach to software development. Work is split into short sprints, each producing a working slice of the system; requirements are allowed to evolve as the team learns; collaboration with stakeholders is preferred over rigid documentation.

### 4.3.2 Why Agile Was Chosen

- **Evolving understanding.** Medical compatibility, role boundaries, and verification workflows are domains the author was learning during the project itself; agile let the design follow the learning.
- **Multi-role product.** Patient, donor, doctor, and admin flows interact; building one fully and only then starting the next would have hidden integration problems too late.
- **Small team / single developer.** Agile's lightweight ceremonies (per-sprint planning, in-sprint demos) match a solo or near-solo workflow far better than waterfall stage-gating.
- **Testable in slices.** Each sprint produced something demonstrable — a working login, a working HLA editor, a working chat — which made supervisor reviews and peer feedback concrete.

### 4.3.3 Pros of Agile

- Flexibility to incorporate stakeholder feedback after every sprint.
- Continuous delivery of working software, which keeps motivation and visibility high.
- Early defect detection through repeated end-to-end testing.
- Better alignment with real user needs because real users see the product earlier.

### 4.3.4 Cons of Agile

- Without discipline, sprint scope can creep.
- Documentation must be kept up to date deliberately; it is not a free side-effect.
- Predicting an exact end date is harder than under waterfall — mitigated by maintaining a prioritised backlog and a "must-have / should-have / could-have" cut list.

## 4.4 Testing & Validation

### 4.4.1 Unit Testing

Unit-level testing focused on pure logic modules: the HLA scoring functions in `client/lib/hla.ts`, the ABO compatibility table and orchestrator in `client/lib/matching.ts`, and the image resize utility in `client/lib/imageResize.ts`. These modules are pure functions with deterministic inputs and outputs, which makes them ideal candidates for table-driven tests.

### 4.4.2 Security Rules Testing

Firestore Security Rules are non-trivial and silently dangerous when wrong. They were tested against the Firebase Local Emulator, with negative-path scenarios for: an unauthenticated user attempting to read another user's profile; a patient attempting to mark themselves verified; a non-participant attempting to read a chat; a non-doctor attempting to set verification status. Each negative path returns `permission-denied`, which is the correct behaviour.

### 4.4.3 System / End-to-End Testing

System testing exercised complete user journeys across multiple roles in the same browser session (using Firebase Auth's multi-tab sign-in to simulate two users):

- A patient registers, completes their HLA typing, and sends a request to a candidate donor.
- The donor receives the request, accepts it, and a chat thread is created.
- A doctor sees both profiles in the verification queue, approves both, and the verified badge appears in real time.
- An admin sees the new users in the user list, can disable any account, and the disabled account immediately loses access on its next request.

### 4.4.4 Validation

Validation was carried out by cross-checking expected and observed outcomes during the above scenarios, by comparing computed compatibility scores against hand-worked examples, and by gathering qualitative feedback during informal demos. The platform meets the functional requirements and user expectations identified in Chapter Five.

## 4.5 Test Plan

### 4.5.1 Objectives

- Verify each module performs as designed (unit).
- Verify the database security model rejects every unauthorised access (rules).
- Verify role-spanning user journeys complete end-to-end (system).
- Verify the platform is usable on common Sri Lankan mobile devices and connection speeds.

### 4.5.2 Scope of Testing

- Authentication: register, log in, log out, password reset.
- Profile management: edit, upload image, set HLA, set blood group.
- Matching: candidate listing, score correctness, "HLA pending" fallback.
- Requests: send, accept, reject, transition state.
- Chat: only enabled for accepted matches, only readable by participants.
- Notifications: in-app bell and push (Cloud Messaging).
- Verification: doctor approve/reject; admin override.
- Admin: user list, disable/enable, announcements.

### 4.5.3 Types of Testing Conducted

- **Unit testing** of pure logic modules.
- **Security rules testing** against the Firebase emulator.
- **System / end-to-end testing** across roles.
- **Cross-device manual testing** on Chrome desktop, Firefox desktop, Chrome mobile, and Safari iOS.

### 4.5.4 Test Environment

- **Frontend:** Next.js 16 dev server on `localhost:3000`, plus a Vercel preview deployment for cross-device testing.
- **Backend:** Firebase project (development) with emulator for rules tests, real project for end-to-end.
- **Browsers:** Chrome, Firefox, Safari (latest stable).

### 4.5.5 Test Cases

Representative test cases are tabulated in Appendix 5 (Test Cases). A short selection: register-patient-with-valid-data, register-patient-with-existing-email, sign-in-with-wrong-password, send-request-to-self (must fail), accept-request-as-non-recipient (must fail), open-chat-without-accepted-match (must fail), doctor-approves-verification, admin-disables-user.

### 4.5.6 Bug Tracking and Resolution

Bugs were tracked as GitHub Issues on the project repository, with severity labels (`bug:critical`, `bug:major`, `bug:minor`) and target sprints. Each fix was made on a feature branch and merged via pull request once the relevant tests passed.

### 4.5.7 Success Criteria

- All major user journeys complete without error on a clean account.
- All security-rule negative paths return `permission-denied`.
- Compatibility scores match hand-worked examples for the test HLA panels.
- The platform loads to interactive within 3 seconds on a 4G mobile connection.

## 4.6 Conclusion

The technology choices, the agile methodology, the requirement-gathering programme, and the test plan together support a feasible, well-scoped, and verifiable project. The next chapter formalises the requirements that drove the implementation.

---

# Chapter Five: Requirements

## 5.1 Functional Requirements

1. **Authentication and role-based access.** Users register and sign in with email and password (Firebase Auth). On registration the user selects one of the roles patient / donor / doctor; admin is provisioned out-of-band. The forgot-password flow is supported. Role determines which dashboard the user lands on after sign-in.

2. **Profile management.** Each user maintains a profile with name, contact details, profile image (auto-resized client-side before upload), blood group, and — for patients and donors — HLA typing on the A, B, and DR loci. Profile edits are visible in real time across the platform.

3. **HLA editing and compatibility scoring.** Users can enter their HLA typing through a guided editor that validates locus syntax. The platform computes a compatibility score for any patient–donor pair using ABO rules and CREG-aware HLA comparison; if HLA is incomplete on either side the score is flagged "provisional / HLA pending."

4. **Match discovery.** Patients see a ranked list of candidate donors; donors see incoming requests. Filters allow narrowing by blood group, location, and verification status.

5. **Request workflow.** A patient sends a match request to a donor. The donor accepts or rejects. On acceptance, a private chat is created.

6. **Real-time chat.** Accepted matches share a chat thread that only the two participants and the supervising doctor can read. The chat carries a visible reminder that commercial offers are illegal.

7. **Verification system.** A doctor reviews patient and donor profiles in a verification queue and approves or rejects each. Verified profiles carry a visible badge.

8. **Notifications.** In-app notification bell plus push notifications via Firebase Cloud Messaging cover: new request received, request accepted/rejected, verification approved, new chat message, system announcements.

9. **Doctor dashboard.** Doctors see: pending verifications, active matches they supervise, and announcements they have authored.

10. **Admin dashboard.** Admins see: user list (filterable by role and status), the ability to disable/enable users, the ability to broadcast announcements, and verification audit visibility.

11. **AI assistant.** A Chatbase-powered support chatbot answers general questions about HLA matching, registration, and platform features.

## 5.2 Non-Functional Requirements

1. **Performance.** Pages load to interactive within 3 seconds on a representative 4G connection. Real-time updates (chat, notifications, status changes) appear within 1 second of the change.

2. **Scalability.** The Firebase backend scales horizontally with no application-level changes. Composite indexes are version-controlled to keep query plans reproducible as data volume grows.

3. **Security.** All traffic is HTTPS. Passwords are never stored — Firebase Auth handles credential storage. Firestore Security Rules enforce role-based access at the database level. File access in Cloud Storage is governed by parallel rules. Sensitive medical fields are visible only to the user themselves, their matched counterpart (after verification), and authorised doctors.

4. **Availability.** The target is 99.9% uptime, inherited from the Firebase platform.

5. **Usability.** The interface is mobile-first and follows accessible-color-contrast guidelines. All interactive elements are keyboard-reachable. Copy is plain-English at a level suitable for non-medical readers.

6. **Reliability.** No data loss across reasonable network interruptions. Optimistic UI updates roll back on confirmed server failure. Failed image uploads are retryable.

7. **Maintainability.** The codebase is TypeScript end-to-end, with shared types between UI and data models. Pure logic (HLA, matching, image resize) is isolated in `client/lib/` so it can be unit-tested without React. Security rules are tracked in version control.

## 5.3 User Requirements

- **Patients** want to find a candidate donor as quickly as possible, with confidence that the candidate is genuine and has been screened by a doctor.
- **Donors** want a safe, ethical channel to volunteer that protects their identity until they choose to reveal it.
- **Doctors** want a single dashboard that surfaces verification work and match progress without overwhelming them.
- **Admins** want the operational tools to keep the platform free of fraudulent or abusive accounts.

## 5.4 System Requirements

**Frontend**

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4 with PostCSS

**Backend (Firebase)**

- Firebase Authentication
- Cloud Firestore (with security rules and composite indexes in `firestore.rules` and `firestore.indexes.json`)
- Cloud Storage (with `storage.rules`)
- Firebase Cloud Messaging

**External services**

- Chatbase (AI support chatbot)

**Hardware (development workstation, minimum)**

- Intel Core i5 (or Apple M1) or higher
- 8 GB RAM (16 GB recommended)
- 10 GB free SSD storage
- Stable broadband connection

**Hardware (end user, minimum)**

- Any modern smartphone or laptop
- A modern browser (last two major versions of Chrome, Firefox, Safari, or Edge)

---

# Chapter Six: End Project Report

## 6.1 Project Summary

LifeSync is a kidney patient–donor–doctor matching platform built on Next.js 16, React 19, TypeScript, and Firebase. It addresses the absence of a centralised, ethical, medically-rigorous channel for living kidney donation in Sri Lanka. Patients and donors register, complete HLA-aware medical profiles, and are matched by a deterministic compatibility algorithm; doctors review and verify profiles in a queue; a real-time chat and notification system keeps the parties coordinated; an admin dashboard manages the user lifecycle.

## 6.2 Objectives & Evaluation

### 6.2.1 Main Objectives

- **Provide a single, secure platform that connects kidney patients with verified, compatible living donors.** Achieved. Patient and donor roles are first-class, the matching graph respects verification status, and chat is gated on acceptance.
- **Use medically-grounded compatibility scoring.** Achieved. ABO rules plus CREG-aware HLA scoring at A, B, and DR loci is implemented in `client/lib/matching.ts` and `client/lib/hla.ts`, with explicit "HLA pending" handling.
- **Place a doctor in the loop.** Achieved. The verification queue is part of the doctor dashboard, and verification is a precondition for several downstream features.

### 6.2.2 Sub Objectives

- **Reduce time-to-find a candidate donor from weeks to a single session.** Achieved in principle within the platform's reach; clinical-pilot validation is future work.
- **Give donors a transparent, ethical channel.** Achieved.
- **Provide doctors with a useful dashboard.** Achieved at a functional level; further iteration with practising clinicians is the natural next step.
- **Provide admin tooling.** Achieved.
- **Comply with Sri Lankan personal-data and transplantation law.** Achieved in design; production deployment would require formal institutional approval.

### 6.2.3 Evaluation of Objective Fulfilment

| Status | Items |
| --- | --- |
| Successfully met | Role-based platform; HLA-aware matching; doctor verification; real-time notifications and chat; admin lifecycle tools |
| Partially met | Push notification breadth (some browsers limit FCM behaviour); profile completeness coaching |
| Areas for improvement | Multi-language UI (Sinhala, Tamil); deeper integration with hospital LIMS for HLA data import; clinical pilot with a real transplant unit |

## 6.3 Realisation of Business Objectives

- **Reduce search time.** The structured search and ranked candidate list reduce the discovery effort from "many weeks of social-media canvassing" to a single session of profile review. Quantified validation requires a clinical pilot.
- **Increase ethical donor visibility.** Genuine donors now have a public, doctor-supervised place to register, distinct from social-media noise.
- **Improve doctor productivity.** The verification queue presents work in a single list, and downstream chat threads keep all communication for a case in one place.
- **Reduce financial cost.** Faster matching shortens dialysis duration, which is a major direct healthcare cost in Sri Lanka.
- **Facilitate compliant communication.** All chat carries the legal reminder that organ trade is forbidden under the Transplantation of Human Tissues Act.

## 6.4 Changes Made During the Project

- **Verification became a first-class flow rather than a passive flag.** Initially planned as a profile attribute; promoted to a queue, an explicit doctor action, and a visible badge after early feedback that "trust must be visible."
- **Chatbase integration was added late.** Originally intended as a documentation page; replaced with an embedded AI assistant after observing that users prefer in-context help.
- **Push notifications were added.** Initially the design relied on email; switched to Firebase Cloud Messaging after the survey result that doctors and patients live inside their phones, not their inboxes.
- **The "HLA pending" UI state was added.** The first matching implementation refused to score incomplete typings; this hid genuinely useful ABO-only candidates and was corrected.

---

# Chapter Seven: Project Post-Mortem

## 7.1 Appropriateness of the Objectives

The objectives set at the project's start remained appropriate throughout. The core insight — that the gap is "trustworthy structured matching, not directory listing" — held up under stakeholder feedback and shaped every design decision.

## 7.2 Product Specification vs. Business Objectives

The implemented product covers the headline business objectives. Where the spec went beyond the business objectives, those additions (push notifications, AI assistant) have been justified by user feedback. Where the spec falls short of the long-term business objectives (multilingual support, hospital LIMS integration), those gaps are documented as future work.

## 7.3 Client Relationship

In the absence of a paying client, the supervisor and the interviewed clinician acted as proxy stakeholders. Regular short demos kept the feedback loop tight; the most useful single piece of feedback ("trust must be visible") came from the clinician interview and reshaped the verification flow.

## 7.4 Development Process Evaluation

Agile worked well for this project. The single most valuable practice was the per-sprint working demo: it forced integration to keep up with feature growth and surfaced UX problems that pure unit testing would have missed. The least valuable practice (in this solo context) was formal sprint retrospectives — these were more effective as informal end-of-day journaling.

## 7.5 Technology Choices

The technology stack served the project well. Next.js 16's App Router was new during the project window but stable enough to use in earnest. Firebase saved an enormous amount of time by collapsing auth, database, storage, and push notifications into one configuration. TypeScript paid for itself by catching role-confusion bugs at compile time. Tailwind v4 kept the UI consistent across four role dashboards without a design-system library.

The one technology choice that had a learning cost was Firestore Security Rules: their declarative expression language is unusual and required deliberate practice to write securely. The investment was worth it — the rules are now the strongest line of defence in the platform.

## 7.6 Personal Performance

Personal performance was steady and goal-oriented. Strengths were ruthless prioritisation and willingness to delete features that did not serve the core mission. Weaknesses were over-investing in UI polish during sprints when functional gaps remained, and underestimating the time required to write good security rules.

## 7.7 Lessons Learned

- **Get one full role end-to-end before starting another.** A working patient flow is more useful than three half-built ones.
- **Verification is a feature, not a flag.** Make trust signals first-class.
- **Real-time wins over polling, every time.** Firestore subscriptions paid back their setup cost within a week.
- **Write security rules tests early.** Rules that are wrong in dev are catastrophic in prod.
- **Solo developers benefit more from journaling than from formal ceremonies.**

---

# Conclusion

LifeSync addresses a real and underserved problem in Sri Lankan healthcare: the absence of a structured, trustworthy, medically-rigorous channel that connects kidney patients with willing living donors and gives doctors a tool to govern that connection. By combining a low-friction directory-style front end, a registry-grade compatibility engine, and a doctor-mediated verification model, the platform fills the gap that Facebook groups, paired-exchange registries, and hospital programmes each leave open.

The technical foundation — Next.js 16, React 19, TypeScript, and Firebase — is modern, scalable, and economical for the project's stage. The agile methodology let the design follow the learning. The HLA-aware compatibility algorithm is the project's most distinctive technical contribution and is the piece most worth carrying forward into a clinical pilot.

LifeSync is not a finished product, and it does not pretend to be. It is a defensible foundation: enough to demonstrate that the problem is solvable in software, enough to invite a transplant unit to pilot it, and enough to lay out the next steps clearly. Future work — multilingual UI, deeper LIMS integration, formal ethics approval, and a clinical pilot — is well scoped against this foundation.

The project demonstrates how thoughtful application of mainstream web technology can address a high-stakes social problem. That, more than any individual feature, is the claim it stands behind.

---

# References

- British Transplantation Society and Renal Association. *Guidelines for Living Donor Kidney Transplantation* (latest edition).
- Kidney Disease: Improving Global Outcomes (KDIGO) Work Group. *KDIGO Clinical Practice Guideline on the Evaluation and Care of Living Kidney Donors.*
- Sri Lanka Ministry of Health. *Annual Health Bulletin* (latest edition).
- Department of Government Information, Sri Lanka. *Transplantation of Human Tissues Act, No. 48 of 1987 (as amended).*
- Government of Sri Lanka. *Personal Data Protection Act, No. 9 of 2022.*
- National Kidney Registry (United States). https://www.kidneyregistry.org/
- NHS Blood and Transplant. *UK Living Kidney Sharing Scheme.* https://www.nhsbt.nhs.uk/
- MatchingDonors.com. https://www.matchingdonors.com/
- Vercel. *Next.js Documentation.* https://nextjs.org/docs
- Google. *Firebase Documentation.* https://firebase.google.com/docs
- Tailwind Labs. *Tailwind CSS v4 Documentation.* https://tailwindcss.com/docs
- Chatbase. *Chatbase Documentation.* https://www.chatbase.co/

---

# Appendix

## Appendix 1: User Guide

### How to set up the project environment

1. Clone the repository.
2. From the project root, change into the `client` directory.
3. Run `npm install` to install dependencies (first time only).
4. Create `client/.env.local` with the Firebase configuration values (`NEXT_PUBLIC_FIREBASE_API_KEY` etc.) and the Chatbase ID (`NEXT_PUBLIC_CHATBASE_ID`).
5. Run `npm run dev` to start the development server.
6. Open the URL printed by Next.js (typically `http://localhost:3000`) in a browser.

### How to register and sign in as a patient

1. Click **Join as a Patient** on the landing page.
2. Fill in name, email, password, and profile image.
3. Submit the registration form; you are signed in immediately and routed to the patient dashboard.
4. Subsequent visits: use **Sign in** with the same email and password.

### How to register as a donor

The flow is identical to the patient flow, with **Join as a Donor** selected on the landing page.

### How to set HLA typing

1. From the patient or donor dashboard, open the profile editor.
2. Open the **HLA** section.
3. Enter A, B, and DR locus values guided by the inline help.
4. Save. The profile updates in real time; matching scores recompute on the next view.

### How to send a match request

1. From the patient dashboard, open the candidate list.
2. Open a candidate profile.
3. Click **Send request**.
4. The donor receives an in-app notification and a push notification.

### How to accept or reject a request (donor)

1. From the donor dashboard, open the requests panel.
2. Open the request.
3. Click **Accept** or **Reject**. On accept, a chat thread is created.

### How to verify a profile (doctor)

1. Sign in as a doctor.
2. Open the verification queue from the doctor dashboard.
3. Open a profile, review the medical fields, and click **Approve** or **Reject**.
4. The profile updates in real time and the verified badge appears for approved profiles.

### How to manage users (admin)

1. Sign in as an admin.
2. Open the user list from the admin dashboard.
3. Filter by role or status.
4. Use **Disable** / **Enable** to toggle account access.
5. Use the announcements page to broadcast system-wide messages.

## Appendix 2: PID (Project Initiation Document)

The full PID — produced at the start of the project and accepted by the supervisor — is held in the project repository. It covers the project's business case, scope, objectives, methodology, initial plan, risk analysis, and outline budget.

## Appendix 3: Interim Report

The interim report — produced at the project's mid-point — documented the state of the system at that time (authentication, profiles, initial matching) and the plan for the remaining sprints (verification, chat, notifications, admin). It is held in the project repository.

## Appendix 4: Records of Supervisory Meetings

Minutes from supervisory meetings — covering project idea approval, the literature review, the design pivot to make verification a first-class flow, and the final demo — are held in the project repository.

## Appendix 5: Test Cases

A representative selection of test cases:

| ID | Description | Steps | Expected | Status |
| --- | --- | --- | --- | --- |
| TC-001 | Register a new patient with valid data | Open landing page → click *Join as a Patient* → fill the form → submit | Account created; redirected to patient dashboard | Pass |
| TC-002 | Register with an existing email | Same as TC-001 with an email already in use | Form shows "email already in use" error | Pass |
| TC-003 | Sign in with valid credentials | Open landing page → click *Sign in* → enter email and password → submit | Redirected to the dashboard for the user's role | Pass |
| TC-004 | Sign in with wrong password | Same as TC-003 with incorrect password | Form shows authentication error; no session created | Pass |
| TC-005 | Forgot password flow | Open *Sign in* → click *Forgot password* → enter email → check inbox | Reset email arrives; reset link sets a new password | Pass |
| TC-006 | Set HLA typing | Open profile editor → open HLA section → enter A, B, DR values → save | HLA stored; matching score updates on next candidate view | Pass |
| TC-007 | Match list shows compatibility score | Sign in as patient → open candidate list | Candidates appear sorted by score; provisional candidates flagged "HLA pending" | Pass |
| TC-008 | Send match request | Open candidate profile → click *Send request* | Donor receives in-app and push notification | Pass |
| TC-009 | Send request to self (must fail) | Attempt to send a match request to one's own profile | Action rejected; UI prevents the call; rules also reject if forced | Pass |
| TC-010 | Accept match request creates chat | Sign in as donor → open request → click *Accept* | Request marked accepted; chat thread visible to both parties | Pass |
| TC-011 | Non-participant cannot read chat | Sign in as a third user → attempt to read the chat document directly | `permission-denied` from Firestore | Pass |
| TC-012 | Doctor approves verification | Sign in as doctor → open verification queue → click *Approve* on a profile | Profile shows verified badge in real time | Pass |
| TC-013 | Patient cannot self-verify | Sign in as patient → attempt to write `verified: true` directly | `permission-denied` from Firestore | Pass |
| TC-014 | Admin disables a user | Sign in as admin → open user list → click *Disable* | Disabled user is signed out on next request; cannot sign in | Pass |
| TC-015 | Push notification on accepted request | Trigger acceptance with a registered FCM token | Push notification arrives on the patient's device | Pass |
