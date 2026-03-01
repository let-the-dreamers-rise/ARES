"""
ARES — Synthetic Campus Graph Builder
======================================
Generates a two-layer hybrid graph representing a university campus:

  Layer 1 (Human Communication Graph):
      Nodes: Student, Faculty, Admin, IT Staff, Researcher
      Edges: Communication trust relationships with weighted trust scores

  Layer 2 (Infrastructure Access Graph):
      Nodes: Auth Server, Email Gateway, Cloud DB, Lab Servers, File Systems
      Edges: Access control relationships with privilege levels

  Cross-Layer Edges:
      Map human nodes to infrastructure nodes they can access based on role.

Architecture Note — AMD Scalability:
    Graph construction is CPU-bound and embarrassingly parallel for large
    campuses. For 10K+ node graphs, the generation can be partitioned by
    department/cluster and assembled via AMD Instinct GPU-accelerated sparse
    matrix operations using ROCm + cuGraph (AMD fork) or PyTorch Geometric
    with ROCm backend. For edge-deployed scenarios, AMD Ryzen AI NPUs can
    accelerate real-time graph updates and incremental re-scoring.
"""

import random
from typing import Optional
import networkx as nx
import numpy as np


# ─────────────────────────────────────────────────────────────
#  Constants for campus generation
# ─────────────────────────────────────────────────────────────

HUMAN_ROLES = {
    "Student":    {"count_ratio": 0.55, "susceptibility": 0.7, "privilege": 1},
    "Faculty":    {"count_ratio": 0.15, "susceptibility": 0.4, "privilege": 3},
    "Admin":      {"count_ratio": 0.08, "susceptibility": 0.3, "privilege": 4},
    "IT":         {"count_ratio": 0.07, "susceptibility": 0.2, "privilege": 5},
    "Researcher": {"count_ratio": 0.15, "susceptibility": 0.5, "privilege": 2},
}

INFRA_NODES = [
    {"id": "AUTH_SERVER",   "type": "Auth Server",   "criticality": 0.95, "required_privilege": 4},
    {"id": "EMAIL_GATEWAY", "type": "Email Gateway", "criticality": 0.80, "required_privilege": 1},
    {"id": "CLOUD_DB",      "type": "Cloud DB",      "criticality": 0.90, "required_privilege": 3},
    {"id": "LAB_SERVER_1",  "type": "Lab Server",    "criticality": 0.70, "required_privilege": 2},
    {"id": "LAB_SERVER_2",  "type": "Lab Server",    "criticality": 0.70, "required_privilege": 2},
    {"id": "FILE_SYSTEM",   "type": "File System",   "criticality": 0.75, "required_privilege": 2},
    {"id": "BACKUP_SRV",    "type": "Backup Server", "criticality": 0.85, "required_privilege": 5},
    {"id": "WEB_PORTAL",    "type": "Web Portal",    "criticality": 0.60, "required_privilege": 1},
    {"id": "VPN_GATEWAY",   "type": "VPN Gateway",   "criticality": 0.88, "required_privilege": 3},
    {"id": "DNS_SERVER",    "type": "DNS Server",     "criticality": 0.92, "required_privilege": 5},
]

DEPARTMENTS = [
    "Computer Science", "Engineering", "Mathematics", "Physics",
    "Chemistry", "Biology", "Business", "Law", "Medicine", "Arts",
]


