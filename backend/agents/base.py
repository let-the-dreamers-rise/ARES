"""
ARES — Base Attack Agent
=========================
Abstract base class for all adversarial agents in the simulation.

Design Philosophy:
    Each agent encapsulates a specific attack technique with:
    - Probability functions governing success/failure
    - Target selection logic based on graph topology
    - State transitions (idle → active → succeeded/failed)

    This abstraction layer is explicitly designed for future upgrade to:
    - Graph Neural Network (GNN) based target selection
    - Reinforcement Learning (RL) based action policies
    - Hybrid GNN+RL agents trained on ROCm/AMD Instinct GPUs

AMD Scalability Note:
    Agent inference can be accelerated on AMD hardware:
    - Training: AMD Instinct MI250X/MI300X via ROCm + PyTorch
    - Edge inference: AMD Ryzen AI (XDNA) NPU for real-time agent decisions
    - Batch evaluation: Parallel agent execution across GPU SMs
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import networkx as nx
import numpy as np


class AgentState(Enum):
    """State machine for attack agents."""
    IDLE = "idle"
    SCANNING = "scanning"
    ACTIVE = "active"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    COOLDOWN = "cooldown"


@dataclass
class AttackResult:
    """Result of a single agent action on a target node."""
    agent_type: str
    source_node: str
    target_node: str
    success: bool
    probability: float
    step: int
    details: str = ""


@dataclass
class AgentConfig:
    """Configuration for attack agent behavior."""
    base_success_rate: float = 0.3
    trust_multiplier: float = 1.5      # How much trust increases success
    privilege_penalty: float = 0.1     # Penalty per privilege gap
    max_targets_per_step: int = 3
    cooldown_steps: int = 1


class BaseAttackAgent(ABC):
    """
    Abstract attack agent with pluggable target selection and execution.

    Subclasses implement:
        - select_targets(): Choose nodes to attack
        - compute_success_probability(): Calculate P(success | target, context)
        - execute_attack(): Perform the attack action

    Future GNN/RL Upgrade Path:
        Replace select_targets() with a GNN-based node scoring model.
        Replace compute_success_probability() with an RL policy network.
        The SimulationEngine does not need to change — only agent internals.
    """

    def __init__(self, agent_type: str, config: Optional[AgentConfig] = None):
        self.agent_type = agent_type
        self.config = config or AgentConfig()
        self.state = AgentState.IDLE
        self.attack_log: list[AttackResult] = []
        self.rng = np.random.default_rng()

    @abstractmethod
    def select_targets(self, graph: nx.Graph, compromised: set[str], step: int) -> list[str]:
        """Select target nodes from the graph for this attack step."""
        ...

    @abstractmethod
    def compute_success_probability(
        self, graph: nx.Graph, source: str, target: str
    ) -> float:
        """Compute probability of successful attack on target from source."""
        ...

    @abstractmethod
    def execute_attack(
        self, graph: nx.Graph, target: str, step: int, compromised: set[str]
    ) -> AttackResult:
        """Execute the attack on a specific target node."""
        ...

    def step(self, graph: nx.Graph, compromised: set[str], current_step: int) -> list[AttackResult]:
        """
        Execute one simulation step for this agent.

        Returns:
            List of AttackResult for each attempted attack.
        """
        self.state = AgentState.SCANNING
        targets = self.select_targets(graph, compromised, current_step)
        self.state = AgentState.ACTIVE

        results = []
        for target in targets[: self.config.max_targets_per_step]:
            result = self.execute_attack(graph, target, current_step, compromised)
            self.attack_log.append(result)
            results.append(result)

        self.state = AgentState.COOLDOWN if results else AgentState.IDLE
        return results

    def get_compromised_neighbors(self, graph: nx.Graph, compromised: set[str]) -> set[str]:
        """Find all safe nodes adjacent to compromised nodes (attack surface)."""
        surface = set()
        for c_node in compromised:
            for neighbor in graph.neighbors(c_node):
                if graph.nodes[neighbor].get("state") == "safe":
                    surface.add(neighbor)
        return surface

    def reset(self):
        """Reset agent to initial state for a new simulation run."""
        self.state = AgentState.IDLE
        self.attack_log.clear()
