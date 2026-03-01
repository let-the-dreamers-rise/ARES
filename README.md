
<h1 align="center">ARES</h1>
<h3 align="center">Adversarial Risk & Exploitation Simulator</h3>
<p align="center">
  <em>AI-driven cyberattack simulation & predictive risk modeling for education institutions</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/NetworkX-3.6-FF6F00?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AMD_Instinct-Optimized-ED1C24?style=for-the-badge&logo=amd&logoColor=white" />
</p>

---

## 🔥 What is ARES?

**ARES doesn't detect attacks — it predicts them.**

Universities are the #1 most attacked sector globally — facing 1,800+ cyberattacks per week with an average breach cost of $3.86M. Current tools can only react. ARES simulates attacks **before they happen**.

ARES constructs a **digital twin** of a university campus network — modeling every student, faculty member, admin, and IT system as nodes in a hybrid graph — then deploys **three coordinated AI attack agents** and runs **100+ Monte Carlo simulations** to statistically predict which attacks would succeed, how fast they'd spread, and what defenses to prioritize.

### Key Capabilities

| Capability | Description |
|-----------|-------------|
| 🧬 **Hybrid Graph Modeling** | Two-layer network: human communication + infrastructure access, with cross-layer edges |
| 🤖 **Multi-Agent Attack Simulation** | Three AI agents (Phishing, Credential Exploitation, Lateral Movement) coordinating in kill-chain phases |
| 📊 **Monte Carlo Risk Prediction** | 100+ independent iterations producing statistical confidence, not single-point estimates |
| 🔬 **Graph-Theoretic Scoring** | Centrality-based vulnerability scoring + spectral clustering for community risk |
| 🛡 **Actionable Defense ROI** | Prioritized recommendations with cost estimates and risk reduction percentages |
| 🚀 **AMD GPU-Scalable** | Architecture designed for AMD Instinct MI250X/MI300X via ROCm + PyTorch |

---

## 🖥 Screenshots

### Tactical Command Center — Initial State
The ARES interface features a CrowdStrike/Darktrace-inspired dark tactical UI with real-time risk gauges, animated threat indicators, and a 3-step simulation wizard.

### Campus Network Generated — 750+ Node Graph
Interactive graph visualization powered by React Flow showing the campus digital twin with human nodes (students, faculty, admin, IT, researchers) arranged by department, and infrastructure nodes (auth servers, email gateway, cloud DB) clustered at the center.

