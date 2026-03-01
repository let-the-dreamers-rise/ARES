"""
ARES — Adversarial Risk & Exploitation Simulator
==================================================
FastAPI application entrypoint.

Production-grade cyberattack simulation and predictive risk modeling
platform for universities and global education systems.

AMD Scalability Note:
    This application is architected so that compute-intensive simulation
    workloads (Monte Carlo, GNN inference) can be offloaded to AMD Instinct
    GPUs via ROCm/PyTorch. The FastAPI layer remains the orchestration and
    API gateway, while heavy compute is delegated to the SimulationEngine
    abstraction layer which supports batch/parallel execution.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router

app = FastAPI(
    title="ARES — Adversarial Risk & Exploitation Simulator",
    description=(
        "AI-driven cyberattack simulation and predictive risk modeling "
        "platform for universities and global education systems."
    ),
    version="1.0.0",
)

# --- CORS Configuration ---
# In production, restrict origins to specific deployment domains.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount API Router ---
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    """System health probe for load balancers and monitoring."""
    return {"status": "OPERATIONAL", "system": "ARES", "version": "1.0.0"}
