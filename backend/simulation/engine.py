"""
ARES — Monte Carlo Simulation Engine
======================================
Orchestrates multi-agent adversarial simulations with Monte Carlo
statistical modeling.

Architecture:
    The SimulationEngine runs N iterations of coordinated multi-agent
    attacks on the campus graph, collecting statistics on:
    - Compromise spread probability per node
    - Time-to-compromise distributions
    - Attack path frequencies
    - Cluster-level risk aggregates

Parallel Execution Design:
    The engine exposes `run_parallel()` which is designed for:
    1. CPU parallelism via multiprocessing.Pool (current implementation)
    2. GPU batch parallelism via AMD Instinct + ROCm (future)

    AMD Instinct GPU Scaling Strategy:
    ──────────────────────────────────
    Each Monte Carlo iteration is independent (embarrassingly parallel).
    On an AMD Instinct MI250X (220 CUs, 128GB HBM2e):
    - Represent the graph as sparse adjacency tensors on GPU
    - Run 1000+ iterations in parallel across GPU compute units
    - Each CU runs an independent simulation with its own random state
    - Agent probability computations become element-wise tensor ops
    - PyTorch + ROCm handles memory management and kernel dispatch

    AMD Ryzen AI Edge Deployment:
    ─────────────────────────────
    For edge deployments (campus-local risk monitoring):
    - XDNA NPU runs lightweight inference on pre-trained risk models
    - CPU handles graph construction; NPU handles risk scoring
    - ONNX Runtime with ROCm EP for cross-platform portability

    Migration Path:
    1. Current: NumPy + CPU sequential/multiprocessing
    2. Phase 2: PyTorch tensors + ROCm GPU parallelism
    3. Phase 3: PyTorch Geometric for GNN-based agents on GPU
    4. Phase 4: Distributed multi-GPU across AMD Instinct cluster
"""

import copy
import time
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass, field
from typing import Optional

import networkx as nx
import numpy as np

from agents.phishing import PhishingAgent
from agents.credential_exploiter import CredentialExploiterAgent
from agents.lateral_movement import LateralMovementAgent
from agents.base import AttackResult


@dataclass
class SimulationConfig:
    """Configuration for a simulation run."""
    num_iterations: int = 100        # Monte Carlo iterations
    max_steps: int = 20              # Max attack steps per iteration
    initial_compromised: int = 3     # Number of initially compromised nodes
    infection_probability: float = 0.5  # Base infection multiplier
    parallel_workers: int = 4        # CPU parallel workers
    seed: Optional[int] = None


@dataclass
class StepSnapshot:
    """Snapshot of graph state at a simulation step."""
    step: int
    compromised_nodes: list[str]
    vulnerable_nodes: list[str]
    safe_nodes: list[str]
    attack_results: list[dict]
    compromised_count: int
    total_nodes: int


@dataclass
class IterationResult:
    """Result of a single Monte Carlo iteration."""
    iteration_id: int
    total_compromised: int
    total_nodes: int
    compromise_ratio: float
    steps_taken: int
    attack_log: list[dict]
    step_snapshots: list[StepSnapshot]
    compromised_node_ids: list[str]
    infra_compromised: list[str]


@dataclass
class SimulationResult:
    """Aggregate result across all Monte Carlo iterations."""
    num_iterations: int
    mean_compromise_ratio: float
    std_compromise_ratio: float
    max_compromise_ratio: float
    min_compromise_ratio: float
    median_steps_to_peak: float
    node_compromise_frequency: dict[str, float]  # node_id -> P(compromised)
    infra_compromise_frequency: dict[str, float]
    global_risk_index: float  # 0–100 scale
    attack_path_summary: list[dict]
    execution_time_seconds: float
    # Best (median) iteration for visualization
    representative_iteration: Optional[IterationResult] = None


