"""
ARES — Agent C: Lateral Movement Engine
=========================================
Simulates lateral movement through infrastructure after initial compromise.

Attack Model:
    - After human nodes are compromised, attempt to access infrastructure
    - Uses cross-layer edges (human → infrastructure) and infrastructure
      backbone edges for lateral movement
    - Success probability depends on privilege level vs required access
    - Can chain: compromised infra → adjacent infra (backbone traversal)

P(lateral_move) = base_rate × access_factor × (privilege / required_privilege)

Future Upgrade (GNN):
    Replace path selection with a Graph Neural Network trained on
    infrastructure topology to learn optimal lateral movement paths.
    Train on AMD Instinct MI300X with PyTorch Geometric + ROCm.
"""

import networkx as nx
import numpy as np

from agents.base import BaseAttackAgent, AgentConfig, AttackResult


class LateralMovementAgent(BaseAttackAgent):
    """
    Lateral movement agent that traverses from compromised human nodes
    into infrastructure and across infrastructure backbone.
    """

    def __init__(self, config: AgentConfig | None = None):
        cfg = config or AgentConfig(
            base_success_rate=0.20,
            trust_multiplier=1.0,
            privilege_penalty=0.2,
            max_targets_per_step=2,
            cooldown_steps=2,
        )
        super().__init__(agent_type="LateralMovement", config=cfg)
        self.attempted_paths: set[tuple[str, str]] = set()

    def select_targets(
        self, graph: nx.Graph, compromised: set[str], step: int
    ) -> list[str]:
        """
        Target selection for lateral movement:
        1. Find infrastructure nodes adjacent to compromised human nodes
        2. Find infrastructure nodes adjacent to compromised infrastructure
        3. Prioritize by criticality (high criticality = high impact)
        """
        targets = []

        for c_node in compromised:
            for neighbor in graph.neighbors(c_node):
                n_data = graph.nodes[neighbor]
                if n_data.get("state") != "safe":
                    continue

                # Skip already-attempted paths
                if (c_node, neighbor) in self.attempted_paths:
                    continue

                edge_data = graph.edges[c_node, neighbor]
                # Only traverse cross-layer or infrastructure edges
                if edge_data.get("layer") in ("cross", "infrastructure"):
                    criticality = n_data.get("criticality", 0.5)
                    targets.append((neighbor, criticality, c_node))

        # Sort by criticality (highest impact first)
        targets.sort(key=lambda x: x[1], reverse=True)
        return [t[0] for t in targets[: self.config.max_targets_per_step]]

    def compute_success_probability(
        self, graph: nx.Graph, source: str, target: str
    ) -> float:
        """
        P(lateral) = base_rate × (attacker_privilege / required_privilege) × access_factor

        Access factor is derived from the edge trust weight.
        """
        source_data = graph.nodes.get(source, {})
        target_data = graph.nodes[target]

        attacker_privilege = source_data.get("privilege", 1)
        required_privilege = target_data.get("required_privilege", 3)

        privilege_ratio = min(attacker_privilege / max(required_privilege, 1), 2.0)
        access_factor = 0.5
        if graph.has_edge(source, target):
            access_factor = graph.edges[source, target].get("trust", 0.3)

        prob = self.config.base_success_rate * privilege_ratio * access_factor
        return float(np.clip(prob, 0.01, 0.80))

    def execute_attack(
        self, graph: nx.Graph, target: str, step: int, compromised: set[str]
    ) -> AttackResult:
        """Execute lateral movement to an infrastructure node."""
        # Find the best source for this target
        source = self._find_source(graph, target, compromised)
        self.attempted_paths.add((source, target))

        prob = self.compute_success_probability(graph, source, target)
        success = self.rng.random() < prob

        if success:
            graph.nodes[target]["state"] = "compromised"
            graph.nodes[target]["compromised_at"] = step

        target_data = graph.nodes[target]
        return AttackResult(
            agent_type=self.agent_type,
            source_node=source,
            target_node=target,
            success=success,
            probability=prob,
            step=step,
            details=(
                f"Lateral move to {target_data.get('role', 'unknown')} "
                f"(criticality={target_data.get('criticality', 0):.2f})"
            ),
        )

    def _find_source(
        self, graph: nx.Graph, target: str, compromised: set[str]
    ) -> str:
        """Find the best compromised node to launch lateral movement from."""
        best_source = None
        best_priv = -1
        for c_node in compromised:
            if graph.has_edge(c_node, target):
                priv = graph.nodes[c_node].get("privilege", 0)
                if priv > best_priv:
                    best_priv = priv
                    best_source = c_node
        return best_source or (list(compromised)[0] if compromised else "unknown")

    def reset(self):
        """Reset agent state for new simulation."""
        super().reset()
        self.attempted_paths.clear()
