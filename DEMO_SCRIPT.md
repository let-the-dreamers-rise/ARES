# 🎬 ARES — 3-Minute Demo Video Script

---

## PRE-RECORDING CHECKLIST
- [ ] Backend running: `python -m uvicorn main:app --port 8000`
- [ ] Frontend running: `npm run dev` → http://localhost:5173
- [ ] Browser maximized, dark theme
- [ ] Screen recorder ready (OBS / Xbox Game Bar / Loom)
- [ ] Microphone tested

---

## SCRIPT

### [0:00–0:20] HOOK + PROBLEM (20 seconds)

**[SHOW: Title slide or ARES splash screen]**

> "Universities are the most attacked sector in the world — 1,800 cyberattacks per week, with an average breach costing $3.86 million."
>
> "But here's the real problem: current tools can only DETECT attacks. We built something that PREDICTS them."
>
> "This is ARES — the Adversarial Risk and Exploitation Simulator."

---

### [0:20–0:50] WHAT IS ARES (30 seconds)

**[SHOW: ARES UI in standby mode — the tactical command center]**

> "ARES is an AI-driven cyberattack simulation engine. It creates a digital twin of a university campus network — modelling every student, faculty member, admin, and IT system as nodes in a hybrid graph."
>
> "It then unleashes three coordinated AI attack agents — a phishing generator, a credential exploiter, and a lateral movement engine — and runs over 100 Monte Carlo simulations to statistically predict which attacks would succeed."

---

### [0:50–1:30] LIVE DEMO — GENERATE + SIMULATE (40 seconds)

**[ACTION: Click GENERATE CAMPUS]**

> "Let's generate a campus with 750 nodes — students, faculty, 10 departments, plus infrastructure like auth servers and email gateways."

**[WAIT for graph to appear — show the radial network layout]**

> "Here's our campus digital twin. Blue nodes are safe. Each node has susceptibility scores, privilege levels, and trust-weighted communication edges."

**[ACTION: Adjust infection probability slider to ~70%, initial compromised to 5]**

> "Let's configure an aggressive attack — 70% infection probability, 5 initially compromised accounts."

**[ACTION: Click RUN]**

> "ARES is now running 100 independent Monte Carlo iterations, each deploying all three agents in coordinated phases — phishing first, then credential exploitation, then infrastructure lateral movement."

**[WAIT for results to appear — ~5 seconds]**

---

### [1:30–2:10] RESULTS + INTELLIGENCE (40 seconds)

**[SHOW: Full UI with results populated]**

> "The simulation is complete. Look at the results:"

**[POINT TO: Risk gauge in top bar]**

> "Our Global Risk Index shows the overall campus vulnerability. The threat level indicator has updated."

**[POINT TO: Right panel — top vulnerable nodes]**

> "The Threat Intelligence panel identifies the most vulnerable nodes. Notice that WEB_PORTAL and EMAIL_GATEWAY consistently score highest — these are infrastructure bottleneck nodes with high betweenness centrality."

**[ACTION: Step through timeline with ▶ button]**

> "And using the timeline scrubber, we can replay the infection propagation step by step. Watch how nodes turn from blue to yellow to red — this isn't animation, it's real simulation data from the Monte Carlo engine."

---

### [2:10–2:40] DEFENSE RECOMMENDATIONS + AMD (30 seconds)

**[POINT TO: Bottom panel — defense recommendations]**

> "The bottom panel automatically generates prioritized defense recommendations with cost estimates. High-priority: deploy MFA campus-wide for $25K, projected to reduce compromise by 45%. Medium: zero-trust network architecture. Each recommendation is data-driven from the simulation results."

**[POINT TO: AMD badge or mention verbally]**

> "Architecturally, ARES is designed for AMD Instinct GPU acceleration. The Monte Carlo engine is embarrassingly parallel — on an MI300X, we can run 1,000 simultaneous iterations across GPU compute units using ROCm and PyTorch. The migration path is documented in every module."

---

### [2:40–3:00] CLOSING + IMPACT (20 seconds)

**[SHOW: Full ARES UI one final time]**

> "ARES doesn't detect attacks — it predicts them. It gives universities the power to simulate adversarial campaigns, quantify their risk, and make data-driven security investments."
>
> "Built with Python, FastAPI, React, and NetworkX. Optimized for AMD Instinct. This is ARES."

**[END]**

---

## POST-RECORDING
- Trim to exactly 3:00 or under
- Add background music (subtle, electronic/dark)
- Upload to YouTube (unlisted) or Google Drive
- Add link to SUBMISSION_DECK.md

---
