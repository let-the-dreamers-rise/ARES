"""
ARES — Serialization Utilities
================================
Converts NetworkX graph objects and simulation results into
JSON-serializable dictionaries for API responses.
"""

from dataclasses import asdict
import networkx as nx
import numpy as np


def _sanitize_value(v):
    """Convert numpy types to native Python for JSON serialization."""
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return float(v)
    if isinstance(v, np.ndarray):
        return v.tolist()
    return v


def graph_to_json(graph: nx.Graph) -> dict:
    """
    Serialize a NetworkX graph to a JSON-friendly dictionary.

    Returns:
        {
            "nodes": [ { "id": ..., "data": { ... } }, ... ],
            "edges": [ { "source": ..., "target": ..., "data": { ... } }, ... ],
        }
    """
    nodes = []
    for node_id, data in graph.nodes(data=True):
        node_dict = {"id": str(node_id)}
        node_data = {}
        for k, v in data.items():
            node_data[k] = _sanitize_value(v)
        node_dict["data"] = node_data
        nodes.append(node_dict)

    edges = []
    for u, v, data in graph.edges(data=True):
        edge_dict = {
            "source": str(u),
            "target": str(v),
        }
        edge_data = {}
        for k, val in data.items():
            edge_data[k] = _sanitize_value(val)
        edge_dict["data"] = edge_data
        edges.append(edge_dict)

    return {"nodes": nodes, "edges": edges}


def simulation_result_to_json(result) -> dict:
    """Serialize a SimulationResult to JSON-friendly dict."""
    # Convert representative iteration snapshots
    rep = result.representative_iteration
    snapshots = []
    if rep:
        for snap in rep.step_snapshots:
            snapshots.append({
                "step": snap.step,
                "compromised_nodes": snap.compromised_nodes,
                "vulnerable_nodes": snap.vulnerable_nodes,
                "safe_count": len(snap.safe_nodes),
                "compromised_count": snap.compromised_count,
                "total_nodes": snap.total_nodes,
                "attack_results": snap.attack_results,
            })

    return {
        "num_iterations": result.num_iterations,
        "mean_compromise_ratio": result.mean_compromise_ratio,
        "std_compromise_ratio": result.std_compromise_ratio,
        "max_compromise_ratio": result.max_compromise_ratio,
        "min_compromise_ratio": result.min_compromise_ratio,
        "median_steps_to_peak": result.median_steps_to_peak,
        "global_risk_index": result.global_risk_index,
        "attack_path_summary": result.attack_path_summary,
        "execution_time_seconds": result.execution_time_seconds,
        "node_compromise_frequency": {
            k: round(v, 4) for k, v in
            sorted(result.node_compromise_frequency.items(), key=lambda x: x[1], reverse=True)[:50]
        },
        "infra_compromise_frequency": result.infra_compromise_frequency,
        "step_snapshots": snapshots,
    }


def risk_report_to_json(report) -> dict:
    """Serialize a CampusRiskReport to JSON-friendly dict."""
    return {
        "global_risk_index": report.global_risk_index,
        "total_nodes": report.total_nodes,
        "vulnerability_distribution": report.vulnerability_distribution,
        "top_attack_targets": report.top_attack_targets,
        "infrastructure_risk": report.infrastructure_risk,
        "high_risk_nodes": [
            {
                "node_id": n.node_id,
                "role": n.role,
                "department": n.department,
                "layer": n.layer,
                "vulnerability_score": n.vulnerability_score,
                "degree_centrality": n.degree_centrality,
                "betweenness_centrality": n.betweenness_centrality,
                "compromise_probability": n.compromise_probability,
            }
            for n in report.high_risk_nodes
        ],
        "cluster_risks": [
            {
                "cluster_id": c.cluster_id,
                "node_count": len(c.node_ids),
                "mean_vulnerability": c.mean_vulnerability,
                "max_vulnerability": c.max_vulnerability,
                "connectivity_factor": c.connectivity_factor,
                "cluster_risk_index": c.cluster_risk_index,
                "high_risk_count": len(c.high_risk_nodes),
            }
            for c in report.cluster_risks
        ],
    }
