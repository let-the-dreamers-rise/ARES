import React, { useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

/**
 * StrategicMap — Center Interactive Graph Visualization
 * =====================================================
 * Displays the campus network graph using React Flow with:
 * - Node coloring by state (safe/vulnerable/compromised)
 * - Animated infection propagation via timeline scrubber
 * - Minimap and zoom controls
 */

const NODE_COLORS = {
    safe: { bg: '#1A2332', border: '#3B82F6', glow: 'rgba(59, 130, 246, 0.3)' },
    vulnerable: { bg: '#2A1F0D', border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)' },
    compromised: { bg: '#2A0F0F', border: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' },
};

const ROLE_SHAPES = {
    Student: { width: 8, height: 8 },
    Faculty: { width: 12, height: 12 },
    Admin: { width: 14, height: 14 },
    IT: { width: 16, height: 16 },
    Researcher: { width: 11, height: 11 },
    'Auth Server': { width: 20, height: 20 },
    'Email Gateway': { width: 18, height: 18 },
    'Cloud DB': { width: 20, height: 20 },
    'Lab Server': { width: 16, height: 16 },
    'File System': { width: 16, height: 16 },
    'Backup Server': { width: 16, height: 16 },
    'Web Portal': { width: 14, height: 14 },
    'VPN Gateway': { width: 18, height: 18 },
    'DNS Server': { width: 18, height: 18 },
};

function buildFlowData(graphData, snapshot) {
    if (!graphData) return { nodes: [], edges: [] };

    // Build look-up for snapshot states
    const stateMap = {};
    if (snapshot) {
        (snapshot.compromised_nodes || []).forEach(id => { stateMap[id] = 'compromised'; });
        (snapshot.vulnerable_nodes || []).forEach(id => { stateMap[id] = 'vulnerable'; });
    }

    // Layout: use a force-directed-like deterministic placement
    const totalNodes = graphData.nodes.length;
    const humanNodes = graphData.nodes.filter(n => n.data.layer === 'human');
    const infraNodes = graphData.nodes.filter(n => n.data.layer === 'infrastructure');

    // Place human nodes in a large circle
    const radius = Math.max(400, Math.sqrt(humanNodes.length) * 28);
    const nodes = [];

    humanNodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / humanNodes.length;
        // Add some radial variation based on department hash
        const dept = node.data.department || '';
        const deptHash = dept.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const r = radius * (0.7 + 0.3 * ((deptHash % 10) / 10));

        const state = stateMap[node.id] || node.data.state || 'safe';
        const colors = NODE_COLORS[state] || NODE_COLORS.safe;
        const dims = ROLE_SHAPES[node.data.role] || { width: 10, height: 10 };

        nodes.push({
            id: node.id,
            position: { x: 600 + r * Math.cos(angle), y: 500 + r * Math.sin(angle) },
            data: { label: '', ...node.data, state },
            type: 'default',
            style: {
                width: dims.width,
                height: dims.height,
                borderRadius: node.data.layer === 'infrastructure' ? 3 : '50%',
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 0 ${state === 'compromised' ? 12 : 6}px ${colors.glow}`,
                padding: 0,
                fontSize: 0,
                transition: 'all 0.5s ease',
            },
        });
    });

    // Place infrastructure nodes in center cluster
    infraNodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / Math.max(infraNodes.length, 1);
        const r = 120;

        const state = stateMap[node.id] || node.data.state || 'safe';
        const colors = NODE_COLORS[state] || NODE_COLORS.safe;
        const dims = ROLE_SHAPES[node.data.role] || { width: 18, height: 18 };

        nodes.push({
            id: node.id,
            position: { x: 600 + r * Math.cos(angle), y: 500 + r * Math.sin(angle) },
            data: { label: node.data.role || node.id, ...node.data, state },
            type: 'default',
            style: {
                width: dims.width,
                height: dims.height,
                borderRadius: 4,
                background: colors.bg,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 0 ${state === 'compromised' ? 16 : 8}px ${colors.glow}`,
                padding: 0,
                fontSize: 0,
                transition: 'all 0.5s ease',
            },
        });
    });

    // Only show subset of edges for performance (too many edges freeze React Flow)
    const maxEdges = 800;
    const sampledEdges = graphData.edges.length > maxEdges
        ? graphData.edges.filter((_, i) => i % Math.ceil(graphData.edges.length / maxEdges) === 0)
        : graphData.edges;

    const edges = sampledEdges.map((edge, i) => {
        const edgeColor =
            edge.data.layer === 'cross' ? 'rgba(139, 92, 246, 0.15)' :
                edge.data.layer === 'infrastructure' ? 'rgba(6, 182, 212, 0.25)' :
                    'rgba(59, 130, 246, 0.08)';

        return {
            id: `e-${i}`,
            source: edge.source,
            target: edge.target,
            style: { stroke: edgeColor, strokeWidth: 0.5 },
            animated: edge.data.layer === 'infrastructure',
        };
    });

    return { nodes, edges };
}

