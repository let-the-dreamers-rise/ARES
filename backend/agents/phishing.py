"""
ARES — Agent A: Phishing Generator
====================================
Simulates AI-generated phishing campaigns targeting human nodes.

Attack Model:
    - Selects targets based on susceptibility scores and communication proximity
    - Success probability is a function of:
        P(success) = base_rate × susceptibility × trust_factor × (1 / awareness)
    - Initial attack vector: targets random high-susceptibility nodes
    - Secondary waves: targets neighbors of compromised nodes via trust edges

Future Upgrade (GNN):
    Replace target selection with a Graph Attention Network (GAT) that scores
    nodes based on learned embeddings of the communication graph topology,
    enabling more realistic adversarial targeting patterns.
"""

import networkx as nx
import numpy as np

from agents.base import BaseAttackAgent, AgentConfig, AttackResult, AgentState


class PhishingAgent(BaseAttackAgent):
    """
    Phishing attack agent that targets human nodes through
    social engineering probability models.
    """

    def __init__(self, config: AgentConfig | None = None):
        cfg = config or AgentConfig(
            base_success_rate=0.35,
            trust_multiplier=1.8,
            max_targets_per_step=5,
            cooldown_steps=0,
        )
        super().__init__(agent_type="PhishingGenerator", config=cfg)

    def select_targets(
        self, graph: nx.Graph, compromised: set[str], step: int
    ) -> list[str]:
        """
        Target selection strategy:
            Step 0: Attack high-susceptibility nodes (cold start)
            Step N: Attack neighbors of compromised nodes via trust edges
        """
        if step == 0 or not compromised:
            # Cold start: pick most susceptible human nodes
            human_nodes = [
                (n, d.get("susceptibility", 0))
                for n, d in graph.nodes(data=True)
                if d.get("layer") == "human" and d.get("state") == "safe"
            ]
            human_nodes.sort(key=lambda x: x[1], reverse=True)
            # Top N most susceptible
            top_n = max(5, len(human_nodes) // 20)
            candidates = [n for n, _ in human_nodes[:top_n]]
            self.rng.shuffle(candidates)
            return candidates[: self.config.max_targets_per_step]

        # Propagation: target safe neighbors of compromised nodes
        surface = self.get_compromised_neighbors(graph, compromised)
        # Filter to human layer only
        surface = [
            n for n in surface
            if graph.nodes[n].get("layer") == "human"
        ]
        if not surface:
            return []

        # Sort by susceptibility (higher = better target)
        surface_scored = [
            (n, graph.nodes[n].get("susceptibility", 0.5))
            for n in surface
        ]
        surface_scored.sort(key=lambda x: x[1], reverse=True)
        return [n for n, _ in surface_scored[: self.config.max_targets_per_step]]

    def compute_success_probability(
        self, graph: nx.Graph, source: str, target: str
    ) -> float:
        """
        P(phish_success) = base_rate × susceptibility × trust_factor

        Where trust_factor is the edge trust weight between source and target,
        boosted by the trust_multiplier config parameter.
        """
        target_data = graph.nodes[target]
        susceptibility = target_data.get("susceptibility", 0.5)

        # Get trust from edge if it exists
        trust_factor = 0.3  # base trust if no direct connection
        if source and graph.has_edge(source, target):
            edge_data = graph.edges[source, target]
            trust_factor = edge_data.get("trust", 0.3) * self.config.trust_multiplier

        prob = self.config.base_success_rate * susceptibility * trust_factor
        return float(np.clip(prob, 0.01, 0.95))

    def execute_attack(
        self, graph: nx.Graph, target: str, step: int, compromised: set[str]
    ) -> AttackResult:
        """Execute phishing attack on a target node."""
        # Find the best source (compromised node with highest trust to target)
        source = self._find_best_source(graph, target, compromised)
        prob = self.compute_success_probability(graph, source, target)

        success = self.rng.random() < prob
        if success:
            graph.nodes[target]["state"] = "compromised"
            graph.nodes[target]["compromised_at"] = step

        return AttackResult(
            agent_type=self.agent_type,
            source_node=source or "external",
            target_node=target,
            success=success,
            probability=prob,
            step=step,
            details=f"Phishing email with susceptibility={graph.nodes[target].get('susceptibility', 0):.3f}",
        )

    def _find_best_source(
        self, graph: nx.Graph, target: str, compromised: set[str]
    ) -> str | None:
        """Find the compromised node with highest trust to target."""
        best_source = None
        best_trust = -1
        for c_node in compromised:
            if graph.has_edge(c_node, target):
                trust = graph.edges[c_node, target].get("trust", 0)
                if trust > best_trust:
                    best_trust = trust
                    best_source = c_node
        return best_source
