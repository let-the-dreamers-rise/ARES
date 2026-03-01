# 🛡 ARES — Slide Deck Content
## Presentation Slides (Copy into Google Slides / PowerPoint)

---

## SLIDE 1: TITLE

**Background:** Dark matte black (#0B0F14) with subtle grid pattern
**Logo:** ARES shield icon (blue gradient)

```
🛡 ARES
Adversarial Risk & Exploitation Simulator

AI-Driven Cyberattack Simulation for Education

Team: [Your Team Name]
AMD Hackathon 2026
```

---

## SLIDE 2: THE PROBLEM

**Background:** Dark with red accent highlights

```
THE PROBLEM

🔴 #1 Most Attacked Sector
   Universities face 1,800+ cyberattacks per week

🔴 $3.86M Average Breach Cost
   IBM X-Force 2024 — education sector data breaches

🔴 83% of Attacks Start with Phishing
   AI-generated phishing makes every student a target

🔴 Current Tools Are REACTIVE
   Firewalls, SIEMs, and scanners detect... but don't predict
```

**Speaker Notes:** "The education sector is uniquely vulnerable — open networks, BYOD policies, low security budgets, high-value research data, and a population with minimal cybersecurity training."

---

## SLIDE 3: OUR SOLUTION

**Background:** Dark with blue glow accent

```
ARES — The Solution

"Don't detect attacks. PREDICT them."

    GENERATE          SIMULATE          ANALYZE           DEFEND
    Campus            AI Attack         Risk              Prioritized
    Digital           Agents ×          Scoring &         Defense
    Twin              Monte Carlo       Clustering        Recommendations
      ↓                  ↓                 ↓                  ↓
   750 nodes         100 iterations    Centrality        Costed
   2 layers          3 agents          Spectral          actionable
   Trust edges       Probabilistic     0–100 index       ROI-driven
```

**Speaker Notes:** "ARES builds a digital twin of your campus, deploys three coordinated AI attack agents, runs Monte Carlo simulations, and generates quantified defense recommendations."

---

## SLIDE 4: HOW IT'S DIFFERENT

**Background:** Dark with comparison table

```
HOW ARES IS DIFFERENT

                    Traditional Tools        ARES
                    ─────────────────        ────
Approach:           Reactive detection       Predictive simulation
Attack Model:       Single technique         Multi-agent coordinated APT
Risk Score:         Heuristic / manual       Statistical (100+ simulations)
Graph Awareness:    None                     Centrality + Spectral Clustering
Recommendations:    Generic best practices   Costed, data-driven, prioritized
GPU Scaling:        Not applicable           AMD Instinct MI300X native
```

**Speaker Notes:** "Existing tools like KnowBe4 only test phishing awareness. Vulnerability scanners check CVEs in isolation. SIEMs react to past events. ARES simulates the ENTIRE kill chain before it happens."

---

## SLIDE 5: ARCHITECTURE

**Background:** Dark with architecture diagram

```
                    ARCHITECTURE

┌──────────────────────────────────────┐
│         REACT + VITE FRONTEND        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐ │
│  │Status│ │Ctrl  │ │Graph │ │Intel│ │
│  │Bar   │ │Panel │ │(Flow)│ │Panel│ │
│  └──────┘ └──────┘ └──────┘ └─────┘ │
│  ┌──────────────────────────────────┐│
│  │     Defense Recommendations      ││
│  └──────────────────────────────────┘│
└───────────────┬──────────────────────┘
                │ REST API
┌───────────────┴──────────────────────┐
│         FASTAPI BACKEND              │
│                                      │
│  ┌─────────┐ ┌──────────┐ ┌───────┐ │
│  │ Graph   │ │Simulation│ │ Risk  │ │
│  │ Builder │ │ Engine   │ │ Model │ │
│  │NetworkX │ │Monte     │ │Scikit │ │
│  │         │ │Carlo     │ │Learn  │ │
│  └─────────┘ │┌────────┐│ └───────┘ │
│              ││3 Agents││           │
│              │└────────┘│           │
│              └──────────┘           │
└───────────────┬──────────────────────┘
                │
      ┌─────────┴─────────┐
      │   AMD INSTINCT    │
      │   GPU (Future)    │
      │   ROCm + PyTorch  │
      └───────────────────┘
```

---

## SLIDE 6: THE AI ATTACK AGENTS

**Background:** Dark with red/amber/purple highlights

```
THREE COORDINATED AI ATTACK AGENTS

🔴 AGENT A: Phishing Generator
   Targets: Human nodes (students, faculty)
   Model: P = base × susceptibility × trust_weight
   Strategy: High-susceptibility first → trust-propagation

🟠 AGENT B: Credential Exploiter
   Targets: Compromised humans
   Model: P = base × role_factor / privilege_level
   Strategy: Escalate from Student → Admin → IT

🟣 AGENT C: Lateral Movement Engine
   Targets: Infrastructure nodes
   Model: P = base × (privilege / required_access)
   Strategy: Cross-layer traversal to reach servers

All three execute in COORDINATED PHASES per simulation step
```

**Speaker Notes:** "These agents mirror real APT tactics. Phase 1: social engineering. Phase 2: credential theft and privilege escalation. Phase 3: lateral movement to high-value infrastructure. This coordinated kill chain is what makes ARES realistic."

---

## SLIDE 7: RISK SCORING

**Background:** Dark with formula highlight

```
MULTI-FACTOR RISK SCORING

V(node) = 0.30 × susceptibility
        + 0.25 × degree_centrality
        + 0.30 × betweenness_centrality
        + 0.15 × privilege_factor

 Susceptibility     → How easily tricked (students: higher)
 Degree Centrality  → How connected (hubs: higher risk)
 Betweenness        → Bridge nodes (critical pathways)
 Privilege Factor   → Escalation value (admin/IT: higher)

 Cluster Risk = Spectral Clustering + Community Analysis
 Global Campus Risk Index = 0–100 composite score
```

---

## SLIDE 8: LIVE DEMO SCREENSHOT

**Background:** Full ARES UI screenshot (after simulation)

```
[INSERT SCREENSHOT OF FULL ARES UI WITH SIMULATION RESULTS]

Key highlights:
• 750-node interactive graph with React Flow
• Dynamic node coloring (blue → yellow → red)
• Timeline scrubber for infection replay
• Top vulnerable nodes with risk scores
• Defense recommendations with cost estimates
```

---

## SLIDE 9: AMD INTEGRATION

**Background:** AMD red accent with dark theme

```
AMD ACCELERATION STRATEGY

┌────────────────────┬──────────────┬──────────────────────┐
│ Component          │ Current      │ AMD Optimized        │
├────────────────────┼──────────────┼──────────────────────┤
│ Monte Carlo Engine │ NumPy + CPU  │ PyTorch + ROCm       │
│                    │              │ MI300X: 1000+ iters  │
├────────────────────┼──────────────┼──────────────────────┤
│ Graph Centrality   │ NetworkX     │ cuGraph-ROCm         │
│                    │              │ GPU-parallel BFS     │
├────────────────────┼──────────────┼──────────────────────┤
│ Agent Intelligence │ Probabilistic│ GNN/RL on Instinct   │
│                    │              │ PyTorch Geometric    │
├────────────────────┼──────────────┼──────────────────────┤
│ Edge Deployment    │ — Not yet —  │ Ryzen AI XDNA NPU   │
│                    │              │ Campus-local monitor │
└────────────────────┴──────────────┴──────────────────────┘

WHY AMD?
• MI300X: 192GB HBM3 → hold 100K+ node graphs in GPU memory
• ROCm: Open-source CUDA alternative → aligns with education values
• Ryzen AI: Edge inference without cloud dependency → data privacy
```

---

## SLIDE 10: TECHNOLOGIES

**Background:** Dark with tech logos

```
TECHNOLOGY STACK

Backend                        Frontend
─────────                      ────────
Python 3.12                    React 18
FastAPI                        Vite 6
NetworkX                       React Flow v12
NumPy                          Framer Motion
scikit-learn                   Tailwind CSS v4
Pydantic                       Recharts

GPU Path (Future)
─────────────────
PyTorch + ROCm
PyTorch Geometric
cuGraph-ROCm
ONNX Runtime (Ryzen AI)
```

---

## SLIDE 11: IMPACT & MARKET

**Background:** Dark with green accent for positive numbers

```
IMPACT & MARKET OPPORTUNITY

📊 Addressable Market
   • 30,000+ universities globally
   • $150M–$450M TAM (SaaS model)

💰 Pricing Model
   • $5,000–$15,000 / university / year
   • Tiered: Basic (simulation) → Pro (GPU) → Enterprise (real-time)

🎯 Impact
   • Reduce successful attacks by 40–60% (based on simulation-informed defense)
   • Cut incident response costs by predicting attack vectors
   • Enable data-driven security budget allocation

📈 Growth Path
   • Phase 1: Universities (education verticle)
   • Phase 2: Healthcare (similar open network challenges)
   • Phase 3: Government / critical infrastructure
```

---

## SLIDE 12: THANK YOU + CTA

**Background:** ARES UI screenshot faded, with centered text

```
🛡 ARES
Adversarial Risk & Exploitation Simulator

"Don't detect attacks. Predict them."

GitHub: [link]
Demo: http://localhost:5173
API Docs: http://localhost:8000/docs

Thank you.

Team: [Your Team Name]
```

---