class SimulationEngine:
    """
    Monte Carlo adversarial simulation engine.

    Runs multiple independent simulation iterations, each consisting of
    coordinated multi-agent attacks on a copy of the campus graph.
    """

    def __init__(self, graph: nx.Graph, config: Optional[SimulationConfig] = None):
        self.base_graph = graph
        self.config = config or SimulationConfig()

    def run(self) -> SimulationResult:
        """
        Execute Monte Carlo simulation (sequential).
        For parallel execution, see `run_parallel()`.
        """
        start_time = time.time()
        rng = np.random.default_rng(self.config.seed)
        results: list[IterationResult] = []

        for i in range(self.config.num_iterations):
            seed = int(rng.integers(0, 2**31))
            result = self._run_single_iteration(i, seed)
            results.append(result)

        elapsed = time.time() - start_time
        return self._aggregate_results(results, elapsed)

    def run_parallel(self) -> SimulationResult:
        """
        Execute Monte Carlo simulation with CPU parallelism.

        AMD GPU Upgrade Path:
        ─────────────────────
        To scale this on AMD Instinct GPUs:
        1. Convert graph to PyTorch sparse tensor (COO format)
        2. Batch N iterations as a 3D tensor [iteration × node × feature]
        3. Agent probability functions become vectorized tensor operations
        4. Use torch.multinomial for parallel stochastic sampling
        5. ROCm handles kernel dispatch across GPU compute units

        Example future signature:
            def run_gpu(self, device='rocm:0') -> SimulationResult:
                graph_tensor = self._to_sparse_tensor(self.base_graph)
                states = torch.zeros(N_iters, N_nodes, device=device)
                for step in range(max_steps):
                    probs = self.agent_model(graph_tensor, states)
                    outcomes = torch.bernoulli(probs)
                    states = self._update_states(states, outcomes)
                return self._aggregate_gpu_results(states)
        """
        start_time = time.time()
        rng = np.random.default_rng(self.config.seed)
        seeds = [int(rng.integers(0, 2**31)) for _ in range(self.config.num_iterations)]

        results: list[IterationResult] = []

        # CPU parallel execution via process pool
        # NOTE: For GPU, replace with torch.cuda.Stream parallelism on ROCm
        with ProcessPoolExecutor(max_workers=self.config.parallel_workers) as executor:
            futures = {
                executor.submit(self._run_single_iteration, i, seeds[i]): i
                for i in range(self.config.num_iterations)
            }
            for future in as_completed(futures):
                results.append(future.result())

        elapsed = time.time() - start_time
        return self._aggregate_results(results, elapsed)

    def _run_single_iteration(self, iteration_id: int, seed: int) -> IterationResult:
        """Run a single simulation iteration on a fresh copy of the graph."""
        graph = copy.deepcopy(self.base_graph)
        rng = np.random.default_rng(seed)

        # Initialize agents with infection_probability as a multiplier
        # This makes the user's slider actually affect simulation outcomes
        ip = self.config.infection_probability
        phishing = PhishingAgent()
        credential = CredentialExploiterAgent()
        lateral = LateralMovementAgent()

        # Scale each agent's base_success_rate by the user-configured probability
        phishing.config.base_success_rate *= ip / 0.5      # normalized to default 0.5
        credential.config.base_success_rate *= ip / 0.5
        lateral.config.base_success_rate *= ip / 0.5

        # Set consistent random state
        phishing.rng = rng
        credential.rng = rng
        lateral.rng = rng

        # Select initial compromised nodes
        human_nodes = [
            n for n, d in graph.nodes(data=True)
            if d.get("layer") == "human"
        ]
        initial_targets = rng.choice(
            human_nodes,
            size=min(self.config.initial_compromised, len(human_nodes)),
            replace=False,
        ).tolist()
        compromised: set[str] = set()
        for node in initial_targets:
            graph.nodes[node]["state"] = "compromised"
            graph.nodes[node]["compromised_at"] = 0
            compromised.add(node)

        attack_log: list[dict] = []
        step_snapshots: list[StepSnapshot] = []

        # Record initial state
        step_snapshots.append(self._take_snapshot(graph, 0, []))

        for step in range(1, self.config.max_steps + 1):
            step_results: list[AttackResult] = []

            # Phase 1: Phishing (expand compromise footprint)
            phish_results = phishing.step(graph, compromised, step)
            step_results.extend(phish_results)

            # Phase 2: Credential exploitation (escalate privileges)
            cred_results = credential.step(graph, compromised, step)
            step_results.extend(cred_results)

            # Phase 3: Lateral movement (reach infrastructure)
            lat_results = lateral.step(graph, compromised, step)
            step_results.extend(lat_results)

            # Update compromised set
            for r in step_results:
                if r.success:
                    compromised.add(r.target_node)

            # Mark vulnerable nodes (neighbors of compromised)
            for c_node in compromised:
                for neighbor in graph.neighbors(c_node):
                    if graph.nodes[neighbor].get("state") == "safe":
                        graph.nodes[neighbor]["state"] = "vulnerable"

            # Log results
            step_dicts = [
                {
                    "agent": r.agent_type,
                    "source": r.source_node,
                    "target": r.target_node,
                    "success": r.success,
                    "probability": round(r.probability, 4),
                    "step": r.step,
                    "details": r.details,
                }
                for r in step_results
            ]
            attack_log.extend(step_dicts)
            step_snapshots.append(self._take_snapshot(graph, step, step_dicts))

            # Early termination if no new compromises possible
            if not any(r.success for r in step_results) and step > 3:
                break

        # Collect results
        compromised_nodes = list(compromised)
        infra_compromised = [
            n for n in compromised
            if graph.nodes[n].get("layer") == "infrastructure"
        ]

        total_nodes = graph.number_of_nodes()
        return IterationResult(
            iteration_id=iteration_id,
            total_compromised=len(compromised),
            total_nodes=total_nodes,
            compromise_ratio=len(compromised) / total_nodes if total_nodes > 0 else 0,
            steps_taken=step,
            attack_log=attack_log,
            step_snapshots=step_snapshots,
            compromised_node_ids=compromised_nodes,
            infra_compromised=infra_compromised,
        )

    def _take_snapshot(self, graph: nx.Graph, step: int, attacks: list[dict]) -> StepSnapshot:
        """Capture graph state at a simulation step."""
        compromised = [n for n, d in graph.nodes(data=True) if d.get("state") == "compromised"]
        vulnerable = [n for n, d in graph.nodes(data=True) if d.get("state") == "vulnerable"]
        safe = [n for n, d in graph.nodes(data=True) if d.get("state") == "safe"]
        return StepSnapshot(
            step=step,
            compromised_nodes=compromised,
            vulnerable_nodes=vulnerable,
            safe_nodes=safe,
            attack_results=attacks,
            compromised_count=len(compromised),
            total_nodes=graph.number_of_nodes(),
        )

    def _aggregate_results(
        self, results: list[IterationResult], elapsed: float
    ) -> SimulationResult:
        """Aggregate results across all Monte Carlo iterations."""
        ratios = [r.compromise_ratio for r in results]

        # Node compromise frequency: how often each node gets compromised
        node_freq: dict[str, int] = {}
        infra_freq: dict[str, int] = {}
        for r in results:
            for node in r.compromised_node_ids:
                node_freq[node] = node_freq.get(node, 0) + 1
            for node in r.infra_compromised:
                infra_freq[node] = infra_freq.get(node, 0) + 1

        n_iters = len(results)
        node_compromise_freq = {k: v / n_iters for k, v in node_freq.items()}
        infra_compromise_freq = {k: v / n_iters for k, v in infra_freq.items()}

        # Global risk index (0–100)
        mean_ratio = float(np.mean(ratios))
        infra_risk = np.mean(list(infra_compromise_freq.values())) if infra_compromise_freq else 0
        global_risk = min(100, (mean_ratio * 60 + float(infra_risk) * 40))

        # Attack path summary: most common attack chains
        attack_paths = self._extract_common_paths(results)

        # Find representative (median) iteration for visualization
        median_idx = int(np.argsort(ratios)[len(ratios) // 2])
        representative = results[median_idx]

        return SimulationResult(
            num_iterations=n_iters,
            mean_compromise_ratio=mean_ratio,
            std_compromise_ratio=float(np.std(ratios)),
            max_compromise_ratio=float(np.max(ratios)),
            min_compromise_ratio=float(np.min(ratios)),
            median_steps_to_peak=float(np.median([r.steps_taken for r in results])),
            node_compromise_frequency=node_compromise_freq,
            infra_compromise_frequency=infra_compromise_freq,
            global_risk_index=round(global_risk, 2),
            attack_path_summary=attack_paths,
            execution_time_seconds=round(elapsed, 3),
            representative_iteration=representative,
        )

    def _extract_common_paths(self, results: list[IterationResult]) -> list[dict]:
        """Extract the most frequently observed attack paths."""
        path_counter: dict[str, int] = {}
        for r in results:
            for entry in r.attack_log:
                if entry["success"]:
                    path_key = f"{entry['source']} → {entry['target']} ({entry['agent']})"
                    path_counter[path_key] = path_counter.get(path_key, 0) + 1

        # Sort by frequency and return top 20
        sorted_paths = sorted(path_counter.items(), key=lambda x: x[1], reverse=True)
        return [
            {"path": p, "frequency": c, "probability": round(c / len(results), 3)}
            for p, c in sorted_paths[:20]
        ]
