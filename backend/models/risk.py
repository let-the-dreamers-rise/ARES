"""
ARES — Risk Modeling Module
=============================
Implements multi-factor risk scoring for campus graph nodes and clusters.

Risk Score Formula:
    V(node) = α × susceptibility
            + β × degree_centrality(node)
            + γ × betweenness_centrality(node)
            + δ × privilege_factor(node)

Where:
    α = 0.30  (susceptibility weight)
    β = 0.25  (degree centrality weight — connectivity)
    γ = 0.30  (betweenness centrality weight — bridge criticality)
    δ = 0.15  (privilege weight — escalation value)

Cluster Risk Index:
    CR(cluster) = mean(V(nodes in cluster)) × cluster_connectivity_factor

Global Campus Risk Index (0–100):
    GRI = weighted_mean(CR(all clusters)) × normalization_factor

AMD Scalability:
    Centrality computation on large graphs (>100K nodes) can be accelerated
    using AMD Instinct GPUs with cuGraph-ROCm or PyTorch Geometric sparse
    matrix operations. Betweenness centrality approximation via GPU-parallel
    BFS sampling achieves near-linear speedup on MI250X.
"""

from dataclasses import dataclass
import networkx as nx
import numpy as np
from sklearn.cluster import SpectralClustering


# ─────────────────────────────────────────────────────────────
#  Risk Score Weights
# ─────────────────────────────────────────────────────────────

ALPHA = 0.30   # Susceptibility
BETA = 0.25    # Degree centrality
GAMMA = 0.30   # Betweenness centrality
DELTA = 0.15   # Privilege factor


@dataclass
class NodeRiskProfile:
    """Risk profile for a single node."""
    node_id: str
    role: str
    department: str
    layer: str
    vulnerability_score: float
    susceptibility: float
    degree_centrality: float
    betweenness_centrality: float
    privilege_factor: float
    compromise_probability: float  # From Monte Carlo results


@dataclass
class ClusterRisk:
    """Risk assessment for a node cluster (department/community)."""
    cluster_id: int
    node_ids: list[str]
    mean_vulnerability: float
    max_vulnerability: float
    connectivity_factor: float
    cluster_risk_index: float
    high_risk_nodes: list[str]


@dataclass
class CampusRiskReport:
    """Complete campus risk assessment report."""
    global_risk_index: float        # 0–100 scale
    total_nodes: int
    high_risk_nodes: list[NodeRiskProfile]
    cluster_risks: list[ClusterRisk]
    vulnerability_distribution: dict[str, float]  # role → avg vulnerability
    top_attack_targets: list[dict]
    infrastructure_risk: dict[str, float]