### Simulation Complete — Full Threat Intelligence
After Monte Carlo simulation: dynamic node coloring (blue→yellow→red), populated threat intelligence panel with top vulnerable nodes, cluster risk analysis, attack path frequencies, and auto-generated defense recommendations with cost estimates.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** — [Download](https://www.python.org/downloads/) (check "Add to PATH")
- **Node.js 18+** — [Download](https://nodejs.org/) (LTS version)

### Installation

```bash
# Clone the repo
git clone https://github.com/[your-username]/ares-simulator.git
cd ares-simulator

# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### Running

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.  
API docs available at **http://localhost:8000/docs**.

---

## 🎮 How to Use

```
STEP 1  →  Click GENERATE CAMPUS        Create a synthetic 750-node campus network
STEP 2  →  Configure attack parameters  Adjust infection probability, iterations, depth
STEP 3  →  Click RUN                    Execute Monte Carlo adversarial simulation
STEP 4  →  Use Timeline Scrubber        Replay infection propagation step-by-step
STEP 5  →  Review Intelligence          Analyze risk scores, clusters, attack paths
STEP 6  →  Read Recommendations         Prioritized defenses with cost estimates
```

---

## 🏗 Architecture

```
ARES/
├── backend/                        # Python FastAPI Backend
│   ├── main.py                     # Application entrypoint + CORS config
│   ├── requirements.txt            # Python dependencies
│   ├── api/
│   │   └── routes.py               # 5 REST API endpoints
│   ├── graph/
│   │   └── campus_graph.py         # Synthetic campus graph builder (500-1000 nodes)
│   ├── agents/
│   │   ├── base.py                 # Abstract attack agent framework (GNN/RL upgrade path)
│   │   ├── phishing.py             # Agent A: AI Phishing Generator
│   │   ├── credential_exploiter.py # Agent B: Credential Exploiter
│   │   └── lateral_movement.py     # Agent C: Lateral Movement Engine
│   ├── simulation/
│   │   └── engine.py               # Monte Carlo simulation engine (parallel execution)
│   ├── models/
│   │   └── risk.py                 # Multi-factor risk scoring + spectral clustering
│   └── utils/
│       └── serialization.py        # Graph/result JSON serialization
│
├── frontend/                       # React + Vite + Tailwind Frontend
│   ├── package.json
│   ├── vite.config.js              # Vite config with API proxy
│   ├── index.html
│   └── src/
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Tactical Command Center layout + state management
│       ├── index.css               # Full design system (508 lines)
│       ├── services/
│       │   └── api.js              # API service layer
│       └── components/
│           ├── TopStatusBar.jsx    # ARES logo, animated SVG risk gauge, threat level
│           ├── LeftControlPanel.jsx # 3-step wizard, parameter sliders, scenario selector
│           ├── StrategicMap.jsx    # React Flow interactive graph + timeline scrubber
│           ├── RightIntelPanel.jsx # Simulation metrics, top nodes, clusters, attack paths
│           └── BottomCommandPanel.jsx # Defense recommendations with cost estimates
│
├── README.md
├── SETUP_GUIDE.md                  # Quick setup for new machines
├── SUBMISSION_DECK.md              # Hackathon submission content
├── DEMO_SCRIPT.md                  # 3-minute demo video script
└── SLIDE_DECK_CONTENT.md           # 12-slide presentation content
```

---

## 🧠 How the Simulation Works

### 1. Campus Graph Generation

ARES builds a **two-layer hybrid graph** with NetworkX:

| Layer | Nodes | Edges |
|-------|-------|-------|
| **Human** | 500–1000 nodes: Students, Faculty, Admin, IT, Researchers across 10 departments | Weighted trust edges based on department proximity, role similarity |
| **Infrastructure** | 8+ nodes: Auth Server, Email Gateway, Cloud DB, Lab Servers, VPN, DNS, etc. | Backbone interconnections with criticality scores |
| **Cross-Layer** | — | Role-based access control: privilege level → infrastructure access |

Each human node has attributes: `susceptibility` (0–1), `privilege` (1–5), `department`, `role`, `state`.

### 2. Multi-Agent Attack Model

Three specialized agents execute in **coordinated phases** per simulation step — mimicking real APT kill chains:

| Agent | Phase | Target | Probability Model |
|-------|-------|--------|-------------------|
| 🔴 **Phishing Generator** | 1: Social Engineering | Safe human nodes | `P = base × susceptibility × trust_weight` |
| 🟠 **Credential Exploiter** | 2: Privilege Escalation | Compromised humans | `P = base × role_factor / privilege_level` |
| 🟣 **Lateral Movement** | 3: Infrastructure | Infrastructure nodes | `P = base × (privilege / required_access)` |

The abstraction layer is designed for future upgrade to **GNN-based target selection** and **RL-based action policies**.

### 3. Monte Carlo Simulation Engine

```python
for iteration in range(100):          # 100 independent runs
    graph = deep_copy(campus)         # Fresh graph per iteration
    compromised = random_initial(3)   # Stochastic initial conditions
    for step in range(max_steps):
        phishing.attack(graph)        # Phase 1
        credential.exploit(graph)     # Phase 2
        lateral.move(graph)           # Phase 3
    record(statistics)                # Track outcomes

aggregate → mean_compromise, node_frequencies, attack_paths
```

Each iteration is **independent** with its own random seed — producing statistical distributions, not single-point estimates.

### 4. Risk Scoring

**Node Vulnerability Score:**
```
V(node) = 0.30 × susceptibility
        + 0.25 × degree_centrality
        + 0.30 × betweenness_centrality
        + 0.15 × privilege_factor
```

**Cluster Risk:** Spectral clustering (scikit-learn) identifies network communities, then computes per-cluster risk indices based on mean vulnerability × connectivity density.

**Global Campus Risk Index:** 0–100 composite score combining node vulnerability (60%) and cluster risk (40%).

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-campus` | Generate synthetic campus graph |
| `POST` | `/api/run-simulation` | Execute Monte Carlo attack simulation |
| `GET` | `/api/risk-metrics` | Compute node/cluster/campus risk scores |
| `GET` | `/api/cluster-analysis` | Spectral clustering risk analysis |
| `GET` | `/api/attack-path` | Extract most frequent attack paths |
| `GET` | `/health` | System health check |

### Example: Generate Campus
```bash
curl -X POST http://localhost:8000/api/generate-campus \
  -H "Content-Type: application/json" \
  -d '{"num_nodes": 750, "seed": 42}'
```

### Example: Run Simulation
```bash
curl -X POST http://localhost:8000/api/run-simulation \
  -H "Content-Type: application/json" \
  -d '{"num_iterations": 100, "max_steps": 20, "initial_compromised": 3, "infection_probability": 0.5}'
```

---

## 🎨 Design System

Inspired by **CrowdStrike Falcon**, **Darktrace**, **Palo Alto Cortex**, **IBM QRadar**, and **NATO cyber defense** dashboards.

| Element | Value |
|---------|-------|
| Base Background | `#0B0F14` (matte black) |
| Panel Background | `#0F1419` → `#131B26` (gradient) |
| Border | `#1E3A5F` (deep navy) |
| Primary Accent | `#3B82F6` (electric blue) |
| Secondary Accent | `#06B6D4` (cyan) |
| Threat Indicator | `#EF4444` (red pulse) |
| Warning | `#F59E0B` (amber) |
| Safe | `#10B981` (green) |
| Typography | Inter — professional enterprise font |
| Grid | Subtle tactical grid (`rgba(59, 130, 246, 0.03)`) |

---

## 🔧 AMD GPU Scalability

ARES is architected for **AMD hardware acceleration** at every computational layer:

| Component | Current | AMD Instinct Optimized |
|-----------|---------|----------------------|
| Monte Carlo Engine | NumPy + CPU multiprocessing | PyTorch sparse tensors + ROCm on **MI300X** |
| Graph Centrality | NetworkX sequential | cuGraph-ROCm GPU-parallel BFS |
| Agent Inference | Probabilistic models | GNN/RL trained on Instinct GPUs (PyTorch Geometric) |
| Risk Scoring | scikit-learn CPU | PyTorch GPU tensor operations |
| Edge Deployment | N/A | **AMD Ryzen AI XDNA NPU** for campus-local monitoring |

### Why AMD?
- **MI300X 192GB HBM3** — Entire university graph (100K+ nodes) fits in GPU memory
- **ROCm** — Open-source GPU compute stack, aligns with education values
- **Instinct compute density** — 1,000+ Monte Carlo iterations simultaneously
- **Ryzen AI** — Edge inference for real-time campus monitoring without cloud

### Migration Path
```
Phase 1 (Current):  NumPy + CPU multiprocessing
Phase 2:            PyTorch sparse tensors + ROCm GPU parallelism
Phase 3:            PyTorch Geometric for GNN-based agents on GPU
Phase 4:            Distributed multi-GPU across AMD Instinct cluster
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Python | 3.12 |
| API Framework | FastAPI | 0.135 |
| Graph Engine | NetworkX | 3.6 |
| Computation | NumPy | 2.4 |
| Clustering | scikit-learn | 1.8 |
| Validation | Pydantic | 2.12 |
| Frontend | React | 18.3 |
| Build Tool | Vite | 6.4 |
| Graph Viz | React Flow (@xyflow/react) | 12 |
| Animation | Framer Motion | 11 |
| Styling | Tailwind CSS | 4 |
| Charts | Recharts | 2.15 |

---
