"""
ARES — API Routes
==================
FastAPI REST endpoints for the ARES simulation platform.

Endpoints:
    POST /api/generate-campus     — Generate synthetic campus graph
    POST /api/run-simulation      — Execute Monte Carlo attack simulation
    GET  /api/risk-metrics        — Compute risk scores for current graph
    GET  /api/cluster-analysis    — Perform cluster-level risk analysis
    GET  /api/attack-path         — Get most frequent attack paths
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from graph.campus_graph import CampusGraphBuilder
from simulation.engine import SimulationEngine, SimulationConfig
from models.risk import RiskModel
from utils.serialization import graph_to_json, simulation_result_to_json, risk_report_to_json


router = APIRouter()

# ─────────────────────────────────────────────────────────────
# In-memory state (production: use Redis or persistent store)
# ─────────────────────────────────────────────────────────────

_state = {
    "graph": None,
    "builder": None,
    "simulation_result": None,
    "risk_model": None,
}


# ─────────────────────────────────────────────────────────────
# Request/Response Models
# ─────────────────────────────────────────────────────────────

class CampusRequest(BaseModel):
    num_nodes: int = Field(default=750, ge=500, le=1000, description="Number of human nodes")
    seed: Optional[int] = Field(default=42, description="Random seed for reproducibility")


class SimulationRequest(BaseModel):
    num_iterations: int = Field(default=100, ge=10, le=500, description="Monte Carlo iterations")
    max_steps: int = Field(default=20, ge=5, le=50, description="Maximum attack steps per iteration")
    initial_compromised: int = Field(default=3, ge=1, le=20, description="Initial compromised nodes")
    infection_probability: float = Field(default=0.5, ge=0.1, le=1.0, description="Base infection multiplier")
    parallel: bool = Field(default=False, description="Use parallel execution")


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────

@router.post("/generate-campus")
async def generate_campus(request: CampusRequest = CampusRequest()):
    """
    Generate a synthetic campus graph with human and infrastructure nodes.

    Returns the full graph structure with node attributes and edges,
    along with a summary of the generated campus.
    """
    builder = CampusGraphBuilder(num_nodes=request.num_nodes, seed=request.seed)
    graph = builder.build()

    _state["graph"] = graph
    _state["builder"] = builder
    _state["simulation_result"] = None

    # Compute initial risk scores
    risk_model = RiskModel(graph)
    risk_model.compute_centrality()
    _state["risk_model"] = risk_model

    return {
        "status": "success",
        "summary": builder.get_summary(),
        "graph": graph_to_json(graph),
    }


@router.post("/run-simulation")
async def run_simulation(request: SimulationRequest = SimulationRequest()):
    """
    Execute Monte Carlo adversarial simulation on the campus graph.

    Returns aggregate statistics, step-by-step snapshots for visualization,
    and attack path frequencies.
    """
    if _state["graph"] is None:
        raise HTTPException(
            status_code=400,
            detail="No campus graph generated. Call /generate-campus first.",
        )

    config = SimulationConfig(
        num_iterations=request.num_iterations,
        max_steps=request.max_steps,
        initial_compromised=request.initial_compromised,
        infection_probability=request.infection_probability,
    )

    engine = SimulationEngine(_state["graph"], config)

    if request.parallel:
        result = engine.run_parallel()
    else:
        result = engine.run()

    _state["simulation_result"] = result

    # Recompute risk with simulation data
    if _state["risk_model"]:
        _state["risk_model"] = RiskModel(engine.base_graph)

    return {
        "status": "success",
        "result": simulation_result_to_json(result),
    }


@router.get("/risk-metrics")
async def get_risk_metrics():
    """
    Compute and return risk metrics for the current campus graph.

    Includes node vulnerability scores, cluster risks, and the
    global campus risk index (0–100 scale).
    """
    if _state["graph"] is None:
        raise HTTPException(status_code=400, detail="No campus graph generated.")

    sim_result = _state["simulation_result"]
    freqs = sim_result.node_compromise_frequency if sim_result else None

    risk_model = RiskModel(_state["graph"])
    report = risk_model.generate_report(compromise_frequencies=freqs)
    _state["risk_model"] = risk_model

    return {
        "status": "success",
        "report": risk_report_to_json(report),
    }


@router.get("/cluster-analysis")
async def get_cluster_analysis():
    """
    Perform cluster-level risk analysis using spectral clustering.

    Returns cluster risk indices, high-risk node counts, and
    connectivity factors for each identified cluster.
    """
    if _state["graph"] is None:
        raise HTTPException(status_code=400, detail="No campus graph generated.")

    sim_result = _state["simulation_result"]
    freqs = sim_result.node_compromise_frequency if sim_result else None

    risk_model = RiskModel(_state["graph"])
    risk_model.compute_all_scores(freqs)
    clusters = risk_model.cluster_analysis(compromise_frequencies=freqs)

    return {
        "status": "success",
        "clusters": [
            {
                "cluster_id": c.cluster_id,
                "node_count": len(c.node_ids),
                "mean_vulnerability": c.mean_vulnerability,
                "max_vulnerability": c.max_vulnerability,
                "connectivity_factor": c.connectivity_factor,
                "cluster_risk_index": c.cluster_risk_index,
                "high_risk_count": len(c.high_risk_nodes),
                "node_ids": c.node_ids[:10],  # Limit for response size
            }
            for c in clusters
        ],
    }


@router.get("/attack-path")
async def get_attack_paths():
    """
    Return the most frequently observed attack paths from
    the last simulation run.
    """
    sim_result = _state["simulation_result"]
    if sim_result is None:
        raise HTTPException(
            status_code=400,
            detail="No simulation has been run. Call /run-simulation first.",
        )

    return {
        "status": "success",
        "attack_paths": sim_result.attack_path_summary,
        "infra_compromise_frequency": sim_result.infra_compromise_frequency,
    }
