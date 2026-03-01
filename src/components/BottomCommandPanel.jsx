import React from 'react';
import { motion } from 'framer-motion';

/**
 * BottomCommandPanel — Defense & Mitigation Recommendations
 * ==========================================================
 * Defense recommendations, hardening suggestions, risk mitigation
 * strategy, estimated attack containment cost.
 */

function generateRecommendations(riskMetrics, simulationResult, globalRisk) {
    if (!riskMetrics && !simulationResult) return [];

    const recs = [];

    // Priority HIGH recommendations
    if (globalRisk > 60) {
        recs.push({
            priority: 'high',
            category: 'IMMEDIATE ACTION',
            title: 'Enable Multi-Factor Authentication Campus-Wide',
            detail: 'Credential exploitation probability exceeds 60%. Mandatory MFA deployment on all administrative and IT accounts will reduce lateral movement success by ~45%.',
            cost: '$15,000–$25,000',
        });
    }

    if (simulationResult?.infra_compromise_frequency) {
        const highRiskInfra = Object.entries(simulationResult.infra_compromise_frequency)
            .filter(([, f]) => f > 0.3);
        if (highRiskInfra.length > 0) {
            recs.push({
                priority: 'high',
                category: 'INFRASTRUCTURE',
                title: `Harden ${highRiskInfra.length} Critical Infrastructure Nodes`,
                detail: `${highRiskInfra.map(([id]) => id).join(', ')} show >30% compromise probability. Implement network segmentation, zero-trust access policies, and real-time monitoring.`,
                cost: '$30,000–$50,000',
            });
        }
    }

    // Priority MEDIUM recommendations
    if (riskMetrics?.vulnerability_distribution) {
        const studentVuln = riskMetrics.vulnerability_distribution['Student'];
        if (studentVuln && studentVuln > 0.4) {
            recs.push({
                priority: 'medium',
                category: 'AWARENESS',
                title: 'Deploy AI Phishing Awareness Training',
                detail: `Student susceptibility score: ${(studentVuln * 100).toFixed(0)}%. Deploy targeted phishing simulation drills and AI-literacy workshops. Expected susceptibility reduction: 25-35%.`,
                cost: '$8,000–$12,000',
            });
        }
    }

    recs.push({
        priority: 'medium',
        category: 'NETWORK',
        title: 'Implement Zero-Trust Network Architecture',
        detail: 'Replace implicit trust in communication edges with continuous verification. Microsegment high-value clusters identified in spectral analysis.',
        cost: '$40,000–$80,000',
    });

    // Priority LOW recommendations
    recs.push({
        priority: 'low',
        category: 'MONITORING',
        title: 'Deploy Real-Time Graph-Based Anomaly Detection',
        detail: 'Integrate ARES simulation engine with live network telemetry for continuous risk scoring. AMD Instinct GPU acceleration enables real-time Monte Carlo updates.',
        cost: '$20,000–$35,000',
    });

    if (globalRisk > 30) {
        recs.push({
            priority: 'low',
            category: 'RESILIENCE',
            title: 'Red Team Exercise Schedule',
            detail: 'Based on simulation results, conduct quarterly adversarial red team exercises targeting identified high-risk clusters and attack paths.',
            cost: '$12,000–$20,000/quarter',
        });
    }

    return recs;
}

export default function BottomCommandPanel({ riskMetrics, simulationResult, globalRisk }) {
    const recommendations = generateRecommendations(riskMetrics, simulationResult, globalRisk);
    const hasData = recommendations.length > 0;

    // Estimated total containment cost
    const totalCostMin = hasData ? recommendations.reduce((sum, r) => {
        const match = r.cost.match(/\$([\d,]+)/);
        return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 0);
    }, 0) : 0;

    return (
        <div
            style={{
                flexShrink: 0,
                background: 'linear-gradient(180deg, #0B0F14 0%, #0F1419 100%)',
                borderTop: '1px solid #1E3A5F',
                height: hasData ? 'auto' : 44,
                maxHeight: 180,
                overflow: 'hidden',
            }}
        >
            {!hasData ? (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 44, gap: 8,
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 500 }}>
                        Defense recommendations will appear after simulation
                    </span>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: 0, height: '100%' }}>
                    {/* Scrollable recommendations */}
                    <div style={{
                        flex: 1, display: 'flex', gap: 8, padding: '10px 14px',
                        overflowX: 'auto', overflowY: 'hidden',
                    }}>
                        {recommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`defense-card priority-${rec.priority}`}
                                style={{ minWidth: 280, maxWidth: 320, flexShrink: 0 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: rec.priority === 'high' ? '#EF4444' :
                                                rec.priority === 'medium' ? '#F59E0B' : '#10B981',
                                        }}>
                                            {rec.priority} • {rec.category}
                                        </span>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', marginTop: 2 }}>
                                            {rec.title}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: 6 }}>
                                    {rec.detail}
                                </div>
                                <div style={{
                                    fontSize: '0.68rem', fontWeight: 700, color: '#06B6D4',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    <span style={{ fontSize: '0.55rem', color: '#64748B' }}>Est. Cost:</span>
                                    {rec.cost}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Summary panel */}
                    <div style={{
                        width: 180, flexShrink: 0, padding: '10px 14px',
                        borderLeft: '1px solid #1E3A5F',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8,
                    }}>
                        <div className="metric-card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                Containment Cost
                            </div>
                            <div className="metric-value" style={{ color: '#06B6D4', fontSize: '1.1rem' }}>
                                ${(totalCostMin / 1000).toFixed(0)}K+
                            </div>
                        </div>
                        <div className="metric-card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                                Recommendations
                            </div>
                            <div className="metric-value" style={{ color: '#F59E0B', fontSize: '1.1rem' }}>
                                {recommendations.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