class CampusGraphBuilder:
    """
    Builds a two-layer hybrid graph for adversarial simulation.

    The graph uses a unified NetworkX MultiDiGraph where node attributes
    distinguish between human and infrastructure layers, and edge attributes
    encode trust weights, privilege levels, and layer membership.
    """

    def __init__(self, num_nodes: int = 750, seed: Optional[int] = None):
        """
        Args:
            num_nodes: Total number of human nodes (500–1000 recommended).
            seed: Random seed for reproducible campus generation.
        """
        self.num_nodes = max(500, min(1000, num_nodes))
        self.seed = seed
        self.rng = random.Random(seed)
        self.np_rng = np.random.default_rng(seed)
        self.graph: nx.Graph = nx.Graph()

    def build(self) -> nx.Graph:
        """Orchestrate full campus graph construction."""
        self._generate_human_nodes()
        self._generate_infrastructure_nodes()
        self._generate_human_edges()
        self._generate_infra_edges()
        self._generate_cross_layer_edges()
        return self.graph

    # ─────────────────────────────────────────────────────────
    #  Human Layer
    # ─────────────────────────────────────────────────────────

    def _generate_human_nodes(self):
        """Create human nodes with role-based attributes."""
        node_id = 0
        for role, config in HUMAN_ROLES.items():
            count = int(self.num_nodes * config["count_ratio"])
            for _ in range(count):
                dept = self.rng.choice(DEPARTMENTS)
                self.graph.add_node(
                    f"H_{node_id}",
                    layer="human",
                    role=role,
                    department=dept,
                    susceptibility=config["susceptibility"] + self.np_rng.normal(0, 0.05),
                    privilege=config["privilege"],
                    state="safe",          # safe | vulnerable | compromised
                    compromised_at=-1,     # simulation step when compromised
                    vulnerability_score=0.0,
                )
                node_id += 1

    def _generate_infrastructure_nodes(self):
        """Create infrastructure layer nodes."""
        for infra in INFRA_NODES:
            self.graph.add_node(
                infra["id"],
                layer="infrastructure",
                role=infra["type"],
                department="Infrastructure",
                criticality=infra["criticality"],
                required_privilege=infra["required_privilege"],
                state="safe",
                compromised_at=-1,
                vulnerability_score=0.0,
            )

    # ─────────────────────────────────────────────────────────
    #  Edge Construction
    # ─────────────────────────────────────────────────────────

    def _generate_human_edges(self):
        """
        Build communication graph using preferential attachment within
        departments and sparse cross-department connections.
        """
        human_nodes = [n for n, d in self.graph.nodes(data=True) if d["layer"] == "human"]
        dept_groups: dict[str, list] = {}
        for n in human_nodes:
            dept = self.graph.nodes[n]["department"]
            dept_groups.setdefault(dept, []).append(n)

        # Intra-department: denser connections (Erdos-Renyi within cluster)
        for dept, members in dept_groups.items():
            p_intra = min(0.15, 8.0 / max(len(members), 1))
            for i, a in enumerate(members):
                for b in members[i + 1:]:
                    if self.rng.random() < p_intra:
                        trust = round(self.np_rng.uniform(0.4, 1.0), 3)
                        self.graph.add_edge(a, b, layer="human", trust=trust, edge_type="communication")

        # Inter-department: sparse connections
        all_depts = list(dept_groups.keys())
        for i, d1 in enumerate(all_depts):
            for d2 in all_depts[i + 1:]:
                cross_count = max(1, int(0.02 * min(len(dept_groups[d1]), len(dept_groups[d2]))))
                for _ in range(cross_count):
                    a = self.rng.choice(dept_groups[d1])
                    b = self.rng.choice(dept_groups[d2])
                    if not self.graph.has_edge(a, b):
                        trust = round(self.np_rng.uniform(0.1, 0.5), 3)
                        self.graph.add_edge(a, b, layer="human", trust=trust, edge_type="communication")

    def _generate_infra_edges(self):
        """Build infrastructure interconnection graph."""
        infra_ids = [n["id"] for n in INFRA_NODES]
        # Core backbone: fully connect critical infrastructure
        critical = [n for n in infra_ids if self.graph.nodes[n].get("criticality", 0) > 0.8]
        for i, a in enumerate(critical):
            for b in critical[i + 1:]:
                self.graph.add_edge(a, b, layer="infrastructure", trust=0.9, edge_type="backbone")

        # Peripheral connections
        peripheral = [n for n in infra_ids if n not in critical]
        for p in peripheral:
            target = self.rng.choice(critical)
            self.graph.add_edge(p, target, layer="infrastructure", trust=0.7, edge_type="access")

    def _generate_cross_layer_edges(self):
        """
        Map human nodes to infrastructure nodes they can access
        based on their privilege level.
        """
        human_nodes = [n for n, d in self.graph.nodes(data=True) if d["layer"] == "human"]
        for h_node in human_nodes:
            privilege = self.graph.nodes[h_node]["privilege"]
            for infra in INFRA_NODES:
                if privilege >= infra["required_privilege"]:
                    # Higher privilege → higher probability of having access
                    access_prob = 0.6 + 0.1 * (privilege - infra["required_privilege"])
                    if self.rng.random() < min(access_prob, 0.95):
                        self.graph.add_edge(
                            h_node, infra["id"],
                            layer="cross",
                            trust=round(self.np_rng.uniform(0.3, 0.8), 3),
                            edge_type="access_control",
                        )
                elif privilege >= infra["required_privilege"] - 1:
                    # Adjacent privilege: small chance of access (misconfiguration)
                    if self.rng.random() < 0.05:
                        self.graph.add_edge(
                            h_node, infra["id"],
                            layer="cross",
                            trust=round(self.np_rng.uniform(0.1, 0.3), 3),
                            edge_type="access_control",
                        )

    # ─────────────────────────────────────────────────────────
    #  Utilities
    # ─────────────────────────────────────────────────────────

    def get_summary(self) -> dict:
        """Return a summary of the generated campus graph."""
        human_nodes = [n for n, d in self.graph.nodes(data=True) if d["layer"] == "human"]
        infra_nodes = [n for n, d in self.graph.nodes(data=True) if d["layer"] == "infrastructure"]
        human_edges = [(u, v) for u, v, d in self.graph.edges(data=True) if d.get("layer") == "human"]
        infra_edges = [(u, v) for u, v, d in self.graph.edges(data=True) if d.get("layer") == "infrastructure"]
        cross_edges = [(u, v) for u, v, d in self.graph.edges(data=True) if d.get("layer") == "cross"]

        role_counts = {}
        for n in human_nodes:
            role = self.graph.nodes[n]["role"]
            role_counts[role] = role_counts.get(role, 0) + 1

        return {
            "total_nodes": self.graph.number_of_nodes(),
            "human_nodes": len(human_nodes),
            "infrastructure_nodes": len(infra_nodes),
            "total_edges": self.graph.number_of_edges(),
            "human_edges": len(human_edges),
            "infrastructure_edges": len(infra_edges),
            "cross_layer_edges": len(cross_edges),
            "departments": DEPARTMENTS,
            "role_distribution": role_counts,
        }
