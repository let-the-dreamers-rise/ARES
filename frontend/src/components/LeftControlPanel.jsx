import React from 'react';
import { motion } from 'framer-motion';

/**
 * LeftControlPanel — Tactical Controls
 * ======================================
 * Attack scenario selector, target cluster selection,
 * infection probability slider, simulation depth, run/reset.
 */

const SCENARIOS = [
    { value: 'multi-stage', label: 'Multi-Stage Hybrid Attack' },
    { value: 'phishing', label: 'Phishing Campaign' },
    { value: 'credential', label: 'Credential Compromise' },
    { value: 'lateral', label: 'Lateral Infrastructure Movement' },
    { value: 'apt', label: 'Advanced Persistent Threat' },
];

export default function LeftControlPanel({
    config,
    onConfigChange,
    onGenerate,
    onRun,
    onReset,
    isLoading,
    hasGraph,
    hasSimulation,
}) {
    return (
        <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                width: 264,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #0F1419 0%, #0B0F14 100%)',
                borderRight: '1px solid #1E3A5F',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div className="panel-header" style={{ borderBottom: '1px solid #1E3A5F', borderRadius: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                TACTICAL CONTROLS
            </div>

            <div className="panel-content" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16, padding: '14px' }}>
                {/* Step 1: Generate Campus */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: hasGraph ? '#10B981' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 700, color: '#fff',
                        }}>
                            {hasGraph ? '✓' : '1'}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Network Generation
                        </span>
                    </div>

                    {/* Campus Size */}
                    <label className="control-label">Campus Size (Nodes)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input
                            type="range"
                            className="control-range"
                            min={500}
                            max={1000}
                            step={50}
                            value={config.numNodes}
                            onChange={e => onConfigChange('numNodes', Number(e.target.value))}
                            disabled={isLoading}
                        />
                        <span style={{
                            minWidth: 36, textAlign: 'right',
                            fontSize: '0.78rem', fontWeight: 700, color: '#3B82F6',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {config.numNodes}
                        </span>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={onGenerate}
                        disabled={isLoading}
                        style={{ width: '100%', marginBottom: 4 }}
                    >
                        {isLoading && !hasGraph ? (
                            <><div className="spinner" /> GENERATING...</>
                        ) : hasGraph ? (
                            <><span style={{ fontSize: '0.9rem' }}>↻</span> REGENERATE</>
                        ) : (
                            <><span style={{ fontSize: '0.9rem' }}>⬡</span> GENERATE CAMPUS</>
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#1E3A5F' }} />

                {/* Step 2: Configure Simulation */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: hasSimulation ? '#10B981' : hasGraph ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : '#1E293B',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 700, color: hasGraph ? '#fff' : '#64748B',
                        }}>
                            {hasSimulation ? '✓' : '2'}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Attack Configuration
                        </span>
                    </div>

                    {/* Scenario */}
                    <label className="control-label">Attack Scenario</label>
                    <select
                        className="control-select"
                        value={config.scenario}
                        onChange={e => onConfigChange('scenario', e.target.value)}
                        disabled={!hasGraph || isLoading}
                        style={{ marginBottom: 12 }}
                    >
                        {SCENARIOS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>

                    {/* Monte Carlo Iterations */}
                    <label className="control-label">Monte Carlo Iterations</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input
                            type="range"
                            className="control-range"
                            min={10}
                            max={500}
                            step={10}
                            value={config.numIterations}
                            onChange={e => onConfigChange('numIterations', Number(e.target.value))}
                            disabled={!hasGraph || isLoading}
                        />
                        <span style={{
                            minWidth: 32, textAlign: 'right',
                            fontSize: '0.78rem', fontWeight: 700, color: '#06B6D4',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {config.numIterations}
                        </span>
                    </div>

                    {/* Infection Probability */}
                    <label className="control-label">Infection Probability</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input
                            type="range"
                            className="control-range"
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            value={config.infectionProbability}
                            onChange={e => onConfigChange('infectionProbability', Number(e.target.value))}
                            disabled={!hasGraph || isLoading}
                        />
                        <span style={{
                            minWidth: 36, textAlign: 'right',
                            fontSize: '0.78rem', fontWeight: 700, color: '#EF4444',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {(config.infectionProbability * 100).toFixed(0)}%
                        </span>
                    </div>

                    {/* Simulation Depth */}
                    <label className="control-label">Simulation Depth (Steps)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <input
                            type="range"
                            className="control-range"
                            min={5}
                            max={50}
                            step={5}
                            value={config.maxSimSteps}
                            onChange={e => onConfigChange('maxSimSteps', Number(e.target.value))}
                            disabled={!hasGraph || isLoading}
                        />
                        <span style={{
                            minWidth: 28, textAlign: 'right',
                            fontSize: '0.78rem', fontWeight: 700, color: '#F59E0B',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {config.maxSimSteps}
                        </span>
                    </div>

                    {/* Initial Compromised */}
                    <label className="control-label">Initial Compromised</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <input
                            type="range"
                            className="control-range"
                            min={1}
                            max={20}
                            step={1}
                            value={config.initialCompromised}
                            onChange={e => onConfigChange('initialCompromised', Number(e.target.value))}
                            disabled={!hasGraph || isLoading}
                        />
                        <span style={{
                            minWidth: 20, textAlign: 'right',
                            fontSize: '0.78rem', fontWeight: 700, color: '#8B5CF6',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {config.initialCompromised}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#1E3A5F' }} />

                {/* Step 3: Execute */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: hasGraph && !hasSimulation ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : '#1E293B',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 700, color: hasGraph ? '#fff' : '#64748B',
                        }}>
                            3
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Execute Simulation
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="btn-primary"
                            onClick={onRun}
                            disabled={!hasGraph || isLoading}
                            style={{ flex: 1 }}
                        >
                            {isLoading && hasGraph ? (
                                <><div className="spinner" /> RUNNING...</>
                            ) : (
                                <><span style={{ fontSize: '0.85rem' }}>▶</span> RUN</>
                            )}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={onReset}
                            disabled={isLoading}
                            style={{ flex: 1 }}
                        >
                            ↺ RESET
                        </button>
                    </div>
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* AMD Badge */}
                <div style={{
                    padding: '8px 12px',
                    background: '#131B26',
                    borderRadius: 6,
                    border: '1px solid #1E3A5F',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Optimized For
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ED1C24', letterSpacing: '0.08em', marginTop: 2 }}>
                        AMD INSTINCT
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#475569', marginTop: 2 }}>
                        ROCm • MI300X • Ryzen AI
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