export default function StrategicMap({ graphData, simulationResult, currentStep, maxSteps, onStepChange }) {
    const snapshot = simulationResult?.step_snapshots?.[currentStep] || null;
    const { nodes: flowNodes, edges: flowEdges } = useMemo(
        () => buildFlowData(graphData, snapshot),
        [graphData, snapshot]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

    // Update nodes/edges when data changes
    React.useEffect(() => {
        setNodes(flowNodes);
        setEdges(flowEdges);
    }, [flowNodes, flowEdges, setNodes, setEdges]);

    const handleTimelineClick = useCallback((e) => {
        if (maxSteps <= 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onStepChange(Math.round(pct * maxSteps));
    }, [maxSteps, onStepChange]);

    // Stats from snapshot
    const stats = snapshot ? {
        compromised: snapshot.compromised_count || 0,
        total: snapshot.total_nodes || 0,
        safe: (snapshot.total_nodes || 0) - (snapshot.compromised_count || 0) - (snapshot.vulnerable_nodes?.length || 0),
        vulnerable: snapshot.vulnerable_nodes?.length || 0,
    } : null;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Map area */}
            <div style={{ flex: 1, position: 'relative' }}>
                {!graphData ? (
                    // Empty state
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: 16,
                    }}>
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                            </svg>
                        </motion.div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Generate campus to initialize strategic map
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#334155' }}>
                            Use the tactical controls to create a synthetic campus network
                        </div>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        minZoom={0.1}
                        maxZoom={4}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background color="#1E3A5F" gap={40} size={0.5} />
                        <Controls position="bottom-left" />
                        <MiniMap
                            nodeColor={(node) => {
                                const state = node.data?.state || 'safe';
                                return state === 'compromised' ? '#EF4444' :
                                    state === 'vulnerable' ? '#F59E0B' : '#3B82F6';
                            }}
                            maskColor="rgba(11, 15, 20, 0.85)"
                            position="bottom-right"
                        />
                    </ReactFlow>
                )}

                {/* Overlay Stats */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 16,
                            padding: '6px 18px',
                            background: 'rgba(11, 15, 20, 0.85)',
                            borderRadius: 8,
                            border: '1px solid #1E3A5F',
                            backdropFilter: 'blur(8px)',
                            zIndex: 10,
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3B82F6' }}>{stats.safe}</div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Safe</div>
                        </div>
                        <div style={{ width: 1, background: '#1E3A5F' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F59E0B' }}>{stats.vulnerable}</div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vulnerable</div>
                        </div>
                        <div style={{ width: 1, background: '#1E3A5F' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#EF4444' }}>{stats.compromised}</div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Compromised</div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Timeline Scrubber */}
            {simulationResult && maxSteps > 0 && (
                <div className="timeline-container">
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Timeline
                    </span>
                    <div className="timeline-track" onClick={handleTimelineClick}>
                        <div
                            className="timeline-fill"
                            style={{ width: `${(currentStep / maxSteps) * 100}%` }}
                        />
                        <div
                            className="timeline-thumb"
                            style={{ left: `${(currentStep / maxSteps) * 100}%` }}
                        />
                    </div>
                    <span className="timeline-step-label">
                        Step {currentStep} / {maxSteps}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                            disabled={currentStep <= 0}
                        >
                            ◀
                        </button>
                        <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            onClick={() => onStepChange(Math.min(maxSteps, currentStep + 1))}
                            disabled={currentStep >= maxSteps}
                        >
                            ▶
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
