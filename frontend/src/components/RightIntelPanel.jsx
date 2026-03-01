import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RightIntelPanel — Intelligence & Analytics Panel
 * ==================================================
 * High-risk clusters, top vulnerable nodes, predicted compromise %,
 * attack path summary.
 */
export default function RightIntelPanel({ riskMetrics, clusterData, attackPaths, simulationResult }) {
    const hasData = riskMetrics || simulationResult;

    return (
        <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                width: 290,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #0F1419 0%, #0B0F14 100%)',
                borderLeft: '1px solid #1E3A5F',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div className="panel-header" style={{ borderRadius: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                THREAT INTELLIGENCE
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
                {!hasData ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', height: '100%', padding: '40px 20px',
                        textAlign: 'center', gap: 12,
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        </svg>
                        <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>
                            Run a simulation to view threat intelligence
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {/* ── Simulation Metrics ───────────────── */}
                        {simulationResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0 }}
                            >
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E3A5F' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 600, color: '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
                                    }}>
                                        Simulation Results
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <div className="metric-card">
                                            <div className="metric-value" style={{ color: '#EF4444' }}>
                                                {(simulationResult.mean_compromise_ratio * 100).toFixed(1)}%
                                            </div>
                                            <div className="metric-label">Mean Compromise</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value" style={{ color: '#F59E0B' }}>
                                                {(simulationResult.max_compromise_ratio * 100).toFixed(1)}%
                                            </div>
                                            <div className="metric-label">Max Compromise</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value" style={{ color: '#06B6D4' }}>
                                                {simulationResult.median_steps_to_peak?.toFixed(0) || '—'}
                                            </div>
                                            <div className="metric-label">Median Steps</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value" style={{ color: '#8B5CF6' }}>
                                                {simulationResult.execution_time_seconds?.toFixed(1)}s
                                            </div>
                                            <div className="metric-label">Execution Time</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── High Risk Nodes ─────────────────── */}
                        {riskMetrics?.high_risk_nodes && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E3A5F' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 600, color: '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                                    }}>
                                        Top Vulnerable Nodes
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {riskMetrics.high_risk_nodes.slice(0, 8).map((node, i) => (
                                            <div
                                                key={node.node_id}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '5px 8px', borderRadius: 4,
                                                    background: i < 3 ? 'rgba(239, 68, 68, 0.06)' : '#131B26',
                                                    border: `1px solid ${i < 3 ? 'rgba(239, 68, 68, 0.15)' : '#1E3A5F'}`,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{
                                                        fontSize: '0.6rem', fontWeight: 700,
                                                        color: i < 3 ? '#EF4444' : '#64748B',
                                                        minWidth: 16,
                                                    }}>
                                                        #{i + 1}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#E2E8F0' }}>
                                                            {node.node_id}
                                                        </div>
                                                        <div style={{ fontSize: '0.58rem', color: '#64748B' }}>
                                                            {node.role} • {node.department}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{
                                                        fontSize: '0.78rem', fontWeight: 800,
                                                        color: node.vulnerability_score > 0.7 ? '#EF4444' :
                                                            node.vulnerability_score > 0.5 ? '#F59E0B' : '#3B82F6',
                                                    }}>
                                                        {(node.vulnerability_score * 100).toFixed(0)}
                                                    </div>
                                                    <div style={{ fontSize: '0.5rem', color: '#64748B', textTransform: 'uppercase' }}>
                                                        RISK
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Cluster Risks ───────────────────── */}
                        {clusterData && clusterData.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E3A5F' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 600, color: '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                                    }}>
                                        High-Risk Clusters
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {clusterData.slice(0, 6).map((cluster) => {
                                            const riskPct = (cluster.cluster_risk_index * 100).toFixed(0);
                                            const barColor = cluster.cluster_risk_index > 0.6 ? '#EF4444' :
                                                cluster.cluster_risk_index > 0.4 ? '#F59E0B' : '#3B82F6';
                                            return (
                                                <div
                                                    key={cluster.cluster_id}
                                                    style={{
                                                        padding: '6px 8px', borderRadius: 4,
                                                        background: '#131B26',
                                                        border: '1px solid #1E3A5F',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94A3B8' }}>
                                                            Cluster {cluster.cluster_id}
                                                        </span>
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: barColor }}>
                                                            {riskPct}%
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        height: 3, borderRadius: 2,
                                                        background: '#1E293B',
                                                        overflow: 'hidden',
                                                    }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${riskPct}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                            style={{
                                                                height: '100%', borderRadius: 2,
                                                                background: barColor,
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{
                                                        display: 'flex', justifyContent: 'space-between',
                                                        marginTop: 3, fontSize: '0.55rem', color: '#64748B',
                                                    }}>
                                                        <span>{cluster.node_count} nodes</span>
                                                        <span>{cluster.high_risk_count} high-risk</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Attack Paths ────────────────────── */}
                        {attackPaths?.attack_paths && attackPaths.attack_paths.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div style={{ padding: '12px 14px' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 600, color: '#64748B',
                                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                                    }}>
                                        Top Attack Paths
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {attackPaths.attack_paths.slice(0, 6).map((path, i) => (
                                            <div key={i} className="attack-path-item">
                                                <span style={{
                                                    fontSize: '0.6rem', fontWeight: 700, color: '#EF4444',
                                                    minWidth: 14,
                                                }}>
                                                    {i + 1}
                                                </span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: '0.65rem', color: '#E2E8F0',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>
                                                        {path.path}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#F59E0B' }}>
                                                    {(path.probability * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Infrastructure Risk ─────────────── */}
                        {simulationResult?.infra_compromise_frequency &&
                            Object.keys(simulationResult.infra_compromise_frequency).length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div style={{ padding: '12px 14px', borderTop: '1px solid #1E3A5F' }}>
                                        <div style={{
                                            fontSize: '0.65rem', fontWeight: 600, color: '#64748B',
                                            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                                        }}>
                                            Infrastructure Compromise
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            {Object.entries(simulationResult.infra_compromise_frequency)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([nodeId, freq]) => (
                                                    <div
                                                        key={nodeId}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '4px 8px', borderRadius: 3,
                                                            background: freq > 0.5 ? 'rgba(239, 68, 68, 0.08)' : '#131B26',
                                                            border: '1px solid #1E3A5F',
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94A3B8' }}>
                                                            {nodeId}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.72rem', fontWeight: 700,
                                                            color: freq > 0.5 ? '#EF4444' : freq > 0.2 ? '#F59E0B' : '#10B981',
                                                        }}>
                                                            {(freq * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