class RiskModel:
    """
    Multi-factor risk scoring engine.

    Computes centrality metrics, combines with role-based susceptibility,
    and produces node-level, cluster-level, and campus-level risk indices.
    """

    def __init__(self, graph: nx.Graph):
        self.graph = graph
        self._degree_centrality: dict[str, float] = {}
        self._betweenness_centrality: dict[str, float] = {}

    def compute_centrality(self):
        """
        Precompute centrality metrics for all nodes.

        AMD GPU Acceleration Note:
            For graphs with >50K nodes, replace this with GPU-accelerated
            centrality using cuGraph on ROCm:
                import cugraph
                G_cu = cugraph.from_networkx(self.graph)
                dc = cugraph.degree_centrality(G_cu)
                bc = cugraph.betweenness_centrality(G_cu, k=min(100, N))
        """
        self._degree_centrality = nx.degree_centrality(self.graph)
        # Use approximate betweenness for performance (k samples)
        k = min(100, self.graph.number_of_nodes())
        self._betweenness_centrality = nx.betweenness_centrality(
            self.graph, k=k, normalized=True
        )

    def score_node(self, node_id: str, compromise_prob: float = 0.0) -> NodeRiskProfile:
        """
        Compute the vulnerability score for a single node.

        V(node) = α×susceptibility + β×degree_cent + γ×between_cent + δ×priv_factor
        """
        data = self.graph.nodes[node_id]
        layer = data.get("layer", "human")

        if layer == "human":
            susceptibility = float(data.get("susceptibility", 0.5))
            privilege = data.get("privilege", 1)
            priv_factor = privilege / 5.0  # Normalize to [0, 1]
        else:
            susceptibility = 1.0 - float(data.get("criticality", 0.5))
            priv_factor = float(data.get("required_privilege", 3)) / 5.0

        dc = self._degree_centrality.get(node_id, 0)
        bc = self._betweenness_centrality.get(node_id, 0)

        # Normalize betweenness (can be much larger than degree centrality)
        max_bc = max(self._betweenness_centrality.values()) if self._betweenness_centrality else 1
        bc_normalized = bc / max_bc if max_bc > 0 else 0

        vulnerability = (
            ALPHA * susceptibility
            + BETA * dc
            + GAMMA * bc_normalized
            + DELTA * priv_factor
        )
        vulnerability = float(np.clip(vulnerability, 0, 1))

        # Store on graph
        self.graph.nodes[node_id]["vulnerability_score"] = vulnerability

        return NodeRiskProfile(
            node_id=node_id,
            role=data.get("role", "unknown"),
            department=data.get("department", "unknown"),
            layer=layer,
            vulnerability_score=round(vulnerability, 4),
            susceptibility=round(susceptibility, 4),
            degree_centrality=round(dc, 4),
            betweenness_centrality=round(bc_normalized, 4),
            privilege_factor=round(priv_factor, 4),
            compromise_probability=round(compromise_prob, 4),
        )

    def compute_all_scores(
        self, compromise_frequencies: dict[str, float] | None = None
    ) -> list[NodeRiskProfile]:
        """Compute vulnerability scores for all nodes."""
        self.compute_centrality()
        freqs = compromise_frequencies or {}
        profiles = []
        for node_id in self.graph.nodes():
            prob = freqs.get(node_id, 0.0)
            profile = self.score_node(node_id, prob)
            profiles.append(profile)
        return profiles

    def cluster_analysis(
        self, n_clusters: int = 8, compromise_frequencies: dict[str, float] | None = None
    ) -> list[ClusterRisk]:
        """
        Perform cluster-level risk analysis using spectral clustering
        on the graph's adjacency structure.
        """
        # Get human nodes for clustering
        human_nodes = [
            n for n, d in self.graph.nodes(data=True)
            if d.get("layer") == "human"
        ]
        if len(human_nodes) < n_clusters:
            n_clusters = max(2, len(human_nodes) // 2)

        # Build adjacency matrix for human subgraph
        subgraph = self.graph.subgraph(human_nodes)
        adj_matrix = nx.to_numpy_array(subgraph, nodelist=human_nodes)

        # Spectral clustering
        clustering = SpectralClustering(
            n_clusters=n_clusters,
            affinity="precomputed",
            n_init=10,
            random_state=42,
        )
        # Use adjacency as affinity (add small epsilon for numerical stability)
        affinity = adj_matrix + 0.01
        labels = clustering.fit_predict(affinity)

        # Compute cluster risk
        freqs = compromise_frequencies or {}
        clusters: list[ClusterRisk] = []

        for cluster_id in range(n_clusters):
            cluster_nodes = [
                human_nodes[i] for i in range(len(human_nodes))
                if labels[i] == cluster_id
            ]
            if not cluster_nodes:
                continue

            vulnerabilities = [
                self.graph.nodes[n].get("vulnerability_score", 0.5)
                for n in cluster_nodes
            ]

            # Connectivity factor: internal edge density
            cluster_subgraph = self.graph.subgraph(cluster_nodes)
            n_nodes = len(cluster_nodes)
            max_edges = n_nodes * (n_nodes - 1) / 2
            density = cluster_subgraph.number_of_edges() / max_edges if max_edges > 0 else 0

            mean_vuln = float(np.mean(vulnerabilities))
            max_vuln = float(np.max(vulnerabilities))
            connectivity = min(1.0, density * 5)  # Scale density up

            cluster_risk = mean_vuln * (1 + connectivity * 0.5)
            cluster_risk = float(np.clip(cluster_risk, 0, 1))

            # High risk nodes in cluster
            high_risk = [
                n for n in cluster_nodes
                if self.graph.nodes[n].get("vulnerability_score", 0) > 0.6
            ]

            clusters.append(ClusterRisk(
                cluster_id=cluster_id,
                node_ids=cluster_nodes,
                mean_vulnerability=round(mean_vuln, 4),
                max_vulnerability=round(max_vuln, 4),
                connectivity_factor=round(connectivity, 4),
                cluster_risk_index=round(cluster_risk, 4),
                high_risk_nodes=high_risk,
            ))

        clusters.sort(key=lambda c: c.cluster_risk_index, reverse=True)
        return clusters

    def generate_report(
        self, compromise_frequencies: dict[str, float] | None = None
    ) -> CampusRiskReport:
        """Generate a complete campus risk assessment report."""
        profiles = self.compute_all_scores(compromise_frequencies)
        clusters = self.cluster_analysis(compromise_frequencies=compromise_frequencies)

        # Global risk index (0–100)
        all_scores = [p.vulnerability_score for p in profiles]
        mean_vuln = float(np.mean(all_scores))
        max_cluster_risk = max((c.cluster_risk_index for c in clusters), default=0)

        # Weight: 60% vulnerability, 40% cluster risk
        global_risk = (mean_vuln * 60 + max_cluster_risk * 40)
        global_risk = float(np.clip(global_risk, 0, 100))

        # Top vulnerable nodes
        profiles.sort(key=lambda p: p.vulnerability_score, reverse=True)
        high_risk = profiles[:20]

        # Role distribution
        role_vulns: dict[str, list[float]] = {}
        for p in profiles:
            role_vulns.setdefault(p.role, []).append(p.vulnerability_score)
        vuln_distribution = {
            role: round(float(np.mean(scores)), 4)
            for role, scores in role_vulns.items()
        }

        # Infrastructure risk
        infra_risk = {}
        freqs = compromise_frequencies or {}
        for n, d in self.graph.nodes(data=True):
            if d.get("layer") == "infrastructure":
                infra_risk[n] = round(freqs.get(n, 0.0), 4)

        # Top attack targets (combining vulnerability and compromise frequency)
        top_targets = [
            {
                "node_id": p.node_id,
                "role": p.role,
                "vulnerability": p.vulnerability_score,
                "compromise_probability": p.compromise_probability,
                "combined_risk": round(
                    p.vulnerability_score * 0.5 + p.compromise_probability * 0.5, 4
                ),
            }
            for p in profiles[:30]
        ]
        top_targets.sort(key=lambda x: x["combined_risk"], reverse=True)

        return CampusRiskReport(
            global_risk_index=round(global_risk, 2),
            total_nodes=self.graph.number_of_nodes(),
            high_risk_nodes=high_risk,
            cluster_risks=clusters,
            vulnerability_distribution=vuln_distribution,
            top_attack_targets=top_targets[:15],
            infrastructure_risk=infra_risk,
        )
